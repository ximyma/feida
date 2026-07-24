# 23. ERP 总览与产品基础档案

> **Sowork AI 企业智能ERP系统**（下文简称「本系统」）v1.2.0 技术教程。登录账号 `admin/admin123`，前端地址 `http://localhost:3000`。安装依赖请使用 `npm install --legacy-peer-deps`。本篇所有结论均对照真实源码（`client/src/pages/ProductPage/*`、`server/standalone.ts`、`client/src/components/Layout.tsx`、`client/src/app.tsx`）逐行核验。

## 学习目标

读完本文，你将能够：

- 说清 ERP 在本系统里的定位，以及它为何与 HR（人力资源）并列；
- 理解「产品基础档案」为何是销售、采购、生产、仓储的共同主数据；
- 逐一讲清 9 个产品子功能（颜色、尺码、品类、款号、款色、SKU、箱型、编码规则、配码）的界面、操作流程、底层表、源码与原理；
- 看懂 SKU 如何由「款号 + 颜色 + 尺码」组合而成，并定位批量生成源码；
- 读懂编码规则如何自动生成货号，并能指出 1 处真实前端 bug；
- 从管理者视角评估统一主数据、SKU 规范化、配码标准的业务价值与上线风险。

## 核心概念

ERP（企业资源计划）负责本企业「人、财、物」中「物」的流转。在本系统中，HR 管「人」，ERP 管「物」——从产品定义、采购、生产到仓储销售，全链路共享同一套产品数据。

产品基础档案就是这套共享数据的「字典」，也叫**主数据（Master Data）**。它的特点是：一次录入、多方引用。

```
                ┌──────────── 产品基础档案（主数据）────────────┐
                │ 颜色 尺码 品类 款号 款色 SKU 箱型 编码 配码 │
                └──────────────────────────────────────────────┘
                   │        │        │        │
              销售模块  采购模块  生产模块  仓储模块
               报价/订单  请购/收货  工单/BOM   库存/出入库
```

9 个子功能的层级关系如下：

```
颜色(colors) ──┐
              ├──► 款色(product_style_colors) ──┐
款号(styles) ─┘                                  ├──► SKU(product_skus)
尺码(sizes) ──► 尺码组(size_groups) ─────────┘        │
品类(categories) ──► 款号归属分类                          ├──► 箱型(box_types) 装箱
编码规则(coding_rules) ──► 自动生成 SKU 货号               │
配码规则(size_ratios) ──► 订单/生产的尺码配比 ◄────────────┘
```

🔑 一句话记忆：**款号 + 颜色 = 款色；款色 + 尺码 = SKU（最终可买卖的最小单元）**。

### 产品基础档案数据模型总览表

下表是产品模块的核心表与关键字段，字段名与前端 `interface`、后端 `db` 操作完全一致，可对照源码使用。注意：所有表的增删改查都走 catch-all 通用接口 `/api/:table`（路由注册见 `server/standalone.ts:4065`、`4097`，挂在 `app.use('/api', apiAuthMiddleware, apiRouter())` 之下，`standalone.ts:11858`），只要表名在 `ALLOWED` 白名单即可读写（`standalone.ts:1113-1116`）。

| 表名 | 对应子页 | 关键字段 |
|------|-----------|----------|
| `colors` | 颜色库 | `id,name,pantone_code,custom_code,hex_color,image_url,sort_order,is_active,created_at` |
| `sizes` | 尺码管理 | `id,name,category,sort_order,is_active,created_at`（`category`∈shoe/clothing/accessory） |
| `size_groups` | 尺码管理 | `id,name,description,is_active,created_at` |
| `size_group_items` | 尺码管理 | `id,size_group_id,size_id,sort_order` |
| `product_categories` | 品类管理 | `id,name,code,parent_id,type,sort_order,is_active,created_at` |
| `product_styles` | 款号管理 | `id,code,name,category_id,brand,season,year,description,status,created_at` |
| `product_style_colors` | 款色管理 | `id,style_id,color_id,image_url_1,image_url_2,status,created_at` |
| `product_style_size_configs` | 款号管理（尺码组配置） | `id,style_id,size_group_id` |
| `box_types` | 箱型管理 | `id,name,code,length,width,height,unit,description,is_active,created_at` |
| `product_skus` | SKU 管理 | `id,style_id,style_color_id,size_id,sku_code,barcode,status,created_at` |
| `coding_rules` | 编码规则 | `id,name,code,target_type,prefix,sequence_digits,current_sequence,date_format,rule_template,is_active,created_at` |
| `size_ratios` | 配码规则 | `id,style_id,size_group_id,size_id,ratio` |

⚠️ **路由事实**：本系统没有 `/api/erp` 这样的域前缀。ERP 数据全部走 catch-all 路由 `/api/:table`，前端直接 `fetch('/api/colors')`、`fetch('/api/product_skus')` 等（`ProductPage.tsx:124-133`）。只要表名在 `ALLOWED` 内即可读写。带业务语义的动作（如批量生成 SKU）才有专属路径 `/api/product_skus/generate`（`standalone.ts:4202`）。

---

## 产品基础档案门户（总览）

门户对应 `client/src/pages/ProductPage/ProductPage.tsx`，路由 `/product`（`app.tsx:274`）。它是整个产品模块的驾驶舱，也是进入 9 个子页的唯一图形化入口。

### ① 界面布局与操作流程

顶部是标题「产品基础档案」与副标题「管理鞋服行业产品基础数据，包括颜色、尺码、款号、SKU 等」（`ProductPage.tsx:156-159`）。其下是 6 张渐变统计卡片（颜色数、尺码数、款号数、款色数、SKU 数、箱型数），再下面是两个快捷操作按钮（批量生成 SKU、配置编码规则），中部是 9 个模块卡片，底部是「使用指南」与「数据关系图」（`ProductPage.tsx:161-299`）。

9 张模块卡片由 `modules` 数组定义（`ProductPage.tsx:29-102`），每张用 `NavLink` 直接跳到对应子页：

