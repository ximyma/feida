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
  createSession, loadMessages, appendMessages, clearSession,
  listSessions, cleanupOldSessions, getSessionTitle,
} from './memory/conversation-store';
import { appendDailyMemory, readDailyMemory, getLongTermMemory, flushMemory, searchMemory } from './memory/memory-manager';
import { skillManager } from './skills/skill-manager';

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

  // 确保会话存在
  try { createSession(sessionId, userMessage.slice(0, 30)); } catch { /* ignore */ }

  // 加载历史消息
  let historyMessages = '';
  try {
    const msgs = loadMessages(sessionId, 10);
    historyMessages = msgs.filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => `${m.role === 'user' ? '用户' : '助手'}: ${m.content.slice(0, 200)}`)
      .join('\n');
  } catch { /* ignore */ }

  // 构建系统提示词
  const defaultPrompt = `你是飞达智能HR系统的技术助手，可以执行实际操作。
项目位于 D:\\feida，数据库是 SQLite (data/ehr.db)。

⚡ 当用户要求以下操作时，必须调用对应工具获取真实结果，不能编造或猜测：
- 查询数据、查看表结构 → sql_query (列所有表: SELECT name FROM sqlite_master)
- 搜索代码、查找文件 → grep / glob / read_file
- 执行命令、构建项目 → bash
- 修改文件 → write_file / patch
- 搜索网页信息 → web_search / web_fetch

SQLite 提示：查表名用 SELECT name FROM sqlite_master WHERE type='table' ORDER BY name；查结构用 PRAGMA table_info('表名')。不要用 SHOW TABLES/DESCRIBE。

如果工具返回错误，分析原因后换一种方式重试，不要放弃！${options.useTags ? `

工具调用标签格式 (必须精确):
[TOOL:sql_query]{"sql":"SELECT name FROM sqlite_master WHERE type='\''table'\''","confirm":true}[/TOOL]
[TOOL:grep]{"pattern":"搜索词"}[/TOOL]
[TOOL:read_file]{"file_path":"路径"}[/TOOL]
[TOOL:glob]{"pattern":"*.ts"}[/TOOL]
[TOOL:bash]{"command":"dir"}[/TOOL]
[TOOL:web_search]{"query":"关键词"}[/TOOL]

标签内必须是严格 JSON，每个标签一行，不要加额外文字。` : ''}${historyMessages ? `\n\n最近对话:\n${historyMessages}` : ''}`;

  const systemPrompt = options.systemPrompt || defaultPrompt + skillManager.buildSkillsPrompt();

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

// ── 导出记忆系统 ──
export {
  createSession, loadMessages, appendMessages, clearSession,
  listSessions, cleanupOldSessions, getSessionTitle,
  appendDailyMemory, readDailyMemory, getLongTermMemory, flushMemory, searchMemory,
};
