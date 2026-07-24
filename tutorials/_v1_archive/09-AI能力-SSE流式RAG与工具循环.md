# 第 09 章 · AI 能力：SSE 流式、RAG 与工具循环

> Sowork AI 企业智能ERP系统 · 代码级技术教程
> 源码锚点：`server/ai-service.js`（流式 146~197、RAG 264~304、工具循环 474~572）、`server/code-agent-tools.js`（工具定义 47~157、分派 347~363）、`server/standalone.ts`（SSE 端点 3332~3360）

---

## 学习目标

- 读懂 SSE（Server-Sent Events）流式响应的服务端实现：从 HTTP 头到逐块 `write`
- 精读 RAG 混合检索：中文分词 + 余弦相似度 + 关键词打分的加权融合
- 逐段读懂"工具执行循环"（tool loop）：LLM 返回工具调用 → 执行 → 回填 → 再请求
- 掌握 7 个内置工具（read_file/grep/bash/sql_query…）的定义与安全边界
- （管理者）理解本地私有化 AI 对数据安全的意义

---

## 核心概念：企业 AI 的三块拼图

一个能"干活"的企业 AI 助手，需要三块能力拼在一起：

```
① 流式输出（SSE）   → 让用户看到 AI"边想边说"，而不是干等十几秒
② 知识增强（RAG）   → 让 AI 基于企业自己的知识库/数据回答，而非瞎编
③ 工具执行（Agent） → 让 AI 能真正查数据库、搜代码、跑命令，而非只会聊天
```

Sowork AI 的 AI 层（`server/ai-service.js` + `server/code-agent-tools.js`）把这三块都实现了。注意——这两个是**手写的 `.js` 文件**（不经 tsc 编译，靠 `build:server` 的 `cpSync` 拷贝，见第 01 章）。

---

## 源码剖析一：SSE 流式响应

流式的价值：ChatGPT 那种"文字一个个蹦出来"的体验，靠的就是 SSE。服务端端点在 `server/standalone.ts:3332-3360`：

```ts
// server/standalone.ts:3332-3360
router.post('/ai/stream-chat', async (req, res) => {
  try {
    const { messages, options } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: '请提供有效的 messages 数组' });
    }
    // SSE 流式响应
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    const aiService = require('./ai-service.js');
    const fullContent = await aiService.chatCompletionStreamFull(messages, options || {});
    res.write(`data: ${JSON.stringify({ type: 'content', content: fullContent.content })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (e: any) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: e.message });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: e.message })}\n\n`);
      res.end();
    }
  }
});
```

SSE 的四个关键响应头，逐个说清：

| 响应头 | 值 | 作用 |
|--------|----|----|
| `Content-Type` | `text/event-stream` | 告诉浏览器这是 SSE 流，不是普通 JSON |
| `Cache-Control` | `no-cache` | 禁止缓存，每个 token 都要实时到达 |
| `Connection` | `keep-alive` | 保持长连接，持续推送 |
| `X-Accel-Buffering` | `no` | **关键**：关闭 Nginx 等反向代理的缓冲，否则代理会攒够一批才发，流式就失效了 |

数据格式是 `data: {...}\n\n`——每条消息以 `data: ` 开头、`\n\n` 结尾，这是 SSE 协议规定。

底层逐块解析在 `server/ai-service.js:146-197`，这才是真正"逐字"的地方：

```js
// server/ai-service.js:146-190
async function chatCompletionStreamFull(messages, options = {}) {
  const model = resolveModelConfig(options);
  const config = { ...model, ...getRuntimeConfig(), ...options };
  const isOllama = config.providerType === 'ollama';
  const onToken = options.onToken || (() => {});
  ...
  return new Promise((resolve, reject) => {
    ...
    res.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n'); buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim()) continue;
        if (line.startsWith('data: ')) {
          // OpenAI SSE 格式
          const j = line.slice(6).trim(); if (j === '[DONE]') continue;
          try { const p = JSON.parse(j); const c = p.choices?.[0]?.delta?.content || ''; if (c) { fullContent += c; onToken(c); } } catch {}
        } else {
          // Ollama JSON 行格式
          try { const p = JSON.parse(line); const c = p.message?.content || ''; if (c) { fullContent += c; onToken(c); } } catch {}
        }
      }
    });
    res.on('end', () => { resolve({ content: fullContent, model: config.model }); });
```

