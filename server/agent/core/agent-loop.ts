/**
 * AgentLoop v4 — 简洁版 Agent 执行循环
 * 参照 SoWork sowork/agent/run_agent.py
 *
 * 核心流程:
 *   LLM call → tool_calls? execute tools → continue
 *           → text? return done
 *           → empty? inject hint → continue
 *
 * 移除: DSML/XML 解析、过度复杂的失败追踪、JSON修复
 * 保留: 工具结果裁剪、上下文裁剪、LLM重试退避
 */
import { Agent, AgentResult } from './agent';
import { BaseTool, ToolStage } from '../tools/base-tool';
import { registerAllTools } from '../tools/registry';

registerAllTools();

// ── 常量 ──
const MAX_RESULT_CHARS = 8000;
const MAX_HISTORY_RESULT_CHARS = 3000;
const AGGRESSIVE_LIMIT = 5000;

// ── 类型 ──
export interface LLMCaller {
  call(messages: any[], tools: any[], config: any): Promise<LLMResponse>;
}
export interface LLMResponse {
  content: string | null;
  tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }>;
  model: string; usage?: any;
}
export interface LoopConfig {
  maxSteps: number; temperature: number; modelId?: string;
  useTags?: boolean; maxContextTurns?: number;
  cancelSignal?: AbortSignal;
}
export interface LoopEvent {
  type: 'start' | 'step' | 'tool_start' | 'tool_complete' | 'thinking' | 'progress' | 'done' | 'error';
  data?: any;
}

// ── 工具函数 ──

function parseToolArgs(argsStr: string): any {
  if (!argsStr) return {};
  try { return JSON.parse(argsStr); } catch {
    // 修复: 补括号 + 移除尾部逗号
    let s = argsStr.trim().replace(/,(\s*[}\]])/g, '$1');
    const opens = (s.match(/\{/g) || []).length;
    const closes = (s.match(/\}/g) || []).length;
    if (opens > closes) s += '}'.repeat(opens - closes);
    try { return JSON.parse(s); } catch { return {}; }
  }
}

function capResult(result: any): any {
  const str = typeof result === 'string' ? result : JSON.stringify(result);
  if (str.length <= MAX_RESULT_CHARS) return result;
  const truncated = str.slice(0, MAX_RESULT_CHARS) + `\n\n[截断: 共${str.length}字符]`;
  return typeof result === 'string' ? truncated : { _t: true, text: truncated };
}

