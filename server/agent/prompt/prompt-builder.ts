/**
 * PromptBuilder — 模块化系统提示词构建器
 * 参照 CowAgent agent/prompt/builder.py (v2.1.0)
 *
 * 分层构建 (按优先级从高到低):
 *   1. Tooling    — 可用工具清单 + 使用规则
 *   2. Skills     — 已加载技能列表
 *   3. Memory     — 长期记忆/MEMORY.md 索引
 *   4. Knowledge  — 知识库目录索引
 *   5. Workspace  — 项目环境/文件结构
 *   6. Identity   — AGENT.md / USER.md 身份定义
 *   7. Context    — 对话历史摘要
 *   8. Runtime    — 时间/模型/元信息
 *   9. Rules      — 回复语言/格式规则
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..', '..', '..');
const AGENT_DIR = path.join(ROOT, 'agent');

export interface PromptSections {
  tooling?: string;
  skills?: string;
  memory?: string;
  knowledge?: string;
  workspace?: string;
  identity?: string;
  context?: string;
  runtime?: string;
  rules?: string;
}

export interface PromptConfig {
  /** 是否包含工具列表 */
  includeTools?: boolean;
  /** 已加载技能列表 */
  skillsList?: Array<{ name: string; description: string; content?: string }>;
  /** 长期记忆内容 */
  longTermMemory?: string;
  /** 对话历史摘要 */
  contextSummary?: string;
  /** 模型ID (用于运行时信息) */
  modelId?: string;
  /** Ollama标签模式 */
  useTags?: boolean;
  /** 额外自定义内容 */
  extra?: string;
}

export class PromptBuilder {
  private sections: PromptSections = {};
  private config: PromptConfig = {};

  constructor(config?: PromptConfig) {
    this.config = config || {};
  }

  /** 1. 工具层 */
  buildTooling(tools: Array<{ name: string; description: string }>): this {
    if (!this.config.includeTools || tools.length === 0) {
      if (this.config.useTags) {
        this.sections.tooling = this.ollamaToolGuide();
      }
      return this;
    }

    const lines: string[] = ['## 可用工具', ''];
    lines.push('你可以使用以下工具执行实际操作。必须用工具获取真实数据，不能编造！', '');
    for (const tool of tools) {
      lines.push(`### ${tool.name}`, tool.description, '');
    }
    this.sections.tooling = lines.join('\n');
    return this;
  }

  /** 2. 技能层 */
  buildSkills(skills?: PromptConfig['skillsList']): this {
    const list = skills || this.config.skillsList;
    if (!list || list.length === 0) return this;

    const lines: string[] = ['## 已加载技能', ''];
    for (const skill of list) {
      lines.push(`### ${skill.name}: ${skill.description}`);
      if (skill.content) lines.push(skill.content.slice(0, 500));
      lines.push('');
    }
    this.sections.skills = lines.join('\n');
    return this;
  }

  /** 3. 记忆层 */
  buildMemory(longTermMemory?: string): this {
    const mem = longTermMemory || this.config.longTermMemory;
    if (!mem) return this;

    this.sections.memory = `## 长期记忆\n\n${mem.slice(0, 1500)}`;
    return this;
  }

  /** 5. 工作空间 */
  buildWorkspace(): this {
    this.sections.workspace = [
      '## 项目环境',
      '',
      `- 项目目录: ${ROOT}`,
      '- 数据库: SQLite (data/ehr.db)',
      '- 后端: Node.js + TypeScript + Express',
      '- 前端: React + Ant Design + Vite',
      '- 查表名: SELECT name FROM sqlite_master WHERE type=\'table\'',
      '- 查结构: PRAGMA table_info(\'表名\')',
      '',
    ].join('\n');
    return this;
  }

  /** 6. 身份层 */
  buildIdentity(): this {
    // 尝试加载 AGENT.md
    const agentMd = path.join(AGENT_DIR, 'AGENT.md');
    if (fs.existsSync(agentMd)) {
      const content = fs.readFileSync(agentMd, 'utf-8').slice(0, 1000);
      this.sections.identity = `## Agent 身份\n\n${content}`;
    } else {
      this.sections.identity = `## 身份\n\n你是飞达智能HR系统的AI技术助手，帮助用户处理数据库查询、代码分析、系统运维等任务。`;
    }
    return this;
  }

  /** 7. 上下文层 */
  buildContext(summary?: string): this {
    const ctx = summary || this.config.contextSummary;
    if (!ctx) return this;

    const lines = ['## 最近对话', '', ctx, ''];
    this.sections.context = lines.join('\n');
    return this;
  }

  /** 8. 运行时层 */
  buildRuntime(): this {
    const now = new Date().toISOString();
    this.sections.runtime = [
      '## 运行时信息',
      '',
      `- 当前时间: ${now}`,
      `- 时区: Asia/Shanghai (UTC+8)`,
      this.config.modelId ? `- 模型: ${this.config.modelId}` : '',
      '',
    ].filter(Boolean).join('\n');
    return this;
  }

  /** 9. 规则层 */
  buildRules(): this {
    const text = this.config.useTags
      ? this.ollamaToolGuide()
      : '当用户请求需要查询/搜索/文件操作/命令执行时，必须使用工具获取真实结果。如果工具返回错误，分析原因后尝试别的方法，不要放弃。';

    this.sections.rules = [
      '## 行为规则',
      '',
      text,
      '',
      '- 使用 Markdown 格式回复',
      '- 用中文回答，数据库相关保持英文',
      '- 表名/字段名用反引号',
    ].join('\n');
    return this;
  }

  /** 构建最终 prompt */
  build(): string {
    const order: Array<keyof PromptSections> = [
      'tooling', 'skills', 'memory', 'knowledge', 'workspace',
      'identity', 'context', 'runtime', 'rules',
    ];

    const parts: string[] = [];
    for (const key of order) {
      if (this.sections[key]) parts.push(this.sections[key]!);
    }

    if (this.config.extra) parts.push(this.config.extra);

    return parts.join('\n\n');
  }

  /** Ollama 标签格式工具指南 */
  private ollamaToolGuide(): string {
    return [
      '工具调用标签格式 (每个标签独立一行，内含严格 JSON):',
      '[TOOL:sql_query]{"sql":"SELECT name FROM sqlite_master WHERE type=\\"table\\"","confirm":true}[/TOOL]',
      '[TOOL:grep]{"pattern":"搜索关键词"}[/TOOL]',
      '[TOOL:read_file]{"file_path":"相对路径"}[/TOOL]',
      '[TOOL:glob]{"pattern":"*.ts"}[/TOOL]',
      '[TOOL:bash]{"command":"执行命令"}[/TOOL]',
      '[TOOL:web_search]{"query":"搜索词"}[/TOOL]',
      '[TOOL:web_fetch]{"url":"网址"}[/TOOL]',
      '[TOOL:write_file]{"file_path":"路径","content":"内容"}[/TOOL]',
      '[TOOL:patch]{"file_path":"路径","old_string":"原文","new_string":"新文"}[/TOOL]',
    ].join('\n');
  }
}

/** 快速构建提示词 */
export function buildPrompt(config: PromptConfig, tools?: Array<{ name: string; description: string }>): string {
  const builder = new PromptBuilder(config)
    .buildWorkspace()
    .buildIdentity()
    .buildRuntime()
    .buildSkills(config.skillsList)
    .buildMemory(config.longTermMemory)
    .buildContext(config.contextSummary)
    .buildRules();

  if (tools) {
    builder.buildTooling(tools);
  } else {
    config.includeTools = false;
    builder.buildTooling([]);
  }

  return builder.build();
}
