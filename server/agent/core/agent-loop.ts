/**
 * AgentLoop v3 — Agent 执行循环
 * 参照 CowAgent agent/protocol/agent_stream.py (v2.1.0, 1721行)
 *
 * v3 新增:
 *   - JSON修复 (畸形参数自动修复)
 *   - 工具结果裁剪 (当前50K / 历史20K)
 *   - 增强失败检测 (同参数5次 / 同工具8次)
 *   - 空响应处理 (静默时注入提示)
 *   - 最大步数LLM摘要
 *   - OpenAI消息孤儿清理
 *   - LLM重试退避 (速率限制/溢出各退避)
 */
import { Agent, AgentConfig, AgentResult } from './agent';
import { BaseTool, ToolStage, ProgressCallback } from '../tools/base-tool';
import { registerAllTools } from '../tools/registry';

registerAllTools();

// ── 常量 ──
const MAX_CURRENT_RESULT_CHARS = 50000;
const MAX_HISTORY_RESULT_CHARS = 20000;
const AGGRESSIVE_LIMIT = 10000;
const MAX_SAME_ARGS_CALLS = 5;
const MAX_SAME_TOOL_FAILURES = 8;

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
  cancelSignal?: AbortSignal; onProgress?: ProgressCallback;
}
export interface LoopEvent {
  type: 'step' | 'tool_start' | 'tool_end' | 'progress' | 'text' | 'done' | 'error';
  data?: any;
}

// ── JSON修复 ──
function parseToolArgs(argsStr: string): any {
  if (!argsStr) return {};
  try { return JSON.parse(argsStr); } catch {
    // 简单修复: 补全未闭合括号
    let fixed = argsStr.trim();
    const opens = (fixed.match(/\{/g) || []).length;
    const closes = (fixed.match(/\}/g) || []).length;
    if (opens > closes) { fixed += '}'.repeat(opens - closes); }
    const openB = (fixed.match(/\[/g) || []).length;
    const closeB = (fixed.match(/\]/g) || []).length;
    if (openB > closeB) { fixed += ']'.repeat(openB - closeB); }
    // 移除尾部逗号
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    try { return JSON.parse(fixed); } catch { return {}; }
  }
}

// ── 消息验证 ──
function dropOrphanedToolResults(messages: any[]): any[] {
  const knownIds = new Set<string>();
  for (const m of messages) {
    if (m.role === 'assistant' && m.tool_calls) {
      m.tool_calls.forEach((tc: any) => tc.id && knownIds.add(tc.id));
    }
  }
  return messages.filter(m => {
    if (m.role === 'tool' && m.tool_call_id && !knownIds.has(m.tool_call_id)) return false;
    return true;
  });
}

