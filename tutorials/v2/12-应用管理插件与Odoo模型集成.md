# 12. 应用管理、插件与 Odoo 模型集成

本篇带你从「管理者」和「开发者」两个视角，拆解 **Sowork AI 企业智能ERP系统** v1.2.0 中「应用管理」「插件」与「Odoo 模型集成」三件事如何协同工作。你将看到：手写业务模块、低代码插件、以及把已有 Odoo 资产一键扫进来，最终都收敛到同一套通用 CRUD 外壳上。

环境约定：账号 `admin/admin123`，前端端口 `3000`，依赖安装用 `npm install --legacy-peer-deps`。本系统**没有** `/api/hr` 这类按域前缀划分的接口；业务数据统一走 catch-all 路由 `/api/:table`，Odoo 模型走 `/model/:model/*` 通用 ORM 接口与 `/odoo/*` 导入路由。

## 学习目标

- 区分「应用管理（modules）」与「插件（addons）」两个概念，理解应用市场式的安装/卸载机制。
- 看懂 Odoo 模型集成链路：`.py` 源码 → 解析 → 转成 Sowork AI 的 `models.js` → 复用 `/model/:model/*`。
- 理解 `/app/:module` 通用外壳如何让「模型即页面」，省掉大量前端编码。
- 站在管理者角度，评估已有 Odoo 资产如何低成本迁移。

## 核心概念

在 Sowork AI 里，一个「可调用的业务实体」有三条来源，它们最终都注册进同一个 ORM 注册表 `global.__feida_models`：

```
业务实体来源
├── modules/   手写 Odoo 风格模块（install/uninstall/upgrade 管理）
├── addons/    低代码 / 插件（_addon 标记，按 addon 分组）
└── Odoo 导入  把外部 .py 扫进来 → 落进 modules/ → 复用通用 CRUD
```

关键区别在**管理方式**：

| 维度 | 应用管理 (modules) | 插件 (addons) |
|------|--------------------|---------------|
| 形态 | 手写业务模块，含 manifest | 低代码/插件，模型标 `_addon=true` |
| 安装 | 注册表 `install(name)` | 随模块加载自动 `loadFromModule` |
| 依赖 | 有 `depends` 校验 | 按 `_addonName` 分组 |
| 卸载 | 清理注册 + 状态回退 | 清理插件登记 |
| 路由 | `/modules/list`、`/addons/list` | `/addons/:addon/models` |

🔑 一句话：**modules 是「系统能力」，addons 是「可插拔扩展」**，二者都通过通用 ORM 暴露接口。

## 界面布局与操作流程

应用管理相关的界面分布在三处：

- **应用管理** `AppManagerPage.tsx`（路由 `/apps-manager`）：卡片式应用列表，支持搜索、状态过滤（已发布/草稿/归档）、进入/编辑/发布/删除。
- **模型集成中心** `OdooModelBrowser.tsx`（路由 `/odoo-models`）：三个 Tab —— Odoo 模块浏览器、数据库表导入、批量导入模块目录。
- **通用 CRUD 运行页** `ModuleRunPage.tsx`（路由 `/addon/:addon/:model`）：任意模型自动长成列表/表单/字段定义页。

管理者日常操作流：

```
打开「应用管理」 → 看到全部已发布应用（卡片）
        │
        ├─ 点「进入」   → /app/:module 通用外壳（模型即页面）
        ├─ 点「发布」   → /api/apps/publish
        └─ 点「更多」   → 发布/下架/删除
```

开发者若要接入 Odoo 资产，则走「模型集成中心 → 导入 Odoo 模块(.py) → 组合创建应用」，或在 `OdooModelBrowser` 里批量扫描 `addons` 目录后一次性导入。

## 底层逻辑与数据模型

服务端路由集中在 `server/standalone.ts`，注册表与 ORM 是两个全局对象：

- `(global as any).__feida_module_registry`：模块注册表，负责 install/uninstall/upgrade。
- `(global as any).__feida_models`：模型 ORM 注册表，提供 `list()`、`getDef()`、`loadFromModule()`。

应用市场式安装的本质，是注册表对 manifest 的「依赖求解 + 状态机」：

