# 第 12 章 · 企业级管控：RBAC 权限与 i18n 国际化

> Sowork AI 企业智能ERP系统 · 代码级技术教程
> 源码锚点：`server/standalone.ts`（i18n 字典 3777~3812、权限目录 3815~3838、站点/角色 3843~3862、播种 3867~3898、角色 CRUD 3900~3956、resolve 3957~3973）

---

## 学习目标

- 读懂三层 RBAC 模型：权限点（point）→ 角色（role）→ 站点范围（site scope）
- 精读 `ensureRbacSeeded` 的"合并 + 强制回填"播种策略及其踩坑背景
- 逐段读懂 `/rbac/resolve`：多角色权限点求并集、站点范围求并集
- 理解"命名路由必须注册在 catch-all `/:table` 之前"的铁律
- 掌握 i18n 的极简双份字典方案（后端 + 前端）
- （管理者）理解精细化授权、多站点隔离对企业合规的意义

---

## 核心概念：三层权限模型

企业系统的权限从来不是"管理员/普通用户"两档能搞定的。Sowork AI 的 RBAC（#108/#130）用三层结构（`server/standalone.ts:3815-3862`）：

```
① 权限点 point   最细粒度，如 cms:article:delete（删除文章）
        ↑ 组成
② 角色 role      一组权限点的集合，如 hr_admin
        ↑ 附加
③ 站点范围 site  横向作用域，如 ['main','shop']（该角色只在主站+商城生效）
```

权限点回答"能做什么"，站点范围回答"在哪些站点能做"。二者正交——一个 HR 管理员可能有全部 HR 权限，但只限于主站，不能碰门户资讯站。

---

## 源码剖析一：权限目录（RBAC_CATALOG）

权限点按模块分组定义（`server/standalone.ts:3815-3838`，节选）：

```ts
// server/standalone.ts:3815-3838（节选）
const RBAC_CATALOG = [
  { moduleKey: 'cms', moduleName: '内容管理', points: [
    { key: 'cms:article:view', label: '查看文章' }, { key: 'cms:article:create', label: '创建文章' },
    { key: 'cms:article:edit', label: '编辑文章' }, { key: 'cms:article:delete', label: '删除文章' },
    { key: 'cms:article:publish', label: '发布文章' }, { key: 'cms:channel:manage', label: '栏目管理' },
    { key: 'cms:comment:moderate', label: '评论审核' }, { key: 'cms:media:manage', label: '素材管理' }
  ]},
  { moduleKey: 'shop', moduleName: '商城', points: [ /* shop:goods:manage, shop:order:refund … */ ]},
  { moduleKey: 'hr', moduleName: '人力资源', points: [ /* hr:employee:manage … */ ]},
  { moduleKey: 'sys', moduleName: '系统', points: [ /* system:user:manage, system:role:manage … */ ]}
];
const RBAC_ALL = RBAC_CATALOG.flatMap(g => g.points.map(p => p.key));
```

**权限点命名规范**：`模块:资源:动作`（如 `cms:article:delete`）。三段式命名让权限一眼可读、易于按前缀批量匹配（如 `p.startsWith('cms:')` 判断"是否有任何 CMS 权限"）。`RBAC_ALL` 是所有权限点的扁平数组——超级管理员直接拿它。

站点目录与角色定义（`server/standalone.ts:3843-3862`）：

```ts
// server/standalone.ts:3843-3862（节选）
const RBAC_SITES = [
  { code: 'main', name: '主站' }, { code: 'shop', name: '商城' }, { code: 'portal', name: '门户资讯' }
];
const RBAC_ROLES = [
  { code: 'super_admin', name: '超级管理员', type: 'system', perms: RBAC_ALL, sites: ['*'] },
  { code: 'sys_admin',   name: '系统管理员', type: 'system', perms: RBAC_ALL, sites: ['*'] },
  { code: 'hr_admin',    name: 'HR管理员',   type: 'system', perms: [/* 大量 cms/shop/hr/sys 点 */], sites: ['main','shop'] },
  { code: 'hr_staff',    name: 'HR专员',     type: 'system', perms: ['cms:article:view','cms:article:create','hr:employee:manage','hr:attendance:manage','hr:recruitment:manage'], sites: ['main'] },
  { code: 'dept_manager',name: '部门经理',   type: 'system', perms: ['hr:approval:manage','hr:attendance:manage'], sites: ['main'] },
  { code: 'employee',    name: '普通员工',   type: 'system', perms: [], sites: [] }
];
```

`sites: ['*']` 表示全部站点（超集）；`employee` 的 `perms: []` + `sites: []` 表示只有自助功能、无管理权限。

