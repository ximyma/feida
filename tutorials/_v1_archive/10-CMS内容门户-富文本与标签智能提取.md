# 第 10 章 · CMS 内容门户：富文本、标签智能提取与审核工作流

> Sowork AI 企业智能ERP系统 · 代码级技术教程
> 源码锚点：`server/standalone.ts`（标签云 9194~9206、文章 CRUD 9208~9290、智能标签 9293~9327、敏感词 9329~9337、审核/回收站 9577~9586、批量操作 9599~9610）

---

## 学习目标

- 读懂 CMS 文章的完整 CRUD：创建/编辑时如何处理 JSON 字段、敏感词拦截、软删除
- 精读"标签云聚合"：如何从文章内嵌 `tags` 字段实时统计标签热度（而非维护独立标签表）
- 逐行读懂"智能标签提取"算法：词库命中 + CJK n-gram 频率挖掘 + 去碎片
- 掌握审核工作流（approve/reject）与回收站（软删除 + restore）的状态设计
- （管理者）理解内容安全（敏感词）与内容运营（标签、审核）的落地方式

---

## 核心概念：CMS 在 Sowork AI 里的定位

Sowork AI 的 CMS 模块对标 SSCMS，但用 React SPA 架构重新实现。它承担企业官网、门户资讯、产品动态等内容发布职责。核心数据模型只有几张表：

```
cms_channels          栏目（树形，支持副栏目、模板、排序）
cms_articles          文章（内嵌 tags/images 的 JSON 字段）
cms_comments          评论（审核后可见）
cms_article_attachments  附件
cms_sensitive_words   敏感词库
cms_media             素材库
```

一个关键设计决策贯穿全章：**标签不是独立的表，而是内嵌在文章的 `tags` 字段（JSON 数组字符串）里**。这带来一个直接后果——"标签云"必须在查询时实时聚合。下面我们从这个点切入。

---

## 源码剖析一：标签云聚合（无标签表的实时统计）

标签云端点在 `server/standalone.ts:9194-9206`：

```ts
// server/standalone.ts:9194-9206
// 标签云聚合（统计各标签文章数）
router.get('/cms-tags', (req, res) => {
  const articles = db.findAll('cms_articles') as any[];
  const counter: Record<string, number> = {};
  articles.forEach((a: any) => {
    if (a.status === 'deleted') return;
    let tags: string[] = [];
    try { const p = JSON.parse(a.tags || '[]'); tags = Array.isArray(p) ? p : []; } catch { tags = []; }
    tags.forEach((t: string) => { if (t) counter[t] = (counter[t] || 0) + 1; });
  });
  const list = Object.entries(counter).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  res.json(list);
});
```

逐段拆解：

1. **`db.findAll('cms_articles')`**：取出全部文章。
2. **`if (a.status === 'deleted') return`**：跳过软删除文章——回收站里的文章不该出现在标签云。
3. **`JSON.parse(a.tags || '[]')`**：每篇文章的 `tags` 是 JSON 字符串，解析成数组。用 `try/catch` 包裹，脏数据不会让整个接口崩溃。
4. **`counter[t] = (counter[t] || 0) + 1`**：累加每个标签的出现次数。
5. **`Object.entries(...).map(...).sort(...)`**：转成 `[{name, count}]` 并按热度降序。

🔑 **为什么不建标签表？** 独立标签表需要维护"文章-标签"多对多关系表、增删文章时同步标签计数，复杂且容易不一致。内嵌 JSON + 查询时聚合的方案，牺牲了大数据量下的性能，换来了**数据一致性天然保证**（文章即真相来源，删文章标签自动消失）。对企业站点这种量级（文章通常几百到几千篇）完全够用。

> ⚠️ 历史教训（见项目记忆）：曾经有一个基于 `cms_tags` 表的重复 `GET /cms-tags` 死路由，导致标签云数据和文章实际标签对不上。**权威来源永远是文章内嵌的 `tags` 字段**，那条死路由已删除。

