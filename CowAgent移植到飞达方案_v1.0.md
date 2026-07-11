# CowAgent AI 系统移植到飞达方案

> 分析日期：2026-07-11 | 源项目：D:\myapps\CowAgent v2.1.0 (MIT) | 目标：D:\feida v1.1.0

---

## 一、CowAgent 核心架构速览

```
CowAgent 五大子系统：
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  工具系统     │  │  技能系统     │  │  记忆系统     │  │  知识系统     │  │  自演进系统    │
│  ToolManager  │  │ SkillManager  │  │ MemoryManager │  │ KnowledgeSvc │  │ Evolution     │
│  15+ 工具     │  │ SKILL.md定义  │  │ 三层记忆架构  │  │ MD Wiki      │  │ 空闲触发审查  │
│  MCP协议      │  │ 内置+自定义   │  │ SQLite+FTS5   │  │ 自动索引维护  │  │ 文件快照备份  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │                 │                 │
       └─────────┬───────┴────────┬────────┴────────┬────────┴────────┬────────┘
                 │                │                 │                 │
             ┌───┴────────────────┴─────────────────┴─────────────────┴───┐
             │                    Agent 协议层                              │
             │   Agent.run_stream() → AgentStreamExecutor (Agent Loop)     │
             │   Task / Result / Context / CancelToken                     │
             └───────────────────────────┬─────────────────────────────────┘
                                         │
             ┌───────────────────────────┴─────────────────────────────────┐
             │                桥接层 (AgentBridge / Channel)               │
             │  12 通道 (Web/WeChat/Feishu/DingTalk/Telegram/Slack/...)   │
             └──────────────────────────────────────────────────────────────┘
```

---

## 二、飞达现有 AI 现状 vs CowAgent

| 子系统 | 飞达当前 | CowAgent | 差距 |
|--------|----------|----------|------|
| **工具系统** | 7个硬编码工具 (code-agent-tools.js) | 15+ 可插拔工具 + MCP协议 | 🔴 架构差距大 |
| **技能系统** | ❌ 无 | SKILL.md + SkillManager | 🔴 完全没有 |
| **记忆-短期** | 前端 state, 刷新丢失 | Agent.messages 内存 + ConversationStore SQLite | 🔴 无持久化 |
| **记忆-中期** | ❌ 无 | memory/YYYY-MM-DD.md 每日日志 | 🔴 完全没有 |
| **记忆-长期** | ❌ 无 (仅 .workbuddy 内部使用) | MEMORY.md + FTS5 混合搜索 | 🔴 完全没有 |
| **知识系统** | ai_knowledge 表 (RAG用) | knowledge/ MD wiki + 自动索引 | 🟡 部分有 |
| **Agent Loop** | runCodeAgent() 单文件 | AgentStreamExecutor + 工具循环 | 🟡 基本逻辑有但不够完整 |
| **提示词系统** | 硬编码字符串拼接 | PromptBuilder 七层动态构建 | 🔴 架构差距大 |
| **自演进** | ❌ 无 | Evolution + Deep Dream | 🔴 完全没有 |
| **流式输出** | chatCompletionStreamFull | AgentStreamExecutor.stream_text | 🟢 基本可用 |
| **模型适配** | 3个 (DeepSeek/OpenAI/Ollama) + SiliconFlow | 15+ 模型适配器 | 🟢 够用 |

---

## 三、移植策略：渐进式，非一次性重写

### 原则
1. **不影响现有功能**——现有 AI 对话继续可用
2. **逐子系统移植**——工具→记忆→技能→知识→演进
3. **Node.js 原生实现**——不依赖 Python bridge
4. **复用现有基础设施**——SQLite (better-sqlite3)、Express 路由、React 前端

### 目录规划