---

## 源码剖析二：播种策略——合并 + 强制回填（含踩坑史）

`ensureRbacSeeded`（`server/standalone.ts:3867-3898`）是全章最需要细读的一段，因为它解决了一个真实的迁移陷阱。

```ts
// server/standalone.ts:3867-3898
let rbacSeeded = false;
const ensureRbacSeeded = () => {
  if (rbacSeeded) return;
  // roles 表迁移：补充 siteScope 列（站点级权限，#130）
  try {
    const cols = (db as any).db.prepare('PRAGMA table_info(roles)').all().map((c: any) => c.name);
    if (!cols.includes('siteScope')) {
      (db as any).db.prepare("ALTER TABLE roles ADD COLUMN siteScope TEXT DEFAULT '[\"*\"]'").run();
    }
  } catch { /* ignore */ }
  // 始终确保细粒度权限点存在（不删除已有的 p_* 模块级权限）。
  const insP = (db as any).db.prepare('INSERT OR REPLACE INTO permissions (id, moduleName, moduleKey, actions, description) VALUES (?,?,?,?,?)');
  for (const g of RBAC_CATALOG) {
    const keys = g.points.map(p => p.key);
    const labels: Record<string, string> = {}; g.points.forEach(p => { labels[p.key] = p.label; });
    insP.run(g.moduleKey, g.moduleName, g.moduleKey, JSON.stringify(keys), JSON.stringify(labels));
  }
  for (const r of RBAC_ROLES) {
    const ex = (db as any).db.prepare('SELECT * FROM roles WHERE code = ?').get(r.code);
    if (!ex) {
      (db as any).db.prepare('INSERT INTO roles (id, name, code, description, permissionIds, type, isActive, createdAt, siteScope) VALUES (?,?,?,?,?,?,1,?,?)').run('role_' + r.code, r.name, r.code, r.desc, JSON.stringify(r.perms), r.type, new Date().toISOString(), JSON.stringify(r.sites));
    } else {
      // 合并：保留已有权限点 + 追加本角色规范的细粒度点（避免丢失 p_* 模块级权限）
      const existing = parseArr(ex.permissionIds);
      const merged = Array.from(new Set([...existing, ...r.perms]));
      // siteScope：RBAC_ROLES 均为内置系统角色，其站点范围始终以代码定义为准
      // （ALTER ADD COLUMN DEFAULT 曾把旧行统一填成 ["*"]，故此处强制回填修复）。
      (db as any).db.prepare('UPDATE roles SET permissionIds = ?, siteScope = ? WHERE id = ?').run(JSON.stringify(merged), JSON.stringify(r.sites), ex.id);
    }
  }
  rbacSeeded = true;
};
```

三个设计决策，逐个说清：

**1. 幂等迁移加列**：先 `PRAGMA table_info(roles)` 检查 `siteScope` 列在不在，不在才 `ALTER TABLE ADD COLUMN`。这样重复启动不会报"列已存在"。（呼应第 04 章的迁移哲学。）

**2. 权限点用 `INSERT OR REPLACE`**：每次启动都刷新权限目录，保证代码里新增的权限点自动进库。

**3. 角色权限用"合并"，站点范围用"强制覆盖"——这里是踩坑重点：**

- **权限点合并**（`merged = [...existing, ...r.perms]` 去重）：保留管理员在后台给角色加过的权限，同时补上代码里规范的点。**尊重人工改动**。
- **站点范围强制覆盖**（直接 `siteScope = r.sites`）：为什么这里不"尊重已有值"？因为 `ALTER TABLE ADD COLUMN ... DEFAULT '["*"]'` 会把所有旧角色行的 `siteScope` **统统填成 `["*"]`**。此时"已有值"根本分不清是"真·管理员设成全站"还是"迁移默认填的"。所以对**内置系统角色**，一律以代码 `RBAC_ROLES.sites` 为准，强制回填修复。

🔑 **权限点合并、站点范围覆盖——为什么两者策略不同？** 权限点的"已有值"是可信的（要么是初始播种，要么是管理员主动加的）；而站点范围的"已有值"被迁移默认污染了，不可信。**能分清人工改动就尊重，分不清就以代码为准**。这是数据迁移中"新增列 DEFAULT 污染"的经典应对。自定义角色（不在 `RBAC_ROLES` 里）不受此影响，其 `siteScope` 由管理员经 API 维护。

---

## 源码剖析三：resolve——多角色权限求并集

一个用户可能有多个角色，最终权限是所有角色的并集。这就是 `/rbac/resolve`（`server/standalone.ts:3957-3973`）：

