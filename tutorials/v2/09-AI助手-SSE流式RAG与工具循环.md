# AI 助手——SSE 流式、RAG 混合检索与工具循环

本篇带你深入 **Sowork AI 企业智能ERP系统** v1.2.0 的 AI 助手内核：一条 SSE 长连接如何把模型 Token 实时推到前端，知识库问答如何不依赖向量库而用 TF 余弦完成混合检索，以及代码助手如何像人一样「思考→调工具→看结果→再思考」最多 15 轮。

---

## 学习目标

读完本文你能做到：

- 在 `http://localhost:3000` 用 `admin/admin123` 跑通一次流式问答与一次代码助手任务。
- 解释 `POST /ai/stream-chat` 的 4 个响应头各自作用，尤其是 `X-Accel-Buffering:no`。
- 读懂 `hybridSearch` 的 `语义×0.6 + 关键词×0.4` 打分逻辑。
- 复述 ReAct 工具循环的回合结构，并知道 15 轮上限在哪里。
- 在部署侧清楚 AI 能力的三条安全边界。

---

## 核心概念

先建立四个词的心智模型：

| 概念 | 一句话 | 本文落点 |
|---|---|---|
| SSE | Server-Sent Events，服务端单向持续推流 | `text/event-stream` 长连接 |
| RAG | 检索增强生成，先找资料再让模型作答 | `hybridSearch` 混合检索 |
| 混合检索 | 语义相似 + 关键词命中加权 | `0.6 / 0.4` 权重 |
| ReAct | 推理(Reason)与行动(Act)交替的 Agent 范式 | `runCodeAgent` 工具循环 |

🚀 这套设计的初衷：用最小依赖（Node 原生 http + SQLite）换来「开箱即用的企业私有 AI 助手」。

---

## 界面布局与操作流程

前端入口在 AI 助手页，分两个面板：

```
AI 助手页 (localhost:3000)
├── 知识问答 / 对话面板
│   ├── 消息流（逐字流式渲染）
│   └── 输入框 → POST /ai/stream-chat
└── 代码助手 / Agent 面板
    ├── 思考步骤(steps)时间线
    └── 工具调用回显（read_file / sql_query …）
```

操作流程（你即操作者）：

1. 登录 `admin/admin123`，进入「AI 助手」。
2. 知识问答：输入「年假规则是什么」，观察文字逐字出现。
3. 代码助手：输入「查一下员工表有多少条记录」，观察它自动调用 `sql_query`。
4. 后端路由事实提醒：业务数据走 catch-all `POST /api/:table`，**没有按域前缀的 `/api/hr`**；AI 单独走 `/ai/*`。

---

## 底层逻辑与数据模型

AI 请求的三层数据流：

```
浏览器
  │  POST /ai/stream-chat (messages)
  ▼
standalone.ts  ──写入 SSE 头──▶  res.write("data: ...")
  │  require('./ai-service.js')
  ▼
ai-service.js
  ├── chatCompletionStreamFull   流式对话
  ├── hybridSearch               知识库检索(RAG)
  └── runCodeAgent               工具循环(Agent)
        │  TOOL_DEFINITIONS
        ▼
code-agent-tools.js  ── 受 ALLOWED_PATHS / 危险命令 / confirm 约束
```

知识条目的数据形状（RAG 检索对象）：

```js
{ id, title, content, score, semanticScore, keywordScore }
// hybridSearch 的 items 即上述数组，返回按 score 降序的前 topK 条
```

没有任何向量表、没有 pgvector、没有 Faiss——检索完全靠文本经 `tokenizeChinese` 后的 TF 向量与余弦相似度完成。

---

## 源码剖析

### 1. SSE 端点：四个响应头

`server/standalone.ts:3340` 在真正写数据前先落 4 个头：

```js
res.writeHead(200, {
  'Content-Type': 'text/event-stream',   // ① 声明这是事件流
  'Cache-Control': 'no-cache',           // ② 禁止中间缓存
  'Connection': 'keep-alive',            // ③ 保持长连接
  'X-Accel-Buffering': 'no',             // ④ 关闭反代缓冲
});
res.write(`data: ${JSON.stringify({ type: 'content', content: fullContent.content })}\n\n`);
res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
res.end();
```

- ① 让浏览器以 `event-stream` 解析；② 防止 CDN/网关缓存住不刷新；③ 让一条 TCP 连接持续复用。
- ④ 是 nginx 等反代的关键开关，详见原理剖析。

### 2. 流式分行解析技巧

`server/ai-service.js:174` 是流式解析的精髓——半包处理：

