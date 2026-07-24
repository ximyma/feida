# 24-PLM工艺管理：物料 / BOM / 工艺路线

> 本教程基于 **Sowork AI 企业智能ERP系统** v1.2.0 编写。请用浏览器访问 `http://localhost:3000`，以 `admin / admin123` 登录；若首次部署，请先执行 `npm install --legacy-peer-deps` 安装依赖。

本篇属于《Sowork AI 企业智能ERP系统》v1.2.0 技术教程系列。Sowork AI 企业智能ERP系统（以下简称本系统）以「产品生命周期管理（PLM）」为制造业务的起点，把物料、工艺、结构层层组织成可生产、可核算的数据资产。本文带你从界面走到源码，既讲给管理者听「为什么重要」，也讲给开发者听「数据怎么流转」。

🔑 本文把 PLM 的 **10 个子页**逐一拆开讲：界面怎么看、操作怎么做、数据存哪、源码怎么写、背后原理是什么。每个子页一节 `##`，每节含 5 个 `###`（界面布局与操作流程 / 底层逻辑与数据模型 / 源码剖析 / 原理剖析 / 管理者视角）。建议边读边在 `http://localhost:3000` 动手验证。

## 学习目标

读完本篇你将能够：

- 在左侧导航进入「工艺管理」(`/plm`)，说出 10 个子页各自的职责与路由。
- 用真实源码看懂 `boms` + `bom_items`、`process_routes` + `process_route_items` 的父子层级结构。
- 理解 `scrap_rules`（损耗规则）如何进入成本核算，以及工艺路线的 `standard_time` / `piece_rate` 如何对接计件工资。
- 知道各表的状态机（如 BOM 的 `draft → approved → obsolete`、物料的 `active/inactive`）。
- 作为管理者，能向团队解释 BOM 准确性、工艺路线、损耗率对企业意味着什么。
- 识别本模块几处实现缺口（季节物料库为占位、BOM 明细死链、部分列表未过滤停用态），在排障与实施时提前规避。

## 核心概念

PLM 在制造业 ERP 中处于「设计 → 制造」的交接处：

```
产品基础档案(款号/颜色/尺码)            ← product_styles / product_categories
        │
        ▼
   PLM 工艺管理  ── 物料属性 → 物料 → 工序 → 工艺路线 → 部件 → BOM → 损耗规则
        │                                                      └ 大底 / 季节物料(鞋服专项)
        ▼
   生产管理(工单/排产) → 仓储(用料) → 成本(核算) → 薪酬(计件)
```

10 个子页各管一段，底层表均注册在 `server/standalone.ts` 的 `ALLOWED` 白名单（`standalone.ts:1117-1120`）：

| 子页 | 路由 | 主表 / 明细表 | 一句话作用 |
|------|------|---------------|-----------|
| 工艺管理(首页) | `/plm` | —（只读聚合） | 总览与入口 |
| 物料属性类型 | `/plm/material-attributes` | `material_attributes` | 定义物料分类（原材料/半成品/辅料…） |
| 物料主数据 | `/plm/materials` | `materials` | 每一个真实物料的档案 |
| 工序库 | `/plm/processes` | `processes` | 裁剪、针车、成型等标准工序 |
| 工艺路线 | `/plm/process-routes` | `process_routes` / `process_route_items` | 把工序按顺序排列成制造路径 |
| 部件库 | `/plm/components` | `components` | 可复用的半成品/部件 |
| BOM管理 | `/plm/boms` | `boms` / `bom_items` | 产品由哪些物料/部件构成 |
| 损耗规则 | `/plm/scrap-rules` | `scrap_rules` | 各工序/物料/订单的报废与损耗率 |
| 大底资料库 | `/plm/soles` | `soles` | 鞋类大底等专用资料 |
| 季节物料库 | `/plm/season-materials` | `season_materials` | 按季节组织的物料 |

🔑 一句话记忆：**物料是原子，部件是组合，BOM 是配方，工艺路线是做法，损耗规则是成本的安全垫。**

关于接口路由，有一点必须先讲清：PLM 的「表数据」全部走 catch-all 通用接口 `/api/:table`（如 `GET /api/materials`），但**带明细（items）的复杂对象有独立 router**（`/materials`、`/boms`、`/process-routes` 等，统一挂载在 `standalone.ts:11858` 的 `app.use('/api', …, apiRouter())` 之下），保证父子一起写入。季节物料库没有独立 router，只能经 catch-all `/api/season-materials` 访问（详见后文「季节物料库」）。

## PLM 首页 / 概览

### 界面布局与操作流程

`client/src/pages/ProductPage/PLMPage.tsx`，路由 `/plm`（`Layout.tsx:133-143`，图标 `GitBranch`）。它是整个 PLM 模块的驾驶舱：

- 顶部 6 张统计卡：物料数、工序数、工艺路线、BOM数、部件数、大底数（`PLMPage.tsx:98-105` 的 `statCards`）。
- 中部 3 个彩色模块卡片组（物料管理 / 工艺管理 / BOM管理），每组下挂子页入口链接（`PLMPage.tsx:58-96` 的 `modules`）。
- 底部「使用流程指南」4 步（基础数据 → 物料库 → 工艺路线 → 编制BOM）与「鞋服行业 PLM 特点」说明。