| 子页路由 | 模块名 | 说明 |
| --- | --- | --- |
| `/product/colors` | 颜色库 | 潘通色号、自定义色号 |
| `/product/sizes` | 尺码管理 | 尺码库 + 尺码组 |
| `/product/categories` | 品类管理 | 多级品类分类 |
| `/product/styles` | 款号管理 | SPU，含季节、品牌 |
| `/product/style-colors` | 款色管理 | 款号 + 颜色变体 |
| `/product/skus` | SKU 管理 | 批量生成、条码 |
| `/product/box-types` | 箱型管理 | 装箱规格 |
| `/product/coding-rules` | 编码规则 | 表达式自动编码 |
| `/product/size-ratios` | 配码规则 | 尺码配比 |

**操作流程**：进入 `/product` 后，点任意卡片即可跳转对应子页；点「批量生成 SKU」直达 SKU 页，点「配置编码规则」直达编码规则页。统计卡片数字由 `fetchStats`（`ProductPage.tsx:121-152`）并行拉取 8 个 `/api/*` 端点后取 `data.length` 得到。推荐初始化顺序（页面「使用指南」也给出，`ProductPage.tsx:264-283`）：先配编码规则 → 颜色 → 尺码与尺码组 → 品类 → 款号 → 款色 → 批量生成 SKU → 配码规则。

### ② 底层逻辑与数据模型

门户本身不落库，它只是路由入口与统计聚合。6 张卡片中，`colors/sizes/styleColors/styles/skus/boxTypes` 是真实从接口取长度的（`ProductPage.tsx:124-133`），而 `coding-rules` 与 `size-ratios` 两张卡片的 `statKey` 设为 `null`（`ProductPage.tsx:92`、`100`），因此不显示计数——它们没有纳入顶部统计，仅作为入口卡片存在。

### ③ 源码剖析

统计拉取逻辑只是并行 `fetch` 后数数组长度，无复杂计算：

```tsx
// ProductPage.tsx:124-147
const endpoints = [
  { key: 'colors', url: '/api/colors' },
  { key: 'sizes', url: '/api/sizes' },
  { key: 'sizeGroups', url: '/api/size_groups' },
  { key: 'categories', url: '/api/product_categories' },
  { key: 'styles', url: '/api/product_styles' },
  { key: 'styleColors', url: '/api/product_style_colors' },
  { key: 'skus', url: '/api/product_skus' },
  { key: 'boxTypes', url: '/api/box_types' },
];
const results = await Promise.all(
  endpoints.map(async ({ key, url }) => {
    const res = await fetch(url);
    const data = await res.json();
    return { key, count: Array.isArray(data) ? data.length : 0 };
  })
);
```

注意：统计用 `data.length` 而非后端聚合接口，因此数据量大时是一次性全量拉取后在浏览器里数长度——这是产品模块的通用风格（与仓储模块直接用 `/api/inventory/statistics` 不同）。

### ④ 原理剖析

门户是「信息架构」而非「数据仪表盘」：它把高频功能前置成卡片，让用户无需记住 URL 也能进入各子页。把「使用指南」与「数据关系图」直接画在首页，是因为产品档案的层级（款号→款色→SKU）对新手不直观，用图形降低认知门槛。

### ⑤ 管理者视角

🚀 门户让实施顾问与管理者一登录就能看到「我现在有多少种颜色 / 尺码 / 款号 / SKU」的全局健康度，并给出标准化初始化路径，避免各企业自创一套混乱顺序。建议把 `coding-rules`、`size-ratios` 也纳入顶部统计，让管理者一眼看清编码规则与配码标准是否齐备。

⚠️ **子页不在侧边栏渲染**（详见文末「注意事项」）：`subMenuItems['/product']`（`Layout.tsx:121-131`）虽定义了 9 个二级菜单，但侧边栏的 `renderNewModuleNav` 渲染循环（`Layout.tsx:556-577`）**没有包含 `/product`**，只有顶级单链接经 `menuItems.map`（`Layout.tsx:49`）渲染。因此左侧栏看不到这 9 个子页，你必须走门户卡片或直接输 URL（如 `http://localhost:3000/product/skus`）。

---

## 颜色库（ColorsPage）

对应 `client/src/pages/ProductPage/ColorsPage.tsx`，路由 `/product/colors`（`app.tsx:275`），底层主表 `colors`。

### ① 界面布局与操作流程

顶部是标题「颜色库管理」+ 副标题「管理产品颜色档案，支持潘通色号、自定义色号和颜色图片」（`ColorsPage.tsx:107-110`），右上角「添加颜色」按钮，左侧搜索框按名称/潘通/自定义色号过滤（`ColorsPage.tsx:114-135`）。主体是一个响应式网格（4~8 列），每张颜色卡片显示色块（`hex_color`）、名称、潘通色号、自定义色号，并提供「编辑/删除」（`ColorsPage.tsx:137-172`）。

**操作流程**：点「添加颜色」→ 填**颜色名称**（必填）、**潘通色号**（如 `PANTONE 19-1664`）、**自定义色号**、**颜色值**（`<input type="color">` 取色器或手填 `#000000`）、**排序** → 保存即 `POST /api/colors`（`ColorsPage.tsx:48-71`）。列表里可编辑、删除（删除是 `confirm` 二次确认后 `DELETE /api/colors/:id`，`ColorsPage.tsx:86-97`）。

### ② 底层逻辑与数据模型

落库表 `colors`，关键字段见总览表。`interface Color` 含 `is_active: number`（`ColorsPage.tsx:5-15`），但**前端表单 `formData` 并未包含 `is_active`**（`ColorsPage.tsx:22-29`），所以新建颜色不会写入启用状态；列表也不展示启用/停用徽章（对比箱型、款号等页面有状态列）。

### ③ 源码剖析

保存逻辑走 catch-all 路由，新增 `POST /api/colors`、编辑 `PUT /api/colors/:id`、删除 `DELETE /api/colors/:id`：

```tsx
// ColorsPage.tsx:54-60
const url = editingColor ? `/api/colors/${editingColor.id}` : '/api/colors';
const method = editingColor ? 'PUT' : 'POST';
const res = await fetch(url, {
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});
```

由于前端不传 `id`，后端 catch-all 会按表名前缀自动生成主键：`${table.slice(0,3)}_${Date.now()}`（`standalone.ts:4103`）——对 `colors` 即 `col_<时间戳>`。删除则是物理删除（catch-all `DELETE /api/:table/:id` 直接 `db.deleteById`，与仓储模块的软删除不同）。

