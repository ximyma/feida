/**
 * AgentLoop — Agent 执行循环 v2
 * 参照 CowAgent agent/protocol/agent_stream.py (v2.1.0)
 *
 * v2 新增: 取消机制 / 失败追踪 / 进度回调 / 上下文裁剪 / 后处理工具 / 消息修复
 */
import { Agent, AgentConfig, AgentResult } from './agent';
import { BaseTool, ToolStage, ProgressCallback } from '../tools/base-tool';
import { registerAllTools } from '../tools/registry';

registerAllTools();

// ── 类型定义 ──

export interface LLMCaller {
  call(messages: any[], tools: any[], config: any): Promise<LLMResponse>;
}

export interface LLMResponse {
  content: string | null;
  tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }>;
  model: string;
  usage?: any;
}

export interface LoopConfig {
  maxSteps: number;
  temperature: number;
  modelId?: string;
  useTags?: boolean;
  maxContextTurns?: number;  // 新增：最大上下文轮次
  cancelSignal?: AbortSignal;  // 新增：取消信号
  onProgress?: ProgressCallback; // 新增：进度回调
}

export interface LoopEvent {
  type: 'step' | 'tool_start' | 'tool_end' | 'progress' | 'done' | 'error';
  data?: any;
}

// ── 主循环 ──

export async function runAgentLoop(
  agent: Agent,
  llmCaller: LLMCaller,
  config: LoopConfig,
  onEvent?: (event: LoopEvent) => void,
): Promise<AgentResult> {
  const steps: AgentResult['steps'] = [];
  const isOllama = config.useTags || false;
  const maxContextTurns = config.maxContextTurns || 20;

  agent.loadTools();
  const tools = agent.getTools();

  // 工具失败计数器 (防无限重试)
  const failureCounts: Map<string, number> = new Map();
  const MAX_FAILURES = 3;

  // 绑定进度回调到工具
  for (const tool of tools) {
    tool.progressCallback = config.onProgress || ((msg: string) => {
      onEvent?.({ type: 'progress', data: { tool: tool.name, message: msg } });
    });
  }

  for (let i = 0; i < config.maxSteps; i++) {
    // ── 取消检查 ──
    if (config.cancelSignal?.aborted) {
      onEvent?.({ type: 'error', data: { message: '用户取消了操作' } });
      return { content: '操作已取消', steps, iterations: steps.length };
    }

    // ── 上下文裁剪 (保留最近 N 轮) ──
    const messages = trimContext(agent.messages, maxContextTurns);

    onEvent?.({ type: 'step', data: { iteration: i + 1 } });

    let response: LLMResponse;
    try {
      response = await llmCaller.call(
        messages,
        isOllama ? [] : tools.map(t => t.getSchema()),
        { temperature: config.temperature, modelId: config.modelId, useTags: isOllama },
      );
    } catch (e: any) {
      // 上下文溢出 → 激进裁剪后重试
      if (e.message?.includes('context') || e.message?.includes('token')) {
        const trimmed = trimContext(agent.messages, maxContextTurns / 2);
        onEvent?.({ type: 'progress', data: { message: '上下文超限，已自动裁剪' } });
        response = await llmCaller.call(trimmed, [], config);
        if (!response.content && !response.tool_calls?.length) {
          return { content: '对话太长，请开始新对话', steps, iterations: steps.length };
        }
      } else {
        return { content: `LLM调用失败: ${e.message}`, steps, iterations: steps.length };
      }
    }

    // ── OpenAI 标准 tool_calls ──
    if (!isOllama && response.tool_calls?.length) {
      agent.addAssistantMessage(response.content || '', response.tool_calls);
      for (const tc of response.tool_calls) {
        const fnName = tc.function.name;
        let fnParams: any = {};
        try { fnParams = JSON.parse(tc.function.arguments); } catch { /* ignore */ }
        onEvent?.({ type: 'tool_start', data: { tool: fnName, params: fnParams } });

        // 失败追踪
        const fails = failureCounts.get(fnName) || 0;
        if (fails >= MAX_FAILURES) {
          agent.addToolResult(tc.id, JSON.stringify({ error: `${fnName} 已失败${MAX_FAILURES}次，跳过` }));
          continue;
        }

        const tool = tools.find(t => t.name === fnName);
        const result = tool ? await tool.executeTool(fnParams) : { success: false, error: `未知工具: ${fnName}` };
        steps.push({ tool: fnName, params: fnParams, result });

        const resultStr = JSON.stringify(result);
        if (!result.success) {
          failureCounts.set(fnName, fails + 1);
          agent.addToolResult(tc.id, `${resultStr}\n\n请分析错误原因，换一种正确的方法重试。(${fnName} 已失败 ${fails + 1}/${MAX_FAILURES} 次)`);
        } else {
          failureCounts.set(fnName, 0); // 成功后重置计数
          agent.addToolResult(tc.id, resultStr);
        }
      }
      continue;
    }

    // ── Ollama 标签格式 ──
    if (isOllama && response.content) {
      const toolRegex = /\[TOOL:(\w+)\]([\s\S]*?)\[\/TOOL\]/g;
      const toolCalls: Array<{ name: string; params: any }> = [];
      let match;
      while ((match = toolRegex.exec(response.content)) !== null) {
        let params: any = {};
        try { params = JSON.parse(match[2].trim()); } catch { /* ignore */ }
        toolCalls.push({ name: match[1], params });
      }

      if (toolCalls.length > 0) {
        const cleanContent = response.content.replace(/\[TOOL:\w+\][\s\S]*?\[\/TOOL\]/g, '').trim();
        agent.addAssistantMessage(cleanContent || `执行 ${toolCalls.map(t => t.name).join(', ')}`);
        for (const tc of toolCalls) {
          onEvent?.({ type: 'tool_start', data: { tool: tc.name, params: tc.params } });

          const fails = failureCounts.get(tc.name) || 0;
          if (fails >= MAX_FAILURES) {
            agent.addToolResult(`tag_${tc.name}`, JSON.stringify({ error: `${tc.name} 已失败${MAX_FAILURES}次，跳过` }));
            continue;
          }

          const tool = tools.find(t => t.name === tc.name);
          const result = tool ? await tool.executeTool(tc.params) : { success: false, error: `未知工具: ${tc.name}` };
          steps.push({ tool: tc.name, params: tc.params, result });

          const resultStr = JSON.stringify(result);
          if (!result.success) {
            failureCounts.set(tc.name, fails + 1);
            agent.addToolResult(`tag_${tc.name}`, `${resultStr}\n\n请分析错误原因，换一种正确的方法重试。`);
          } else {
            failureCounts.set(tc.name, 0);
            agent.addToolResult(`tag_${tc.name}`, resultStr);
          }
        }
        continue;
      }

      const clean = response.content.replace(/\[TOOL:\w+\][\s\S]*?\[\/TOOL\]/g, '').trim();
      onEvent?.({ type: 'done', data: { content: clean || '无响应' } });

      // ── 执行后处理工具 ──
      await executePostProcessTools(tools, steps);

      return { content: clean || '无响应', steps, iterations: steps.length };
    }

    // ── 纯文本回复 ──
    onEvent?.({ type: 'done', data: { content: response.content || '无响应' } });

    await executePostProcessTools(tools, steps);

    return { content: response.content || '无响应', steps, iterations: steps.length };
  }

  return { content: '达到最大执行次数，请简化你的请求。', steps, iterations: steps.length };
}