你点任意子页链接即跳转到对应子页；统计卡数字由 `fetchStats`（`PLMPage.tsx:33-56`）并行拉取 6 张表后取 `length` 实时计算。

### 底层逻辑与数据模型

首页本身**不新建任何表**，它只聚合读取 `materials / processes / process-routes / boms / components / soles` 六张表，统计各自行数。`statCards` 的 `value` 直接等于数组长度（`PLMPage.tsx:43-50`）。

### 源码剖析

统计请求并行发起，注意 `fetch` 路径都带 `/api` 前缀，与后端 `/api/...` 挂载一致：

```tsx
// client/src/pages/ProductPage/PLMPage.tsx:35-50
const [materials, processes, routes, boms, components, soles] = await Promise.all([
  fetch('/api/materials').then(r => r.json()),
  fetch('/api/processes').then(r => r.json()),
  fetch('/api/process-routes').then(r => r.json()),
  fetch('/api/boms').then(r => r.json()),
  fetch('/api/components').then(r => r.json()),
  fetch('/api/soles').then(r => r.json()),
]);
setStats({ materials: materials.length, processes: processes.length, ... });
```

⚠️ **源码事实（死链）**：`modules[2].items` 里有一项「BOM明细」指向 `/plm/bom-items`（`PLMPage.tsx:93`），但 `Layout.tsx:133-143` 的 PLM 菜单**并未注册** `/plm/bom-items` 路由。点击该链接会跳到未定义的页面（空白/404）。BOM 明细实际是在「BOM管理」的「查看」弹窗里展示的（`BOMsPage.tsx:135-156`），并非独立页面。这是一处需要留意的入口缺陷。

### 原理剖析

首页是「只读聚合视图」：它不持有业务规则，只是把已存在的档案数据按数量切片展示，类似考勤首页的「今日概况」。把高频入口前置、把汇总指标显眼化，是为了让工艺/计划人员无需理解底层表即可完成日常导航。

### 管理者视角

首页的 6 张卡是 PLM 数据健康度的「体检表」：物料/BOM/工艺路线数量长期为 0，说明工艺基础数据尚未搭建，下游生产与成本都将无据可依。管理者应把「先有完整物料库与 BOM，再做排产」作为上线前置条件。

## 物料属性类型

### 界面布局与操作流程

`client/src/pages/ProductPage/MaterialAttributesPage.tsx`，路由 `/plm/material-attributes`。页面以「卡片网格」形式预置展示 6 类物料属性（原材料/半成品/成品/辅料/包装材料/其他，`MaterialAttributesPage.tsx:74` 的 `ATTRIBUTE_TYPES`），每类卡片可「添加 / 编辑 / 删除」；顶部有搜索框与「添加属性」按钮，弹窗填 名称 / 编码 / 描述。

你点「添加属性」→ 填名称（必填）、编码、描述 → 保存写 `material_attributes`；预置的 6 类若尚不存在，可在其卡片点「添加」快速建一条同名属性。

### 底层逻辑与数据模型

落库表 `material_attributes`，关键字段：`id`、`name`、`code`、`description`、`is_active`（`MaterialAttributesPage.tsx:6-11`）。后端 GET 走 catch-all `GET /api/material-attributes`（`standalone.ts` 无独立 router，由 ALLOWED 白名单放行），POST 落库并置 `is_active:1`：

```ts
// server/standalone.ts:6691-6694
router.post('/material-attributes', (req, res) => {
  const id = `ma_${Date.now()}`;
  db.insert('material_attributes', { id, ...req.body, is_active: 1, created_at: new Date().toISOString() });
  res.json({ success: true, id });
});
```

### 源码剖析

前端保存逻辑与大多数档案页同构：编辑走 `PUT /api/material-attributes/:id`，新增走 `POST /api/material-attributes`（`MaterialAttributesPage.tsx:31-52`）。删除是**软删除**——后端把 `is_active` 置 0，而非物理删行（`standalone.ts:6700-6703`）。因此「删除」后的属性在数据库里依然存在，只是业务视图通常按 `is_active` 过滤时不再出现。

### 原理剖析

`material_attributes` 是「物料分类模板」：它是一个轻量字典，给 `materials.attribute_id` 提供参考值。注意页面预置了 6 个类型名，但数据是**自由文本**——`ATTRIBUTE_TYPES` 只是展示用的快捷入口，真正落库的是用户填写的 `name`，并不强制必须是这 6 类之一。这与后端「无独立 router、纯字典表」的定位一致。

### 管理者视角

物料属性（分类）是物料主数据的「分类轴」。把物料先分好类（原材料/辅料/半成品），后续按属性统计用量、按属性设置损耗规则才有抓手。建议先在此把企业常用分类定全，再批量录入物料，避免后期反复返工。

## 物料主数据

### 界面布局与操作流程