```ts
// server/standalone.ts:316
router.post('/modules/:name/install', (req, res) => {
  const registry = (global as any).__feida_module_registry;
  const ok = registry.install(req.params.name);   // 内部校验 depends
  if (!ok) { res.status(400).json({ error: '安装失败(依赖不满足或已安装)' }); return; }
  res.json({ success: true });
});
```

对应还有 `uninstall`（:323）与 `upgrade`（:330），三者共用同一套 `listWithState()` 返回带状态的清单（:306）。注意 addons 与 modules 的登记入口不同：`/addons/list`（:343）会过滤出 `def._addon === true` 的模型并按 `_addonName` 分组，而 `/modules/list` 直接来自手写模块清单。

Odoo 集成的关键全局是 `__feida_models`。无论模型来自手写模块还是 Odoo 导入，只要调用 `reg.loadFromModule(modPath)`（:611）即可接入通用 CRUD —— 这是「模型即页面」得以成立的基础。

## 源码剖析

**1. 插件如何被识别与分组。** `server/standalone.ts:343` 的 `/addons/list` 通过 `_addon` 与 `_addonName` 把模型归类：

```ts
// server/standalone.ts:347
const addonModels = all.filter((m: any) => {
  const def = models.getDef?.(m.name);
  return def && def._addon === true;        // 仅插件模型
});
// 按 addon 分组，返回 { name, models:[{name,description,fields}] }
```

**2. Odoo 导入的「三步链路」。** `server/standalone.ts:539` 的 `/odoo/import` 是核心：

```ts
// server/standalone.ts:579   Step1: .py → JSON（Python 解析器）
jsonResult = execSync(`${pythonPath} odoo-parser.py ${sourceDir}`);
// server/standalone.ts:596   Step2: JSON → Sowork AI 模块（Node 转换器）
convResult = execSync(`node odoo2feida.js ${jsonFile} ${modulesDir}`);
// server/standalone.ts:611   Step3: 注册到 ORM
reg.loadFromModule(modulePath);
```

即：Odoo 的 `ir.model` 定义被 `odoo-parser.py` 抽成 JSON，再由 `odoo2feida.js` 转成本系统的 `models.js`（落进 `modules/` 目录），最后 `loadFromModule` 挂到 ORM。批量场景 `server/standalone.ts:492` 的 `/odoo/batch-import` 只是把上述三步包成循环。

> ⚠️ 注：`odoo2feida.js` 是仓库中真实存在的 Odoo 转换脚本（更名前命名，非产品名）；产品对外名称统一为 **Sowork AI 企业智能ERP系统**。详见大纲"历史内部命名说明"。

**3. 通用 CRUD 外壳。** `ModuleRunPage.tsx:36` 不写任何业务字段，仅通过 `/model/:model/*` 接口动态取字段与数据：

```ts
// client/src/pages/AppsPage/ModuleRunPage.tsx:37
const [fRes, dRes] = await Promise.all([
  fetch(`${BASE}/model/${model}/fields`),       // 字段定义
  fetch(`${BASE}/model/${model}/search?limit=100`), // 列表数据
]);
```

增删改同样走通用接口：`/model/${model}/create`、`/write/${id}`、`/unlink/${id}`（:54、:70）。这意味着**新增一个 Odoo 模型，无需写一行前端代码**。

**4. /app/:module 通用外壳（模型即页面）。** 路由在 `client/src/app.tsx:373`：

```ts
// client/src/app.tsx:373
<Route path="/app/:module" element={<AppShell />}>
  <Route index element={<ModuleHome />} />     // 模块主页：各表卡片
  <Route path=":table" element={<ListView />} />   // 列表
  <Route path=":table/new" element={<FormView />} /> // 新建
  <Route path=":table/:id" element={<DetailView />} /> // 详情
  <Route path=":table/:id/edit" element={<FormView />} />
</Route>
```

`ModuleHome.tsx:48` 读 `appConfig.menu`，为每张表渲染一张卡片，点击即跳到 `/app/:module/:table`。**页面由模型定义驱动，而不是硬编码** —— 这就是「模型即页面」。

## 原理剖析

整条链路的抽象是「**定义即界面**」：