```
feida/
├── server/
│   ├── ai-service.js              # 保留，逐步重构为调用新系统
│   ├── code-agent-tools.js        # 保留，迁移到新工具系统
│   ├── agent/                     # 新增：Agent 核心
│   │   ├── core/
│   │   │   ├── agent.ts           # Agent 类 (对应 cow Agent)
│   │   │   ├── agent-loop.ts      # AgentLoop (对应 AgentStreamExecutor)
│   │   │   ├── task.ts            # Task 数据模型
│   │   │   ├── result.ts          # AgentAction, ToolResult, AgentResult
│   │   │   └── cancel.ts          # 取消令牌
│   │   ├── tools/
│   │   │   ├── base-tool.ts       # BaseTool 基类
│   │   │   ├── tool-manager.ts    # ToolManager 单例
│   │   │   ├── registry.ts        # 工具注册表
│   │   │   └── builtin/           # 内置工具
│   │   │       ├── read-file.ts
│   │   │       ├── write-file.ts
│   │   │       ├── edit-file.ts
│   │   │       ├── bash.ts
│   │   │       ├── glob.ts
│   │   │       ├── grep.ts
│   │   │       ├── sql-query.ts
│   │   │       ├── web-search.ts
│   │   │       └── web-fetch.ts
│   │   ├── skills/
│   │   │   ├── skill-manager.ts   # SkillManager
│   │   │   ├── skill-loader.ts    # SKILL.md 加载器
│   │   │   ├── skill-formatter.ts # 技能格式化
│   │   │   └── types.ts          # SkillEntry 类型
│   │   ├── memory/
│   │   │   ├── memory-manager.ts  # 高层接口
│   │   │   ├── conversation-store.ts # 对话历史 SQLite 存储
│   │   │   ├── daily-log.ts      # 每日记忆 (YYYY-MM-DD.md)
│   │   │   ├── long-term.ts      # MEMORY.md 管理
│   │   │   ├── storage.ts        # SQLite + FTS5 混合搜索
│   │   │   ├── summarizer.ts     # 记忆刷新 + 蒸馏
│   │   │   └── chunker.ts       # 文本分块
│   │   ├── knowledge/
│   │   │   └── knowledge-service.ts # 知识目录管理
│   │   ├── prompt/
│   │   │   └── prompt-builder.ts  # 动态提示词构建
│   │   └── evolution/
│   │       ├── evolution-config.ts
│   │       ├── trigger.ts         # 空闲检测
│   │       ├── executor.ts        # 演进执行
│   │       └── backup.ts         # 快照备份
│   └── modules/
│       └── database/
│           └── database.service.ts # 扩展：FTS5 支持
│
├── agent/                         # Agent 工作空间 (对应 ~/cow/)
│   ├── AGENT.md                   # Agent 身份文件
│   ├── USER.md                    # 用户身份文件
│   ├── RULE.md                    # 工作规则
│   ├── MEMORY.md                  # 长期记忆索引
│   ├── memory/                    # 每日记忆目录
│   ├── skills/                    # 自定义技能目录
│   └── knowledge/                 # 知识库
│       └── index.md
│
└── client/
    └── src/
        └── pages/
            └── AIAssistantPage/
                └── AIAssistantPage.tsx  # 增强：显示记忆/知识/技能状态
```

---

## 四、分阶段移植计划

### 阶段一：工具系统重构（优先级最高）

**目标**：将 7 个硬编码工具改为可插拔的 BaseTool 体系

| 移植内容 | CowAgent 源文件 | 飞达目标 | 工作量 |
|----------|----------------|----------|--------|
| BaseTool 基类 | `agent/tools/base_tool.py` | `agent/tools/base-tool.ts` | 小 |
| ToolManager 单例 | `agent/tools/tool_manager.py` | `agent/tools/tool-manager.ts` | 中 |
| 工具注册表 | `agent/tools/__init__.py` | `agent/tools/registry.ts` | 小 |
| Read 工具 | `agent/tools/read/` | 已有 read_file，适配 | 小 |
| Write 工具 | `agent/tools/write/` | 已有 write_file，适配 | 小 |
| Edit 工具 | `agent/tools/edit/` | 已有 patch，适配 | 小 |
| Bash 工具 | `agent/tools/bash/` | 已有 bash，适配 | 小 |
| Ls 工具 | `agent/tools/ls/` | 已有 glob | 小 |
| WebSearch | `agent/tools/web_search/` | **新增** | 中 |
| WebFetch | `agent/tools/web_fetch/` | **新增** | 小 |
| SQL Query | 无对应(飞达特有) | 已有 sql_query | - |