### ④ 原理剖析

颜色是最底层的原子字典：只录一次，被款色、SKU、条码等上层引用。把潘通色号与自定义色号并列，是为了兼顾国际标准（潘通）与企业内部叫法，避免设计部与车间对同一颜色各说各话。色块用 `hex_color` 在 UI 直接预览，减少「色号文字 ↔ 实际颜色」的认知误差。

### ⑤ 管理者视角

🚀 颜色字典规范后，设计、采购、生产、仓储对「同一双鞋的黑色」有唯一指代，配色报表、按色库存统计才不会发散。建议在上线前把常用色（含企业标准潘通号）一次性录全，别等业务跑起来再补。

⚠️ **删除是物理删除，无软删除**。与仓储模块（仓库置 `inactive`、货位置 `deleted`）不同，产品档案的删除走 catch-all 物理删除，被款色/SKU 引用的颜色一旦误删会破坏外键语义。删除前请确认没有款色或 SKU 还在引用它。

---

## 尺码管理（SizesPage）

对应 `client/src/pages/ProductPage/SizesPage.tsx`，路由 `/product/sizes`（`app.tsx:276`），底层三张表：`sizes`、`size_groups`、`size_group_items`。

### ① 界面布局与操作流程

顶部标题「尺码管理」+ 副标题「管理尺码库和尺码组，支持鞋服行业多码制配置」（`SizesPage.tsx:192-196`）。页面内部分两个 Tab：**尺码库**（Tab `sizes`）与**尺码组**（Tab `groups`），由 `activeTab` 状态切换（`SizesPage.tsx:34`、`200-224`）。

- **尺码库 Tab**：搜索框 +「添加尺码」按钮；网格展示各尺码名与分类（shoe/clothing/accessory），可编辑/删除（`SizesPage.tsx:226-289`）。
- **尺码组 Tab**：「添加尺码组」按钮；卡片展示每个尺码组及其下挂的尺码标签，组内可「管理尺码 / 编辑 / 删除」（`SizesPage.tsx:292-372`）。「管理尺码」弹窗列出全部尺码，可逐条「添加 / 移除」到该组（`SizesPage.tsx:466-505`）。

**操作流程**：建尺码（`POST /api/sizes`，必填名称、选分类）→ 建尺码组（`POST /api/size_groups`，填名称、描述）→ 在组内「管理尺码」把若干尺码挂进来（逐条 `POST /api/size_group_items`，`SizesPage.tsx:126-145`）。前端拉取时先取 `sizes`、`size_groups`，再对每个组循环 `GET /api/size_group_items?size_group_id=...`（`SizesPage.tsx:49-74`）。

### ② 底层逻辑与数据模型

三张表关键字段见总览表。`size_group_items` 是连接表，把 `size_groups` 与 `sizes` 多对多关联（`size_group_id + size_id`）。尺码 `category` 区分鞋/服/配件，用于不同品类的码制隔离。

### ③ 源码剖析

新增尺码、尺码组、组内成员均走 catch-all：

```tsx
// SizesPage.tsx:82-88 新增尺码
const url = editingSize ? `/api/sizes/${editingSize.id}` : '/api/sizes';
const method = editingSize ? 'PUT' : 'POST';
const res = await fetch(url, { method, headers: {...}, body: JSON.stringify(formData) });

// SizesPage.tsx:129-137 把尺码加入尺码组
await fetch('/api/size_group_items', {
  method: 'POST',
  body: JSON.stringify({ size_group_id: selectedGroup.id, size_id: sizeId, sort_order: 0 }),
});
```

注意：同一个尺码可被多个尺码组引用（多对多），前端不在此去重——业务上「童鞋组」与「成人鞋组」确实可能共用部分尺码，这是合理设计。

### ④ 原理剖析

为什么需要「尺码组」而不是直接给款号挂散尺码？鞋服行业同一品牌常有欧码、美码、国码多套体系，且不同款适用的尺码范围不同（童鞋 28–38、成人鞋 39–46）。尺码组让「款号」一次性绑定一组尺码（通过 `product_style_size_configs`），既避免重复勾选，又保证同款尺码范围一致——这正是「一次录入、多方引用」主数据思想的体现。

### ⑤ 管理者视角

🚀 尺码组标准化后，下游「批量生成 SKU」只需选一个组就能自动铺满该款所有尺码，极大降低录单工作量。建议按「品类 + 性别/年龄段」预设尺码组（如女鞋欧码组、男鞋国码组），并冻结常用组，避免录入人员临时拼凑导致同款尺码遗漏。

⚠️ 删除尺码组是物理删除（`DELETE /api/size_groups/:id`），不会自动清理 `size_group_items` 的引用行；若某款已配置该组、并已据此生成 SKU，误删组会造成「款号配置指向不存在的组」。删除前请先确认没有款号在引用。

---

## 品类管理（CategoriesPage）

对应 `client/src/pages/ProductPage/CategoriesPage.tsx`，路由 `/product/categories`（`app.tsx:277`），底层主表 `product_categories`。

### ① 界面布局与操作流程

顶部标题「品类管理」+ 副标题「管理产品品类，支持多级品类分类」（`CategoriesPage.tsx:192-195`）。工具栏右侧有「树形 / 表格」两种视图切换（`viewMode`，`CategoriesPage.tsx:29`、`210-223`），默认树形。树形视图用递归 `renderTreeNode` 渲染多级品类，可展开/折叠（`CategoriesPage.tsx:133-188`）；表格视图按「顶级品类 + 其下级品类（带 `└─` 缩进）」平铺（`CategoriesPage.tsx:252-318`）。

**操作流程**：点「添加品类」→ 填**品类名称**（必填）、**品类编码**（用于自动编码规则，如 `SHOE`）、**上级品类**（下拉选顶级品类，可留空表示顶级）、**类型**（shoe 鞋类 / clothing 服装 / accessory 配件 / material 材料）、**排序** → 保存即 `POST /api/product_categories`（`CategoriesPage.tsx:48-71`）。类型用彩色徽章展示（`getTypeBadge`，`CategoriesPage.tsx:121-130`）。

### ② 底层逻辑与数据模型

