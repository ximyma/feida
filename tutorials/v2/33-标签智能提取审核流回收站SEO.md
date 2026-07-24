# 33. 标签智能提取 · 审核工作流 · 回收站 · SEO/Sitemap

本篇带你深入 **Sowork AI 企业智能ERP系统**（下文简称本系统）v1.2.0 的内容管理（CMS）四大能力：标签智能提取、审核工作流、软删除回收站、SEO 与 Sitemap。你将同时站在「写代码的开发者」和「看效果的管理者」两个视角，理解它们如何协同把一篇草稿变成可被搜索引擎抓取的优质内容。

## 学习目标

- 理解标签的权威数据来源，并能正确调用标签聚合接口。
- 掌握智能提取的算法原理：词库命中 + CJK n-gram 频率挖掘 + 去碎片。
- 看懂审核工作流的状态机（`review → published / draft`）。
- 理解软删除如何实现「回收站」式的防误删能力。
- 知道 SEO 字段与 `sitemap.xml` 的生成逻辑，让内容可被搜索引擎收录。

## 核心概念

| 概念 | 说明 |
| --- | --- |
| 标签云 | 对全站文章的内嵌 `tags`（JSON 数组）做聚合统计，输出 `[{name,count}]` |
| 智能提取 | 后端基于标题+正文自动给出候选标签，前端合并进表单 |
| 审核流 | 文章处于 `review` 状态，管理员「通过/驳回」驱动状态机 |
| 软删除 | 删除只是把 `status` 改为 `deleted`，数据仍保留，可恢复 |
| Sitemap | 将已发布文章与在售商品生成标准 `sitemap.xml` 供爬虫抓取 |

🔑 记住：本系统**没有独立的 cms_tags 表作为权威来源**，标签权威来源就是文章行内的 `tags` 字段（JSON 数组）。历史上曾存在基于 `cms_tags` 表的重复死路由，已被删除，教程一律以文章内嵌 tags 为准。

## 界面布局与操作流程

在后台「内容管理 → 文章管理」页（`client/src/pages/Admin/CMSAdminPage.tsx`）中，你会看到三类筛选按钮（`CMSAdminPage.tsx:634-635`）：

```
[全部]  [待审核(review)]  [回收站(deleted)]
```

- **左侧标签云侧栏**：页面挂载时请求 `GET /api/cms-tags`（`CMSAdminPage.tsx:111`），把全站标签渲染成可点击的标签云，点击即按标签筛选文章。
- **智能提取按钮**：编辑文章弹窗内点击「智能提取」，触发 `POST /api/cms-articles/suggest-tags`（`CMSAdminPage.tsx:290-314`），候选标签会自动合并进当前 tags 字段。
- **审核操作**：当文章状态为 `review` 时，行内出现「通过/驳回」按钮（`CMSAdminPage.tsx:531-540`）；通过调用 `PUT /api/cms-articles/:id/review {action:'approve'}`，驳回则传 `reject`。
- **回收站**：筛选切到「回收站」后，状态为 `deleted` 的文章行只显示「恢复」按钮（`CMSAdminPage.tsx:541-544`），调用 `PUT /api/cms-articles/:id/restore` 回到草稿。

## 底层逻辑与数据模型

文章表 `cms_articles` 的关键字段：

```
cms_articles
├── id           文章唯一ID (ca_时间戳)
├── title        标题
├── content      正文(HTML)
├── tags         JSON 字符串, 如 '["ERP","仓储"]'  ← 标签权威来源
├── status       draft | review | published | deleted | offline | scheduled
├── seo_title     SEO 标题
├── seo_keywords  SEO 关键词
├── seo_description SEO 描述
└── updated_at   软删除/恢复都会刷新此字段
```

状态机的核心分支在 `PUT /api/cms-articles/:id/review`（`server/standalone.ts:9577-9582`）：

```
approve ──► status = 'published'   (对外可见)
reject  ──► status = 'draft'        (退回草稿重新编辑)
```

软删除路由 `DELETE /api/cms-articles/:id`（`server/standalone.ts:9286-9290`）并不真删，只置 `status='deleted'`。列表接口 `GET /api/cms-articles` 默认会过滤掉 `deleted`（`standalone.ts:9150`）；只有显式传入 `status=deleted` 才返回回收站数据（`CMSAdminPage.tsx:127`）。

## 源码剖析

### 1. 标签云聚合 `GET /api/cms-tags`

核心逻辑遍历所有文章，跳过软删除，解析 `tags` JSON 并计数（`server/standalone.ts:9195-9206`）：

```ts
router.get('/cms-tags', (req, res) => {
  const articles = db.findAll('cms_articles') as any[];
  const counter: Record<string, number> = {};
  articles.forEach((a: any) => {
    if (a.status === 'deleted') return;          // ① 排除回收站文章
    let tags: string[] = [];
    try { const p = JSON.parse(a.tags || '[]'); tags = Array.isArray(p) ? p : []; } catch { tags = []; }
    tags.forEach((t: string) => { if (t) counter[t] = (counter[t] || 0) + 1; }); // ② 累加
  });
  const list = Object.entries(counter).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);          // ③ 按热度降序
  res.json(list);
});
```

### 2. 智能提取的 n-gram 算法 `POST /api/cms-articles/suggest-tags`

