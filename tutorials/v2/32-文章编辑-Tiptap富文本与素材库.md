# 32. 文章编辑——Tiptap 富文本与素材库（含水印/缩略图）

本篇基于 **Sowork AI 企业智能ERP系统** v1.2.0 的真实代码，带你从「怎么用」到「怎么实现」吃透文章编辑器与素材库。

## 学习目标

读完你能做到：

- 用 Tiptap 编辑器写好一篇带表格、视频、源码的文章并发布。
- 看懂富文本正文在数据库里以什么形式存储、文章如何引用素材库图片。
- 讲清后端 `/api/upload` 的水印、`/api/image/crop` 的裁剪分别做了什么。
- 给非技术的运营同事讲明白：为什么素材要统一管理、为什么加水印。

## 核心概念

| 概念 | 说明 |
| --- | --- |
| Tiptap | 基于 ProseMirror 的富文本编辑器框架，本系统用其封装 `RichTextEditor` 组件 |
| HTML 正文 | 编辑器内容以 HTML 字符串存入 `cms_articles.content` 字段 |
| 素材库 | 独立图片/文件仓库，数据存于 `file_storage` 表，可被任意文章 URL 引用 |
| 水印 | 上传时可选 `?wt=文字`，服务端用 sharp 合成半透明文字水印 |
| 裁剪 | 在素材库「裁剪」弹窗框选区域，调 `/api/image/crop` 生成缩略图 |

🚀 一句话：编辑器产 HTML，素材库产 URL，正文里用 `<img src="URL">` 把它们缝在一起。

## 界面布局与操作流程

文章管理位于后台「CMS 管理 → 文章管理」Tab，点击「添加文章」弹出编辑弹窗：

```
文章弹窗
├─ 标题 / 栏目 / 作者 / 状态
├─ 置顶·推荐·热点·醒目(开关)
├─ 标签(可输入新建/智能提取)
├─ 摘要
├─ 正文  ← RichTextEditor，高度 500
│   ├─ 工具栏: 加粗/标题/对齐/列表/表格/高亮/颜色
│   ├─ 插入图片URL / 上传图片 / 视频 / YouTube / 链接 / 站内文章
│   └─ 查看/编辑源码(HTML)
└─ 附件(保存后可上传)
```

素材库在「素材库」Tab：选分组名 → 点「上传」→ 调 `/api/upload` 落盘，再 `POST /api/file-storage` 登记元数据。图片右下角有「裁剪」按钮，框选后生成缩略图。

编辑器工具栏源码在 `client/src/components/RichTextEditor.tsx:176-218`，按钮通过 `editor.chain().focus().xxx().run()` 触发命令。

## 底层逻辑与数据模型

正文与素材分两张表，靠 URL 解耦：

- `cms_articles.content`：整篇 HTML 字符串，图片以 `/uploads/xxx.png` 这种相对路径嵌在 `<img>` 里。
- `file_storage`：`id, file_name, file_path, file_size, mime_type, entity_type, entity_id`（见 `server/modules/database/database.service.ts:2910`）。`entity_type` 即素材库里填的「分组名」。

引用关系是一对多：一篇文章的 HTML 里可插入多个 `file_storage.file_path`，但素材本身不绑定文章，删除文章不会删素材——这正是「素材可复用」的底层原因。

保存文章时，前端把 `content`（HTML）随表单 `JSON.stringify` 发给 `POST /api/cms-articles`（`client/src/pages/Admin/CMSAdminPage.tsx:341-356`），后端原样写入 `content` 字段（`server/standalone.ts:9258-9267`）。

## 源码剖析

**1) Tiptap 初始化（真实片段）** `client/src/components/RichTextEditor.tsx:53-73`

```ts
const editor = useEditor({
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Underline, Link.configure({ openOnClick: false }),
    Image.configure({ allowBase64: true, inline: true }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle, Color, Highlight.configure({ multicolor: true }),
    Placeholder.configure({ placeholder }),
    TableKit.configure({ table: { resizable: false } }),   // 表格套件
    Youtube.configure({ width: 640, height: 360 }),
    VideoNode,  // 自定义 mp4/webm 视频节点
  ],
  content: value || '',
  onUpdate: ({ editor }) => onChange?.(editor.getHTML()),  // 关键：实时导出 HTML
});
```

`onUpdate` 里 `editor.getHTML()` 是连接「编辑器内存结构」与「数据库 HTML 字符串」的桥梁。源码视图（HTML 编辑）则用 `editor.getHTML()` 读出、`editor.commands.setContent()` 写回（`RichTextEditor.tsx:133-141`）。

**2) 图片上传落盘** `RichTextEditor.tsx:116-128`：`handleUpload` 把文件 `POST /api/upload`，拿到 `data.url` 后 `setImage({ src: data.url })` 插进正文。