逐段拆解流式解析的难点：

1. **`buffer` + `split('\n')` + `lines.pop()`**：网络分片不保证按行到达，一个 chunk 可能包含"半行"。所以先累积到 `buffer`，`split('\n')` 后 **`lines.pop()` 把最后可能不完整的一行留回 buffer**，等下个 chunk 拼齐——这是流式解析的经典技巧。
2. **兼容两种 LLM 格式**：`data: ` 前缀 → OpenAI 格式（取 `delta.content`）；纯 JSON 行 → Ollama 格式（取 `message.content`）。**一套代码同时支持云端 API 和本地 Ollama**。
3. **`onToken(c)` 回调**：每解析出一段内容就回调。上层可以在这个回调里把 token 实时 `res.write` 给浏览器（见另一个端点 `/ai/code-agent/stream`），实现真正的"逐字上屏"。

🔑 `isOllama` 这个开关贯穿全文——它让系统既能接 OpenAI/DeepSeek 云端模型，也能接**完全本地**的 Ollama 模型（数据不出企业内网）。

---

## 源码剖析二：RAG 混合检索

RAG（检索增强生成）的核心是：回答前先从知识库里"检索"出相关片段喂给 LLM。Sowork AI 用的是**语义 + 关键词混合检索**（`server/ai-service.js:264-304`）。

先看中文分词（`server/ai-service.js:264-273`）：

```js
// server/ai-service.js:264-273
const STOP = new Set('的了是在我有人都不一个上也很到说要你会有自己这他那所为所以因为但'.split(''));
function tokenizeChinese(text) {
  const words = text.replace(/[^\u4e00-\u9fff\w]/g, ' ').split(/\s+/).filter(w => w.length >= 1);
  const tokens = [];
  for (const w of words) {
    if (w.length === 1) { if (/[\u4e00-\u9fff]/.test(w) && !STOP.has(w)) tokens.push(w); }
    else tokens.push(w);
  }
  return [...new Set(tokens)];
}
```

无第三方分词库，用停用词表 + 正则做轻量中文分词——单字若是停用词（"的""了"）则丢弃。**零依赖、可私有化**是这套 AI 层的设计底色。

再看语义相似度（`server/ai-service.js:275-286`）：

```js
// server/ai-service.js:275-286
function cosineSimilarity(a, b) {
  const tf = (t) => {
    const words = t.toLowerCase().split(/[\s,，。！？、；：""''（）\(\)\n]+/).filter(w => w.length > 1);
    const m = {}; words.forEach(w => { m[w] = (m[w] || 0) + 1; });
    const n = words.length || 1; Object.keys(m).forEach(k => m[k] /= n);
    return m;
  };
  const tA = tf(a), tB = tf(b), all = new Set([...Object.keys(tA), ...Object.keys(tB)]);
  let dot = 0, nA = 0, nB = 0;
  all.forEach(w => { const va = tA[w] || 0, vb = tB[w] || 0; dot += va * vb; nA += va * va; nB += vb * vb; });
  return (nA === 0 || nB === 0) ? 0 : dot / (Math.sqrt(nA) * Math.sqrt(nB));
}
```

这是**基于词频（TF）的余弦相似度**——不需要 embedding 模型、不需要向量数据库，纯 JS 就能算。精度不如深度 embedding，但零成本、零依赖，对企业内部文档检索够用。

最后是混合融合（`server/ai-service.js:294-304`）：

