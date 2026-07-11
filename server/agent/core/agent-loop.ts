/**
 * AgentLoop — Agent 执行循环
 * 参照 CowAgent agent/protocol/agent_stream.py AgentStreamExecutor
 *
 * 核心流程: LLM生成 → 检测tool_calls → 执行工具 → 反馈结果 → 循环至无tool_calls
 */
import { Agent, AgentConfig, AgentResult } from './agent';
import { BaseTool } from '../tools/base-tool';
import { registerAllTools } from '../tools/registry';

// 首次加载确保工具已注册
registerAllTools();

/** LLM 调用抽象接口 — 由外部注入 */
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
  /** Ollama 用标签格式: [TOOL:name]{...}[/TOOL] */
  useTags?: boolean;
}

export interface LoopEvent {
  type: 'step' | 'tool_start' | 'tool_end' | 'done' | 'error';
  data?: any;
}

export async function runAgentLoop(
  agent: Agent,
  llmCaller: LLMCaller,
  config: LoopConfig,
  onEvent?: (event: LoopEvent) => void,
): Promise<AgentResult> {
  const steps: AgentResult['steps'] = [];
  const isOllama = config.useTags || false;

  agent.loadTools();
  const tools = agent.getTools();

  for (let i = 0; i < config.maxSteps; i++) {
    const messages = agent.messages.map(m => {
      const msg: any = { role: m.role, content: m.content };
      if (m.tool_calls) msg.tool_calls = m.tool_calls;
      if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
      return msg;
    });

    onEvent?.({ type: 'step', data: { iteration: i + 1 } });

    const response = await llmCaller.call(
      messages,
      isOllama ? [] : tools.map(t => t.getSchema()),
      { temperature: config.temperature, modelId: config.modelId, useTags: isOllama },
    );

    // --- OpenAI 标准 tool_calls ---
    if (!isOllama && response.tool_calls?.length) {
      agent.addAssistantMessage(response.content || '', response.tool_calls);
      for (const tc of response.tool_calls) {
        const fnName = tc.function.name;
        let fnParams: any = {};
        try { fnParams = JSON.parse(tc.function.arguments); } catch { /* ignore */ }
        onEvent?.({ type: 'tool_start', data: { tool: fnName, params: fnParams } });

        const tool = tools.find(t => t.name === fnName);
        const result = tool ? await tool.executeTool(fnParams) : { success: false, error: `未知工具: ${fnName}` };
        steps.push({ tool: fnName, params: fnParams, result });
        onEvent?.({ type: 'tool_end', data: { tool: fnName, result } });

        agent.addToolResult(tc.id, JSON.stringify(result));
      }
      continue;
    }

    // --- Ollama 标签格式: [TOOL:name]{...}[/TOOL] ---
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
          const tool = tools.find(t => t.name === tc.name);
          const result = tool ? await tool.executeTool(tc.params) : { success: false, error: `未知工具: ${tc.name}` };
          steps.push({ tool: tc.name, params: tc.params, result });
          onEvent?.({ type: 'tool_end', data: { tool: tc.name, result } });
          agent.addAssistantMessage('', undefined);
          agent.addToolResult(`tag_${tc.name}_${Date.now()}`, JSON.stringify(result));
        }
        continue;
      }
      // 清理标签后的纯文本回复
      const clean = response.content.replace(/\[TOOL:\w+\][\s\S]*?\[\/TOOL\]/g, '').trim();
      onEvent?.({ type: 'done', data: { content: clean || '无响应' } });
      return { content: clean || '无响应', steps, iterations: steps.length };
    }

    // --- 纯文本回复 (无工具调用) ---
    onEvent?.({ type: 'done', data: { content: response.content || '无响应' } });
    return { content: response.content || '无响应', steps, iterations: steps.length };
  }

  return { content: '达到最大执行次数，请简化你的请求。', steps, iterations: steps.length };
}

/** 简单工厂：创建 Agent + 执行循环 */
export async function runAgent(
  userMessage: string,
  llmCaller: LLMCaller,
  config: AgentConfig & LoopConfig,
  onEvent?: (event: LoopEvent) => void,
): Promise<AgentResult> {
  const agent = new Agent(config);
  agent.addUserMessage(userMessage);
  return runAgentLoop(agent, llmCaller, config, onEvent);
}