落库表 `product_categories`，关键字段见总览表。多级结构靠 `parent_id` 自引用实现：顶级品类 `parent_id` 为空（`CategoriesPage.tsx:108` 用 `!c.parent_id` 取根），子品类 `parent_id` 指向父节点。类型影响编码规则中 `${categ.code}` 的取值（`standalone.ts:4277`）与统计分组。

### ③ 源码剖析

保存与删除同为 catch-all：

```tsx
// CategoriesPage.tsx:54-60
const url = editingCategory ? `/api/product_categories/${editingCategory.id}` : '/api/product_categories';
const method = editingCategory ? 'PUT' : 'POST';
const res = await fetch(url, { method, headers: {...}, body: JSON.stringify(formData) });
```

树形渲染是纯前端递归，不依赖后端树接口——它一次性 `GET /api/product_categories` 全量拉回，再用 `parent_id` 在内存里拼父子关系（`CategoriesPage.tsx:98-109` 的 `rootCategories` 与 `getChildren`）。

### ④ 原理剖析

品类的价值是「给产品打业务标签层」：鞋/服/配件决定不同的码制、工艺与供应链；材料则服务于 PLM/BOM。多级结构让「运动鞋 → 跑鞋 → 竞速跑鞋」这类层级可被自由展开，既支持粗粒度报表（按鞋类汇总），也支持细粒度钻取。编码（`code`）单独存，是为了让编码规则在生成货号时能嵌入品类缩写。

### ⑤ 管理者视角

🚀 品类树是后续销售分析、生产计划、仓储分类的统计骨架。建议先定好顶层品类（鞋/服/配件/材料）与二级品类，再录款号时挂接，避免后期大量款号回流改分类。

⚠️ 删除品类同样是物理删除（`DELETE /api/product_categories/:id`），不会级联处理子品类与已挂接的款号。若删掉一个还有子品类或仍有款号 `category_id` 指向它的品类，会留下「孤儿」数据。删除前请先确认无下级品类、且款号未引用。

---

## 款号管理（StylesPage）

对应 `client/src/pages/ProductPage/StylesPage.tsx`，路由 `/product/styles`（`app.tsx:278`），底层主表 `product_styles`，并通过 `product_style_size_configs` 配置尺码组。

### ① 界面布局与操作流程

顶部标题「款号管理」+ 副标题「管理产品款号档案（SPU），是鞋服行业产品的核心主数据」（`StylesPage.tsx:187-190`）。表格列：款号（编码）、名称、品类、品牌、季节、状态、操作（`StylesPage.tsx:217-278`）。每行操作有 4 个图标：紫色「款色管理」（跳 `/product/style-colors?styleId=...`，`StylesPage.tsx:248`）、青色「配置尺码组」、蓝色编辑、红色删除。

**操作流程**：点「添加款号」→ 填**款号编码**（必填，如 `FD2026001`）、**名称**（必填）、**品类**（下拉）、**品牌**、**季节**（如 `2026春夏`）、**年份**、**描述** → 保存即 `POST /api/product_styles`（`StylesPage.tsx:74-97`）。建好款号后，点该行青色图标「配置尺码组」弹出 `SizeConfigModal`，把若干 `size_groups` 挂到该款（`POST /api/product_style_size_configs`，`StylesPage.tsx:131-149`；移除则 `DELETE /api/product_style_size_configs/:id`，`StylesPage.tsx:151-161`）。

### ② 底层逻辑与数据模型

落库表 `product_styles` 关键字段见总览表（`StylesPage.tsx:6-17`）。尺码组配置存 `product_style_size_configs`（`style_id + size_group_id`），一个款可挂多个组。`SizeConfigModal` 通过专属接口 `GET /api/product_styles/:id/size-config` 拉取已配置组及其下尺码（`StylesPage.tsx:422` → 后端 `standalone.ts:4291`）。

### ③ 源码剖析

新增款号走 catch-all：

```tsx
// StylesPage.tsx:80-86
const url = editingStyle ? `/api/product_styles/${editingStyle.id}` : '/api/product_styles';
const method = editingStyle ? 'PUT' : 'POST';
const res = await fetch(url, { method, headers: {...}, body: JSON.stringify(formData) });
```

配置尺码组时，前端把整组 `size_group_id` 作为一行 `product_style_size_configs` 提交；后端 `size-config` 接口会反查该组下的尺码，拼成 `{ ...config, size_group, sizes }` 返回（`standalone.ts:4291-4305`），供弹窗展示「该款已有哪些尺码」。

### ④ 原理剖析

款号（SPU）是产品的「抽象层」：它代表「一款鞋」这个概念，而不关心颜色与尺码。把季节、品牌、品类、尺码组都挂在款号上，是因为这些属性对「同一款」是共用的——无论出多少个颜色、多少个尺码，季节/品牌不变。这种抽象让下游 SKU 只需关心「哪款 + 哪色 + 哪码」三个变量，结构与现实商品天然对应。

### ⑤ 管理者视角

🚀 款号是产品数据的「锚点」：销售按款汇总、生产按款排工单、库存按款看结构，全都从 `product_styles` 出发。建议款号编码规则化（前缀区分品类/品牌 + 年份 + 流水），并尽早把尺码组配齐，否则后续「批量生成 SKU」会卡在「无尺码组」。

⚠️ 从款号行点「款色管理」会用 `navigate('/product/style-colors?styleId=...')` 带参跳转（`StylesPage.tsx:248`），`StyleColorsPage` 读取该参数自动筛选该款（`StyleColorsPage.tsx:35-62`）。但侧边栏无法进入子页（见文末注意事项），这个「行内跳转」反而是最顺手的入口。

---

## 款色管理（StyleColorsPage）

对应 `client/src/pages/ProductPage/StyleColorsPage.tsx`，路由 `/product/style-colors`（`app.tsx:279`），底层主表 `product_style_colors`。

### ① 界面布局与操作流程

顶部标题「款色管理」+ 副标题「管理款号+颜色变体，支持多图展示，是 SKU 生成的基础」（`StyleColorsPage.tsx:157-160`）。工具栏含搜索框、款号下拉筛选（「全部款号」+ 各款）、「添加款色」按钮（`StyleColorsPage.tsx:163-195`）。主体是网格卡片：每张卡片显示颜色色块（`color_hex`）、款名、颜色名，以及最多两张图片（`image_url_1`/`image_url_2`），并提供编辑/删除（`StyleColorsPage.tsx:198-249`）。