```js
// server/ai-service.js:294-304
function hybridSearch(query, items, config = runtimeConfig.retrieval) {
  const qTokens = tokenizeChinese(query);
  const results = items.map(item => {
    const sem = cosineSimilarity(query, item.title || '') * 0.6 + cosineSimilarity(query, item.content || '') * 0.4;
    const kw = keywordScore(qTokens, tokenizeChinese((item.title || '') + ' ' + (item.content || '')));
    const w = config.hybridWeight || { semantic: 0.6, keyword: 0.4 };
    const score = config.searchMode === 'keyword' ? kw : config.searchMode === 'semantic' ? sem : sem * w.semantic + kw * w.keyword;
    return { ...item, score, semanticScore: sem, keywordScore: kw };
  });
  return results.filter(r => r.score > (config.scoreThreshold || 0.05)).sort((a, b) => b.score - a.score).slice(0, config.topK || 5);
}
```

逐段读打分逻辑：

1. **语义分 `sem`**：标题相似度 ×0.6 + 正文相似度 ×0.4（标题权重更高，因为标题更浓缩）。
2. **关键词分 `kw`**：查询词命中文档词的比例。
3. **混合 `score`**：默认 `sem × 0.6 + kw × 0.4`。支持三种模式切换——`keyword`（纯关键词）、`semantic`（纯语义）、`hybrid`（混合，默认）。
4. **过滤 + 排序 + 截断**：分数低于 `scoreThreshold`（默认 0.05）的丢弃，按分降序取 `topK`（默认 5）条喂给 LLM。

🔑 **为什么混合而不是纯语义？** 纯语义会漏掉专有名词精确匹配（如产品型号"XG-2000"），纯关键词又抓不住语义近似。混合是工程上的平衡点。

---

## 源码剖析三：工具执行循环（Agent 的心脏）

这是 AI 从"聊天机器人"进化成"能干活的 Agent"的关键。核心循环在 `server/ai-service.js:474-572`：

```js
// server/ai-service.js:478-539（节选主循环）
const maxIterations = options.maxIterations || 15;
const allMessages = [...messages];
let finalContent = '';
const steps = [];
...
for (let i = 0; i < maxIterations; i++) {
  ...
  if (!isOllama) {
    reqBody.tools = tools.TOOL_DEFINITIONS;
    reqBody.tool_choice = 'auto';
  }
  const response = await chatCompletionDirect(reqBody, cfg);
  // 统一响应格式：OpenAI 是 choices[0].message，Ollama 是 message
  let msg = null;
  if (response.choices && response.choices.length > 0) {
    msg = response.choices[0].message;
  } else if (response.message) {
    msg = response.message;
  }
  if (!msg) { finalContent = 'AI 无响应'; break; }

  // OpenAI 标准 tool_calls
  if (msg.tool_calls && msg.tool_calls.length > 0) {
    allMessages.push({ role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls });
    for (const tc of msg.tool_calls) {
      const fnName = tc.function.name;
      let fnParams = {};
      try { fnParams = JSON.parse(tc.function.arguments); } catch { /* ignore */ }
      const toolResult = tools.execute(fnName, fnParams);
      steps.push({ tool: fnName, params: fnParams, result: toolResult });
      allMessages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(toolResult, null, 2).slice(0, 4000) });
    }
    continue;
  }
  ...
  finalContent = (msg.content || '').replace(/\[TOOL:\w+\][\s\S]*?\[\/TOOL\]/g, '').trim();
  break;
}
return { content: finalContent || '达到最大执行次数，请简化你的请求。', steps, iterations: steps.length };
```

这就是 **ReAct（Reason + Act）循环**的标准实现，逐步拆解：

