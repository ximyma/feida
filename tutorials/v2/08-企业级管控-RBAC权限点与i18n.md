# 08 · 企业级管控：RBAC 权限点与 i18n 多语言

> 本篇基于 **Sowork AI 企业智能ERP系统** v1.2.0 的真实服务端代码（`server/standalone.ts`）展开，带你从界面到源码，吃透「细粒度权限」与「多语言」两大企业级管控能力。

## 学习目标

读完本文，你将能够：

- 说清三层 RBAC（权限点 → 角色 → 用户）的映射关系。
- 理解「站点级 scope」为什么需要强制回填内置角色。
- 看懂后端双字典 i18n 的实现，并能扩展英文词条。
- 站在管理者视角，设计「财务部只看财务、HR 只看人事」的隔离方案。

## 核心概念

**RBAC（基于角色的访问控制）** 在本系统中分三层：

```
权限点 permission point   —— 最小授权单元，如 cms:article:delete
        ↓ 聚合
角色 role                —— 一组权限点 + 站点 scope，如 hr_admin
        ↓ 绑定
用户 user               —— 一名员工可绑定多个角色，权限取并集
```

**权限点** 形如 `module:resource:action`，例如 `cms:article:delete` 表示「内容管理模块 / 文章 / 删除」。

**站点 scope** 是权限的横向作用域。一个角色除了「能做什么」，还要被限定「在哪些站点生效」。`*` 代表全部站点（超集）。

**i18n** 采用「以中文为 key」的双字典策略：后端 `I18N_EN` 负责接口语义词条，前端 `EN_DICT` 负责 UI 文案，二者都以中文原文作为查找键，未命中英文时直接回退显示中文。

## 界面布局与操作流程

在 Sowork AI 企业智能ERP系统中，管控配置集中在「系统管理」模块：

| 菜单 | 能力 | 对应接口 |
|------|------|----------|
| 权限管理 | 查看权限点目录 | `GET /api/rbac/permissions` |
| 角色管理 | 增删改角色与 siteScope | `GET/POST/PUT/DELETE /api/rbac/roles` |
| 站点范围 | 查看可用站点码 | `GET /api/rbac/sites` |
| 语言切换 | 拉取翻译字典 | `GET /api/i18n/messages?lang=en` |

操作流程典型路径：系统管理员先确定需要哪几个站点（main/shop/portal）→ 创建自定义角色并勾选权限点 + 站点范围 → 把角色绑定到具体用户 → 用户登录后前端调用 `/api/rbac/resolve` 拿到合并后的权限集合，据此渲染可用菜单。

## 底层逻辑与数据模型

权限目录与角色都落库在 SQLite（`better-sqlite3`），关键表结构：

```
roles 表
├── id          主键 (role_xxx)
├── code        角色编码 (super_admin / hr_admin / custom_xxx)
├── permissionIds  TEXT，权限点 key 数组 JSON
├── type        'system' | 'custom'
└── siteScope   TEXT，站点码数组 JSON，如 ["main","shop"] 或 ["*"]
```

权限点本身不以单行存储，而是按模块聚合到 `permissions` 表：`moduleKey` 唯一，一行存该模块全部权限点 key 与 label 映射（见下文源码）。这种「模块级一行」设计既简化了目录下发，也避免了权限点爆炸式增长。

`/api/rbac/resolve` 是运行期核心：传入若干 `roleIds`，返回**权限点并集**与 **siteScope 并集**（`*` 为超集，遇 `*` 即整体返回 `["*"]`）。

## 源码剖析

### 1. i18n 双字典与接口

后端英文词典以中文为键，覆盖菜单、CMS Tab、商城、通用词（`server/standalone.ts:3777`）：

```ts
const I18N_EN: Record<string, string> = {
  '首页仪表盘': 'Dashboard', '组织管理': 'Organization', '产品档案': 'Products', ...
  '删除': 'Delete', '编辑': 'Edit', '新增': 'Add',
  '栏目管理': 'Channels', '文章管理': 'Articles', '商品管理': 'Products', ...
};
```

接口逻辑极简（`server/standalone.ts:3807`）：