**操作流程**：点「添加款色」→ 选**款号**（必填）、选**颜色**（必填，来自 `colors`）、填**图片1 URL**、**图片2 URL** → 保存即 `POST /api/product_style_colors`（`StyleColorsPage.tsx:97-120`）。若从款号页带 `?styleId=` 进入，款号下拉会被锁定且不可改（`disabled={!!styleIdFromUrl}`，`StyleColorsPage.tsx:278`）。

### ② 底层逻辑与数据模型

落库表 `product_style_colors`，关键字段见总览表（`StyleColorsPage.tsx:18-26`）。它是「款号 + 颜色」的组合实体——`style_id` 指向 `product_styles`，`color_id` 指向 `colors`。注意前端 `interface` 含 `status` 字段，但表单并未编辑它（新建时 `status` 不传，由后端默认）。

### ③ 源码剖析

保存与删除走 catch-all：

```tsx
// StyleColorsPage.tsx:103-109
const url = editingColor ? `/api/product_style_colors/${editingColor.id}` : '/api/product_style_colors';
const method = editingColor ? 'PUT' : 'POST';
const res = await fetch(url, { method, headers: {...}, body: JSON.stringify(formData) });
```

列表数据是前端「富化」得到的：先并行拉 `product_styles`、`colors`、`product_style_colors`，再按 `sc.style_id` / `sc.color_id` 把款名、颜色名、色值拼进每条款色（`StyleColorsPage.tsx:80-90`）。这就是为何卡片能直接显示款名与色块，而底层表只存了 ID。

### ④ 原理剖析

款色是「款号」与「颜色」的第一次组合，也是 SKU 的「半成品」：一个款色 = 某款某颜色的完整外观（如「经典跑鞋-经典黑」）。它额外承载图片，是因为销售/商城/生产都需要「这款这色长什么样」的视觉素材。把图片挂在款色而非 SKU 上，是因为同一颜色不同尺码长相一致，图只需存一次。

### ⑤ 管理者视角

🚀 款色是 SKU 生成的前置条件——没有款色，批量生成 SKU 时「款色下拉」为空。建议每建一个款号，就把该款计划出的所有颜色都建成款色并上传实拍图，这样下游商城、生产、仓储拿到的都是带图的标准化外观。

⚠️ 款色删除是物理删除（`DELETE /api/product_style_colors/:id`），但它下已生成的 SKU 不会自动清理。误删款色会导致「SKU 的 `style_color_id` 指向不存在的款色」，列表富化时颜色名会变成 `-`。删除前请先确认该款色下无在用的 SKU。

---

## SKU 管理（SKUsPage）

对应 `client/src/pages/ProductPage/SKUsPage.tsx`，路由 `/product/skus`（`app.tsx:280`），底层主表 `product_skus`。这是产品档案的「终点」——最终可买卖的最小单元。

### ① 界面布局与操作流程

顶部标题「SKU 管理」+ 副标题「管理产品 SKU（款色+尺码），支持批量生成和条码管理」（`SKUsPage.tsx:218-221`）。两个绿色/蓝色按钮：「批量生成」（绿）、「添加 SKU」（蓝）（`SKUsPage.tsx:235-257`）。表格列：SKU 编码、款号、颜色、尺码、条码、状态、操作（`SKUsPage.tsx:260-310`）。

**操作流程**：
- **批量生成（推荐）**：点「批量生成」→ 选**款号**、**款色**、**尺码组** → 提交 `POST /api/product_skus/generate`（`SKUsPage.tsx:149-172`、后端 `standalone.ts:4202`），系统按尺码组下所有尺码逐一组合生成 SKU。
- **单条添加**：点「添加 SKU」→ 选款号（联动出款色）、款色、尺码，可手填 SKU 编码与条码（`SKUsPage.tsx:328-391`）。

### ② 底层逻辑与数据模型

落库表 `product_skus`，关键字段见总览表（`SKUsPage.tsx:5-14`）：`style_id / style_color_id / size_id / sku_code / barcode / status`。SKU 由「款色 + 尺码」唯一确定，批量生成时后端遍历尺码组下尺码，对每条组合生成一行（`standalone.ts:4224-4252`）。

### ③ 源码剖析

**批量生成**是核心业务接口，逻辑在 `server/standalone.ts:4202-4258`：