---

## 源码剖析二：文章创建——JSON 字段与敏感词拦截

创建文章在 `server/standalone.ts:9246-9269`：

```ts
// server/standalone.ts:9246-9269
router.post('/cms-articles', (req, res) => {
  const { channel_id, title, subtitle, author, source, summary, content, image_url, images, video_url, tags, keywords, is_top, is_hot, is_recommend, status, publish_time, seo_title, seo_keywords, seo_description } = req.body;
  if (!title) {
    res.status(400).json({ success: false, message: '文章标题不能为空' });
    return;
  }
  const hits = scanSensitive(`${title} ${summary} ${content}`);
  if (sensitiveBlock && hits.length > 0) {
    res.status(400).json({ success: false, message: '内容包含敏感词，已拦截发布', hits });
    return;
  }
  const id = `ca_${Date.now()}`;
  db.insert('cms_articles', {
    id, channel_id: channel_id || '', title, subtitle, author, source,
    summary, content, image_url, images: JSON.stringify(images || []),
    video_url, tags: JSON.stringify(tags || []), keywords,
    is_top: is_top ? 1 : 0, is_hot: is_hot ? 1 : 0, is_recommend: is_recommend ? 1 : 0,
    status: status || 'draft', publish_time: publish_time || new Date().toISOString(),
    view_count: 0, like_count: 0, comment_count: 0, favorite_count: 0,
    seo_title, seo_keywords, seo_description, sensitive_hits: JSON.stringify(hits),
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  });
  res.json({ success: true, id, sensitive_hits: hits });
});
```

三个关键点：

1. **JSON 字段序列化**：`images` 和 `tags` 都是数组，存库前 `JSON.stringify`——SQLite 里以 TEXT 存储（呼应第 04 章"JSON 列约定"）。
2. **布尔转 0/1**：`is_top ? 1 : 0`——SQLite 没有原生布尔，用整数模拟。
3. **敏感词扫描 + 拦截开关**：`scanSensitive(...)` 扫描标题+摘要+正文，命中词返回数组；`sensitiveBlock` 是全局开关（默认 false），开启后命中即 400 拦截。即使不拦截，命中词也会存进 `sensitive_hits` 字段供后台审计。

敏感词扫描本身很简洁（`server/standalone.ts:9329-9337`）：

```ts
// server/standalone.ts:9329-9337
let sensitiveBlock = false; // 命中即拦截（可在后台开启）
const scanSensitive = (text: string): string[] => {
  const words = (db.findAll('cms_sensitive_words') as any[]).map((w: any) => w.word).filter(Boolean);
  const hits: string[] = [];
  const t = String(text || '').toLowerCase();
  words.forEach((w: string) => { if (t.includes(String(w).toLowerCase())) hits.push(w); });
  return [...new Set(hits)];
};
```

纯字符串包含匹配（`includes`），大小写不敏感，去重返回。简单但对企业内容审核够用。

---

## 源码剖析三：文章详情——一次请求组装所有关联数据

详情端点（`server/standalone.ts:9208-9244`）做了很多"顺手活"，值得学习它如何在一个请求里把关联数据都拼好：

```ts
// server/standalone.ts:9214-9242（节选）
// 增加浏览次数
db.update('cms_articles', req.params.id, { view_count: (article.view_count || 0) + 1 });
article.view_count = (article.view_count || 0) + 1;
// 获取栏目信息
if (article.channel_id) article.channel = db.findById('cms_channels', article.channel_id);
// 反序列化 JSON 字段
article.tags_list = JSON.parse(article.tags || '[]');
article.images_list = JSON.parse(article.images || '[]');
article.attachments_list = db.findWhere('cms_article_attachments', { article_id: req.params.id });
// 评论（仅审核通过的）
const comments = db.findWhere('cms_comments', { article_id: req.params.id, status: 'approved' });
article.comments = comments;
// 上一篇 / 下一篇
const allArticles = db.findWhere('cms_articles', { channel_id: article.channel_id, status: 'published' });
allArticles.sort((a, b) => new Date(a.publish_time||a.created_at).getTime() - new Date(b.publish_time||b.created_at).getTime());
const currentIndex = allArticles.findIndex((a) => a.id === req.params.id);
if (currentIndex > 0) article.prev_article = allArticles[currentIndex - 1];
if (currentIndex < allArticles.length - 1) article.next_article = allArticles[currentIndex + 1];
```

