# 第 06 章 · 自研 ORM 引擎源码精读

> Sowork AI 企业智能ERP系统 · 代码级技术教程
> 源码锚点：`server/modules/orm/recordset.ts`（440 行）、`environment.ts`（74 行）、`model-class.ts`（210 行）

---

## 学习目标

- 读懂 Sowork AI 自研 ORM 的三大核心类：`Environment` / `Recordset` / `ModelRegistry`
- 从源码层面理解 `search / create / write / unlink` 的 SQL 生成逻辑
- 掌握公式字段 `formula` 的"字符串替换 + Function 求值"实现与其安全边界
- 理解 `many2one` 关联解析与 `one2many` 反向查询的源码路径
- 看懂 `Proxy` 如何实现 `record.name = 'x'` 的脏写收集与 `flush`

---

## 核心概念：为什么要自研 ORM

Sowork AI 没有直接用 Prisma / TypeORM，而是自研了一套 **Odoo 风格** 的轻量 ORM。原因有三：

1. **零 codegen**：模型用纯 JS 对象声明（`_fields`），启动即自动建表，改字段不需要重新生成 client——这是低代码平台"配置即数据库"的地基。
2. **链式记录集（Recordset）**：`env.demo_contact.search().sorted('credit', true).mapped('name')` 这种 Odoo 式表达力，Prisma 给不了。
3. **可控**：全部实现只有 ~1100 行 TS，出问题能一路读到底，适合企业私有化后自行维护。

调用入口非常"Odoo"：

```
env['res.partner'].search({ is_company: true }).mapped('name')
      │              │                              │
   Environment    Recordset                     工具方法
```

---

## 源码剖析一：Environment —— 每请求一个上下文

`environment.ts` 的职责是"把数据库连接、用户上下文、模型注册表打包"，并用 `Proxy` 让 `env.表名` 惰性返回 Recordset。

```ts
// server/modules/orm/environment.ts:35-54
constructor(cr: any, registry: ModelRegistry, context: EnvContext = {}) {
  this.cr = cr;                 // 🔑 原始数据库连接（better-sqlite3 实例）
  this.registry = registry;     // 模型注册表
  this.uid = context.uid || 0;  // 当前用户ID（权限/审计用）
  this.context = { ...context, uid: this.uid };
}

get(modelName: string): Recordset {
  const key = modelName.replace(/\./g, '_');   // 支持 res.partner → res_partner
  if (!this._cache.has(key)) {
    const modelClass = this.registry.get(key);
    if (!modelClass) throw new Error(`模型不存在: ${key}`);
    this._cache.set(key, new Recordset(this, key, modelClass));  // 惰性创建
  }
  return this._cache.get(key)!;
}
```

**逐段理解**
- `cr`（cursor 的缩写，同样是 Odoo 术语）保存的是**原始** better-sqlite3 连接，Recordset 里所有 `this.env.cr.prepare(...)` 都走它。
- `get()` 做了两件事：① 把 `.` 归一成 `_`（`res.partner` 与 `res_partner` 都能访问）；② **惰性 + 缓存**——同一请求内多次访问同一模型只建一次 Recordset。

而 `env.demo_contact` 这种"属性式访问"靠的是 `createProxy`：

```ts
// server/modules/orm/environment.ts:60-70
static createProxy(env: Environment): Environment & Record<string, Recordset> {
  return new Proxy(env, {
    get(target, prop: string) {
      if (prop in target) return (target as any)[prop];   // 真实方法/属性优先
      if (typeof prop === 'string' && !prop.startsWith('_')) {
        try { return target.get(prop); } catch { return undefined; }  // 否则当模型名
      }
      return undefined;
    },
  }) as any;
}
```

> 🔑 记住这个设计：`env.foo` 只要 `foo` 不是 Environment 自身属性、不以 `_` 开头，就会被当成模型名去 `get()`。这就是为什么你能直接写 `env.demo_contact`。

---

## 源码剖析二：search —— 过滤器如何变成 SQL

`Recordset.search()` 是最常用的方法。它把一个 JS 过滤对象翻译成参数化 SQL：