这是本篇最有技术含量的部分（`server/standalone.ts:9293-9327`）。算法分三步：

```ts
// 第一步：词库命中（已有的全站标签，若出现在本文中优先保留）
const vocab = new Set<string>();
existing.forEach((a: any) => {
  if (a.status === 'deleted') return;
  (JSON.parse(a.tags || '[]') as string[]).forEach((t: string) => { if (t) vocab.add(t); });
});
const dictMatches = [...vocab].filter(t => text.includes(t));

// 第二步：CJK n-gram 频率挖掘（2~4 字滑动窗口，剔除停用词）
const freq: Record<string, number> = {};
const cjk = text.match(/[一-龥]+/g) || [];
cjk.forEach(seg => {
  for (let n = 2; n <= 4; n++) {
    for (let i = 0; i + n <= seg.length; i++) {
      const w = seg.slice(i, i + n);
      if (STOP.has(w)) continue;                 // 过滤"我们/公司/系统"等碎片
      freq[w] = (freq[w] || 0) + 1;
    }
  }
});
const novel = Object.entries(freq)
  .filter(([w, c]) => c >= 2 && !vocab.has(w) && !dictMatches.includes(w)) // 出现≥2次才算候选
  .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
  .map(([w]) => w);

// 第三步：去碎片（丢弃被更长候选包含的短串，保留完整短语）
const deduped = novel.filter(w => !allTerms.some(t => t !== w && t.length > w.length && t.includes(w)));
const suggestions = [...dictMatches, ...deduped].slice(0, 12);
```

要点：n-gram 在中文里不需要分词器即可「挖」出高频短语；`c >= 2` 过滤偶发词；`STOP` 停用词表排除无意义高频词；最后的 `deduped` 保证「供应链管理」不会同时被「供应」「链管」这类碎片污染。

### 3. Sitemap 生成 `GET /sitemap.xml`

遍历已发布文章与在售商品，拼标准 XML（`server/standalone.ts:11732-11748`）：

```ts
const articles = db.findWhere('cms_articles', { status: 'published' });
const goods = db.findWhere('shop_goods', { status: 'online' });
// 每篇生成 <url><loc>.../site/article/{id}</loc><lastmod>...</lastmod></url>
```

## 原理剖析

为什么标签要用「内嵌 JSON」而非独立表？因为标签是文章的从属属性，内嵌可避免多表 JOIN、聚合统计时一次遍历即可完成（见 `cms-tags` 实现）。审核流用单一 `status` 字段表达状态机，比多表审批记录更轻量，适合中小内容团队；而软删除只改 `status`，让「删除」可撤销——这是回收站的本质。

✅ 软删除是「逻辑删除」，数据永不失联，可随时 `restore` 回草稿。

## 管理者视角

- **标签**提升内容检索与 SEO：读者点标签云即可聚合同类文章，搜索引擎也更易理解主题。
- **审核工作流**保障发布质量：所有 `review` 文章必须经管理员「通过」才变 `published`，避免未经校对的内容外泄。
- **回收站**防误删：运营手滑点了删除，管理员进回收站一键「恢复」，业务零损失。
- **SEO/Sitemap**让内容被看见：`seo_*` 字段写入页面 head，`sitemap.xml` 主动把已发布内容推给爬虫。

⚠️ 管理者需注意：审核「驳回」会把文章退回 `draft`，作者需重新提交才会再次进入待审核队列。

## 注意事项

- ⚠️ **标签权威来源是文章内嵌 `tags`（JSON），不是 `cms_tags` 表**。任何标签统计、筛选、云图都应走 `GET /api/cms-tags` 或文章的 `tags` 字段。
- 🔑 审核「驳回(reject)」会把状态重置为 `draft`，不是删除——作者可继续编辑后再次提交。
- ✅ 软删除（`status='deleted'`）均可回收：回收站「恢复」后状态回到 `draft`。
- 智能提取是基于词频的统计启发式，结果仅供参考，发布前人工确认更稳妥。
- Sitemap 只收录 `published` 文章与 `online` 商品，草稿/回收站内容不会暴露给爬虫。

## 小结与练习

本篇你掌握了：标签云来自文章内嵌 tags 的聚合（`standalone.ts:9195`）；智能提取用 n-gram 频率挖掘 + 词库命中（`standalone.ts:9293`）；审核流是 `review → published/draft` 状态机（`standalone.ts:9577`）；回收站基于软删除（`standalone.ts:9286`）；Sitemap 自动收录已发布内容（`standalone.ts:11732`）。

练习：
1. 给一篇新文章手动加 3 个标签，调用 `GET /api/cms-tags` 验证计数 +1。
2. 写一段含「供应链管理」「仓储优化」的正文，点击智能提取，观察候选标签是否包含这些短语。
3. 把文章提交审核，分别点「通过」与「驳回」，在数据库确认 `status` 变化。
4. 删除一篇文章后进入回收站点「恢复」，确认其重新出现在全部列表。

> **系列导航**：[上一篇：32-文章编辑](./32-文章编辑-Tiptap富文本与素材库.md) ｜ [下一篇：34-商城总览](./34-商城总览与商品管理.md) ｜ [大纲](../教程系列写作大纲V2.md)