`client/src/pages/ProductPage/MaterialsPage.tsx`，路由 `/plm/materials`。顶部是搜索框 + 「全部品类 / 全部属性」两个下拉 + 「添加物料」按钮；下方表格列：物料编码、名称、品类、属性、规格、单价、状态、操作。点「添加物料」弹窗填：编码（自动生成）、名称（必填）、品类、属性、规格、单位、单价、安全库存。

你点「添加物料」→ 至少填名称 → 保存写 `materials`；列表里可编辑、可删除（删除是浏览器 `confirm` 二次确认，`MaterialsPage.tsx:112-121`）。品类下拉来自 `product_categories`、属性下拉来自 `material-attributes`（`MaterialsPage.tsx:50-65` 的 `fetchData`）。

### 底层逻辑与数据模型

落库表 `materials`，关键字段：`id`、`code`、`name`、`category_id`、`attribute_id`、`unit`、`spec`、`safety_stock`、`price`、`status`（`MaterialsPage.tsx:6-19`）。后端 POST 用 `mat_` 前缀生成 `id`，`code` 留空则兜底 `MAT` + 时间戳（`standalone.ts:6724-6728`）：

```ts
// server/standalone.ts:6724-6728
router.post('/materials', (req, res) => {
  const id = `mat_${Date.now()}`;
  const code = req.body.code || `MAT${String(Date.now()).slice(-8)}`;
  db.insert('materials', { id, code, ...req.body, status: 'active', created_at: new Date().toISOString() });
  res.json({ success: true, id });
});
```

### 源码剖析

列表读取走 `GET /api/materials`，支持 `category_id / attribute_id / status / keyword` 过滤（`standalone.ts:6706-6718`）。保存逻辑（新增 `POST`、编辑 `PUT`）在 `MaterialsPage.tsx:67-94`。删除走 `DELETE /api/materials/:id`，后端置 `status='inactive'`（`standalone.ts:6734-6736`）——即软删除。

⚠️ **实现不一致（需注意）**：`GET /api/materials` 用的是 `db.findWhere('materials', {})`，**不过滤 `status`**，会把已置 `inactive` 的「已删除」物料也返回；前端 `MaterialsPage` 也没有按 `status` 过滤，所以列表里「禁用」物料仍然可见（仅状态徽章显示为灰）。这与「工序库 / 部件库 / 损耗规则」用 `is_active:1` 过滤的写法不一致（`standalone.ts:6742` 等）。后果：在物料页「删除」一个物料后，它依然出现在列表里。实施时注意以 `status` 字段区分，避免误以为没删掉。

### 原理剖析

物料是 PLM 的「原子」。它同时挂 `category_id`（品类，来自产品模块 `product_categories`）与 `attribute_id`（属性，来自上节 `material_attributes`），从而支持「按品类 + 按属性」二维筛选。`safety_stock`（安全库存）、`price`（单价）是后续采购建议与成本核算的取数来源——它们在此处维护一次，下游（采购、仓储、成本）共享。

### 管理者视角

物料主数据是所有生产用料、BOM、采购、库存的「身份证」。编码与名称一旦录入，被 BOM、工单、出入库大量引用，**强烈建议录入前规范编码规则**（如 `MAT` + 类别 + 序号）。软删除保证历史单据可追溯；但如上所述，物料列表不过滤停用态，盘点物料时应以 `status` 字段为准。

## 工序库

### 界面布局与操作流程

`client/src/pages/ProductPage/ProcessesPage.tsx`，路由 `/plm/processes`。顶部搜索框 + 「添加工序」；表格列：编码、工序名称、类型、所属车间、标准工时(分钟/双)、计件单价(元/双)、操作。弹窗填：编码、名称（必填）、工序类型（裁断/针车/成型/包装/组装/质检/其他，`ProcessesPage.tsx:18`）、所属车间（裁断车间等，`ProcessesPage.tsx:19`）、标准工时、计件单价、单位、备注。

你点「添加工序」→ 填名称与类型、车间、工时、单价 → 保存写 `processes`；此处维护的「标准工时 / 计件单价」是工艺路线计件工资的基准来源。

### 底层逻辑与数据模型

落库表 `processes`，关键字段：`id`、`code`、`name`、`process_type`、`standard_time`、`piece_rate`、`unit`、`department`、`description`（`ProcessesPage.tsx:6-16`）。后端 GET 用 `is_active:1` 过滤（`standalone.ts:6742`），即「已删除」工序不出现在列表：

```ts
// server/standalone.ts:6740-6744
router.get('/processes', (req, res) => {
  const { department, process_type } = req.query;
  let list = db.findWhere('processes', { is_active: 1 });
  if (department) list = list.filter((l: any) => l.department === department);
  if (process_type) list = list.filter((l: any) => l.process_type === process_type);
  res.json(list);
});
```

### 源码剖析

新增用 `proc_` 前缀（`standalone.ts:6748`）；删除软删除置 `is_active:0`（`standalone.ts:6756-6758`）。前端保存/编辑在 `ProcessesPage.tsx:47-73`。注意 GET 支持 `department` 与 `process_type` 两个维度的服务端过滤，但前端当前只用了本地 `searchText` 模糊搜，没有把这两个下拉接到接口——属可用但未接线的能力。