```ts
// server/modules/orm/recordset.ts:41-77
search(filter = {}, options?): Recordset {
  const params: any[] = [];
  const clauses: string[] = ['1=1'];               // 🔑 恒真起点，省去"是否第一个条件"的判断
  for (const [key, val] of Object.entries(filter)) {
    if (val === undefined || val === null) continue;
    const col = key.replace(/\./g, '_');
    if (typeof val === 'object' && val.$like) {
      clauses.push(`${col} LIKE ?`); params.push(`%${val.$like}%`);
    } else if (typeof val === 'object' && val.$gt !== undefined) {
      clauses.push(`${col} > ?`); params.push(val.$gt);
    } else if (typeof val === 'object' && val.$in) {
      clauses.push(`${col} IN (${val.$in.map(() => '?').join(',')})`);
      params.push(...val.$in);
    } else {
      clauses.push(`${col} = ?`);
      params.push(val === true ? 1 : val === false ? 0 : val);   // 布尔→0/1
    }
  }
  const where = clauses.join(' AND ');
  const rows = this.env.cr.prepare(
    `SELECT * FROM "${this._name}" WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`
  ).all(...params);
  // …把 rows 装进新的 Recordset 返回
}
```

**关键点讲解**
- **参数化查询防注入**：所有值都用 `?` 占位 + `params` 数组传入，`val` 永远不拼进 SQL 字符串。这是 `better-sqlite3` 的 prepared statement，天然防 SQL 注入。
- **`1=1` 技巧**：初始就放一个恒真条件，后面所有 `AND xxx` 无需判断"我是不是第一个"，代码更短。
- **操作符对象**：`{ $like, $gt, $lt, $in }` 让你写 `search({ name: { $like: '北京' }, credit: { $gt: 1000 } })`——迷你版的查询 DSL。
- **布尔归一**：SQLite 无原生 boolean，`true/false` 在写入和查询时都转成 `1/0`（贯穿 create/write）。

> ⚠️ 注意 `col = key.replace(/\./g, '_')`：列名只做了点转下划线，**没有**做白名单校验。这在内部可信调用没问题，但如果你把外部输入的 key 直接透传进 `search`，需自行加字段白名单，避免 `ORDER BY` 之类被利用（`order` 也是直接拼接的）。

---

## 源码剖析三：create —— 钩子、校验、公式一条龙

`create()` 把"业务规则"内聚在了 ORM 层，一次写入要经过 5 道工序：