```ts
router.get('/i18n/messages', (req, res) => {
  const lang = (req.query.lang as string) || 'zh-CN';
  if (lang === 'en') { res.json({ locale: 'en', messages: I18N_EN }); return; }
  // zh-CN 以中文原文为 key（messages 为空对象，前端回退到 key）
  res.json({ locale: 'zh-CN', messages: {} });
});
```

注意 `zh-CN` 故意返回空字典——因为中文就是 key，无需翻译，前端直接用 key 渲染即可。

### 2. RBAC 骨架：权限点目录与角色

权限点按模块分组定义（`server/standalone.ts:3815`）：

```ts
const RBAC_CATALOG = [
  { moduleKey: 'cms',  moduleName: '内容管理', points: [
      { key: 'cms:article:view', label: '查看文章' },
      { key: 'cms:article:delete', label: '删除文章' }, ... ] },
  { moduleKey: 'shop', moduleName: '商城', points: [ ... ] },
  { moduleKey: 'hr',   moduleName: '人力资源', points: [ ... ] },
  { moduleKey: 'sys',  moduleName: '系统', points: [ ... ] },
];
const RBAC_ALL = RBAC_CATALOG.flatMap(g => g.points.map(p => p.key));
```

站点码（`server/standalone.ts:3843`）：

```ts
const RBAC_SITES = [
  { code: 'main', name: '主站' },
  { code: 'shop', name: '商城' },
  { code: 'portal', name: '门户资讯' }
];
```

内置角色（`server/standalone.ts:3849`）演示了「权限点 + 站点 scope」的组合，例如 `hr_admin` 拥有 HR 全模块 + CMS 部分权限，但只限于 `['main','shop']` 两个站点：

```ts
{ code: 'hr_admin', name: 'HR管理员', type: 'system',
  perms: [ 'hr:employee:manage', 'hr:salary:manage', ... ], sites: ['main','shop'] }
```

### 3. ensureRbacSeeded：内置角色强制回填

关键在已存在角色的更新分支（`server/standalone.ts:3888`）：

```ts
} else {
  const existing = parseArr(ex.permissionIds);
  const merged = Array.from(new Set([...existing, ...r.perms]));
  // siteScope：内置系统角色，其站点范围始终以代码定义为准
  // （ALTER ADD COLUMN DEFAULT 曾把旧行统一填成 ["*"]，故此处强制回填修复）。
  (db as any).db.prepare('UPDATE roles SET permissionIds = ?, siteScope = ? WHERE id = ?')
    .run(JSON.stringify(merged), JSON.stringify(r.sites), ex.id);
}
```

🔑 这正是「内置角色 siteScope 以代码为准」的落地：无论数据库里旧值是什么，每次 seeding 都用 `r.sites` 覆盖写回。

### 4. /api/rbac/resolve：合并权限点 + scope 并集

```ts
router.post('/rbac/resolve', (req, res) => {
  const roleIds: string[] = (req.body && req.body.roleIds) || [];
  const points = new Set<string>();
  const sites = new Set<string>();
  let allSites = false;
  for (const rid of roleIds) {
    const code = String(rid).replace(/^role_/, '');
    const r = (db as any).db.prepare('SELECT permissionIds, siteScope FROM roles WHERE code = ?').get(code);
    if (r) {
      (JSON.parse(r.permissionIds) as string[]).forEach(p => points.add(p));
      const ss = normSites(r.siteScope);
      if (ss.includes('*')) allSites = true; else ss.forEach(s => sites.add(s));
    }
  }
  res.json({ permissions: Array.from(points), siteScope: allSites ? ['*'] : Array.from(sites), sites: RBAC_SITES });
});
```

## 原理剖析

**为什么 siteScope 不能信任 DB 里的旧值？**

这是本篇最容易被忽视的坑。早期 `roles` 表没有 `siteScope` 列，迁移时用：

```sql
ALTER TABLE roles ADD COLUMN siteScope TEXT DEFAULT '["*"]'
```

这条语句会把**所有已有行**的 `siteScope` 默认填成 `["*"]`（全部站点）。问题在于：你无法区分「管理员真把某角色设成全站点」和「只是迁移默认值」。如果不强制回填，一个本应局限于 `main` 站点的 HR 角色，可能因迁移默认而被「升级」成跨站点可见，造成越权。

