/**
 * 飞达 Agent 系统 — 统一入口
 *
 * 桥梁：连接旧的 ai-service.js 与新的 Agent 工具系统
 * 渐进替换 runCodeAgent
 */
import { Agent, AgentConfig } from './core/agent';
import { runAgentLoop, LLMCaller, LLMResponse, LoopConfig, LoopEvent } from './core/agent-loop';
import { registerAllTools } from './tools/registry';
import {
  createSession, loadMessages, appendMessages, clearSession, deleteSession,
  listSessions, cleanupOldSessions, getSessionTitle,
  updateSessionTitle, generateTitle,
} from './memory/conversation-store';
import { appendDailyMemory, readDailyMemory, getLongTermMemory, flushMemory, searchMemory } from './memory/memory-manager';
import { skillManager } from './skills/skill-manager';
import { buildPrompt } from './prompt/prompt-builder';

// 启动时注册所有工具和技能
registerAllTools();
skillManager.refresh();

// ── LLM Caller 适配器 (连接现有 ai-service.js 的 chatCompletionDirect) ──

export function createLLMCaller(chatFn: (body: any, cfg: any) => Promise<any>, modelCfg: any): LLMCaller {
  return {
    async call(messages: any[], tools: any[], config: any): Promise<LLMResponse> {
      const body: any = {
        model: modelCfg.model || 'deepseek-chat',
        messages,
        temperature: config.temperature ?? 0.3,
        max_tokens: 4096,
      };
      if (tools.length > 0) {
        body.tools = tools.map(t => ({ type: 'function', function: t }));
        body.tool_choice = 'auto';
      }
      try {
        const resp = await chatFn(body, modelCfg);
        // 兼容两种响应格式
        if (resp.choices?.[0]) {
          const choice = resp.choices[0];
          return {
            content: choice.message?.content || null,
            tool_calls: choice.message?.tool_calls,
            model: resp.model,
            usage: resp.usage,
          };
        }
        if (resp.message) {
          return { content: resp.message.content || null, model: resp.model };
        }
        return { content: null, model: '' };
      } catch (e: any) {
        return { content: null, model: '' };
      }
    },
  };
}

// ── 高层 API ──

export interface ChatOptions {
  sessionId?: string;
  modelId?: string;
  modelCfg?: any;
  chatFn?: (body: any, cfg: any) => Promise<any>;
  systemPrompt?: string;
  useTags?: boolean; // Ollama 标签模式
  maxSteps?: number;
  temperature?: number;
}

export interface ChatResult {
  content: string;
  steps: Array<{ tool: string; params: any; result: any }>;
  sessionId: string;
}

/**
 * 统一对话入口
 */
export async function chat(
  userMessage: string,
  options: ChatOptions,
  onEvent?: (e: LoopEvent) => void,
): Promise<ChatResult> {
  const sessionId = options.sessionId || `s_${Date.now()}`;

  // 确保会话存在 (自动生成标题)
  try { createSession(sessionId, generateTitle(userMessage)); } catch { /* ignore */ }

  // 加载历史消息
  let historyMessages = '';
  try {
    const msgs = loadMessages(sessionId, 10);
    historyMessages = msgs.filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => `${m.role === 'user' ? '用户' : '助手'}: ${m.content.slice(0, 200)}`)
      .join('\n');
  } catch { /* ignore */ }

  // PromptBuilder 模块化构建系统提示词
  const skills = skillManager.getEnabled().map(s => ({ name: s.name, description: s.description, content: s.content }));
  let longTermMemory = '';
  try { longTermMemory = getLongTermMemory().slice(0, 1500); } catch { /* ignore */ }

  const defaultPrompt = buildPrompt({
    includeTools: true,
    skillsList: skills,
    longTermMemory,
    contextSummary: historyMessages || undefined,
    modelId: options.modelId,
    useTags: options.useTags,
  }, options.chatFn ? [] : []); // tools 由 agent-loop 管理

  const systemPrompt = options.systemPrompt || defaultPrompt;

  // 创建 Agent
  const agent = new Agent({
    systemPrompt,
    modelId: options.modelId,
    maxSteps: options.maxSteps || 15,
    temperature: options.temperature ?? 0.3,
  });
  agent.addUserMessage(userMessage);

  // 执行
  const llmCaller = options.chatFn
    ? createLLMCaller(options.chatFn, options.modelCfg || {})
    : { call: async () => ({ content: 'LLM 未配置', model: '' }) };

  const result = await runAgentLoop(agent, llmCaller, {
    maxSteps: options.maxSteps || 15,
    temperature: options.temperature ?? 0.3,
    modelId: options.modelId,
    useTags: options.useTags,
  }, onEvent);

  // 持久化消息
  try {
    appendMessages(sessionId, [
      { role: 'user', content: userMessage },
      { role: 'assistant', content: result.content },
    ]);
  } catch { /* ignore */ }

  // 记忆冲刷 (摘要写入每日日志)
  if (result.steps.length > 0) {
    try {
      const summary = `执行了 ${result.steps.length} 个工具: ${result.steps.map(s => s.tool).join(', ')}`;
      flushMemory(summary, 'agent_execution').catch(() => {});
    } catch { /* ignore */ }
  }

  return { content: result.content, steps: result.steps, sessionId };
}

// ── 导出工具系统 ──
export * from './tools/base-tool';
export { toolManager } from './tools/tool-manager';
export { registerAllTools } from './tools/registry';

export * from './prompt/prompt-builder';
export { skillManager } from './skills/skill-manager';

// ── 导出记忆系统 ──
export {
  createSession, loadMessages, appendMessages, clearSession, deleteSession,
  listSessions, cleanupOldSessions, getSessionTitle,
  updateSessionTitle, generateTitle,
  appendDailyMemory, readDailyMemory, getLongTermMemory, flushMemory, searchMemory,
};