1. **`for (let i = 0; i < maxIterations; i++)`**：最多循环 15 轮，防止 AI 陷入无限工具调用。
2. **把工具定义传给 LLM**：`reqBody.tools = TOOL_DEFINITIONS`、`tool_choice = 'auto'`——让模型自己决定要不要调工具、调哪个。
3. **模型返回 `tool_calls`**：说明 AI 决定"我要查数据库"。代码解析出工具名和参数，`tools.execute(fnName, fnParams)` **真正执行**。
4. **回填结果**：把工具结果作为 `role: 'tool'` 消息 `push` 回消息历史，`continue` 进入下一轮——**AI 拿到工具结果后继续思考**。
5. **`.slice(0, 4000)`**：工具结果截断到 4000 字符，防止把 LLM 的上下文撑爆。
6. **无工具调用则收尾**：模型不再需要工具时，返回纯文本作为最终答案，`break` 退出循环。

⚠️ 代码里还有一段 Ollama 兼容分支（`server/ai-service.js:542-563`）：因为部分 Ollama 模型不支持标准 `tool_calls`，改用 `[TOOL:name]{...}[/TOOL]` 标签格式，用正则 `/\[TOOL:(\w+)\]([\s\S]*?)\[\/TOOL\]/g` 解析。这再次体现"云端 + 本地双支持"的设计。

---

## 源码剖析四：7 个内置工具及其安全边界

工具定义是 OpenAI function-calling 标准格式（`server/code-agent-tools.js:47-157`），共 7 个：

| 工具 | 作用 | 关键参数 |
|------|------|---------|
| `read_file` | 读项目文件（可指定行范围） | `file_path`, `offset`, `limit` |
| `write_file` | 写文件 | `file_path`, `content` |
| `patch` | 精确替换文件片段 | `file_path`, `old_string`, `new_string` |
| `grep` | 正则搜索代码 | `pattern`, `path`, `glob` |
| `glob` | 文件名匹配 | `pattern`, `limit` |
| `bash` | 执行 shell 命令（结果截断 8000 字符） | `command`, `timeout` |
| `sql_query` | 查询/修改 SQLite（写操作需确认） | `sql`, `confirm` |

看 `sql_query` 的定义，注意它的安全设计（`server/code-agent-tools.js:142-155`）：

```js
// server/code-agent-tools.js:142-155
{
  type: 'function',
  function: {
    name: 'sql_query',
    description: '对项目SQLite数据库执行查询（只读SELECT）或修改（INSERT/UPDATE/DELETE）。修改操作需要confirm参数。',
    parameters: {
      type: 'object',
      properties: {
        sql: { type: 'string', description: 'SQL语句。只读查询直接执行，写操作需confirm=true' },
        confirm: { type: 'boolean', description: '执行写操作时必须设为true确认' },
      },
      required: ['sql']
    }
  }
},
```

分派器把工具名路由到实现，并内置安全限制（`server/code-agent-tools.js:347-363`）：

```js
// server/code-agent-tools.js:347-363
module.exports = {
  TOOL_DEFINITIONS,
  execute(name, params) {
    switch (name) {
      case 'read_file': return execReadFile(params);
      case 'write_file': return execWriteFile(params);
      case 'patch': return execPatch(params);
      case 'grep': return execGrep(params);
      case 'glob': return execGlob(params);
      case 'bash': return execBash(params);
      case 'sql_query': return execSqlQuery(params);
      default: return { error: `未知工具: ${name}` };
    }
  },
  execReadFile, execWriteFile, execPatch, execGrep, execGlob, execBash, execSqlQuery,
};
```

🔑 三道安全闸口（在各 `exec*` 实现里）：
- **`read_file`/`write_file`**：`ALLOWED_PATHS` 路径白名单，AI 不能读写项目目录外的文件。
- **`bash`**：危险命令（`rm -rf` 等）拦截 + 结果截断 8000 字符。
- **`sql_query`**：写操作（INSERT/UPDATE/DELETE）必须 `confirm=true`，防止 AI 误删数据。

---

## 实战代码：调用 AI 助手