// ── 主循环 ──
export async function runAgentLoop(
  agent: Agent, llmCaller: LLMCaller, config: LoopConfig,
  onEvent?: (event: LoopEvent) => void,
): Promise<AgentResult> {
  const steps: AgentResult['steps'] = [];
  const isOllama = config.useTags || false;
  const maxContextTurns = config.maxContextTurns || 20;
  agent.loadTools();
  const tools = agent.getTools();

  for (let i = 0; i < config.maxSteps; i++) {
    if (config.cancelSignal?.aborted) {
      onEvent?.({ type: 'error', data: { message: '用户取消' } });
      return { content: '操作已取消', steps, iterations: steps.length };
    }

    onEvent?.({ type: 'step', data: { iteration: i + 1 } });

    // 上下文裁剪
    const messages = trimMessages(agent.messages, maxContextTurns, i);

    // LLM 调用
    let response: LLMResponse | null = null;
    try {
      response = await llmCaller.call(messages,
        isOllama ? [] : tools.map(t => t.getSchema()),
        { temperature: config.temperature, modelId: config.modelId });
    } catch (e: any) {
      onEvent?.({ type: 'progress', data: { message: `LLM调用失败: ${e.message}` } });
      // 重试一次
      try {
        await sleep(1000);
        response = await llmCaller.call(messages.slice(-20),
          isOllama ? [] : tools.map(t => t.getSchema()),
          { temperature: config.temperature, modelId: config.modelId });
      } catch {
        return { content: `LLM调用失败: ${e.message}`, steps, iterations: steps.length };
      }
    }
    if (!response) return { content: 'LLM无响应', steps, iterations: steps.length };

    // ── OpenAI tool_calls (标准函数调用) ──
    if (!isOllama && response.tool_calls?.length) {
      agent.addAssistantMessage(response.content || '', response.tool_calls);
      let combinedSize = 0;

      for (const tc of response.tool_calls) {
        const fnParams = parseToolArgs(tc.function.arguments);
        onEvent?.({ type: 'tool_start', data: { tool: tc.function.name, params: fnParams } });

        const tool = tools.find(t => t.name === tc.function.name);
        let rawResult;
        try {
          rawResult = tool ? await tool.executeTool(fnParams) : { success: false, error: `未知工具: ${tc.function.name}` };
        } catch (e: any) {
          rawResult = { success: false, error: e.message };
        }

        const result = capResult(rawResult);
        steps.push({ tool: tc.function.name, params: fnParams, result });

        let resultStr = JSON.stringify(result);
        combinedSize += resultStr.length;
        // 多工具总量裁剪
        if (combinedSize > MAX_RESULT_CHARS * 3) {
          resultStr = resultStr.slice(0, AGGRESSIVE_LIMIT) + '\n[已截断]';
        }

        if (!result.success) {
          agent.addToolResult(tc.id, `${resultStr}\n\n请分析错误并换一种方法重试。`);
        } else {
          agent.addToolResult(tc.id, resultStr);
        }
      }
      continue;
    }

    // ── Ollama 标签格式 ──
    if (isOllama && response.content) {
      const toolRegex = /\[TOOL:(\w+)\]([\s\S]*?)\[\/TOOL\]/g;
      const toolCalls: Array<{ name: string; params: any }> = [];
      let m;
      while ((m = toolRegex.exec(response.content)) !== null) {
        toolCalls.push({ name: m[1], params: parseToolArgs(m[2].trim()) });
      }
      if (toolCalls.length > 0) {
        const clean = response.content.replace(/\[TOOL:\w+\][\s\S]*?\[\/TOOL\]/g, '').trim();
        agent.addAssistantMessage(clean || `执行 ${toolCalls.map(t => t.name).join(', ')}`);
        for (const tc of toolCalls) {
          const tool = tools.find(t => t.name === tc.name);
          const result = tool ? await tool.executeTool(tc.params) : { success: false, error: `未知工具: ${tc.name}` };
          steps.push({ tool: tc.name, params: tc.params, result });
          const rStr = JSON.stringify(capResult(result));
          agent.addToolResult(`tag_${tc.name}_${Date.now()}`,
            result.success ? rStr : `${rStr}\n\n请分析错误并重试。`);
        }
        continue;
      }
      const clean = response.content.replace(/\[TOOL:\w+\][\s\S]*?\[\/TOOL\]/g, '').trim();
      onEvent?.({ type: 'done', data: { content: clean || '无响应' } });
      return { content: clean || '无响应', steps, iterations: steps.length };
    }

    // ── 空响应 → 注入提示 ──
    if (!response.content && !response.tool_calls?.length) {
      if (i > 0) {
        agent.messages.push({ role: 'user', content: '请基于工具执行结果向用户回复。如果无法获取足够信息，请如实说明。' } as any);
        continue;
      }
      return { content: '无响应', steps, iterations: steps.length };
    }

    // ── 纯文本 → 完成 ──
    onEvent?.({ type: 'done', data: { content: response.content || '无响应' } });
    return { content: response.content || '无响应', steps, iterations: steps.length };
  }

  // 最大步数 → 请求总结
  try {
    agent.messages.push({ role: 'user', content: '已执行多步操作，请总结结果并回答用户。' } as any);
    const resp = await llmCaller.call(
      trimMessages(agent.messages, 5, 0), [], { temperature: 0.3, modelId: config.modelId });
    if (resp.content) return { content: resp.content, steps, iterations: steps.length };
  } catch { /* ignore */ }
  return { content: '达到最大执行次数，请简化请求。', steps, iterations: steps.length };
}

// ── 上下文裁剪 ──
function trimMessages(messages: any[], maxTurns: number, currentStep: number): any[] {
  const sysMsg = messages.find(m => m.role === 'system');
  const recent: any[] = [];
  let turns = 0;
  for (let i = messages.length - 1; i >= 0 && turns < maxTurns; i--) {
    const m = messages[i];
    if (m.role === 'user') { recent.unshift(m); turns++; }
    else if (m.role === 'assistant' || m.role === 'tool') recent.unshift(m);
  }
  const result = sysMsg ? [sysMsg, ...recent] : recent;
  // 历史结果裁剪
  if (currentStep > 0) {
    let lastUserIdx = -1;
    for (let i = result.length - 1; i >= 0; i--) {
      if (result[i].role === 'user') { lastUserIdx = i; break; }
    }
    for (let i = 0; i < Math.max(0, lastUserIdx); i++) {
      if (result[i].role === 'tool' && typeof result[i].content === 'string'
          && result[i].content.length > MAX_HISTORY_RESULT_CHARS) {
        result[i] = { ...result[i], content: result[i].content.slice(0, MAX_HISTORY_RESULT_CHARS) + '\n[已截断]' };
      }
    }
  }
  return result;
}

function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
