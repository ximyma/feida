# 31 · CMS 总览与栏目管理

## 学习目标

学完本篇，你将能够：

- 理解 CMS（内容门户）在 **Sowork AI 企业智能ERP系统** 中的定位，以及「栏目 → 文章」的层级关系。
- 在后台进入栏目管理界面，完成栏目的增删改查。
- 使用 HTML5 拖拽或 ↑/↓ 按钮调整栏目顺序，并理解底层 `sort_order` 字段的写入逻辑。
- 为栏目分别指定「列表模板」与「详情模板」，理解模板前后端分离的设计。

本篇基于 **v1.2.0** 的真实代码。请用 `admin/admin123` 登录，服务默认运行在 `http://localhost:3000`。

## 核心概念

CMS 即内容管理系统，本系统中它承担**企业官网、博客、资讯门户**的内容发布职责。

数据层级是一个简单的树：

```
企业官网 (/site)
└── 栏目 channel（cms_channels）
    ├── 子栏目
    └── 文章 article（cms_articles）
```

关键实体：

| 概念 | 表名 | 说明 |
| --- | --- | --- |
| 栏目 | `cms_channels` | 网站的导航节点，可多级嵌套 |
| 文章 | `cms_articles` | 归属于某栏目，承载正文内容 |
| 模板 | `template_list` / `template_detail` | 分别决定列表页与详情页的渲染样式 |

🔑 记住：栏目是网站导航的「骨架」，文章只是挂在骨架上的「内容」。

## 界面布局与操作流程

入口在左侧菜单 **网站管理** 分组（定义在 `client/src/components/Layout.tsx:189-200`）。点击「栏目管理」会跳转到 `/admin/cms?tab=channels`。

后台标签页结构（见 `CMSAdminPage.tsx:55`）：

```
栏目管理 | 文章管理 | Banner管理 | 评论管理
素材库 | 内容分组 | 敏感词 | 网站配置
```

进入「栏目管理」后，界面分为两块：

1. 顶部工具栏：显示「共 N 个栏目 · 拖拽行可排序」，以及「添加栏目」按钮。
2. 下方表格：列出所有栏目，每行支持拖拽、↑/↓ 排序、编辑、删除。

新增栏目时，弹窗表单包含这些字段（`CMSAdminPage.tsx:805-854`）：

| 字段 | 含义 |
| --- | --- |
| 栏目名称 | 必填，显示在前端导航 |
| 栏目编码 | code，可用于前端路由定位 |
| 上级栏目 | 不选则为顶级栏目 |
| 内容类型 | article / page / link |
| 栏目图片URL | 列表页或卡片样式展示 |
| 列表模板 | 决定栏目列表页布局 |
| 详情模板 | 决定单篇文章页布局 |
| 排序 / 显示 | `sort_order` 与 `is_show` |

## 底层逻辑与数据模型

栏目表 `cms_channels` 的字段在后端写入时完整列出（`server/standalone.ts:9099-9110`）：

```ts
const { name, parent_id, code, type, content_model,
        sort_order, is_show, image_url, description,
        seo_title, seo_keywords, seo_description,
        template_list, template_detail } = req.body;
```

核心字段解释：

- `id`：形如 `cc_<时间戳>`，前端拖拽与排序都以此为标识。
- `parent_id`：为空即顶级栏目，实现多级树。
- `sort_order`：整数，越小越靠前。排序、拖拽全都改写它。
- `is_show`：1 显示 / 0 隐藏。
- `template_list` / `template_detail`：可空，前端据此选不同渲染模板。

⚠️ 本篇重点：CMS 后端用的是**命名路由**，不是通用的 `/api/:table` catch-all。例如栏目相关路由全是 `/api/cms-channels*`，文章是 `/api/cms-articles*`。请按真实路由写前端调用。

## 源码剖析

**1. 栏目列表与树。** 后端按 `sort_order` 升序返回，并支持按 `parent_id` 过滤（`server/standalone.ts:9053-9081`）：

```ts
router.get('/cms-channels', (req, res) => {
  let channels = db.findAll('cms_channels');
  channels.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  res.json(channels);
});

router.get('/cms-channels/tree', (req, res) => { /* 递归 buildTree */ });
```

**2. 拖拽排序路由。** 这是栏目的灵魂接口（`server/standalone.ts:9115-9121`）：

```ts
// 拖拽排序：按传入 id 顺序重设 sort_order
router.post('/cms-channels/reorder', (req, res) => {
  const ids = (req.body).ids || (req.body).orderedIds;
  if (!Array.isArray(ids)) { res.status(400).json({ error: 'ids required' }); return; }
  ids.forEach((id, i) => { db.update('cms_channels', id, { sort_order: i }); });
  res.json({ success: true });
});
```

逻辑非常直白：把你拖好的 id 顺序数组传进来，`sort_order` 直接等于它在数组中的下标。