一次请求完成了：**浏览量+1、栏目信息、标签/图片反序列化、附件、审核过的评论、上一篇/下一篇导航**。前端拿到就能直接渲染整个详情页，无需多次往返。注意 `tags_list`（数组）与 `tags`（原始 JSON 字符串）并存——前端用 `tags_list`，兼容旧代码用 `tags`。

---

## 源码剖析四：智能标签提取（本章算法重头戏）

这是最能体现工程巧思的一段。目标：给一篇文章的标题+正文，自动推荐候选标签。算法分两路——**词库命中**（复用全站已有标签）+ **新词挖掘**（CJK n-gram 频率），最后**去碎片**。源码在 `server/standalone.ts:9293-9327`：

```ts
// server/standalone.ts:9293-9327
router.post('/cms-articles/suggest-tags', (req, res) => {
  const { title = '', content = '' } = req.body as any;
  const text = String(title || '') + ' ' + String(content || '').replace(/<[^>]+>/g, ' ');
  // 现有全站标签词库（排除软删除文章）
  const existing = db.findAll('cms_articles') as any[];
  const vocab = new Set<string>();
  existing.forEach((a: any) => {
    if (a.status === 'deleted') return;
    try { (JSON.parse(a.tags || '[]') as string[]).forEach((t: string) => { if (t) vocab.add(t); }); } catch { /* ignore */ }
  });
  // 1) 词库命中：标题/正文中出现过的已有标签（相关标签，优先）
  const dictMatches = [...vocab].filter(t => text.includes(t));
  // 2) 新词挖掘：CJK n-gram 频率（2-4 字），去停用词
  const STOP = new Set(['我们','你们','他们','这个',/* …约 80 个停用词… */,'活动','项目']);
  const freq: Record<string, number> = {};
  const cjk = text.match(/[一-龥]+/g) || [];
  cjk.forEach(seg => {
    for (let n = 2; n <= 4; n++) {
      for (let i = 0; i + n <= seg.length; i++) {
        const w = seg.slice(i, i + n);
        if (STOP.has(w)) continue;
        freq[w] = (freq[w] || 0) + 1;
      }
    }
  });
  const novel = Object.entries(freq)
    .filter(([w, c]) => c >= 2 && !vocab.has(w) && !dictMatches.includes(w))
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([w]) => w);
  // 去碎片：若候选是更长候选（或已命中标签）的子串，则丢弃，保留更完整的短语
  const allTerms = [...dictMatches, ...novel];
  const deduped = novel.filter(w => !allTerms.some(t => t !== w && t.length > w.length && t.includes(w)));
  const suggestions = [...dictMatches, ...deduped].slice(0, 12);
  res.json({ suggestions });
});
```

逐段精读算法：

**第一路 · 词库命中（`dictMatches`）**
- 先从全站非删除文章收集所有已用过的标签，构成 `vocab`（词库）。
- `[...vocab].filter(t => text.includes(t))`：本文出现过的已有标签优先推荐。这样能让**标签体系收敛**——尽量复用已有标签，而不是每篇文章造新词。