```ts
// standalone.ts:4224-4250
for (const item of sizeItems) {
  const size = db.findById('sizes', item.size_id) as any;
  if (!size) continue;
  let skuCode = '';
  if (rule) {
    const seq = (rule.current_sequence || 0) + generated.length + 1;
    const seqStr = String(seq).padStart(rule.sequence_digits || 4, '0');
    skuCode = `${rule.prefix || ''}${style.code}${size.name}${seqStr}`;   // 4233
    db.update('coding_rules', rule.id, { current_sequence: seq });
  } else {
    skuCode = `${style.code}_${styleColorId}_${size.id}`;
  }
  const sku = {
    id: `sku_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    style_id: styleId, style_color_id: styleColorId, size_id: size.id,
    sku_code: skuCode, status: 'active', created_at: new Date().toISOString()
  };
  db.insert('product_skus', sku);   // 4250
}
```

要点：SKU 编码 = `前缀 + 款号编码 + 尺码名 + 递增序号`，序号来自 `coding_rules.current_sequence`，每生成一个就自增并写回（`standalone.ts:4235`）。前端 `SKUsPage.tsx:149-172` 调用 `/api/product_skus/generate` 时，正是提交这三个下拉（款号、款色、尺码组）。

### ④ 原理剖析

为什么 SKU 要拆成「款号→款色→SKU」三层？因为现实中一件商品天然有三个维度：是什么款（style）、什么颜色（color）、什么尺码（size）。把三层拆开，既能避免重复录入（颜色、尺码只录一次），又能在任意维度上做统计（按款汇总销量、按颜色看库存、按尺码排生产）。SKU 是库存与订单的基石：库存数量挂在 SKU 上，订单行明细指向 SKU，生产工单领料也围绕 SKU。

### ⑤ 管理者视角

🚀 从管理角度看，SKU 规范化直接决定后续所有业务报表准不准。建议上线初期就用「批量生成」而非手填，并先配好编码规则（见下节），保证货号统一可读、全局唯一。

⚠️ **单条添加 SKU 的「编码留空自动生成」是误导**：添加弹窗里 SKU 编码占位符写「留空将自动生成」（`SKUsPage.tsx:378`），但单条保存走 catch-all `POST /api/product_skus`，**后端并无单条自动编码逻辑**——`sku_code` 为空时会被原样插入空字符串（`standalone.ts:4110` 仅按表字段过滤，不补编码）。只有「批量生成」才会调编码规则出号。因此单条添加务必手填编码，否则会得到空货号的 SKU。这是真实的前端文案/后端能力不一致，已如实写入，请勿修改源码。

⚠️ SKU 删除是物理删除（`DELETE /api/product_skus/:id`）。已入库/有订单的 SKU 不建议删，应置 `status='inactive'`（列表有启用/停用徽章，`SKUsPage.tsx:284-289`）而非物理删除，以免库存与订单失去指向。

---

## 箱型管理（BoxTypesPage）

对应 `client/src/pages/ProductPage/BoxTypesPage.tsx`，路由 `/product/box-types`（`app.tsx:281`），底层主表 `box_types`。

### ① 界面布局与操作流程

顶部标题「箱型管理」+ 副标题「管理产品包装箱型规格，用于物流和仓储管理」（`BoxTypesPage.tsx:108-111`）。表格列：编码、名称、尺寸（长×宽×高）、单位、描述、状态、操作（`BoxTypesPage.tsx:138-187`）。状态用绿/灰徽章区分启用/停用（`BoxTypesPage.tsx:161-167`）。点「添加箱型」弹窗填编码、名称、长、宽、高、单位（cm/mm/inch）、描述（`BoxTypesPage.tsx:206-278`）。

**操作流程**：点「添加箱型」→ 填**箱型编码**（必填，如 `BOX-01`）、**名称**（必填，如 `标准鞋盒`）、**长/宽/高**（数字）、**单位**、**描述** → 保存即 `POST /api/box_types`（`BoxTypesPage.tsx:50-73`）。列表可编辑、删除（`DELETE /api/box_types/:id`，`BoxTypesPage.tsx:89-100`）。

### ② 底层逻辑与数据模型

落库表 `box_types` 关键字段见总览表（`BoxTypesPage.tsx:5-16`）。与颜色页不同，箱型页`interface` 的 `is_active` 在前端有真实使用：列表显示启用/停用徽章（虽添加弹窗未提供启用开关，`is_active` 默认由后端给值）。`length/width/height` 存数字、`unit` 存单位，便于装箱体积/运费估算。

### ③ 源码剖析

保存走 catch-all：

```tsx
// BoxTypesPage.tsx:56-62
const url = editingBox ? `/api/box_types/${editingBox.id}` : '/api/box_types';
const method = editingBox ? 'PUT' : 'POST';
const res = await fetch(url, { method, headers: {...}, body: JSON.stringify(formData) });
```

### ④ 原理剖析

箱型是「物流维度」的主数据：它描述「一箱能装什么、装多少、占多大空间」。在鞋服行业，不同款/不同配码整箱出货，箱型规格直接服务于装箱单、体积重计费、仓位规划。把箱型独立成表，是为了让「某款一箱装几双、按什么尺码比」可被仓储与物流复用，而不是每次出货临时算。

### ⑤ 管理者视角

🚀 规范箱型后，仓储可做「按箱入库/出库」、物流可按箱型预估运费与车辆装载。建议按实际包装（单鞋盒、混码整箱、电商快递箱）建立少量标准箱型，避免一物多箱型导致装箱混乱。

⚠️ 删除箱型是物理删除（`DELETE /api/box_types/:id`）。若已有装箱配置或出入库记录引用该箱型，误删会留下悬空引用。删除前请确认无在用的装箱关联。

---

## 编码规则（CodingRulesPage）

对应 `client/src/pages/ProductPage/CodingRulesPage.tsx`，路由 `/product/coding-rules`（`app.tsx:282`），底层主表 `coding_rules`。它是 SKU 自动出号的「发动机」。

### ① 界面布局与操作流程

顶部标题「编码规则」+ 副标题「管理产品编码规则，包括 SKU 编码、条码等自动生成规则」（`CodingRulesPage.tsx:136-139`）。表格列：规则名称、规则编码、应用对象、前缀、序号位数、当前序号、状态、操作（`CodingRulesPage.tsx:166-222`）。每行有「预览（眼睛图标）、编辑、删除」。点「添加规则」弹窗填：规则名称、规则编码、应用对象（sku/barcode/style/color）、前缀、序号位数、当前序号、日期格式（`CodingRulesPage.tsx:242-319`）。点眼睛图标弹「编码预览」窗，显示按当前规则算出的一个示例编码（`CodingRulesPage.tsx:334-359`）。

**操作流程**：点「添加规则」→ 设**应用对象=sku**、**前缀**（如 `SH`）、**序号位数=4** → 保存 `POST /api/coding_rules`。随后到 SKU 页「批量生成」时，系统即按此规则出号（`standalone.ts:4220-4235`）。点「预览」可看下一个序号会长什么样。

### ② 底层逻辑与数据模型

落库表 `coding_rules` 关键字段见总览表（`CodingRulesPage.tsx:5-17`）：`target_type`（应用对象）、`prefix`、`sequence_digits`（序号位数）、`current_sequence`（当前序号，自增）、`date_format`、`rule_template`、`is_active`。后端批量生成 SKU 时通过 `db.findWhere('coding_rules', { target_type: 'sku', is_active: 1 })` 取第一条生效规则（`standalone.ts:4220-4221`）。

### ③ 源码剖析

**后端预览接口**（`standalone.ts:4261-4288`）用表达式变量替换生成样例，支持 `${sequence}`、`${prefix}`、`${categ.code}`、`${year}`、`${month}`、`${day}`：

```ts
// standalone.ts:4269-4282
let preview = rule.expression || '';
preview = preview.replace(/\$\{sequence\}/g, seqStr);
preview = preview.replace(/\$\{prefix\}/g, rule.prefix || '');
if (categoryId) preview = preview.replace(/\$\{categ\.code\}/g, category.code || '');
preview = preview.replace(/\$\{year\}/g, new Date().getFullYear().toString());
preview = preview.replace(/\$\{month\}/g, String(new Date().getMonth()+1).padStart(2,'0'));
preview = preview.replace(/\$\{day\}/g, String(new Date().getDate()).padStart(2,'0'));
```

**前端预览**（`CodingRulesPage.tsx:122-128`）却只算 `前缀 + 日期 + 序号`，且读的是 `rule.prefix`：

```tsx
// CodingRulesPage.tsx:122-128
const generatePreview = (rule) => {
  const prefix = rule.prefix || '';
  const seq = String(rule.current_sequence + 1 || 1).padStart(rule.sequence_digits || 4, '0');
  const date = rule.date_format ? new Date().toISOString().slice(0,10).replace(/-/g,'') : '';
  let result = prefix + (date ? date + prefix : '') + seq;   // 注意前缀被拼了两次
  return result;
};
```

### ④ 原理剖析

编码规则把「人工编货号」变成「系统自动出号」，既保证唯一性（递增序号），又保证可读性（前缀区分品类、序号防重）。批量生成 SKU 时，序号来自 `coding_rules.current_sequence` 并每生成一个自增写回（`standalone.ts:4231-4235`），因此并发生成也能保持单调不重复（单进程内串行循环保证）。

### ⑤ 管理者视角

🚀 编码规则可配置、无需改代码即可调整货号样式，是二开友好的设计。建议为 SKU 设统一前缀（区分品类/品牌）+ 4 位流水，并冻结规则后不再手工改 `current_sequence`，否则可能撞号。

⚠️ **真实前端 bug（已如实写入，请勿改源码）**：编辑编码规则时，`handleEdit` 把前缀读成了 `rule.refix`（拼写错误，少了一个 `p`）：

```tsx
// CodingRulesPage.tsx:85  （原样）
prefix: rule.refix || '',     // 应为 rule.prefix
```

`rule.refix` 在 JS 里是 `undefined`，所以编辑已有规则时，前缀字段会被重置为空字符串，保存后该规则前缀丢失。这是字段名拼写笔误，属真实 bug。

⚠️ **「表达式」能力形同虚设**：后端预览读 `rule.expression`（`standalone.ts:4269`），但前端表单根本没有「expression」字段——它只有 `rule_template`（`CodingRulesPage.tsx:34`、`89`、`309-319`）。而 `rule_template` 在任何预览/生成逻辑里都未被读取，属于死字段。换言之，界面上无法配置 `standalone.ts:4269` 支持的 `${sequence}`/`${categ.code}` 等表达式式编码，只能靠「前缀 + 序号位数」出号。`rule_template` 与 `expression` 命名不一致，是前后端契约未对齐的表现。

⚠️ **前端预览有重复前缀**：`generatePreview` 在 `date` 存在时写成 `prefix + date + prefix + seq`（`CodingRulesPage.tsx:126`），前缀被拼了两次；且日期取自 `rule.date_format` 是否为真值判断，但日期格式串并未真正参与格式化。预览结果仅供示意，真实出号以后端 `standalone.ts:4233` 为准。

---

## 配码规则（SizeRatiosPage）

对应 `client/src/pages/ProductPage/SizeRatiosPage.tsx`，路由 `/product/size-ratios`（`app.tsx:283`），底层主表 `size_ratios`。

### ① 界面布局与操作流程

顶部标题「配码规则管理」+ 副标题「管理款号的尺码配比规则，用于订单录入和生产配码」（`SizeRatiosPage.tsx:174-177`）。工具栏含搜索框、款号下拉、尺码组下拉、「保存配码」按钮（`SizeRatiosPage.tsx:180-225`）。选中款号+尺码组后，主体显示该组下每个尺码一个输入框（配比数量），并实时给出「总配数」与「配码预览（示例：10 箱）」（`SizeRatiosPage.tsx:228-285`）。页面下方还有「已保存的配码规则」表格，列出所有 `size_ratios` 行并可删除（`SizeRatiosPage.tsx:297-355`）。

**操作流程**：选**款号** → 选**尺码组**（联动该组尺码）→ 在每个尺码框填配比数量（默认 1）→ 点「保存配码」。前端先 `DELETE` 该款+该组的旧配码，再逐尺码 `POST /api/size_ratios` 写入新比例（`SizeRatiosPage.tsx:113-157`）。

### ② 底层逻辑与数据模型

落库表 `size_ratios` 关键字段见总览表（`SizeRatiosPage.tsx:5-11`）：`style_id + size_group_id + size_id + ratio`。一条款色组合（款+组+尺码）对应一行比例。配码描述的是「某款某组下，各尺码的相对数量比」，如 S:M:L = 1:2:1。前端 `getSavedRatios` 按 `style_id + size_group_id` 过滤出该组合的全部尺码比例（`SizeRatiosPage.tsx:90-98`）。

### ③ 源码剖析

保存是「先删后插」：

```tsx
// SizeRatiosPage.tsx:127-149
const oldRatios = ratios.filter(r => r.style_id === selectedStyleId && r.size_group_id === selectedSizeGroupId);
for (const old of oldRatios) {
  await fetch(`/api/size_ratios/${old.id}`, { method: 'DELETE' });
}
for (const item of groupSizes) {
  const ratio = ratioValues[item.size_id] || 1;
  if (ratio > 0) {
    await fetch('/api/size_ratios', { method: 'POST', body: JSON.stringify({
      style_id: selectedStyleId, size_group_id: selectedSizeGroupId,
      size_id: item.size_id, ratio
    }) });
  }
}
```

预览是纯前端计算：`ratio × 10` 即为「10 箱时该尺码的双数」（`SizeRatiosPage.tsx:268-283`），便于直观理解配比。

### ④ 原理剖析

为什么要有「配码规则」？鞋服行业订单与生产不是「各尺码各买一双」，而是按固定比例成箱/成批（如男鞋 40:41:42 = 2:3:2）。配码规则把这套比例沉淀为主数据，下游订单录入、生产排产、采购备料都按它自动换算「要生产/采购多少个每个尺码」，避免人工逐行算错。它是连接「产品定义」与「供应链执行」的关键桥梁。

### ⑤ 管理者视角

🚀 配码标准化后，销售开单、生产齐套、仓库拣货都能「给总数→自动拆尺码」，大幅提升效率并减少错配。建议按品类/性别为常用款设好配码比（如电商爆款偏中大码），并随季节销售数据迭代。

⚠️ **死代码（轻微，已如实写入）**：`handleSaveRatios` 里声明了 `const savedCount = 0;`（`SizeRatiosPage.tsx:135`）但全程未使用，属冗余变量，不影响功能。

⚠️ 配码规则删除是物理删除单条 `size_ratios` 行。由于保存采用「先删旧后插新」，频繁保存会不断 `DELETE + INSERT`；若并发保存同一款+组，可能出现短暂读到部分旧数据的竞态，但单用户操作无碍。

---

## 管理者视角（总览）

把 9 个子页串起来看，产品基础档案的核心价值是**统一主数据，避免各系统各说各话**。

如果没有统一档案：销售按自己的叫法报货、仓库按另一套编码入库、生产又用第三套，结果同一双鞋在三个部门是三个「名字」，对账永远对不上。把产品字典沉淀在 ERP 主数据里，销售、采购、生产、仓储全部引用同一份 SKU（颜色→尺码→品类→款号→款色→SKU→箱型→编码→配码），数据天然一致。

🚀 关键落点：
- **SKU 是库存与订单的基石**：库存数量挂在 SKU 上，订单行明细指向 SKU，生产工单领料也围绕 SKU。SKU 建得规范，后续所有业务报表才准。
- **编码规则让货号自动、唯一、可读**：上线初期就定好前缀与序号位数，别等数据乱了再返工。
- **配码规则驱动供应链**：订单/生产按配比自动拆尺码，减少人工错配。
- **箱型支撑物流**：标准化箱型让装箱、运费、仓位规划可复用。

⚠️ 上线 checklist：① 先配编码规则；② 录颜色、尺码与尺码组；③ 建品类树；④ 建款号并配尺码组；⑤ 为款号建款色并传图；⑥ 批量生成 SKU；⑦ 设配码比。严格按此顺序，可避免「款色未建就生成 SKU」「无尺码组卡生成」等中断。

## 注意事项

⚠️ **子页不在侧边栏渲染**：`subMenuItems['/product']`（`Layout.tsx:121-131`）虽定义了 9 个二级菜单，但侧边栏的 `renderNewModuleNav` 渲染循环（`Layout.tsx:556-577`）**没有包含 `/product`**，只有顶级单链接经 `menuItems.map`（`Layout.tsx:49`）渲染。因此左侧栏看不到这 9 个子页。你有两种走法：① 直接在浏览器地址栏输入完整 URL（如 `http://localhost:3000/product/skus`）；② 进入 `/product` 门户后点模块卡片跳转（当作页内入口使用）。

