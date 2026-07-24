# 17-绩效管理-KPI周期记录等级

本教程基于 **Sowork AI 企业智能ERP系统**（版本 v1.2.0，以下简称"本系统"）的真实源码撰写。你将跟随代码逐层理解 KPI 指标库、考核周期、绩效记录、评分等级矩阵四大子模块如何数据互通。实验环境用 admin / admin123 登录，服务默认端口 3000，首次部署请执行 `npm install --legacy-peer-deps`。

## 学习目标

学完本节，你将能够：

- 说出本系统绩效模块的 4 张核心数据表，以及它们为什么共用同一套接口。
- 在界面上完成"建 KPI → 开周期 → 录打分 → 定等级"的完整链路。
- 读懂前端如何把多条 KPI 加权算成总分，再按阈值映射成 S/A/B/C/D。
- 向管理者解释：绩效数据是怎样成为薪酬、晋升量化依据的。

## 核心概念

绩效模块由四个彼此关联的实体构成，它们像一根链条：

```
KPI 指标库 (kpis)
   │  定义"考什么、占多少权重"
   ▼
考核周期 (performance_cycles)
   │  定义"什么时候考、考哪一段"
   ▼
绩效记录 (performance_records)
   │  针对某员工+某周期，逐条 KPI 打分
   ▼
评分等级矩阵 (performance_grades)
      把总分映射到 S/A/B/C/D，并带奖金倍数
```

🔑 一句话记忆：KPI 决定"维度"，周期决定"时机"，记录决定"得分"，等级矩阵决定"结果怎么用"。

四张表在 `server/standalone.ts:1079` 被统一注册进 `ALLOWED` 白名单：

```ts
// 绩效模块
'kpis','performance_cycles','performance_records','performance_grades',
```

## 界面布局与操作流程

侧边栏的绩效子树在 `client/src/components/Layout.tsx` 第 84–90 行定义：

```ts
'/performance': [
  { label: '绩效首页',   to: '/performance' },
  { label: 'KPI管理',    to: '/performance/kpi' },
  { label: '周期管理',   to: '/performance/cycle' },
  { label: '绩效记录',   to: '/performance/record' },
  { label: '评分等级',   to: '/performance/grade' },
],
```

对应路由在 `app.tsx:234-238` 一一挂载：`PerformancePage`（首页，带 Tab 的总览）与四个独立子页 `KPIPage / CyclePage / RecordPage / GradePage`。注意本系统**没有 `/api/hr` 这种按域前缀的接口**——所有增删改查都走 catch-all 的 `/api/:table`。

标准操作流程如下：

1. 进 **KPI管理** 建指标，填写名称、分类、权重、目标值、评分方式。
2. 进 **周期管理** 开一个"季度/年度"周期，设起止日期并"启动"。
3. 进 **绩效记录** 选员工+周期，录入自评/主管评/HR 评分，系统算总分并落等级。
4. 进 **评分等级** 维护等级矩阵（分数段→等级→奖金倍数），供薪酬调用。

## 底层逻辑与数据模型

四张表通过字段而非接口耦合：

| 表名 | 关键字段 | 作用 |
|------|----------|------|
| `kpis` | id, name, category, weight, target, scoringMethod, isActive | 指标库，weight 为权重百分比 |
| `performance_cycles` | id, name, cycleType(monthly/quarterly/yearly), startDate, endDate, status | 考核周期，status 控制启停 |
| `performance_records` | id, employeeId, cycleId, selfScore, managerScore, hrScore, totalScore, grade, status | 员工在某周期的打分结果 |
| `performance_grades` | id, level(S/A/B/C/D), scoreMin, scoreMax, bonusMultiplier, color | 分数→等级→奖金的映射矩阵 |

数据如何流动？记录表用 `cycleId` 关联周期、用 `employeeId` 关联员工；等级表不存外键，而是用 `scoreMin/scoreMax` 区间去"套"记录里的 `totalScore`。这种"区间匹配"正是等级矩阵的核心逻辑。

后端在 `standalone.ts:4065` 的 catch-all 里做白名单与字段校验：

```ts
if (!ALLOWED.includes(table)) { res.json({ error: 'Invalid table' }); return; }
// POST 时只用表里真实存在的列，并补时间戳
const tableInfo = db.query(`PRAGMA table_info("${table}")`);
const cols = tableInfo.map((c: any) => c.name);
data = Object.fromEntries(Object.entries(data).filter(([k]) => cols.includes(k)));
```

## 源码剖析

**1) 等级阈值的两种实现。** 首页 `PerformancePage` 把加权总分直接硬映射等级（`PerformancePage.tsx:254-259`）：

```ts
const totalScore = kpiScores.reduce((s, ks) => s + Math.round(ks.score * ks.weight / 100), 0);
let level = 'D';
if (totalScore >= 95) level = 'S';
else if (totalScore >= 85) level = 'A';
else if (totalScore >= 75) level = 'B';
else if (totalScore >= 60) level = 'C';
```

而"评分等级"子页维护的是可配置矩阵：表 `performance_grades` 含 `scoreMin / scoreMax / bonusMultiplier`（`GradePage.tsx:40-48` 统计了这几个字段）。前者是快速演示用的硬编码，后者才是生产环境应依赖的"单一真相源"。