// ── 工具函数 ──

/** 上下文裁剪：保留最近 N 轮 (1轮 = user + assistant) */
function trimContext(messages: any[], maxTurns: number): any[] {
  if (messages.length <= maxTurns * 2 + 2) return messages;

  const result: any[] = [];
  // 保留系统消息
  const sysMsg = messages.find(m => m.role === 'system');
  if (sysMsg) result.push(sysMsg);

  // 从后往前取 user/assistant 轮次
  let turns = 0;
  const recent: any[] = [];
  for (let i = messages.length - 1; i >= 0 && turns < maxTurns; i--) {
    const m = messages[i];
    if (m.role === 'user' || m.role === 'assistant') {
      recent.unshift(m);
      if (m.role === 'user') turns++;
    } else if (m.role === 'tool') {
      recent.unshift(m); // 保留关联的工具结果
    }
  }

  result.push(...recent);
  return result;
}

/** 执行后处理工具 */
async function executePostProcessTools(tools: BaseTool[], steps: Array<{ tool: string; params: any; result: any }>): Promise<void> {
  const postTools = tools.filter(t => t.stage === ToolStage.POST_PROCESS);
  for (const tool of postTools) {
    try {
      const result = await tool.executeTool({});
      steps.push({ tool: tool.name, params: {}, result });
    } catch { /* post-process errors are non-fatal */ }
  }
}