**BaseTool 接口设计** (TypeScript):

```typescript
interface ToolParam {
  type: string;
  description: string;
  enum?: string[];
}

interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolParam>;
    required: string[];
  };
}

interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract parameters: ToolSchema['parameters'];
  
  getSchema(): ToolSchema { ... }
  abstract execute(params: Record<string, any>): Promise<ToolResult>;
}
```

### 阶段二：记忆系统（核心差异化能力）

**目标**：三层记忆架构——短期(上下文)、中期(每日日志)、长期(MEMORY.md + FTS5)

| 移植内容 | CowAgent 源文件 | 飞达目标 | 工作量 |
|----------|----------------|----------|--------|
| ConversationStore | `agent/memory/conversation_store.py` | `agent/memory/conversation-store.ts` | 中 |
| MemoryManager | `agent/memory/manager.py` | `agent/memory/memory-manager.ts` | 大 |
| MemoryStorage (FTS5) | `agent/memory/storage.py` | `agent/memory/storage.ts` | 大 |
| TextChunker | `agent/memory/chunker.py` | `agent/memory/chunker.ts` | 小 |
| DailyLog | 无独立文件(daily 逻辑在 summarizer) | `agent/memory/daily-log.ts` | 小 |
| LongTerm (MEMORY.md) | summarizer.py | `agent/memory/long-term.ts` | 小 |
| Summarizer | `agent/memory/summarizer.py` | `agent/memory/summarizer.ts` | 中 |

**关键实现要点**：

1. **ConversationStore** → 复用 better-sqlite3，建 sessions + messages 表
2. **混合搜索** → SQLite FTS5 (中文 CJK 分词) + 向量搜索 (可选，暂用关键词权重替代)
3. **记忆刷新** → 上下文超限时自动摘要刷到 daily log
4. **长期记忆索引** → MEMORY.md 由 Agent 自动维护，通过工具读写

**数据库 Schema**：

```sql
-- 对话会话
CREATE TABLE agent_sessions (
  session_id TEXT PRIMARY KEY,
  title TEXT DEFAULT '',
  created_at INTEGER NOT NULL,
  last_active INTEGER NOT NULL,
  msg_count INTEGER DEFAULT 0
);

-- 对话消息 (JSON content 格式)
CREATE TABLE agent_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(session_id, seq)
);

-- 记忆块 (FTS5)
CREATE VIRTUAL TABLE memory_chunks USING fts5(
  content, source_path, user_id,
  tokenize='unicode61'
);

-- 文件元数据 (增量同步)
CREATE TABLE memory_file_meta (
  path TEXT PRIMARY KEY,
  hash TEXT,
  last_synced INTEGER
);
```

### 阶段三：技能系统

**目标**：SKILL.md 文件定义技能，Agent 自动加载注册

| 移植内容 | CowAgent 源文件 | 飞达目标 | 工作量 |
|----------|----------------|----------|--------|
| SkillManager | `agent/skills/manager.py` | `agent/skills/skill-manager.ts` | 中 |
| SkillLoader | `agent/skills/loader.py` | `agent/skills/skill-loader.ts` | 中 |
| SkillFormatter | `agent/skills/formatter.py` | `agent/skills/skill-formatter.ts` | 小 |
| SKILL.md 前端解析 | `agent/skills/frontmatter.py` | `agent/skills/frontmatter.ts` | 小 |
| 内置技能 | `skills/` (3个) | `skills/` 目录 | 小 |

**技能定义格式** (保持与 CowAgent 兼容)：

```markdown
---
name: sql-helper
description: 帮你编写和优化 SQL 查询，分析数据库结构
always: false
default_enabled: true
---

# SQL 辅助技能

当用户询问数据库相关问题时，使用此技能：
1. 先用 sql_query 工具查看表结构
2. 根据需求编写优化 SQL
3. 查询结果用表格或列表展示
```