```js
let fullContent = '', buffer = '';
res.on('data', (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split('\n'); buffer = lines.pop() || '';  // 留住最后半行
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.startsWith('data: ')) {           // OpenAI SSE 格式
      const j = line.slice(6).trim();
      if (j === '[DONE]') continue;
      const p = JSON.parse(j);
      const c = p.choices?.[0]?.delta?.content || '';
      if (c) { fullContent += c; onToken(c); }
    } else {                                    // Ollama 逐行 JSON
      const p = JSON.parse(line);
      const c = p.message?.content || '';
      if (c) { fullContent += c; onToken(c); }
    }
  }
});
```

`lines.pop()` 把「未被 `\n` 结尾的残片」退回 `buffer`，下一包拼齐再解析——这是处理 TCP 分包的标准做法。`onToken` 回调即把单字推给前端的钩子，使 OpenAI 与本地 Ollama 两套协议在 `ai-service.js:149` 的 `isOllama` 分支下归一。

### 3. RAG 混合检索

`server/ai-service.js:294` 的 `hybridSearch` 是核心：

```js
function hybridSearch(query, items, config = runtimeConfig.retrieval) {
  const qTokens = tokenizeChinese(query);
  const results = items.map(item => {
    const sem = cosineSimilarity(query, item.title) * 0.6
              + cosineSimilarity(query, item.content) * 0.4;
    const kw  = keywordScore(qTokens, tokenizeChinese(item.title + ' ' + item.content));
    const w = config.hybridWeight || { semantic: 0.6, keyword: 0.4 };
    const score = sem * w.semantic + kw * w.keyword;
    return { ...item, score, semanticScore: sem, keywordScore: kw };
  });
  return results.filter(r => r.score > 0.05).sort((a,b)=>b.score-a.score).slice(0, 5);
}
```

语义分 `sem` 由标题与正文分别做余弦后按 `0.6/0.4` 加权；关键词分 `kw` 由 `tokenizeChinese` 切出的 token 命中率计算；两者再以 `0.6/0.4` 融合。低于阈值 `0.05` 的丢弃，取前 `topK`(默认 5)。`cosineSimilarity`(`ai-service.js:275`) 内部把文本转成归一化 TF 词频向量，再做点积除以模长——纯数学，无外部模型。

### 4. 工具循环 ReAct

`server/ai-service.js:474` 的 `runCodeAgent` 是 Agent 主循环：

```js
const maxIterations = options.maxIterations || 15;
for (let i = 0; i < maxIterations; i++) {
  const response = await chatCompletionDirect(reqBody, cfg);
  let msg = response.choices?.[0]?.message || response.message;
  if (msg.tool_calls && msg.tool_calls.length > 0) {        // OpenAI 格式
    allMessages.push({ role:'assistant', content: msg.content||'', tool_calls: msg.tool_calls });
    for (const tc of msg.tool_calls) {
      const toolResult = tools.execute(tc.function.name, JSON.parse(tc.function.arguments));
      allMessages.push({ role:'tool', tool_call_id: tc.id,
                         content: JSON.stringify(toolResult).slice(0,4000) });
    }
    continue;                                               // 把结果喂回模型，进入下一轮
  }
  finalContent = (msg.content||'').replace(/\[TOOL:.*?\[\/TOOL\]/g,'').trim();
  break;
}
```

循环体每次都带上历史 `allMessages` 重新问模型；模型若返回 `tool_calls`，就执行并把结果以 `role:'tool'` 回填，再 `continue`。直到模型不再要工具、直接给自然语言，或触达 `maxIterations=15` 才 `break`。Ollama 分支(`ai-service.js:542`)不支持原生 function calling，改用 `[TOOL:name]{...}[/TOOL]` 标签解析，结果以 `role:'user'` 文本回灌。

### 5. 七个工具与安全边界

`server/code-agent-tools.js:47` 定义 7 个工具，分发在 `code-agent-tools.js:347`：

```js
TOOL_DEFINITIONS = [read_file, write_file, patch, grep, glob, bash, sql_query]
module.exports.execute = (name, params) => {
  switch(name){
    case 'read_file': return execReadFile(params);   // ...
    case 'sql_query': return execSqlQuery(params);
    default: return { error: `未知工具: ${name}` };
  }
};
```

三条安全边界：