### 原理剖析

工序是「工艺路线」的组成部分。每个工序自带 **标准工时**（`standard_time`，单位分钟/双）与 **计件单价**（`piece_rate`，元/双）。前者是排产与单件工时的基础，后者是薪酬计件工资的基础。把「工时/单价」定义在工序上，是为了在工艺路线里既可直接复用，也可针对某条路线覆盖（见下节「工艺路线」的 `process_route_items` 同样持有这两字段）。

### 管理者视角

工序库决定「干一道工序要多久、给多少钱」。标准工时不准，排产与计件工资全盘失真。建议由工业工程/车间实测维护，而非拍脑袋；并把车间（`department`）填准，便于后续按车间统计产能与人工成本。

## 工艺路线

### 界面布局与操作流程

`client/src/pages/ProductPage/ProcessRoutesPage.tsx`，路由 `/plm/process-routes`。列表列：编码、路线名称、工序数、默认路线、状态、操作。点「添加工艺路线」弹窗：填路线编码、名称（必填）、设为默认（开关）、备注，并在「工序列表」里逐行「+ 添加工序」——每行选工序（下拉自工序库）、填标准工时、计件单价。点「查看」弹窗按序号展示每道工序的工时与单价；点「审核」类图标仅出现在 BOM 页，工艺路线本身无独立审核接口。

你逐步：建路线头 → 加若干工序行（决定先后）→ 保存写 `process_routes` + `process_route_items`。

### 底层逻辑与数据模型

主表 `process_routes`：`id`、`name`、`code`、`description`、`is_default`、`status`；明细表 `process_route_items`：`id`、`route_id`、`process_id`、`sort_order`、`standard_time`、`piece_rate`、`description`（`ProcessRoutesPage.tsx:12-30`）。后端 GET 列表用 `status:'active'` 过滤（`standalone.ts:6763`），GET 单条把头与明细合并返回（`standalone.ts:6766-6770`）。

### 源码剖析

创建工艺路线时，先写主表 `process_routes`（置 `status:'active'`），再遍历 `items` 逐行写 `process_route_items`，用 `sort_order`（默认数组下标）排序工序（`standalone.ts:6771-6791`）：

```ts
// server/standalone.ts:6776-6787
if (items && Array.isArray(items)) {
  items.forEach((item: any, index: number) => {
    const itemId = `pri_${Date.now()}_${index}`;
    db.insert('process_route_items', {
      id: itemId, route_id: id,
      process_id: item.process_id,
      sort_order: item.sort_order || index,   // ← 决定工序先后
      standard_time: item.standard_time,        // ← 行级工时（可覆盖工序库）
      piece_rate: item.piece_rate,              // ← 行级计件价（可覆盖工序库）
      description: item.description
    });
  });
}
```

更新时采用「先删后插」保证明细与前端完全一致（`standalone.ts:6796-6812`）：`DELETE FROM process_route_items WHERE route_id = ?` 再逐行重插。

### 原理剖析

工艺路线是「零散工序 → 制造路径」的串联器。`sort_order` 决定生产先后顺序，`standard_time` 累加即单件标准工时（排产/工时基础），`piece_rate` 累加即单件计件工资。🔑 注意 `process_route_items` 上**重复持有** `standard_time` / `piece_rate`——它允许在同一条路线里覆盖工序库默认值（例如某路线这道工序更快/更贵）。这带来一个**设计歧义**：生产/薪酬引擎究竟取 `processes` 上的值还是 `process_route_items` 上的值？当前代码库未见生产引擎消费这两字段，需以实际对接模块为准。

### 管理者视角

工艺路线 = 排产与计件的「总剧本」。没有它，生产模块无法知道先做哪道工序、每道要多久，排产只能拍脑袋，计件工资也无从算起。`is_default` 让系统有「默认路线」可引用，多路线并存则支持同款不同工艺（如试产线 vs 量产线）。

## 部件库

### 界面布局与操作流程

`client/src/pages/ProductPage/ComponentsPage.tsx`，路由 `/plm/components`。列表列：编码、部件名称、分类、操作。弹窗填：编码、名称（必填）、分类、描述。点「添加部件」→ 填鞋面/鞋底/内里等 → 保存写 `components`。

### 底层逻辑与数据模型

落库表 `components`，关键字段：`id`、`code`、`name`、`category`、`description`（`ComponentsPage.tsx:6-12`）。后端 GET 用 `is_active:1` 过滤（`standalone.ts:6822`），POST 用 `comp_` 前缀（`standalone.ts:6826`），删除软删除置 `is_active:0`（`standalone.ts:6834-6836`）。

### 源码剖析

前端保存/删除在 `ComponentsPage.tsx:32-48`。后端 CRUD 是标准三件套（`standalone.ts:6821-6837`）。