因此 `ensureRbacSeeded` 对 `type === 'system'` 的内置角色**始终以代码 `RBAC_ROLES` 中的 `sites` 为准**，抹掉迁移噪音。而自定义角色（`type === 'custom'`，不在 `RBAC_ROLES` 内）则由管理员经 API 维护，seeding 不触碰——这是系统安全边界与运维灵活性的平衡。

**为什么 i18n 用「中文当 key」？**

传统 i18n 用抽象 key（如 `menu.dashboard`），缺点是开发时要到处维护 key↔中文映射。本项目反其道而行：中文文案本身即 key，英文词典只覆盖「有翻译的词」。好处是中文环境零配置、英文环境缺词自动显示中文（不会空白），扩展新词条只需往 `I18N_EN` 加一行。

## 管理者视角

✅ **细粒度权限支撑合规隔离。** 设想你的组织希望「财务部只看财务、HR 只看人事」。本系统的权限点已按模块切到 `hr:*`、`shop:*`、`cms:*` 等粒度，你可以创建一个 `finance_viewer` 自定义角色，仅勾选 `system:finance:view`（财务模块查看点）+ `siteScope: ['main']`，再绑定财务同事。他们登录后 `/api/rbac/resolve` 返回的权限集合根本不含 `hr:*` 与 `cms:*`，前端菜单自动隐藏人事与内容入口——数据层面就实现了物理隔离，而非仅靠「看不见」。

🚀 **多语言是出海的底座。** 当业务拓展到英语市场，只需在 `I18N_EN` 与前端 `EN_DICT` 补齐词条，整个后台即切换为英文界面，无需改任何业务逻辑。站点 scope 还能配合多语言，让不同地区站点展示不同内容、不同管理员只管自己站点。

## 注意事项

⚠️ **内置系统角色的 `siteScope` 以代码为准，不要手改数据库。** 即使你直接 UPDATE `roles` 表把 `hr_admin` 改成 `["*"]`，下次服务启动 `ensureRbacSeeded()` 仍会用 `server/standalone.ts:3852` 的 `sites: ['main','shop']` 覆盖回去。要改内置角色的站点范围，必须改源码 `RBAC_ROLES`，而不是改 DB。

🔑 **自定义角色只允许 `*` 或已登记站点码。** 后端在 `POST/PUT /api/rbac/roles` 做了白名单校验（`server/standalone.ts:3930`、`3944`）：`siteScope` 会被过滤为 `s === '*' || RBAC_SITE_CODES.includes(s)`，非法站点码会被静默丢弃，空值回退为 `['*']`。所以你无法把一个角色绑到不存在的站点上。

✅ **权限点前后端同源。** 前端菜单的可见性判断与后端 `RBAC_CATALOG` 使用同一套 key（如 `cms:article:delete`）。前端隐藏只是体验优化，**真正的拦截必须以后端为准**——任何敏感接口都应二次校验 `resolve` 返回的权限集合，不要只依赖前端不渲染按钮。

## 小结与练习

本篇你掌握了：三层 RBAC 的模型、站点 scope 的「强制回填」原理、双字典 i18n 实现，以及管理者如何用它做合规隔离与出海准备。

🚀 动手练习：

1. 启动系统（默认端口 `3000`，`npm install --legacy-peer-deps` 后 `npm run dev`），用 `admin/admin123` 登录，访问 `GET /api/rbac/permissions` 观察四个模块的权限点。
2. 在 `RBAC_ROLES` 中新增一个 `finance_viewer` 内置角色，限定 `hr` 与 `sys` 的财务相关点 + `siteScope: ['main']`，重启服务观察 seeding 是否生效。
3. 调用 `POST /api/i18n/messages?lang=en`，确认返回 `I18N_EN`；试着给 `I18N_EN` 加一条 `'客户管理': 'Customers'`，刷新英文界面验证生效。

> **系列导航**：[上一篇：07-前端架构](./07-前端架构-路由权限渲染与防白屏.md) ｜ [下一篇：09-AI助手](./09-AI助手-SSE流式RAG与工具循环.md) ｜ [大纲](../教程系列写作大纲V2.md)
