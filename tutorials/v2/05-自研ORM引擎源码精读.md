# 05 - 自研 ORM 引擎源码精读

> 产品：Sowork AI 企业智能ERP系统（v1.2.0）。账号 admin/admin123，服务端口 3000，依赖安装需 `npm install --legacy-peer-deps`。业务路由走 catch-all `/api/:table`（无 `/api/hr` 这类按域前缀的路由）。

## 学习目标

- 读懂 Sowork AI 企业智能ERP系统 v1.2.0 自研 ORM 四件套：`Environment`、`ModelRegistry`、`ModelClass`、`Recordset`。
- 掌握「模型即表结构 → 注册 → 自动建表 → 增删改查」的完整调用链。
- 理解 `Recordset` 的 Proxy 脏写追踪机制，避开「改了不生效」的陷阱。
- 从管理者视角看懂什么叫「模型即表」，以及它如何让业务加字段不再依赖 DBA。

## 核心概念

| 概念 | 源码位置 | 一句话解释 |
| --- | --- | --- |
| `Environment` | `environment.ts` | 每个请求一个 ORM 上下文，持有 db 连接、registry、当前用户 uid |
| `ModelRegistry` | `model-registry.ts` | 模型注册表，负责加载模型文件、清缓存、自动建表、处理继承 |
| `ModelClass` | `model-class.ts` | 模型即表结构定义（字段、约束、方法、钩子），对应 Odoo 的 BaseModel 概念 |
| `Recordset` | `recordset.ts` | 查询结果集，承载 `search/create/write/unlink` 与关联、公式、脏写追踪 |

核心设计只有一句话：**模型即表结构**（字段定义直接编译为建表 DDL）；**Recordset 即查询结果集**（用 Proxy 实现脏写追踪，延迟落库）。

## 界面布局与操作流程

开发者视角下，你改的是 `models/xxx.ts` 文件，而不是点某个界面按钮。一次典型的字段新增与生效流程如下：

1. 启动服务端（端口 3000），用 `admin/admin123` 登录后台。
2. 在模块的 `models/` 目录下新增或修改模型文件——你定义了哪些字段，系统就自动建出哪些列。
3. 前端或第三方系统集成通过 catch-all 路由 `/api/:table` 发起 CRUD。注意本系统**没有** `/api/hr` 这类按业务域前缀的路由，全部走 `/api/:table`。
4. 依赖安装必须 `npm install --legacy-peer-deps`，否则 peer 依赖冲突会导致 ORM 模块加载失败、建表中断。

开发者工作区结构：

```
your_module/
├── models/
│   └── partner.ts      ← 你日常只改这里
└── ...
/api/:table             ← 业务统一入口（非 /api/hr 域前缀）
```

## 底层逻辑与数据模型

数据模型由三要素构成：

- `ModelDef._fields`：字段字典，每个字段含 `type / label / required / default / formula`。
- `ModelClass`：把 `ModelDef` 固化为运行期模型类，持有字段、SQL 约束、方法与钩子。
- `Recordset._data` 与 `_dirty`：已加载行数据、待提交脏数据，两张 Map 均以 `id` 为键。

字段类型到 SQL 的映射（节选自 `_fieldToDDL`，`model-class.ts:195`）：

```
char/text/date/datetime/selection/binary → TEXT
integer/boolean                          → INTEGER（boolean 默认 0）
float/monetary                          → REAL
many2one/one2many/many2many             → TEXT
```

## 源码剖析

下面逐段精读 `recordset.ts` 这一旗舰文件。

🔑 **search 的 where 拼装**（`recordset.ts:41-77`）

从 `filter` 对象逐项生成 SQL 子句，初始压入 `['1=1']` 以保证无条件下也能安全拼接。`$like / $gt / $lt / $in` 被转成对应运算符，布尔值规整为 1/0。最终在 `recordset.ts:69` 用 `cr.prepare(...).all(...params)` 执行，结果回填到新 `Recordset` 的 `_data`。

✅ **create 的字段过滤**（`recordset.ts:143-179`）