**3. 前端拖拽处理。** 表格行设置 `draggable`（`CMSAdminPage.tsx:600-604`），`onDragStart` 记录被拖行 id，`onDrop` 触发 `handleChannelDrop`：

```ts
const handleChannelDrop = async (targetId: string) => {
  const ordered = [...channels];
  const from = ordered.findIndex(c => c.id === dragChannelId);
  const to   = ordered.findIndex(c => c.id === targetId);
  const [moved] = ordered.splice(from, 1);
  ordered.splice(to, 0, moved);              // 本地先重排
  await fetch('/api/cms-channels/reorder', {  // 再写回后端
    method: 'POST',
    body: JSON.stringify({ ids: ordered.map(c => c.id) })
  });
  setChannels(ordered);
};
```

**4. 模板下拉。** 弹窗中两个独立 Select（`CMSAdminPage.tsx:829-844`）：

- 列表模板：`default` / `card` / `grid` / `waterfall`
- 详情模板：`default` / `full` / `split` / `magazine`

列表列里也会回显「列表 / 详情」模板（`CMSAdminPage.tsx:475`）。

## 原理剖析

为什么拖拽后必须调用 `reorder`？因为 `sort_order` 是 SQL/JSON 库里的一个普通整数字段，前端只是把它当作「展示顺序」的契约。拖拽只改变了你内存里的数组，不写回数据库，刷新页面就丢了。

排序读取端（`server/standalone.ts:9065`）始终执行：

```ts
channels.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
```

所以无论用拖拽还是 ↑/↓ 按钮，本质都是在对 `sort_order` 重新编号。↑/↓ 按钮的实现（`CMSAdminPage.tsx:482-483`）其实就是把相邻两条的 `sort_order` 互换，再 `PUT /api/cms-channels/:id`。

模板字段为什么有两个？因为列表页（栏目聚合多篇文章）和详情页（单篇正文）的版式需求完全不同。把它们存成栏目上的独立字段，前端渲染时按 `template_list` 选列表组件、按 `template_detail` 选详情组件，实现**前后端模板解耦**。

🚀 站在架构视角：`cms_channels` 既是数据结构，也是「网站导航配置」。你可以把它理解为一张被持久化的站点地图。

## 管理者视角

作为内容负责人，你应关注三点：

- **内容自助发布**：编辑在「文章管理」里写稿，你只需在「栏目管理」搭好骨架，二者解耦，互不打扰。
- **栏目结构即网站导航**：你在后台排好的栏目树与顺序，几乎 1:1 映射到前台 `/site` 的导航。调整栏目就是调整官网结构。
- **模板分离前后端**：不懂代码的运营也能通过下拉框切换「卡片 / 瀑布流 / 杂志风」，无需改前端代码即可改版式。

✅ 最佳实践：新增栏目时先定好 `内容类型`（文章/单页/链接），再选模板，最后用拖拽把顺序摆好并确认「已调整顺序」提示出现。

## 注意事项

⚠️ **栏目删除影响文章归属**：后端删除前会校验子栏目与文章（`server/standalone.ts:9128-9142`）。若栏目下还有文章，会直接拒绝删除并提示「请先删除该栏目下的文章」。所以删栏目前，请先把文章迁移或删除。

🔑 **拖拽排序要保存**：拖完听到 `message.success('已调整顺序')` 才算真正落库。如果网络中断只改了前端数组，刷新即还原。

✅ **模板可区分列表/详情**：`template_list` 与 `template_detail` 互不影响。同一个栏目可以让列表用「网格」、详情用「通栏大图」，别混为一谈。

⚠️ **隐藏不等于删除**：`is_show=0` 只是前端不展示，数据仍在。要彻底清理先用删除流程。

## 小结与练习

本篇你看到了 CMS 的两条主线：

1. 栏目是树形「导航骨架」，由 `cms_channels` 表承载，`sort_order` 控制顺序。
2. 拖拽排序通过 `POST /api/cms-channels/reorder` 把 id 顺序写回 `sort_order`；模板字段让列表页与详情页独立换肤。

练习：

- 登录后台，新增一个顶级栏目「新闻中心」，再在其下加子栏目「公司动态」，用拖拽把顺序调到你想要的位置。
- 给「公司动态」分别选择列表模板 `grid`、详情模板 `magazine`，保存后在 `/site` 验证版式差异。
- 尝试删除一个含文章的栏目，观察后端的拦截提示，理解 `server/standalone.ts:9128` 的校验逻辑。

> **系列导航**：[上一篇：30-质量管理](./30-质量管理-标准检验缺陷纠正措施.md) ｜ [下一篇：32-文章编辑](./32-文章编辑-Tiptap富文本与素材库.md) ｜ [大纲](../教程系列写作大纲V2.md)