**3) 水印逻辑（后端核心）** `server/standalone.ts:2256-2271`

```ts
const wt = req.query.wt as string;
if (wt && ['.jpg','.jpeg','.png','.webp'].includes(ext)) {
  const sharp = require('sharp');
  const metadata = await sharp(destPath).metadata();
  const svgWatermark = Buffer.from(
    `<svg width="${metadata.width}" height="60"><rect .../>
     <text x=... y="40" ...>${wt}</text></svg>`);
  const watermarked = await sharp(destPath)
    .composite([{ input: svgWatermark, gravity: (req.query.wpos as string) || 'southeast' }])
    .toBuffer();
  fs.writeFileSync(destPath, watermarked);
}
```

即：上传接口本身落盘，仅当带 `?wt=文字` 且为图片格式时，用 sharp 合成一张右下角（默认 `southeast`）半透明 SVG 文字水印覆盖原图。

**4) 裁剪生成缩略图** `server/standalone.ts:2280-2313`：`/image/crop` 接收 `source`(已上传路径)+`x,y,width,height`（像素），用 `sharp(...).extract({left,top,width,height})` 切出区域存到 `uploads/cropped/`，并返回新 URL。前端坐标换算见 `CMSAdminPage.tsx:245-264`（用 `naturalWidth/clientWidth` 比例把框选坐标映射到原图像素）。

## 原理剖析

- **为什么存 HTML 而不是 JSON？** 本系统选 HTML，好处是前端 `dangerouslySetInnerHTML` 或 Tiptap `setContent(html)` 可直接渲染，后端搜索（如 `scanSensitive` 对 `title+summary+content` 扫描）也简单。代价是版本迁移比 JSON 文档模型麻烦——但当前需求下最省事。
- **为什么水印/裁剪放服务端？** 水印用 SVG+sharp 合成，避免把原图暴露给前端再上传的二次往返；裁剪同理，前端只传坐标，服务端用 sharp `extract` 保证像素级准确。
- **sharp 是可选依赖**：水印代码包在 `try/catch` 里，sharp 未安装时静默跳过（`standalone.ts:2268-2270`），所以本地没装 sharp 也能上传只是没水印。

## 管理者视角

- ✅ **非技术也能排版发布**：工具栏是图标按钮，所见即所得，不碰 HTML 也能出表格、插视频、加高亮。
- 🔑 **素材库统一管理**：所有图片集中登记在 `file_storage`，避免运营把图乱传到聊天工具、图床，换人也能找到原图。
- ✅ **一张图多处复用**：同一素材 URL 可被多篇文章引用，改一次裁剪结果多处生效。
- 🚀 **水印防盗用**：对外公开文章配图开启 `?wt=公司名` 水印，降低被直接盗图风险。
- 管理者只需盯两件事：栏目归类是否规范、公开图是否带了水印。

## 注意事项

- ⚠️ **Tiptap 版本需钉死**：本期 `package.json` 中 `@tiptap/extension-table`、`@tiptap/extension-youtube` 为 `^3.22.4`，其余核心包为 `^3.14.0`；混装大版本易出现 `Extension duplicate` 报错，安装请用 `npm install --legacy-peer-deps` 并保持同主版本。
- 🔑 **缩略图靠裁剪，而非自动**：当前 `/api/upload` 不会自动生成缩略图。大图请先在素材库「裁剪」生成小图再插入正文，否则详情页加载偏慢。
- ✅ **素材与文章解耦**：删文章不会删素材；回收站恢复文章后，正文内图片 URL 依然有效。
- ⚠️ **水印依赖 sharp**：未安装 `sharp` 时水印静默失效，上线前确认依赖已装。
- 🚀 **源码视图慎用**：HTML 源码可改，但手改出错标签可能导致渲染异常，建议仅用于微调。

## 小结与练习

你已掌握：Tiptap 用 `getHTML()` 把富文本存成 HTML；素材库以 `file_storage` 表统一管理并通过 URL 被正文引用；水印在 `/api/upload` 用 sharp 合成、裁剪在 `/api/image/crop` 用 sharp 提取区域。

动手练习：

1. 写一篇带 3×3 表格和一段 YouTube 嵌入的文章，发布后查看数据库 `cms_articles.content` 确认存的是 HTML。
2. 上传一张产品图，带 `?wt=Sowork` 水印参数（可在素材库上传逻辑补充），再裁剪出一张缩略图插入正文。
3. 在 `file_storage` 里找同一张图，分别被两篇文章引用，验证「素材可复用」。

> **系列导航**：[上一篇：31-CMS总览](./31-CMS总览与栏目管理.md) ｜ [下一篇：33-标签智能提取](./33-标签智能提取审核流回收站SEO.md) ｜ [大纲](../教程系列写作大纲V2.md)