🔑 **SKU 唯一性**：SKU 由「款色 + 尺码」唯一确定，批量生成前请确认款色已建好、尺码组已绑定，避免重复或遗漏。货号唯一性由编码规则的递增序号保证，不要手工改 `current_sequence`。

✅ **编码规则可配置**：货号格式、前缀、序号位数都在「编码规则」页设置，改配置即可生效，无需动代码。

⚠️ **产品档案删除均为物理删除**：与仓储模块（仓库置 `inactive`、货置 `deleted` 软删除）不同，颜色/尺码/品类/款号/款色/SKU/箱型/配码等走 catch-all `DELETE /api/:table/:id` 直接物理删除，**无软删除状态位**。被上层引用的记录误删会造成悬空外键，删除前务必确认无依赖。

⚠️ **单条添加 SKU 不会自动出号**：添加弹窗占位符写「留空将自动生成」，但单条保存走 catch-all，后端不补编码，空 `sku_code` 会被原样写入。请手填编码，或改用「批量生成」。

⚠️ **编码规则页真实 bug**：编辑规则时 `CodingRulesPage.tsx:85` 把 `rule.prefix` 误写为 `rule.refix`，导致编辑已有规则时前缀被清空；且前端预览与后端预览的表达式字段（`rule_template` vs `rule.expression`）未对齐，界面无法配置表达式式编码。以上均如实记录，源码勿改。