### 阶段四：Agent Loop 升级

**目标**：替换单一 runCodeAgent 为完整的 AgentStreamExecutor

| 移植内容 | CowAgent 源文件 | 飞达目标 | 工作量 |
|----------|----------------|----------|--------|
| Agent 类 | `agent/protocol/agent.py` | `agent/core/agent.ts` | 大 |
| AgentStreamExecutor | `agent/protocol/agent_stream.py` | `agent/core/agent-loop.ts` | 大 |
| Task/Result 模型 | `agent/protocol/task.py` + `result.py` | `agent/core/task.ts` + `result.ts` | 小 |
| CancelToken | `agent/protocol/cancel.py` | `agent/core/cancel.ts` | 小 |
| 消息压缩 | `agent/protocol/message_utils.py` | agent-loop 内联 | 小 |

### 阶段五：知识系统 + 提示词 + 自演进

| 移植内容 | 工作量 | 依赖 |
|----------|--------|------|
| KnowledgeService | 小 | 阶段四 Agent |
| PromptBuilder | 中 | 阶段二记忆 + 阶段三技能 |
| 自演进系统 | 大 | 全部前置阶段 |

---

## 五、需要改造的现有代码

### 最小侵入原则——现有功能不受影响

| 现有文件 | 改造方式 |
|----------|----------|
| `server/ai-service.js` | 保留，新增 `runCodeAgent()` → 委托到新 Agent.循环 |
| `server/code-agent-tools.js` | 保留，工具逐步迁移到 `agent/tools/builtin/` |
| `client/.../AIAssistantPage.tsx` | 增强：记忆面板、技能开关、知识索引展示 |
| `server/modules/database/database.service.ts` | 扩展：新增 agent_* 表创建逻辑 |

---

## 六、技术风险与决策

| 决策点 | 建议 | 理由 |
|--------|------|------|
| 是否用 Python bridge 调用 CowAgent？ | **否**，纯 Node.js 重写 | 跨进程通信开销大，部署复杂 |
| 向量搜索用 numpy 还是纯 JS？ | **暂不实现向量搜索**，先用 FTS5 关键词 | 降低复杂度，关键词搜索够用 |
| 是否保留现有 runCodeAgent？ | **渐进替换**，先并存再切换 | 降低风险 |
| SKILL.md 格式 | **完全兼容** CowAgent 格式 | 技能可互通 |
| 自演进系统要不要移植？ | **暂缓**，先完成前四阶段 | 需要 Agent 基础完全稳定后再加 |

---

## 七、里程碑与工期估算

| 阶段 | 核心交付 | 预估 | 可独立验证 |
|------|----------|------|-----------|
| 一：工具系统 | BaseTool + ToolManager + 10工具 | 3天 | 新工具可注册、可被 Agent 调用 |
| 二：记忆系统 | 对话持久化 + 每日日志 + FTS5搜索 | 3天 | 刷新页面后对话仍在 |
| 三：技能系统 | SKILL.md 加载 + 技能提示词注入 | 1天 | 创建 SKILL.md 后 Agent 自动识别 |
| 四：Agent Loop | 完整 Agent + 流式执行器 | 2天 | 工具调用更稳定、错误处理更健壮 |
| 五：知识+提示词 | 知识库 + 动态 Prompt | 2天 | Agent 自动维护知识索引 |
| **合计** | | **11天** | |

---

## 八、立即可开始的最小可行步骤

1. 创建 `server/agent/` 目录结构
2. 实现 `BaseTool` 基类 + `ToolManager` 单例
3. 将 `code-agent-tools.js` 的 7 个函数包装为 BaseTool 子类
4. 添加 `WebSearch` 和 `WebFetch` 两个新工具
5. 修改 `runCodeAgent` 使用 ToolManager.getTools() 替代硬编码工具列表
6. 实现 `ConversationStore` — 对话持久化到 SQLite