- 🔑 **路径白名单** `code-agent-tools.js:21`：`ALLOWED_PATHS` 只允许项目根、`data`、`client`、`server`；`sanitizePath` 一旦探测到 `..` 或越界即抛错。
- ⚠️ **bash 危险命令拦截** `code-agent-tools.js:303`：命中 `rm -rf /`、`mkfs.`、`shutdown`、`dd if=` 等直接拒绝。
- ✅ **sql_query 写操作确认** `code-agent-tools.js:321`：`INSERT/UPDATE/DELETE/DROP/ALTER/CREATE/TRUNCATE` 必须带 `confirm:true`，否则返回提示要求确认。

---

## 原理剖析

### ① 为什么 SSE 需要 `X-Accel-Buffering:no`

nginx 默认会对上游响应做缓冲——它攒够一块再一次性发给浏览器，这会「吃掉」流式的实时性，让逐字效果变成「卡一下整段蹦出来」。该响应头是 nginx 私有指令，显式告诉它「不要缓冲这条响应，来一个字节就透传一个字节」。其它反代（如某些 CDN）同理需要关闭缓冲。`Cache-Control:no-cache` 则防止更外层网关把这次回答缓存住。

### ② RAG 为何不用向量库

向量库（pgvector/Faiss）需要 embedding 模型把文本编码成高维向量，带来额外服务与算力。Sowork AI 企业智能ERP系统 选择「TF 词频向量 + 余弦」的轻量路线：

- 中文经 `tokenizeChinese` 切成单字/词 token，去掉「的、了、在」等停用词(`ai-service.js:264`)；
- 余弦相似度衡量「查询」与「文档」的词频分布接近度，等价于传统搜索引擎的语义近似；
- 再叠一层关键词命中率 `kw`，补偿纯语义对专名（如「年假」「报销单」）不敏感的问题。

`0.6/0.4` 的经验权重让「意思接近」为主、「字面命中」兜底，在中小语料下效果足够，且零外部依赖、可离线。

### ③ 工具循环如何防失控

ReAct 把「模型决策」与「工具执行」解耦：模型只产出意图(`tool_calls`)，真正落盘/执行由 `execute` 在白名单与确认机制内完成。15 轮上限(`ai-service.js:478`)是硬刹车——模型若陷入「调工具→不满意→再调」的死循环，到第 15 次直接返回「请简化请求」，避免无限消耗 Token 与数据库连接。

```
Reason → Act(tool_calls) → 执行 → 结果回填 role:tool → Reason → … (≤15 轮) → 自然语言收尾
```

---

## 管理者视角

- **替代人工**：内置知识库问答可承接约 60%–80% 的重复咨询（制度、流程、报销规则），相当于为 HR/IT 前台省下一名专职应答人力；代码助手让运维自己查库、定位日志，减少对开发者的打扰。
- **合规优势**：私有化部署下，模型若接本地 Ollama，则员工问询、知识文档、数据库查询**全程不出公司内网**；即使接 OpenAI，RAG 检索也只在本地 SQLite 完成，外发的是脱敏后的 query。
- **成本可控**：15 轮上限与 `topK=5` 检索天然限制单次对话的 Token 与算力开销，预算可预测。

---

## 注意事项

⚠️ AI 能力完全依赖你接入的模型：接 OpenAI 需可用 `apiKey` 与网络；接本地 Ollama 需先 `ollama pull` 对应模型。两者在 `ai-service.js:149` 的 `isOllama` 分支切换。

🔑 工具循环有 **15 轮上限**(`ai-service.js:478`) 防失控，复杂任务若被截断，请拆成更小的子问题。

✅ 知识库问答数据不出公司——前提是采用私有化/本地模型部署，且不在 system prompt 中拼入机密原文。

⚠️ `bash` 工具虽拦截了高危命令，但本质仍能在项目目录内执行任意命令；生产环境建议收紧 `ALLOWED_PATHS` 或对 `bash` 工具做角色级开关。

---

## 小结与练习

你已掌握 SSE 四头、`hybridSearch` 的 `0.6/0.4` 打分、`runCodeAgent` 的 15 轮 ReAct，以及三条安全边界。

练习：

1. 在 `ai-service.js:300` 把 `hybridWeight` 改成 `{semantic:0.8, keyword:0.2}`，观察专名查询与泛语义查询的排序变化。
2. 给 `runCodeAgent` 传入 `maxIterations:3`，故意问一个需要多步查库的问题，验证提前刹车行为。
3. 在 `code-agent-tools.js:21` 临时移出 `data` 路径，调用 `sql_query`，确认越界被拒。

> **系列导航**：[上一篇：08-企业级管控RBAC](./08-企业级管控-RBAC权限点与i18n.md) ｜ [下一篇：10-知识库BI预警](./10-知识库BI分析与智能预警.md) ｜ [大纲](../教程系列写作大纲V2.md)