⚠️ **实现缺口（需注意）**：`components` 在 `bom_items.component_id` 中被引用（`standalone.ts:6865`、`6891`），即 BOM 明细既可用物料也可用部件。但 **BOM 管理页的「查看」弹窗只渲染 `item.material_id`，不渲染 `component_id`**（`BOMsPage.tsx:147`），且全程没有把「部件」关联到 BOM 行的 UI。换句话说，部件库当前是「目录型」数据，能被 BOM 引用却**无法从界面建立引用**——要关联部件到 BOM，只能通过 API 直接写 `bom_items.component_id`。

### 原理剖析

部件是「可复用的半成品组合」（如一只完整鞋面），介于物料与成品之间。BOM 支持 `material_id` / `component_id` 二选一，意味着 BOM 可嵌套（成品 → 部件 → 物料），支持层级制造。但当前前端只暴露了物料关联路径，部件关联处于「数据模型支持、界面未接通」状态。

### 管理者视角

部件库的价值在于「复用」：同一鞋面部件可被多款鞋的 BOM 引用，改一处即影响多款。上线前若计划用部件级 BOM，需让实施方补上 BOM 行的部件选择 UI，否则部件库形同摆设。

## BOM 管理

### 界面布局与操作流程

`client/src/pages/ProductPage/BOMsPage.tsx`，路由 `/plm/boms`。列表列：BOM名称、产品款号、类型、版本、状态、操作。点「添加BOM」弹窗填：名称、类型（开发BOM `development` / 技术BOM `technical`）、产品款号（`product_style_id`）、版本（默认 `V1.0`）。保存后，在列表点「查看」眼睛图标可看该 BOM 的物料明细（序号、物料名称、用量、损耗率、供应类型）。草稿态 BOM 可点「审核」图标提交审批。

你逐步：建 BOM 头（关联款号）→ 经 API/界面维护 `bom_items` 明细 → 草稿态点审核变 `approved` → 作废则删除变 `obsolete`。

### 底层逻辑与数据模型

主表 `boms`：`id`、`name`、`bom_type`、`product_style_id`、`version`、`status`；明细表 `bom_items`：`id`、`bom_id`、`material_id`、`component_id`、`qty`、`unit`、`scrap_rate`、`loss_rate`、`supply_type`、`size_id`、`color_id`、`remark`（`BOMsPage.tsx:6-14` 与 `standalone.ts:6861-6874`）。状态机：

```
draft ──(POST /boms/:id/approve)──▶ approved
  │                                      │
  └──────(DELETE, 置 obsolete)──────────┘
```

`bom_type` 取值 `development` / `technical`；`status` 取值 `draft` / `approved` / `obsolete`（`BOMsPage.tsx:74-81` 的 `getStatusBadge`）。

### 源码剖析

创建 BOM 时，先写主表 `boms`，再遍历 `items` 逐行写 `bom_items`，用同一个 `bom_id` 绑定父子（`standalone.ts:6853-6878`）：

```ts
// server/standalone.ts:6858-6875
if (items && Array.isArray(items)) {
  items.forEach((item: any, index: number) => {
    const itemId = `bomi_${Date.now()}_${index}`;
    db.insert('bom_items', {
      id: itemId, bom_id: id,             // ← 父子外键绑定
      material_id: item.material_id,
      component_id: item.component_id,
      qty: item.qty || 1,                 // ← 默认用量 1
      unit: item.unit || '双',
      scrap_rate: item.scrap_rate || 0,   // ← 行级报废率
      loss_rate: item.loss_rate || 0,     // ← 行级损耗率
      supply_type: item.supply_type || 'purchase',
      size_id: item.size_id, color_id: item.color_id, remark: item.remark
    });
  });
}
```

审核接口（`standalone.ts:6911-6919`）把 `status` 置 `approved` 并记录 `approved_by / approved_at`；删除置 `status='obsolete'`（`standalone.ts:6907-6909`）。更新同样「先删后插」明细（`standalone.ts:6883-6904`）。

⚠️ **实现不一致（需注意）**：`GET /api/boms` 用的是 `db.findWhere('boms', {})`，**不过滤 `status`**，会把 `obsolete`（已作废）的 BOM 也返回；前端也未过滤，于是「删除」后的 BOM 仍出现在列表里（仅状态徽章标红「已作废」）。这与工艺路线用 `status:'active'` 过滤（`standalone.ts:6763`）不一致。另：`bom_items` 的 `component_id` 虽被后端写入，但 `BOMsPage` 的查看弹窗只展示 `material_id`（`BOMsPage.tsx:147`），部件行在界面上不可见。

### 原理剖析

BOM 是「配方」：它把成品拆成若干物料/部件行，每行带用量 `qty` 与损耗 `scrap_rate/loss_rate`。之所以用主表+明细两张表，是因为一件成品由几十种料构成，二维表无法表达「一对多」。`size_id/color_id` 支持鞋服行业「不同尺码/颜色用量不同」的矩阵（`PLMPage.tsx:214` 提及）。`supply_type` 区分自制/外购，决定后续走生产工单还是采购单。

### 管理者视角

BOM 准确 = 成本与采购准确。BOM 用量错了，采购多买少买、成本算偏，全是连锁反应。状态机 `draft → approved → obsolete` 给了「先草拟、审过才生效、出错可作废」的管控抓手——务必让 BOM 走审核再用于生产，避免未定稿的配方流入工单。