// ── 工具结果裁剪 ──
function capToolResult(result: any, isHistorical: boolean): any {
  const maxChars = isHistorical ? MAX_HISTORY_RESULT_CHARS : MAX_CURRENT_RESULT_CHARS;
  const str = typeof result === 'string' ? result : JSON.stringify(result);
  if (str.length <= maxChars) return result;
  const truncated = str.slice(0, maxChars) + `\n\n[截断: 共${str.length}字符, 显示前${maxChars}]`;
  return typeof result === 'string' ? truncated : { _truncated: true, text: truncated };
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

  // 失败追踪
  const failureHistory: Array<{ name: string; argsKey: string; success: boolean }> = [];
  const MAX_HISTORY = 50;

  // 绑定进度
  for (const tool of tools) {
    tool.progressCallback = config.onProgress || ((m: string) => onEvent?.({ type: 'progress', data: m }));
  }

  for (let i = 0; i < config.maxSteps; i++) {
    // 取消检查
    if (config.cancelSignal?.aborted) {
      onEvent?.({ type: 'error', data: { message: '用户取消' } });
      return { content: '操作已取消', steps, iterations: steps.length };
    }

    onEvent?.({ type: 'step', data: { iteration: i + 1 } });

    // 上下文裁剪 + 历史结果裁剪
    let messages = trimMessages(agent.messages, maxContextTurns, i, true);
    messages = dropOrphanedToolResults(messages);

    // LLM 调用 + 重试退避
    let response: LLMResponse | null = null;
    let retries = 0;
    while (retries <= 2) {
      try {
        response = await llmCaller.call(messages,
          isOllama ? [] : tools.map(t => t.getSchema()),
          { temperature: config.temperature, modelId: config.modelId, useTags: isOllama });
        break;
      } catch (e: any) {
        const msg = (e.message || '').toLowerCase();
        const isOverflow = /context|overflow|token|prompt.*(long|large|exceed)/i.test(msg);
        const isRateLimit = /rate.?limit|too.?many|429|throttl/i.test(msg);

        if (isOverflow && retries === 0) {
          onEvent?.({ type: 'progress', data: { message: '上下文超限，激进裁剪后重试' } });
          messages = trimMessages(agent.messages, maxContextTurns / 2, i, true);
          messages = messages.map((m: any) => {
            if (m.role === 'tool' && typeof m.content === 'string' && m.content.length > AGGRESSIVE_LIMIT) {
              m.content = m.content.slice(0, AGGRESSIVE_LIMIT) + '\n[截断]';
            }
            return m;
          });
          retries++; continue;
        }
        if (isOverflow && retries >= 1) {
          agent.clearHistory();
          onEvent?.({ type: 'progress', data: { message: '溢出恢复失败，已重置对话' } });
          return { content: '对话上下文超限，请开始新对话。', steps, iterations: steps.length };
        }
        if (isRateLimit) {
          const wait = (retries + 1) * 2000;
          onEvent?.({ type: 'progress', data: { message: `速率限制，${wait/1000}s后重试` } });
          await sleep(wait); retries++; continue;
        }
        retries++;
        if (retries <= 1) { await sleep(1000); continue; }
        return { content: `LLM调用失败: ${e.message}`, steps, iterations: steps.length };
      }
    }
    if (!response) return { content: 'LLM无响应', steps, iterations: steps.length };

    // ── OpenAI tool_calls ──
    if (!isOllama && response.tool_calls?.length) {
      agent.addAssistantMessage(response.content || '', response.tool_calls);
      for (const tc of response.tool_calls) {
        const fnParams = parseToolArgs(tc.function.arguments);
        onEvent?.({ type: 'tool_start', data: { tool: tc.function.name, params: fnParams } });

        const failCheck = checkFailure(tc.function.name, fnParams, failureHistory, MAX_HISTORY);
        if (failCheck.blocked) {
          agent.addToolResult(tc.id, JSON.stringify({ error: failCheck.reason }));
          continue;
        }
        if (failCheck.warning && i > 0) {
          agent.messages.push({ role: 'user', content: failCheck.warning } as any);
        }

        const tool = tools.find(t => t.name === tc.function.name);
        const rawResult = tool ? await tool.executeTool(fnParams) : { success: false, error: `未知工具: ${tc.function.name}` };
        const result = capToolResult(rawResult, false);
        steps.push({ tool: tc.function.name, params: fnParams, result });
        failureHistory.push({ name: tc.function.name, argsKey: JSON.stringify(fnParams), success: result.success });
        if (failureHistory.length > MAX_HISTORY) failureHistory.shift();

        const resultStr = JSON.stringify(result);
        if (!result.success) {
          agent.addToolResult(tc.id, `${resultStr}\n\n请分析错误并换一种方法重试。`);
        } else {
          agent.addToolResult(tc.id, resultStr);
        }
      }
      continue;
    }

    // ── Ollama 标签 ──
    if (isOllama && response.content) {
      const toolRegex = /\[TOOL:(\w+)\]([\s\S]*?)\[\/TOOL\]/g;
      const toolCalls: Array<{ name: string; params: any }> = [];
      let m; while ((m = toolRegex.exec(response.content)) !== null) {
        const params = parseToolArgs(m[2].trim());
        toolCalls.push({ name: m[1], params });
      }
      if (toolCalls.length > 0) {
        const clean = response.content.replace(/\[TOOL:\w+\][\s\S]*?\[\/TOOL\]/g, '').trim();
        agent.addAssistantMessage(clean || `执行 ${toolCalls.map(t => t.name).join(', ')}`);
        for (const tc of toolCalls) {
          const tool = tools.find(t => t.name === tc.name);
          const result = tool ? await tool.executeTool(tc.params) : { success: false, error: `未知工具: ${tc.name}` };
          steps.push({ tool: tc.name, params: tc.params, result });
          const rStr = JSON.stringify(capToolResult(result, false));
          if (!result.success) {
            agent.addToolResult(`tag_${tc.name}`, `${rStr}\n\n请分析错误并重试。`);
          } else {
            agent.addToolResult(`tag_${tc.name}`, rStr);
          }
        }
        continue;
      }
      const clean = response.content.replace(/\[TOOL:\w+\][\s\S]*?\[\/TOOL\]/g, '').trim();
      onEvent?.({ type: 'done', data: { content: clean || '无响应' } });
      await executePostProcessTools(tools, steps);
      return { content: clean || '无响应', steps, iterations: steps.length };
    }

    // ── 空响应处理 ──
    if (!response.content && !response.tool_calls?.length) {
      if (i > 0) {
        // 已有工具调用但LLM静默 -> 注入提示要求总结
        agent.messages.push({ role: 'user', content: '请向用户说明刚才工具执行的结果或回答问题。' } as any);
        continue;
      }
      return { content: '无响应', steps, iterations: steps.length };
    }

    // ── 纯文本 ──
    onEvent?.({ type: 'done', data: { content: response.content || '无响应' } });
    await executePostProcessTools(tools, steps);
    return { content: response.content || '无响应', steps, iterations: steps.length };
  }

  // ── 最大步数 → 尝试用空提示请求总结 ──
  try {
    agent.messages.push({ role: 'user', content: '已执行多步操作。请总结目前的结果并回答用户问题。' } as any);
    const resp = await llmCaller.call(
      dropOrphanedToolResults(trimMessages(agent.messages, 5, 0, true)),
      [], { temperature: 0.3, modelId: config.modelId }
    );
    if (resp.content) return { content: resp.content, steps, iterations: steps.length };
  } catch { /* 摘要失败, 返回默认 */ }
  return { content: '达到最大执行次数，请简化你的请求。', steps, iterations: steps.length };
}