## 小结与练习

本文你掌握了：产品档案 9 个子页的界面、操作流程、底层表、源码与原理；SKU 由「款色 + 尺码」组合、货号由编码规则自动生成的源码逻辑（`standalone.ts:4202-4258`）；9 张表在 `ALLOWED` 注册、走 `/api/:table` 路由；子页需走 URL 或页内卡片。回顾要点：款号+颜色=款色，款色+尺码=SKU；编码规则可配置但存在前端 `refix` bug；产品档案删除均为物理删除。

小练习（逐个子页可操作）：

1. **门户**：登录后访问 `http://localhost:3000/product`，查看 6 张统计卡片，点「配置编码规则」进入编码页。
2. **编码规则**：进 `/product/coding-rules`，新建 `target_type=sku` 规则，前缀 `SH`、序号位数 4，保存后点「预览」观察示例货号（注意：真实出号格式为 `SH`+款号+尺码名+4位序号）。
3. **颜色库**：进 `/product/colors`，加一个颜色（填潘通色号与 hex）。
4. **尺码管理**：进 `/product/sizes`，建一个尺码组并挂两个尺码。
5. **品类管理**：进 `/product/categories`，建「鞋类」顶级品类，再建「跑鞋」作为其子品类。
6. **款号管理**：进 `/product/styles`，建一个款号并绑定第 4 步的尺码组。
7. **款色管理**：进 `/product/style-colors`，为第 6 步款号加一个款色，上传一张图片。
8. **SKU 管理**：进 `/product/skus`，点「批量生成」，选刚建的款号、款色、尺码组，生成后核对 SKU 编码是否符合第 2 步规则。
9. **配码规则**：进 `/product/size-ratios`，选款号+尺码组，填各尺码配比，保存后看「10 箱」预览。
10. **思考**：若只建尺码散表而不建尺码组，会对「配码规则」和后续生产排产产生什么影响？

> **系列导航**：[上一篇：22-员工自助](./22-员工自助门户.md) ｜ [下一篇：24-PLM工艺管理](./24-PLM工艺管理-物料BOM工艺路线.md) ｜ [大纲](../教程系列写作大纲V2.md)