```
Odoo .py / 手写 modules.js / DB 表
        │  (解析 / 扫描)
        ▼
   统一模型定义 (_name, _description, _fields)
        │  __feida_models.loadFromModule
        ▼
   通用 ORM 接口 /model/:model/*
        │
        ▼
   通用外壳 ModuleRunPage / AppShell(ModuleHome/ListView/FormView/DetailView)
        │
        ▼
   任意模型 → 自动长出 列表/表单/详情 页
```

🚀 收益：模型定义是单一事实来源。你改 `models.js` 里的字段，前端列表、表单、详情、搜索框全部跟着变，没有「前后端字段对不齐」的问题。

## 管理者视角

- **已有 Odoo 资产如何低成本迁移？** 你不必重写。把 `addons` 目录交给「批量导入模块目录」（`/odoo/scan-addons` + `/odoo/batch-import`），系统自动扫描含 `models/*.py` 的模块，解析后转成本地模块。对单模块可用「导入 Odoo 模块(.py)」直接拖文件。导入后在「模型集成中心」点「组合创建应用」，自动按 Odoo 视图生成菜单树。
- **插件生态如何扩展系统而不动核心代码？** 这是最大的治理价值：`modules/` 与 `addons/` 都是外挂目录，注册表在启动时扫描加载。你加一个插件，核心 `standalone.ts` 一行不必改；卸载时注册表清理登记（⚠️ 见下），核心同样无感。这让 IT 部门可以按业务线独立交付扩展。
- **数据库资产盘活。** 外部 MySQL/PostgreSQL/SQLite 通过 `/db/scan`（:625）扫描表结构，由 `DBImportWizard.tsx` 向导一步步生成应用，老系统的表也能直接变成 ERP 里的可操作页面。

## 注意事项

⚠️ **Odoo 导入是「模型映射」，不是「逻辑搬运」。** `odoo-parser.py` 主要转换字段与视图结构；复杂的 `server action`、工作流、computed 方法需要你在生成的 `models.js` 里手工补。导入前请评估：纯数据模型迁移很顺，带大量业务逻辑的模块需二次开发。

🔑 **插件卸载会触发注册清理。** `registry.uninstall()` 会把模型、菜单、路由登记一并移除。上线前请在测试环境验证卸载是否影响其他依赖该插件的报表或流程，避免「拆掉一个插件，牵连一片功能」。

✅ **通用 CRUD 外壳大幅省前端开发。** 新增业务对象时，优先用低代码/插件方式产出 `models.js`，直接复用 `ModuleRunPage` 与 `AppShell`，不要用「手写整页」去重复造轮子。

⚠️ **字段类型映射有损耗。** `DBImportWizard.tsx:75` 把 SQL 类型粗略映射为 `integer/float/boolean/date/text/char`，迁移后请人工核对金额、精度类字段，必要时在模型里修正类型。

## 小结与练习

你已理解：Sowork AI 中「应用管理（modules）」与「插件（addons）」是两种注册方式，最终共享同一 ORM；Odoo 资产经 `odoo-parser.py` → `odoo2feida.js` → `loadFromModule` 接入；`/app/:module` 通用外壳让「模型即页面」。

动手练习：

1. 启动系统（端口 3000，登录 `admin/admin123`），进入「应用管理」，观察卡片状态与「进入/发布」动作对应的接口（`/api/apps/list`、`/api/apps/publish`）。
2. 打开「模型集成中心」，点开任一 Odoo 模块，查看其模型与字段，理解 `/odoo/modules` 与 `/odoo/model/:name` 返回结构。
3. 选一个简单 Odoo 模块，用「组合创建应用」生成应用，再进 `/app/:module` 验证列表/表单/详情是否自动生成（对应 `ModuleRunPage.tsx` 与 `app.tsx:373`）。
4. 在 `modules/` 下新建一个含 `_name`、`_fields` 的最小模块，调用 `registry.install()` 验证安装/卸载状态流转。

> **系列导航**：[上一篇：11-低代码平台](./11-低代码平台-4步向导到模型热部署.md) ｜ [下一篇：13-HR总览](./13-HR总览-组织架构成员主档.md) ｜ [大纲](../教程系列写作大纲V2.md)