```bash
# 流式对话
curl -N -X POST http://localhost:3000/api/ai/stream-chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"公司有多少在职员工？"}]}'
# → data: {"type":"content","content":"..."}
# → data: {"type":"done"}
```

Code Agent（带工具循环）会让 AI 自己 `sql_query` 查 `employees` 表统计人数，再用自然语言回答——你在返回的 `steps` 里能看到它执行了哪些工具。

---

## 运行演示：观察工具循环

给 Code Agent 一个需要查数据的问题，返回结构长这样：

```json
{
  "content": "公司当前有 127 名在职员工。",
  "steps": [
    { "tool": "sql_query", "params": { "sql": "SELECT COUNT(*) c FROM employees WHERE status='active'" }, "result": [{ "c": 127 }] }
  ],
  "iterations": 1
}
```

`steps` 就是 AI 的"行动轨迹"——它先查了数据库，拿到 127，再组织成自然语言。这就是工具循环的价值：**AI 的回答有据可查，不是编的**。

---

## 管理者视角

| 关注点 | AI 能力给出的答案 |
|--------|-------------------|
| **数据安全** | 支持接本地 Ollama 模型，对话数据、企业知识**完全不出内网**。RAG 检索也是纯本地计算（无需外部向量服务）。 |
| **实用性** | 不是"玩具聊天框"——Code Agent 能真正查数据库、搜文档、生成报表，答案基于企业真实数据（RAG + 工具循环）。 |
| **成本可控** | 检索用零依赖的 TF 余弦相似度，不需要采购向量数据库或 embedding API。接哪家大模型可配置。 |
| **风险** | AI 的 `sql_query`/`bash` 有写权限（虽有 confirm 与白名单保护）。生产环境应限制 Code Agent 仅管理员可用，并审计其 `steps`。 |

给决策者一句话：**"可私有化 + 能干活 + 成本低"三点，让这套 AI 从演示走向真实生产可用**——尤其是数据敏感的企业。

---

## 注意事项

- ⚠️ **`ai-service.js` / `code-agent-tools.js` 是手写 JS**：不经 tsc 编译，改完必须 `npm run build:server`（会 `cpSync` 到 dist），否则生产环境用的还是旧文件。
- ⚠️ **SSE 必须设 `X-Accel-Buffering: no`**：否则经 Nginx 代理时流式会被缓冲，退化成"一次性返回"。
- ⚠️ **工具循环有 `maxIterations` 上限（15）**：复杂任务可能触顶返回"达到最大执行次数"，需拆分问题。
- ⚠️ **Code Agent 的工具有写权限**：`bash`/`sql_query`/`write_file` 能改系统。务必用权限控制限制可用人群，并审计 `steps`。
- 🔑 RAG 用的是 TF 余弦（非深度 embedding），精度换取零依赖。文档量极大或精度要求极高时，可扩展接入真正的向量检索。

---

## 练习

1. 阅读 `chatCompletionStreamFull`（146 行），解释 `buffer` + `lines.pop()` 为什么能正确处理"网络分片切断了一行"的情况。
2. 在 `hybridSearch`（294 行）里，语义分对标题用 0.6、正文用 0.4 的权重。说明为什么标题权重更高，以及把它改成 0.5/0.5 会有什么影响。
3. **读源码猜作用**：工具循环里每次把工具结果 `.slice(0, 4000)` 再回填。猜猜如果去掉这个截断，长查询结果会导致什么问题。
4. 动手：给 Code Agent 提一个"统计本月新入职员工"的问题，观察返回的 `steps`，看它生成了什么 SQL、执行了几轮工具。

---

> **系列导航**：上一章 ← [第 08 章 · 低代码平台：从向导到模型热部署](./08-低代码平台-从向导到模型热部署.md) ｜ 下一章 → [第 10 章 · CMS 内容门户：富文本与标签智能提取](./10-CMS内容门户-富文本与标签智能提取.md)