## 损耗规则

### 界面布局与操作流程

`client/src/pages/ProductPage/ScrapRulesPage.tsx`，路由 `/plm/scrap-rules`。列表列：规则类型、订单量区间、物料损耗率、工艺损耗率、操作。弹窗填：规则类型（物料损耗/工艺损耗/订单物料损耗/订单工艺损耗，`ScrapRulesPage.tsx:46-51`）、目标 `target_id`、订单量下限/上限、物料损耗率(%)、工艺损耗率(%)、描述。

你点「添加规则」→ 选类型、填订单量区间与两个损耗率 → 保存写 `scrap_rules`。

### 底层逻辑与数据模型

落库表 `scrap_rules`，关键字段：`id`、`rule_type`、`target_id`、`order_qty_min`、`order_qty_max`、`material_loss_rate`、`process_loss_rate`、`description`、`is_active`（`ScrapRulesPage.tsx:6-15`）。后端 GET 用 `is_active:1` 过滤（`standalone.ts:6924`），POST 用 `sr_` 前缀（`standalone.ts:6929`），删除软删除置 `is_active:0`（`standalone.ts:6937-6939`）。

### 源码剖析

前端保存/编辑在 `ScrapRulesPage.tsx:33-42`。规则类型 `RULE_TYPES` 含 4 种（`material`/`process`/`order_material`/`order_process`）。⚠️ **需注意**：后端 `scrap_rules` 表仅有 `rule_type` 与 `target_id`，**没有任何「按 target 联表取名称」的逻辑**，前端列表也只展示 `description` 与类型，不解析 `target_id` 指向谁——因此规则与具体物料/工序的绑定关系在界面上是「不可读」的，只能靠 `description` 人工备注区分。

### 原理剖析

损耗规则是「成本核算的安全垫」。它分两层：
- **物料损耗率**（`material_loss_rate`）：投料时要多备的料（实际投料 = 标准用量 ÷ (1 − 损耗率)）。
- **工艺损耗率**（`process_loss_rate`）：工序加工中的报废比例。

`order_qty_min/max` 让损耗率可随订单量分级（量越大损耗率可能越低），`rule_type` 区分是「通用物料/工艺」还是「针对某订单」。它与 BOM 行上的 `scrap_rate/loss_rate` 构成「规则级 + 实例级」双轨——无行级数据时回退到规则级。

### 管理者视角

损耗率要**实测**，不能拍数。写在系统里的报废率若脱离现场，成本核算与备料都会失真。`target_id` 当前界面不可读，建议在 `description` 里写清「适用于哪个物料/工序/订单」，否则规则多了极易混乱。上线前应由车间统计真实报废数据回填。

## 大底资料库

### 界面布局与操作流程

`client/src/pages/ProductPage/SolesPage.tsx`，路由 `/plm/soles`。列表列：编码、名称、类型、材质、模具号、单价、操作。弹窗填：编码、名称（必填）、类型（如 MD底/橡胶底）、材质、模具号、单价、描述。点「添加大底」→ 填鞋底型号与模具 → 保存写 `soles`。这是鞋服行业 ERP 的专项资料库。

### 底层逻辑与数据模型

落库表 `soles`，关键字段：`id`、`code`、`name`、`sole_type`、`material`、`color`、`mold_no`、`unit_price`、`status`、`description`（`SolesPage.tsx:6-16`）。后端 POST 用 `sole_` 前缀、`code` 留空兜底 `SOLE` + 时间戳，置 `status:'active'`（`standalone.ts:6949-6953`）；删除软删除置 `status:'inactive'`（`standalone.ts:6959-6961`）。

### 源码剖析

前端保存/删除在 `SolesPage.tsx:34-44`。⚠️ **实现不一致（需注意）**：`GET /api/soles` 用 `db.findWhere('soles', {})`，**不过滤 `status`**（`standalone.ts:6945`），「已删除」（inactive）大底仍会出现在列表里（仅徽章区分），与物料、BOM 同样的问题。

### 原理剖析

大底是鞋类制造的专用物料，但系统把它**单独成表**而非归入 `materials`，是为了承载鞋底特有的字段（模具号 `mold_no`、鞋底类型 `sole_type`、专属材质/颜色）。这是一种「行业垂直扩展」思路：通用物料走 `materials`，鞋底这种强行业属性对象走 `soles`，避免把 `materials` 表撑得过于宽泛。

### 管理者视角

大底资料库把「鞋底型号—模具—材质—单价」一体化管理，是鞋企 BOM 里大底行的重要引用来源。模具号尤其关键：换模具往往意味着工艺与损耗变化，资料库维护准确，后续排产与质量追溯才有锚点。

## 季节物料库

### 界面布局与操作流程

`client/src/pages/ProductPage/SeasonMaterialsPage.tsx`，路由 `/plm/season-materials`。页面有搜索框与「添加关联」按钮，弹窗填：季节（春夏/秋冬/全年等，`SeasonMaterialsPage.tsx:49`）、年份、物料（下拉自 `materials`）、备注。界面中部目前显示一个空状态提示「暂无季节物料关联数据」。

