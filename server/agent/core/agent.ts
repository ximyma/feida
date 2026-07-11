/**
 * Agent 核心类 — 参照 CowAgent agent/protocol/agent.py
 *
 * 管理会话级别的 LLM 交互：
 * - 消息历史
 * - 系统提示词
 * - 工具列表
 * - 流式执行入口
 */
import { BaseTool } from '../tools/base-tool';
import { toolManager } from '../tools/tool-manager';

export interface AgentConfig {
  systemPrompt?: string;
  model?: string;
  modelId?: string;
  maxSteps?: number;
  temperature?: number;
  workspaceDir?: string;
  enableTools?: boolean;
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

export interface AgentResult {
  content: string;
  steps: Array<{ tool: string; params: any; result: any }>;
  iterations: number;
}

export class Agent {
  messages: AgentMessage[] = [];
  config: AgentConfig;
  private tools: BaseTool[] = [];

  constructor(config: AgentConfig = {}) {
    this.config = {
      maxSteps: 15,
      temperature: 0.3,
      enableTools: true,
      ...config,
    };
    if (this.config.systemPrompt) {
      this.messages.push({ role: 'system', content: this.config.systemPrompt });
    }
  }

  /** 添加系统提示词 */
  setSystemPrompt(prompt: string): void {
    this.config.systemPrompt = prompt;
    if (this.messages[0]?.role === 'system') {
      this.messages[0].content = prompt;
    } else {
      this.messages.unshift({ role: 'system', content: prompt });
    }
  }

  /** 获取系统提示词 */
  getSystemPrompt(): string {
    return this.config.systemPrompt || '';
  }

  /** 加载工具 */
  loadTools(tools?: BaseTool[]): void {
    if (tools) {
      this.tools = tools;
    } else if (this.config.enableTools) {
      this.tools = toolManager.list();
    }
  }

  /** 获取所有工具 */
  getTools(): BaseTool[] {
    return this.tools;
  }

  /** 获取工具 schemas */
  getToolSchemas() {
    return this.tools.map(t => t.getSchema());
  }

  /** 添加用户消息 */
  addUserMessage(content: string): void {
    this.messages.push({ role: 'user', content });
  }

  /** 添加助手消息 */
  addAssistantMessage(content: string, toolCalls?: any[]): void {
    this.messages.push({ role: 'assistant', content, tool_calls: toolCalls });
  }

  /** 添加工具结果消息 */
  addToolResult(toolCallId: string, content: string): void {
    this.messages.push({ role: 'tool', tool_call_id: toolCallId, content });
  }

  /** 清空对话历史 (保留系统提示词) */
  clearHistory(): void {
    const sysMsg = this.messages.find(m => m.role === 'system');
    this.messages = sysMsg ? [sysMsg] : [];
  }

  /** 获取用户可见的消息 */
  getUserMessages(): AgentMessage[] {
    return this.messages.filter(m => m.role === 'user' || m.role === 'assistant');
  }
}