先跑 `beforeCreate` 钩子与 `_validate`；生成 nanoid 主键，注入 `created_at/updated_at`；`recordset.ts:156-165` 把 `many2one` 对象压成其 `id`、把 `boolean` 规整为 1/0；随后 `_evalFormulas` 计算金额等公式；最后在 `recordset.ts:170` 拼出 `INSERT` 语句落库，再触发 `afterCreate` 钩子。

⚠️ **write 的 Proxy set 陷阱**（`recordset.ts:181-227` 与 `401-431`）

直接对 Proxy 记录赋值**不会立刻落库**——`recordset.ts:416-429` 的 set 陷阱只把改动写入 `_dirty` Map。必须调用 `flush()`（`recordset.ts:434-439`）才会触发 `write(dirty)` 真正执行 `UPDATE`（`recordset.ts:217-219`）。漏掉 `flush()` 是最常见的「改了不生效」Bug。

🔗 **关联 many2one 处理**（`recordset.ts:244-257`）

`resolve()` 读取本行外键值，按字段 `relation` 找到目标模型再 `browse`；`createRecordProxy` 的 get 陷阱（`recordset.ts:408-415`）让 `rec.country_id` 直接返回关联对象，而非裸 id——这正是「模型即表」之上还能表达关系的关键。

## 原理剖析

自研 ORM 相对 TypeORM / Prisma 的取舍：

- **轻量**：无装饰器编译、无独立 migration 工程，一个 `ModelDef` 即是全部真相。
- **贴合 Odoo 模型风格**：`env['res.partner'].search(...)` 链式调用，熟悉 Odoo 的团队零成本上手。
- **便于低代码热部署**：`loadFromModule` 在加载前清除 require 缓存（`model-registry.ts:62`），改模型文件后重载即可，无需重建迁移。

代价是牺牲了强类型与复杂迁移能力——但这恰好契合 ERP 这类字段频繁增删、强调业务响应速度的场景。

## 管理者视角

什么叫「模型即表」？在 Sowork AI 企业智能ERP系统中，**一张业务表 = 一段字段定义**。业务人员想给「客户」加一个「信用额度」字段，开发者只需在 `models/partner.ts` 增加一个字段对象，重启（或热重载）后数据库自动 `ALTER ADD COLUMN`，前台表单随即出现该列。🚀 这意味着加字段不必排队等 DBA 写 DDL，需求响应周期从「天」缩短到「分钟」。

对管理者的直接含义：IT 与业务的沟通成本下降，数据结构的演进权部分交还给业务迭代节奏。

## 注意事项

⚠️ `_inherit` 扩展模型走 `ALTER TABLE ADD COLUMN`（`model-class.ts:189`），旧表自动加列；但**删字段不会自动回收**，需手动清理，避免表结构无限膨胀。

🔑 模型改动（增删字段、改约束）需重启服务或触发热重载；仅改业务逻辑方法可即时生效。

✅ 字段定义即文档——`_fields` 里的 `label / type / required` 就是活的数据字典，可直接生成接口说明，无需另写 wiki。

## 小结与练习

你已读通自研 ORM 四件套，并理解了 `Recordset` 的脏写机制。调用链回顾：

```
models/partner.ts (exports.models)
        │  require() 清缓存（model-registry.ts:62）
        ▼
ModelRegistry.loadFromModule() ──► register(def)
        │                              │
        ▼                              ▼
ModelClass(def)                  _ensureTable()
        │                           CREATE TABLE IF NOT EXISTS
        ▼                                ▼
Environment.get() ─────► Recordset ─────► SQL (better-sqlite3)
                                          │
                                  /api/:table 返回 JSON
```

练习：

1. 在 `models/` 新建 `project.ts`，定义 `name(char)`、`budget(float)`、`state(selection)`，观察自动建出的表结构。
2. 用 `env['project'].create({...})` 插入一条，再用 Proxy 赋值改 `budget` 并调用 `flush()`，确认落库。
3. 故意漏掉 `flush()`，验证「改了不生效」，亲手体会 Proxy 脏写陷阱。

> **系列导航**：[上一篇：04-数据库层](./04-数据库层-驱动抽象与自动建表迁移.md) ｜ [下一篇：06-后端引擎](./06-后端引擎-中间件路由与登录安全.md) ｜ [大纲](../教程系列写作大纲V2.md)