**2) 绩效记录的写入。** `RecordPage.tsx:84-94` 的提交逻辑：

```ts
const body = editing
  ? { ...editing, ...values }
  : { id: `pr_${Date.now()}`, ...values, status: 'draft', createdAt: new Date().toISOString() };
await fetch(`/api/${TABLE}${editing ? '/' + editing.id : ''}`, { method, ... });
```

其中 `TABLE = 'performance_records'`（`RecordPage.tsx:11`），与后端 `ALLOWED` 完全一致，写入链路是通的。

**3) 一个需要你注意的真实不一致。** 首页 `PerformancePage` 的"新建考核"按钮提交到 `/api/performances`（复数，见 `PerformancePage.tsx:274`），但白名单里注册的表名是 `performance_records`（单数）。按 `standalone.ts:4097` 的校验，这条 POST 会返回 `{ error: 'Invalid table' }`。也就是说：用独立子页 `RecordPage` 录入记录是正常工作的，而首页 Tab 里的"新建考核"弹窗可能写不进库。🚀 这是源码层面值得你留意的点——生产使用请以 `/performance/record` 子页为准。

**4) 安全表。** `performance_grades` 与 `kpis` 被列入 `standalone.ts:6316` 的 `safeTables`，数据库初始化时会被保留而非清空，因为它们属于"配置型"基础数据。

## 原理剖析

为什么四张表能共用 `/api/:table`？因为本系统采用"表即资源"的通用 CRUD 设计：前端每个页面只换 `const TABLE = 'xxx'`，其余列表/增/删/改逻辑几乎逐字相同（对比 `KPIPage.tsx:11` 与 `CyclePage.tsx:11`）。后端用 `:table` 占位符 + `ALLOWED` 白名单，既减少重复路由，又防止越权访问任意表。

等级矩阵的"区间匹配"本质是：总分是一个实数，等级矩阵把它切分成左闭右开的区间段。配置得当，区间应**首尾相接、互不重叠**——这正是管理者视角里"标准要先对齐"的底层原因。奖金倍数（`bonusMultiplier`）则把等级结果直接接到薪酬模块，形成"绩效→薪酬"的数据桥。

## 管理者视角

✅ 绩效体系的价值，不在于"打了分"，而在于它把主观评价变成了可比较的数字。KPI 的 `weight` 让不同岗位的贡献可以加权对齐；周期让考核有规律节奏（季度看过程、年度看总结）；等级矩阵里的 `bonusMultiplier` 让你无需二次换算，直接把 S/A/B/C/D 对接奖金与调薪。

给管理者的三条建议：

- 让 KPI 权重之和保持 100%，避免分数失真（系统在 KPI 页会校验并提示）。
- 等级矩阵在考核**启动前**就与团队对齐，考核中途改矩阵会引发公平性质疑。
- 周期关闭后，记录应进入冻结态，把它当作"已确认事实"去对接晋升与薪酬，而非可随意修改的草稿。

## 注意事项

⚠️ **周期关闭即冻结**：`CyclePage` 提供"完成"操作把周期置为 `completed`。一旦关闭，相关记录原则上不应再改动；若前端未做硬拦截，请在流程上约定"已确认记录只读"。

🔑 **等级矩阵要事先对齐**：`performance_grades` 的 `scoreMin/scoreMax` 区间必须在考核前设计好并全员公示，避免事后调阈值造成的信任危机。

✅ **KPI 可复用**：同一套 `kpis` 指标库可横跨多个周期、多个部门反复引用，不要在每次考核时新建重复指标，否则历史数据无法横向对比。

⚠️ **两套入口的差异**：如前"源码剖析"所述，首页 Tab 的"新建考核"与独立 `RecordPage` 走的是不同接口路径，正式录入请以 `/performance/record` 子页为准，避免数据丢失。

## 小结与练习

你已掌握：四张表如何经 `ALLOWED`（standalone.ts:1079）进入通用 CRUD；KPI 加权算总分、再经阈值/矩阵落到 S/A/B/C/D；周期用 `status` 管控考核生命周期；等级表的 `bonusMultiplier` 是绩效联动薪酬的枢纽。

动手练习：

1. 在 KPI 管理新建 3 个指标，权重分别为 40/30/30，验证系统是否提示"权重和为 100%"。
2. 开一个 `quarterly` 周期并启动，到绩效记录页为某员工录入三条 KPI 分数，观察 `totalScore` 与等级生成。
3. 在评分等级页把 S 级的 `bonusMultiplier` 设为 1.5，思考它未来如何进入工资表计算。
4. 用浏览器开发者工具（F12 → Network）观察你的一次"保存"请求，确认它命中的是 `/api/performance_records` 而非 `/api/performances`。

> **系列导航**：[上一篇：16-薪酬管理](./16-薪酬管理-工资表配置公式社保.md) ｜ [下一篇：18-招聘管理](./18-招聘管理-职位简历候选人Offer.md) ｜ [大纲](../教程系列写作大纲V2.md)