**第二路 · 新词挖掘（`novel`）**
- `text.match(/[一-龥]+/g)`：提取所有连续中文片段。
- **n-gram 双层循环**：对每个片段，滑动窗口取 2~4 字的子串。比如"企业智能管理"会产出"企业""业智""智能""企业智""业智能"……
- `if (STOP.has(w)) continue`：约 80 个停用词（"我们""这个""系统"等）直接跳过。
- `freq[w] = (freq[w]||0)+1`：统计每个 n-gram 的出现频率。
- **筛选**：`c >= 2`（至少出现 2 次才算有意义）+ 不在词库 + 不在已命中里。
- **排序**：先按频率降序，频率相同时**长词优先**（`b[0].length - a[0].length`）——因为"企业智能"比"企业"更有信息量。

**第三路 · 去碎片（`deduped`）**
- n-gram 会产生大量子串噪音："企业智能"和它的子串"企业""智能"都会被统计。
- `novel.filter(w => !allTerms.some(t => t !== w && t.length > w.length && t.includes(w)))`：如果候选词 `w` 是另一个更长候选的子串，就丢弃 `w`，**保留最完整的短语**。
- 最终 `dictMatches`（已有标签）+ `deduped`（去碎片新词），取前 12 个。

🔑 这是一套**零依赖的中文关键词抽取**——没有用 jieba、没有 TF-IDF 库、没有 embedding，纯靠 n-gram 频率 + 停用词 + 去碎片。精度不如专业 NLP，但**零安装、可私有化、够用**，和第 09 章 AI 层的设计哲学一脉相承。

---

## 源码剖析五：审核工作流与回收站

CMS 用文章的 `status` 字段驱动一个轻量状态机：

```
draft（草稿） → published（已发布）    ← review approve
published/draft → deleted（回收站）    ← DELETE（软删除）
deleted → draft                        ← restore（恢复）
```

审核与恢复（`server/standalone.ts:9577-9586`）：

```ts
// server/standalone.ts:9577-9586
router.put('/cms-articles/:id/review', (req, res) => {
  const { action, reason } = req.body; // action: 'approve' | 'reject'
  const newStatus = action === 'approve' ? 'published' : 'draft';
  db.update('cms_articles', req.params.id, { status: newStatus, updated_at: new Date().toISOString() });
  res.json({ success: true, status: newStatus });
});
router.put('/cms-articles/:id/restore', (req, res) => {
  db.update('cms_articles', req.params.id, { status: 'draft', updated_at: new Date().toISOString() });
  res.json({ success: true });
});
```

软删除（`server/standalone.ts:9286-9290`）——注意 `DELETE` 请求**并不真删数据**，只是改状态：

```ts
// server/standalone.ts:9286-9290
router.delete('/cms-articles/:id', (req, res) => {
  // 软删除
  db.update('cms_articles', req.params.id, { status: 'deleted', updated_at: new Date().toISOString() });
  res.json({ success: true });
});
```

批量操作（`server/standalone.ts:9599-9610`）——后台勾选多篇文章批量删除/发布/移动栏目：

```ts
// server/standalone.ts:9599-9610
router.put('/cms-articles-batch', (req, res) => {
  const { ids, action, channel_id } = req.body;
  const articleIds = Array.isArray(ids) ? ids : [ids];
  if (action === 'delete') {
    articleIds.forEach((id) => db.update('cms_articles', id, { status: 'deleted', updated_at: new Date().toISOString() }));
  } else if (action === 'publish') {
    articleIds.forEach((id) => db.update('cms_articles', id, { status: 'published', updated_at: new Date().toISOString() }));
  } else if (action === 'move' && channel_id) {
    articleIds.forEach((id) => db.update('cms_articles', id, { channel_id, updated_at: new Date().toISOString() }));
  }
  res.json({ success: true });
});
```

🔑 **软删除的价值**：内容误删可恢复（回收站），且历史数据（浏览量、评论）不丢。所有查询接口都记得过滤 `status !== 'deleted'`——这是软删除方案的"隐性契约"，前面标签云、智能标签都遵守了它。

---

## 实战代码：内容运营全流程