```ts
// server/standalone.ts:3957-3973
router.post('/rbac/resolve', (req, res) => {
  ensureRbacSeeded();
  const roleIds: string[] = (req.body && req.body.roleIds) || [];
  const points = new Set<string>();
  const sites = new Set<string>();
  let allSites = false;
  for (const rid of roleIds) {
    const code = String(rid).replace(/^role_/, '');
    const r = (db as any).db.prepare('SELECT permissionIds, siteScope FROM roles WHERE code = ?').get(code);
    if (r) {
      try { (JSON.parse(r.permissionIds) as string[]).forEach((p: string) => points.add(p)); } catch { /* ignore */ }
      const ss = normSites(r.siteScope);
      if (ss.includes('*')) allSites = true; else ss.forEach((s: string) => sites.add(s));
    }
  }
  res.json({ permissions: Array.from(points), siteScope: allSites ? ['*'] : Array.from(sites), sites: RBAC_SITES });
});
```

逐段读并集逻辑：

1. **`roleIds` 归一**：`String(rid).replace(/^role_/, '')` 去掉 `role_` 前缀——前端可能传 `role_hr_admin` 或 `hr_admin`，统一成 code。
2. **权限点并集**：用 `Set` 累加所有角色的 `permissionIds`，天然去重。
3. **站点范围并集，但 `*` 优先**：只要有一个角色是全站（`*`），`allSites=true`，最终返回 `['*']`。否则合并各角色的具体站点。**这是"权限取并集"的正确语义——用户拥有其任一角色的权限**。
4. **返回结构**：`{ permissions, siteScope, sites }`。前端 `usePermission` 拿这个和本地计算合并（见第 07 章）。

---

## 源码剖析四：路由注册铁律

RBAC 和 i18n 的所有端点，都注册在通用 catch-all `/:table` **之前**。这不是风格问题，是**功能正确性问题**。回顾第 02 章：catch-all 路由 `/:table` 会匹配任何单段路径。如果 `/rbac/roles` 注册在 `/:table` 之后，请求 `/api/rbac/...` 会被 `/:table`（table=`rbac`）先截胡，永远进不到真正的 RBAC 处理器。

```
✅ 正确顺序（standalone.ts 内）：
   router.get('/i18n/messages', ...)      ← line 3807
   router.get('/rbac/permissions', ...)   ← line 3900
   router.post('/rbac/resolve', ...)      ← line 3957
   ...（所有具名路由）
   router.get('/:table', ...)             ← line 4065（catch-all，必须最后）
```

🔑 **铁律：所有 `/rbac/*`、`/i18n/*`、以及一切带连字符或多段的具名路由，必须写在 catch-all `/:table` 之前。** 这是 Express 路由"先注册先匹配"机制的直接推论——第 02 章讲过原理，这里是它最关键的一处应用。

---

## 源码剖析五：i18n 的极简双份字典

国际化没有引入 i18next 之类的重型库，而是后端一份字典、前端一份字典，以**中文原文为 key**。后端字典（`server/standalone.ts:3777-3812`，节选）：

```ts
// server/standalone.ts:3777-3812（节选）
const I18N_EN: Record<string, string> = {
  '首页仪表盘': 'Dashboard', '组织管理': 'Organization', '产品档案': 'Products',
  '保存': 'Save', '取消': 'Cancel', '删除': 'Delete', '编辑': 'Edit', '新增': 'Add',
  '栏目管理': 'Channels', '文章管理': 'Articles', '智能提取': 'Smart Tags',
  '角色管理': 'Roles', '站点范围': 'Site Scope', '全部站点': 'All Sites',
  /* …共约 138 条… */
};
router.get('/i18n/messages', (req, res) => {
  const lang = (req.query.lang as string) || 'zh-CN';
  if (lang === 'en') { res.json({ locale: 'en', messages: I18N_EN }); return; }
  // zh-CN 以中文原文为 key（即 messages 为空对象，前端回退到 key）
  res.json({ locale: 'zh-CN', messages: {} });
});
```

关键设计：

1. **以中文原文为 key**：`t('保存')` 中文环境下直接返回"保存"（messages 为空，回退 key），英文环境返回 "Save"。**无需为中文单独维护一份字典**——中文就是 key 本身。
2. **未翻译自动回退中文**：字典没有的词，`t()` 回退到 key（中文），不会显示成 `undefined` 或乱码。
3. **前后端双份同步**：后端 `I18N_EN` 给 API 层用（如导出、消息），前端 `EN_DICT` 给 UI 用，两份保持同步（138 条）。