你点「添加关联」→ 选季节与物料 → 点保存——**但当前保存不会真正写入数据库**（见下）。

### 底层逻辑与数据模型

落库表 `season_materials`，关键字段：`id`、`season`、`material_id`、`season_year`、`remark`（`SeasonMaterialsPage.tsx:6-13`）。该表已注册进 `ALLOWED` 白名单（`standalone.ts:1120`），因此可通过 catch-all `GET/POST/PUT/DELETE /api/season-materials` 正常读写。

### 源码剖析

⚠️ **重大实现缺口（务必知悉）**：本页是**占位/未完工**状态，分两处体现：

1. 列表永远为空——`fetchData` 直接 `setItems([])`，并注释「目前API未实现完整查询」（`SeasonMaterialsPage.tsx:31-39`）：

```tsx
// client/src/pages/ProductPage/SeasonMaterialsPage.tsx:31-39
const fetchData = async () => {
  try {
    // 获取季节物料（目前API未实现完整查询，暂时显示空）
    setItems([]);
    const data = await fetch('/api/materials').then(r => r.json());
    setMaterials(Array.isArray(data) ? data : []);
  } catch (e) { message.error('获取数据失败'); }
  finally { setLoading(false); }
};
```

2. 保存不落库——`handleSave` 只弹一句「季节物料库功能开发中...」，**从不调用 `fetch('/api/season-materials', …)`**（`SeasonMaterialsPage.tsx:41-45`）：

```tsx
// client/src/pages/ProductPage/SeasonMaterialsPage.tsx:41-45
const handleSave = async () => {
  if (!formData.season || !formData.material_id) { message.warning('请选择季节和物料'); return; }
  message.info('季节物料库功能开发中...');
  setModalOpen(false);
};
```

结论：在 v1.2.0 中，季节物料库**界面既不能加载已有数据，也不能保存新数据**。底层表 `season_materials` 存在且 catch-all 接口可用，但前端未接线。要真正使用，需经 API 直接写 `POST /api/season_materials`，或等待后续版本补全该页。

### 原理剖析

「季节物料」的设计意图是按季节（春夏/秋冬）组织物料视图，便于鞋服企业做季节性选料与备料。字段 `season + season_year + material_id` 构成「某年某季用了哪些物料」的关联。当前前端把它做成了空壳，但数据模型与 catch-all 接口已就位——属于「后端就绪、前端未接」的典型半成品。

### 管理者视角

季节物料库对鞋服企业的「当季选料、过季淘汰」很有价值，但 v1.2.0 暂不可用。管理者不应在此页面期待它能存住数据；若确有需求，应让实施方补齐 `fetchData`（读取 `/api/season-materials`）与 `handleSave`（写入 `/api/season-materials`），否则相关季节性分析无从谈起。

## 与其他模块的衔接

PLM 不是孤岛，它向上游与下游都连着其它模块：

- **产品档案模块**：`product_styles` / `product_categories` 是 BOM 的归属根（`BOMsPage` 的款号下拉来自 `product_styles`，物料品类下拉来自 `product_categories`，均已在 `ALLOWED` 注册，`standalone.ts:1114`、`4216`、`4275`）。没有产品档案，BOM 无法关联款号。
- **生产管理模块**：`process_routes` 的 `standard_time` 累加即排产工时基础，`boms` 决定工单要生产什么、用什么料。工单展开 BOM 即得到领料清单。
- **仓储管理模块**：BOM 展开后的物料需求驱动采购与库存（`materials` ↔ `inventory`）。BOM 用量错，仓储备料与出入库全盘错。
- **成本/财务模块**：`bom_items.scrap_rate/loss_rate` 与 `scrap_rules` 共同决定实际投料与成本；`materials.price`、`soles.unit_price` 是成本单价来源。
- **薪酬模块**：`processes.standard_time/piece_rate` 与 `process_route_items` 上的同名字段，是计件工资的计算依据（见「工艺路线」原理剖析中的歧义提示）。
- **系统/合规模模块**：PLM 各表均走 `ALLOWED` + `apiAuthMiddleware`（`standalone.ts:11858`），删除多为软删除，保留审计链。

🔑 记住一点：PLM 对外主要通过 `boms / bom_items / process_routes / materials` 等表「输出产品结构」，其余模块来读即可，耦合被牢牢控制在表边界内。

## 管理者视角

从管理角度看，PLM 模块解决三件事：

- **BOM 准确 = 成本与采购准确**：BOM 用量错了，采购多买少买、成本算偏，全是连锁反应。务必让 BOM 走 `draft → approved` 审核再用于生产。
- **工艺路线 = 排产与计件基础**：没有它，生产无法知道工序先后与单件工时，计件工资也无从算起。建议由车间实测标准工时与计件单价。
- **损耗率要实测**：`scrap_rules` 与 `bom_items.scrap_rate` 应以现场统计为准，避免拍数。