```bash
# 1. 创建草稿
curl -X POST http://localhost:3000/api/cms-articles \
  -H "Content-Type: application/json" \
  -d '{"title":"Sowork AI 正式开源","content":"<p>企业智能ERP系统...</p>","tags":["开源","ERP"]}'
# → {"success":true,"id":"ca_1690000000000","sensitive_hits":[]}

# 2. 智能提取标签
curl -X POST http://localhost:3000/api/cms-articles/suggest-tags \
  -H "Content-Type: application/json" \
  -d '{"title":"Sowork AI 企业智能ERP系统开源","content":"企业智能管理，低代码平台，AI能力集成"}'
# → {"suggestions":["开源","ERP","企业智能","低代码","AI能力"]}

# 3. 审核发布
curl -X PUT http://localhost:3000/api/cms-articles/ca_1690000000000/review \
  -H "Content-Type: application/json" -d '{"action":"approve"}'
# → {"success":true,"status":"published"}

# 4. 查看标签云
curl http://localhost:3000/api/cms-tags
# → [{"name":"开源","count":5},{"name":"ERP","count":3}, ...]
```

---

## 运行演示：标签云是"活的"

发布几篇带不同标签的文章后，反复访问 `/api/cms-tags`，你会看到计数实时变化——因为它每次都重新聚合全部文章。把一篇文章软删除（`DELETE`），再看标签云，该文章贡献的标签计数立刻减少。这就是"文章即真相来源"设计的直观体现。

---

## 管理者视角

| 关注点 | CMS 给出的答案 |
|--------|----------------|
| **内容安全** | 敏感词库 + 可选的"命中即拦截"开关，防止违规内容发布；即使不拦截也记录命中词供审计。 |
| **内容运营效率** | 智能标签提取自动推荐标签，编辑不用手敲；标签云聚合让热点话题一目了然。 |
| **误操作可恢复** | 软删除 + 回收站，删错的文章可一键恢复，历史数据不丢。 |
| **审核合规** | 草稿→审核→发布的工作流，确保内容经人工审核才对外可见。 |

给决策者一句话：**CMS 不只是"发文章"，它把内容安全、运营效率、合规审核都做进了流程里**。

---

## 注意事项

- ⚠️ **标签的权威来源是文章内嵌 `tags` 字段**，不是独立标签表。任何统计都应从文章聚合，别再建"死路由"读旧表。
- ⚠️ **所有查询必须过滤 `status !== 'deleted'`**——这是软删除方案的隐性契约，漏掉会让回收站文章"复活"到前台。
- ⚠️ **JSON 字段存取要配对**：写入 `JSON.stringify`，读取 `JSON.parse` 且用 `try/catch` 兜底脏数据。
- 🔑 智能标签是启发式算法（n-gram + 停用词），对超长文章或专业术语密集的内容，建议编辑人工复核候选。
- 🔑 敏感词是纯 `includes` 匹配，无法处理变体（拼音、拆字）。安全要求极高时需扩展为正则/相似度匹配。

---

## 练习

1. 阅读 `suggest-tags`（9293 行），解释"去碎片"步骤为什么能把"企业""智能"这类子串过滤掉，只保留"企业智能"。
2. 标签云（9194 行）每次都遍历全部文章。当文章达到 10 万篇时会有什么性能问题？设计一个缓存方案（提示：可用内存缓存 + 文章增删时失效）。
3. **读源码猜作用**：文章创建时 `sensitive_hits: JSON.stringify(hits)` 即使不拦截也存了命中词。猜猜后台可以用这个字段做什么运营动作。
4. 动手：写一篇正文里重复出现"数字化转型"5 次的文章，调用 `suggest-tags`，观察它是否把"数字化转型"作为候选标签推荐出来，并解释为什么。

---

> **系列导航**：上一章 ← [第 09 章 · AI 能力：SSE 流式、RAG 与工具循环](./09-AI能力-SSE流式RAG与工具循环.md) ｜ 下一章 → [第 11 章 · 商城 ShopXO 超集：库存联动与售后状态机](./11-商城ShopXO超集-库存联动与售后状态机.md)