🔑 **为什么不用 i18next？** 对一个中文为主、英文为辅的企业系统，重型 i18n 框架是过度设计。"中文原文即 key + 单向英文字典"方案零依赖、心智负担最小、新增翻译只是加一行键值对。这又是全系统"够用即最优"哲学的体现。

---

## 实战代码：角色与权限操作

```bash
# 1. 查看权限目录（分组）
curl http://localhost:3000/api/rbac/permissions
# → [{"moduleKey":"cms","moduleName":"内容管理","points":[{"key":"cms:article:delete","label":"删除文章"},...]}]

# 2. 创建自定义角色（限定站点范围）
curl -X POST http://localhost:3000/api/rbac/roles \
  -H "Content-Type: application/json" \
  -d '{"name":"商城运营","code":"shop_op","permissionIds":["shop:goods:manage","shop:order:view"],"siteScope":["shop"]}'

# 3. 解析用户的有效权限（多角色并集）
curl -X POST http://localhost:3000/api/rbac/resolve \
  -H "Content-Type: application/json" -d '{"roleIds":["role_hr_admin","role_shop_op"]}'
# → {"permissions":[...并集...],"siteScope":["main","shop"],"sites":[...]}

# 4. 切换英文
curl "http://localhost:3000/api/i18n/messages?lang=en"
# → {"locale":"en","messages":{"保存":"Save",...}}
```

---

## 运行演示：站点范围的并集效果

给一个用户同时赋 `hr_admin`（sites: `['main','shop']`）和 `hr_staff`（sites: `['main']`）两个角色，调 `resolve`，`siteScope` 返回 `['main','shop']`（并集）。再加一个 `super_admin`（sites: `['*']`），`siteScope` 立刻变成 `['*']`——`*` 优先吞掉一切。这直观展示了"权限取并集，越多角色权限越大"的语义。

---

## 管理者视角

| 关注点 | RBAC/i18n 给出的答案 |
|--------|----------------------|
| **精细化授权** | 权限细到"删除文章""退款处理"级别，不再是粗放的"管理员/普通用户"。按岗位精确配权。 |
| **多站点隔离** | 站点范围让同一系统内主站/商城/门户互相隔离，商城运营碰不到 HR 数据，满足数据分权合规。 |
| **可自定义角色** | 内置角色开箱即用，同时支持后台自定义角色（如"商城运营""财务专员"），适配组织结构变化。 |
| **国际化就绪** | 一键切换中英文，适配有海外团队或外籍员工的企业。 |

给决策者一句话：**RBAC 让"谁能在哪个站点做什么"变得可精确配置和审计——这是企业系统通过安全合规审查的硬门槛**。

---

## 注意事项

- ⚠️ **具名路由必须注册在 catch-all `/:table` 之前**，否则 `/rbac/*`、`/i18n/*` 会被通用 CRUD 截胡，返回错误数据。
- ⚠️ **内置系统角色的 `siteScope` 以代码为准**（强制回填），不要指望在后台改内置角色的站点范围会被保留——要改站点范围请建自定义角色。
- ⚠️ **权限点合并 vs 站点覆盖策略不同**，改播种逻辑前先理解"迁移 DEFAULT 污染"的背景，别改成"站点也尊重已有值"。
- ⚠️ **前后端 i18n 字典必须同步**：后端 `I18N_EN` 加了词，前端 `EN_DICT` 也要加，否则 UI 和 API 翻译不一致。
- 🔑 权限点用三段式 `模块:资源:动作` 命名，扩展新权限务必遵守，才能用前缀匹配做批量判断。

---

## 练习

1. 阅读 `ensureRbacSeeded`（3867 行），用自己的话解释"为什么权限点用合并、站点范围用强制覆盖"，以及如果站点范围也用合并会发生什么问题。
2. 在 `resolve`（3957 行）里，站点范围是"`*` 优先"。设计一个反例说明：如果改成"取交集"，会导致什么授权错误。
3. **读源码猜作用**：`roleIds` 处理时 `String(rid).replace(/^role_/, '')`。猜猜为什么要兼容带前缀和不带前缀两种传参。
4. 动手：新增一个权限点 `shop:coupon:manage`（优惠券管理）到 `RBAC_CATALOG`，重启后调 `/rbac/permissions` 验证它自动进库，并说明这依赖了 `INSERT OR REPLACE` 的什么特性。

---

> **系列导航**：上一章 ← [第 11 章 · 商城 ShopXO 超集：库存联动与售后状态机](./11-商城ShopXO超集-库存联动与售后状态机.md) ｜ 下一章 → [第 13 章 · 测试与质量保障](./13-测试与质量保障.md)