⚠️ 管理者要盯住几个上线风险：
1. **季节物料库在 v1.2.0 不可用**（前端占位，见上），不要依赖它做季节性业务。
2. **BOM 明细死链** `/plm/bom-items` 未注册路由，培训用户走「BOM管理 → 查看」而非该入口。
3. **物料/BOM/大底列表不过滤停用态**：「删除」后数据仍在列表显示，盘点与核对请以 `status` 字段为准，勿误以为删除失效。
4. **部件无法从界面关联到 BOM**：若要用部件级 BOM，需实施方补 UI。

🚀 一句话：PLM 把「老师傅脑子里的做法」沉淀成系统数据，企业换人也不丢工艺——前提是基础数据录入准确、审核到位。

## 注意事项

- ⚠️ **季节物料库为占位实现**：`SeasonMaterialsPage.tsx:31-45` 的 `fetchData` 恒返回空、`handleSave` 仅提示「功能开发中」，**不读写数据库**。表 `season_materials` 存在且 catch-all 可用，但界面未接线；如需使用须直接调 API 或等后续版本补全。
- ⚠️ **BOM 明细入口死链**：首页 `PLMPage.tsx:93` 的「BOM明细」指向 `/plm/bom-items`，但 `Layout.tsx:133-143` 未注册该路由，点击会跳空。BOM 明细请在「BOM管理 → 查看」中查看。
- ⚠️ **列表不过滤停用/作废态**：`GET /api/materials`、`/api/boms`、`/api/soles` 均用 `findWhere(table, {})` 全量返回，不过滤 `status`/`is_active`（`standalone.ts:6708`、`6842`、`6945`），「删除」后记录仍在列表可见；而工序/部件/损耗规则会过滤 `is_active:1`。核对时以 `status` 字段为准。
- 🔑 **部件无法界面关联到 BOM**：`bom_items.component_id` 后端支持，但 BOM 页查看弹窗只渲染 `material_id`（`BOMsPage.tsx:147`），无部件选择 UI；要用部件级 BOM 需经 API 直接写 `component_id`。
- ✅ **主从表「先删后插」保证一致**：`boms` 与 `process-routes` 更新时 `DELETE` 旧明细再重插（`standalone.ts:6884`、`6797`），前端与数据库始终一致。
- ✅ **删除多为软删除**：物料/工序/部件/工艺路线/损耗规则/大底删除均只改 `status`/`is_active`，历史数据保留便于追溯；BOM 删除置 `obsolete`，可经审核状态机管理。
- 🔑 **工时/单价双写歧义**：`processes` 与 `process_route_items` 都持有 `standard_time`/`piece_rate`，生产/薪酬引擎取哪个未在本代码库体现，对接时需确认。
- ✅ **路由设计取舍**：前端用命名路由组 `/plm/*` 组织 10 个子页（含首页），后端把表数据收敛到 catch-all `/api/:table`，仅对带明细的复杂对象开独立 router（`/boms`、`/process-routes` 等，统一挂 `/api`），调用时别拼错路径。

## 小结与练习

本篇你看到了 PLM 的 10 个子页、各自主从表，以及物料/BOM/工艺路线的真实写入代码，并识别了若干实现缺口。请完成以下练习（均为可操作）：

1. **PLM 首页**：`admin/admin123` 登录，进 `/plm`，看 6 张统计卡数字，点各子页入口熟悉导航（避开「BOM明细」死链）。
2. **物料属性类型**：进 `/plm/material-attributes`，添加一条「原材料」属性，再回来确认列表出现。
3. **物料主数据**：进 `/plm/materials`，新增物料 `MAT00001 牛皮面`（选好品类与属性），到列表核验；再「删除」它，观察它仍显示但状态变灰（已知缺口）。
4. **工序库**：进 `/plm/processes`，登记 `裁剪`、`针车`、`成型` 三道工序，填标准工时与计件单价。
5. **工艺路线**：进 `/plm/process-routes`，把上述工序按序串成一条路线，给每道填工时/单价，设为默认；点「查看」核对顺序。
6. **部件库**：进 `/plm/components`，登记「鞋面」部件；理解它当前无法在 BOM 界面引用（已知缺口）。
7. **BOM 管理**：进 `/plm/boms`，新建技术 BOM 关联某款号，维护 `bom_items` 明细（用量、损耗率），草稿态点审核变 `approved`；再「删除」观察仍显示但标「已作废」（已知缺口）。
8. **损耗规则**：进 `/plm/scrap-rules`，加一条「物料损耗」规则，填订单量区间与物料/工艺损耗率，在 `description` 写清适用范围。
9. **大底资料库**：进 `/plm/soles`，登记一个鞋底型号（填模具号、材质、单价）。
10. **季节物料库**：进 `/plm/season-materials`，确认列表恒空、保存仅提示「功能开发中」——验证前述占位缺口；若要真用，请用 `POST /api/season-materials` 经 API 写入。

> **系列导航**：[上一篇：23-ERP产品档案](./23-ERP总览与产品基础档案.md) ｜ [下一篇：25-仓储管理](./25-仓储管理-仓库货位库存入出库盘点调拨条码.md) ｜ [大纲](../教程系列写作大纲V2.md)