```ts
// server/modules/orm/recordset.ts:143-179
create(values): Recordset {
  // ① 钩子 beforeCreate
  if (this._hooks.beforeCreate) for (const fn of this._hooks.beforeCreate) fn(values, this.env);
  // ② 校验（required / type / selection）
  const errors = this._validate(values);
  if (Object.keys(errors).length > 0) throw new Error(`校验失败: ${Object.values(errors).join('; ')}`);
  // ③ 生成主键 + 时间戳
  const id = values.id || nanoid(16);
  const now = new Date().toISOString();
  const processed = { id, created_at: now, updated_at: now };
  for (const [k, v] of Object.entries(values)) {
    const field = this._fieldDefs[k];
    if (field?.type === 'many2one') processed[k] = (typeof v === 'object' && v.id) ? v.id : v;  // 关联存ID
    else if (field?.type === 'boolean') processed[k] = (v===true||v===1||v==='1') ? 1 : 0;
    else processed[k] = v;
  }
  // ④ 公式计算
  this._evalFormulas(processed);
  // ⑤ 参数化 INSERT
  const cols = Object.keys(processed);
  this.env.cr.prepare(
    `INSERT INTO "${this._name}" (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`
  ).run(...cols.map(c => processed[c]));
  // 钩子 afterCreate
  if (this._hooks.afterCreate) for (const fn of this._hooks.afterCreate) fn(id, processed, this.env);
  // 返回单条记录的 Recordset
}
```

**为什么这样设计**
- **主键用 `nanoid(16)` 而非自增**：分布式友好、不暴露记录规模、迁移/合并库不冲突。
- **`many2one` 存 ID**：即使你传进来的是一个对象（`{id, name, …}`），也只落库 `id`，保证外键干净。
- **钩子把业务规则留在模型层**：例如"信用额度不能为负"写在 `beforeWrite` 里（见下文），业务代码无需重复校验。

校验实现同样值得一读：

```ts
// server/modules/orm/recordset.ts:359-379
private _validate(values): Record<string, string> {
  const errors = {};
  for (const [name, field] of Object.entries(this._fieldDefs)) {
    const val = values[name];
    if (field.required && (val===undefined||val===null||val==='')) { errors[name] = `${field.label||name} 是必填项`; continue; }
    if (val === undefined || val === null) continue;
    if (field.type === 'integer' && isNaN(Number(val))) errors[name] = `${field.label||name} 需要整数`;
    if (field.type === 'selection' && field.selection) {
      const allowed = field.selection.map(s => s.value);
      if (!allowed.includes(String(val))) errors[name] = `${field.label||name} 值无效: ${val}`;
    }
  }
  return errors;
}
```

> `selection` 字段的取值必须落在声明的选项里，否则报错——这把"下拉框只能选给定值"从前端约束下沉到了数据层。

---

## 源码剖析四：公式字段 formula 的实现与边界

公式是这套 ORM 最"炫"也最需要警惕的功能。`total: { type:'formula', formula:'qty * price' }` 是怎么算出来的？

```ts
// server/modules/orm/recordset.ts:342-357
private _evalFormulas(record): void {
  for (const [name, field] of Object.entries(this._fieldDefs)) {
    if (!field.formula) continue;
    let expr = field.formula as string;               // 'qty * price'
    for (const [k, v] of Object.entries(record)) {    // 把变量名替换成实际值
      if (typeof v === 'number' || typeof v === 'string') {
        expr = expr.replace(new RegExp('\\b' + k + '\\b', 'g'), String(v));  // qty→10, price→50
      }
    }
    const fn = new Function('"use strict"; return (' + expr + ')');  // 🔑 动态求值 "10 * 50"
    record[name] = Number(fn()) || 0;                 // → 500
  }
}
```

**逐段理解**
- 先把公式串里的字段名（用 `\b` 单词边界）替换成当前记录的值，`'qty * price'` → `'10 * 50'`。
- 再用 `new Function` 动态执行这段表达式求值，结果写回 `record[name]`。

> ⚠️ **安全边界（务必知道）**：`new Function` 会执行任意 JS。因为 `formula` 来自**模型定义**（开发者/低代码管理员编写），不是终端用户输入，所以在当前信任模型下是安全的。**但如果你计划让不可信用户自定义公式，必须换成表达式白名单解析器**（如仅允许 `+ - * / ( ) 数字 字段名`），否则等于开了后门。这是二次开发时最容易忽视的风险点。
- 另一个边界：替换用的是简单正则，若字段名互相包含（如 `price` 和 `price2`），`\b` 边界能挡住大部分，但复杂命名仍建议避免子串关系。

write 时公式的处理更巧妙——先合并"库里旧值 + 本次改动"成完整记录再算，避免只改一个字段导致公式拿不到其它字段：

```ts
// server/modules/orm/recordset.ts:205-212
const fullRecord = {};
if (this._ids.length === 1) { this._ensureLoaded(); Object.assign(fullRecord, this._data.get(this._ids[0])); }
Object.assign(fullRecord, processed);      // 旧值打底 + 新值覆盖
this._evalFormulas(fullRecord);
for (const [k, v] of Object.entries(fullRecord)) {
  if (this._fieldDefs[k]?.formula) processed[k] = v;   // 只把公式结果写回
}
```

---

## 源码剖析五：关联与 Proxy 脏写

**many2one 解析**（`resolve`）：读出外键 ID，再去关联模型 `browse`：

```ts
// server/modules/orm/recordset.ts:244-257
resolve(fieldName: string): Recordset | null {
  const row = this._data.get(this._ids[0]);
  const foreignId = row[fieldName];
  const fieldDef = this._fieldDefs[fieldName];
  if (fieldDef.type !== 'many2one') return null;
  const relModel = fieldDef.relation || fieldName.replace(/_id$/, '');  // city_id → city
  return this.env[relModel].browse(foreignId);
}
```

**Proxy 脏写**是点睛之笔——让你像操作普通对象一样 `record.name = 'x'`，改动被暂存，`flush()` 时才落库：

```ts
// server/modules/orm/recordset.ts:407-431
return new Proxy(row, {
  get(target, prop) {
    if (prop in target) return target[prop];
    const fieldDef = recordset._fieldDefs[prop];
    if (fieldDef?.type === 'many2one') return recordset.resolve(prop);  // 读关联自动解析
    return undefined;
  },
  set(target, prop, value) {
    if (!recordset._dirty.has(id)) recordset._dirty.set(id, {});
    const dirty = recordset._dirty.get(id)!;
    dirty[prop] = /* 按类型归一 */ value;    // 🔑 改动进"脏"表，不立即写库
    target[prop] = dirty[prop];
    return true;
  },
});
```

配合 `flush()`：

```ts
// server/modules/orm/recordset.ts:434-439
flush(): boolean {
  const dirty = this._dirty.get(this._ids[0]);
  if (!dirty) return true;
  return this.write(dirty);   // 一次性把脏字段 UPDATE
}
```

> 这就是 Odoo `record.write()` 的 JS 版实现：读写像操作对象，落库集中在 flush，减少 SQL 次数。

---

## 实战代码：从零建一个"信用额度"模型

```js
// addons/demo_erp/models/demo_contact.js
exports.model = {
  _name: 'demo_contact',
  _description: '联系人',
  _fields: {
    name:    { type: 'char',  label: '姓名', required: true },
    city_id: { type: 'many2one', label: '城市', relation: 'demo_city' },
    qty:     { type: 'integer', label: '数量', default: 0 },
    price:   { type: 'float', label: '单价', default: 0 },
    total:   { type: 'formula', label: '金额', formula: 'qty * price' },  // 自动算
  },
  _hooks: {
    beforeWrite: [(id, vals, env) => { if (vals.price < 0) throw new Error('单价不能为负'); }],
  },
};
```

```js
const env = global.__feida_env;
const r = env.demo_contact.create({ name: '北京分公司', qty: 10, price: 50 });
// total 自动 = 500，created_at/updated_at 自动填

env.demo_contact.search({ price: { $gt: 30 } }).sorted('total', true).mapped('name');
// → 按金额倒序的姓名列表
```

---

## 运行演示

```bash
# 1. 放好模型文件后重启，ModelRegistry 自动建表
SERVER_PORT=3400 npm start
# 控制台可见：[Registry] 加载 demo_contact ... 建表 demo_contact

# 2. 通用 CRUD 路由直接可用（白名单内）
curl "http://localhost:3400/api/demo_contact?price_gt=30"

# 3. 校验生效（缺 name 会 400）
curl -X POST http://localhost:3400/api/demo_contact -H "Content-Type: application/json" -d '{"qty":5,"price":20}'
# → 校验失败: 姓名 是必填项
```

---

## 管理者视角

- **业务价值**：这套 ORM 让"新增一个业务对象（客户/合同/工单）"从"改数据库 + 写接口 + 写校验"压缩成"填一张字段表"。**新模块上线周期从人天级降到小时级**，直接对应低代码平台的降本能力。
- **成本**：自研意味着团队要能维护这 ~1100 行代码；但换来的是**不被商业 ORM 绑定、可私有化审计**，对数据合规敏感的企业是净收益。
- **风险**：`formula` 的动态求值若开放给终端用户是安全隐患（见上文 ⚠️）；选型/验收时应确认公式来源仅限管理员。

---

## 注意事项

- ⚠️ **`formula` 用 `new Function` 求值**：仅对可信的模型定义安全；勿让终端用户自定义公式。
- ⚠️ **`search` 的 `order` 参数是字符串拼接**：不要把外部输入直接当排序字段，需白名单。
- ⚠️ **`many2one` 落库只存 ID**：传对象也只取 `.id`，读时用 `resolve`/Proxy 自动解析。
- 🔑 **主键是 `nanoid(16)` 文本**：不是自增整数，跨库合并不冲突。
- 🔑 **布尔值全程 0/1**：SQLite 无 boolean，create/write/search 均自动归一。

---

## 练习

1. 阅读 `recordset.ts:303-325` 的 `filtered` 与 `sorted`，说出它们和 `search` 的区别（提示：内存 vs SQL）。
2. 给 `demo_contact` 加一个 `selection` 字段 `level`（普通/VIP），故意写入非法值，观察 `_validate` 的报错。
3. 写一个 `afterCreate` 钩子，在创建联系人时自动在日志表插一条记录，跑通后截图。
4. 挑战：把 `_evalFormulas` 改造成"仅允许四则运算 + 字段名"的安全白名单解析器（提示：不再用 `new Function`）。

---

> **系列导航**：上一章 ← [第 05 章 · 后端引擎与登录安全](./05-后端引擎与登录安全.md) ｜ 下一章 → [第 07 章 · 前端架构：路由、权限渲染与防白屏](./07-前端架构-路由权限渲染与防白屏.md)