// ── 工具函数 ──

/** 上下文裁剪 + 历史结果限制 */
function trimMessages(messages: any[], maxTurns: number, currentStep: number, capHistory: boolean): any[] {
  // 保留系统消息
  const sysMsg = messages.find(m => m.role === 'system');
  // 收集最近N轮
  const recent: any[] = []; let turns = 0;
  for (let i = messages.length - 1; i >= 0 && turns < maxTurns; i--) {
    const m = messages[i];
    if (m.role === 'user') { recent.unshift(m); turns++; }
    else if (m.role === 'assistant') recent.unshift(m);
    else if (m.role === 'tool') recent.unshift(m);
  }
  const result = sysMsg ? [sysMsg, ...recent] : recent;
  // 裁剪历史工具结果(跳过最后一轮)
  if (capHistory && currentStep > 0) {
    let lastUserIdx = -1;
    for (let i = result.length - 1; i >= 0; i--) {
      if (result[i].role === 'user') { lastUserIdx = i; break; }
    }
    for (let i = 0; i < Math.max(0, lastUserIdx); i++) {
      if (result[i].role === 'tool' && typeof result[i].content === 'string' && result[i].content.length > MAX_HISTORY_RESULT_CHARS) {
        result[i] = { ...result[i], content: result[i].content.slice(0, MAX_HISTORY_RESULT_CHARS) + '\n[已截断]' };
      }
    }
  }
  return result;
}

/** 增强失败检测 */
function checkFailure(name: string, params: any, history: Array<{ name: string; argsKey: string; success: boolean }>, maxLen: number):
  { blocked: boolean; reason?: string; warning?: string } {
  const argsKey = JSON.stringify(params);
  const sameArgs = history.filter(h => h.name === name && h.argsKey === argsKey);
  const sameTool = history.filter(h => h.name === name);
  // 相同参数连续失败3次 → 阻塞
  if (sameArgs.length >= 3 && sameArgs.slice(-3).every(h => !h.success)) {
    return { blocked: true, reason: `${name} 相同参数连续失败3次，已跳过` };
  }
  // 相同参数调用5次 → 阻塞
  if (sameArgs.length >= MAX_SAME_ARGS_CALLS) {
    return { blocked: true, reason: `${name} 相同参数已调用${sameArgs.length}次，停止` };
  }
  // 同工具连续失败8次 → 阻塞
  const consecutiveFails = sameTool.slice(-MAX_SAME_TOOL_FAILURES);
  if (consecutiveFails.length >= MAX_SAME_TOOL_FAILURES && consecutiveFails.every(h => !h.success)) {
    return { blocked: true, reason: `${name} 连续失败${MAX_SAME_TOOL_FAILURES}次，已停止` };
  }
  // 同工具连续失败6次 → 警告
  if (consecutiveFails.length >= 6 && consecutiveFails.every(h => !h.success)) {
    return { blocked: false, warning: '工具已连续失败多次，请尝试新方法或向用户说明情况。' };
  }
  // 最近3次工具调用均成功 → 提示总结
  if (sameArgs.length > 0 && history.slice(-3).every(h => h.success)) {
    return { blocked: false, warning: '工具已返回足够信息，请基于结果向用户回复，不要重复调用相同工具。' };
  }
  return { blocked: false };
}

async function executePostProcessTools(tools: BaseTool[], steps: Array<{ tool: string; params: any; result: any }>) {
  for (const tool of tools.filter(t => t.stage === ToolStage.POST_PROCESS)) {
    try { const r = await tool.executeTool({}); steps.push({ tool: tool.name, params: {}, result: r }); } catch { /* 后处理非致命 */ }
  }
}

function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
