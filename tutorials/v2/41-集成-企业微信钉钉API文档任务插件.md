# 第 41 篇：集成——企业微信 / 钉钉 / API 文档 / 任务管理 / 插件

> 所属产品：**Sowork AI 企业智能ERP系统**（版本 v1.2.0）。本文仅聚焦「系统管理」下的 5 个集成子页，不展开其他模块。

## 学习目标

读完本篇，你将能够：

- 在 Sowork AI 企业智能ERP系统 中配置企业微信与钉钉集成，打通扫码登录、消息推送与通讯录同步。
- 利用自动生成的 API 文档页，快速对接第三方系统。
- 新建、启停并监控定时任务（数据同步、备份、报表、通知等）。
- 在插件管理页启停已注册插件，理解它与第 12 篇「插件生态」的关系。
- 读懂后端插件网关与定时任务 CRUD 的真实代码路径。

## 核心概念

这 5 个子页都属于「系统管理」模块下的**集成能力**，它们解决的是「ERP 如何对外连通」的问题：

| 子页 | 路由 | 解决什么 | 数据落点 |
| --- | --- | --- | --- |
| 企业微信 | `/system/wechat` | 企微扫码登录、消息通知、通讯录同步 | 前端配置态（演示） |
| 钉钉集成 | `/system/dingtalk` | 钉钉扫码登录、消息通知、通讯录同步 | 前端配置态（演示） |
| API 文档 | `/system/api-doc` | 自动罗列系统接口，降低对接成本 | 静态模块清单 |
| 任务管理 | `/system/tasks` | 定时任务与后台作业调度 | `scheduled_tasks` 表 |
| 插件管理 | `/system/plugins` | 按启用态决定插件是否响应请求 | `plugins` 表 |

🔑 一句话记忆：前两个是「IM 连接」，API 文档是「对外窗口」，任务管理是「自动执行」，插件管理是「可插拔扩展」。

## 界面布局与操作流程

侧边栏「系统管理」下的集成入口（见 `client/src/components/Layout.tsx:242-246`）：

```
系统管理
├─ 用户管理        /system/users
├─ 角色权限        /system/roles
├─ ...（省略）
├─ 企业微信        /system/wechat      ← 本篇
├─ 钉钉集成        /system/dingtalk    ← 本篇
├─ API文档         /system/api-doc     ← 本篇
├─ 任务管理        /system/tasks       ← 本篇
└─ 插件管理        /system/plugins     ← 本篇
```

**企业微信 / 钉钉设置页**（结构基本一致）：

1. 顶部点击「测试连接」验证密钥有效性（需先填 CorpId/Secret 或 AppKey/AppSecret）。
2. 基础配置区：企业 ID、AgentId、应用 Secret（钉钉为 AppKey/AppSecret）。
3. 回调配置区：填写回调 URL，并把该 URL 配置到企微/钉钉后台。
4. 数据同步区：开启定时同步，选择同步部门/员工、自动建号，并设置同步间隔（10 分钟至每天）。
5. 点击「保存配置」「立即同步」。

🚀 提示：本篇页面为前端演示态（保存动作延迟后返回成功），真正的密钥校验在对接企微/钉钉开放平台时落地。

**API 文档页**：左侧按模块（人事、考勤、薪酬、审批、系统）折叠列出接口，右侧展示选中接口的 Method、路径、请求/响应示例，并提供「在线测试」按钮。

**任务管理页**：顶部统计卡（待执行/执行中/已完成/失败），中部搜索与状态/类型筛选，下方表格含进度条与「执行/停止/日志/删除」操作；「新建任务」弹窗填名称、类型、Cron 表达式（如 `0 8 * * *`）。

**插件管理页**：卡片网格列出已注册插件，每张卡片显示版本、描述与「已启用/已停用」徽标，按钮一键启停。

## 底层逻辑与数据模型

这 5 个功能的后端存储分为两类：

IM 与 API 文档为**前端静态态**，配置仅在前端 `useState` 中维护，用于演示集成入口与文档展示；真正生产化时，密钥应存入 `system_config` 或独立凭据表并加密。

任务管理与插件管理则是**真实持久化**，走通用 CRUD 表：

```
scheduled_tasks           定时任务表
├─ id, name, type         任务类型: sync/backup/report/notification/cleanup/import/export
├─ schedule               Cron 表达式
├─ status                 pending / running / completed / failed
└─ progress, lastRun, nextRun

plugins                   插件注册表
├─ id, name, version
├─ enabled (0/1)          启用状态，决定网关是否放行
└─ description, config
```

后端在启动时执行 `ensureRbacSeeded()` 等播种逻辑，并注册插件骨架（`server/standalone.ts:3977`），插件以**静态注册**方式进入 `pluginRegistry`，不会加载磁盘上的任意 JS，这是关键的安全策略。

## 源码剖析

**插件启停逻辑**（最值得精读的一段，见 `server/standalone.ts:3979-4025`）：

```ts
// 3979 注册表与启用判定
const pluginRegistry = new Map<string, any>();
const definePlugin = (p: any) => pluginRegistry.set(p.id, p);
const pluginEnabled = (id: string): boolean => {
  try { const row = (db as any).db.prepare('SELECT enabled FROM plugins WHERE id = ?').get(id);
        return row ? !!row.enabled : (pluginRegistry.get(id)?.enabled !== false); }
  catch { return pluginRegistry.get(id)?.enabled !== false; }
};
// 3992 网关：未启用直接 403
const pluginGate = (id: string, res: any): boolean => {
  const p = pluginRegistry.get(id);
  if (!p || !pluginEnabled(id)) { res.status(403).json({ error: '插件未启用或不存在' }); return false; }
  return true;
};
```

真正处理启停的路由在 `server/standalone.ts:4019`：

```ts
router.post('/plugins/:id/toggle', (req, res) => {
  const p = pluginRegistry.get(req.params.id);
  if (!p) { res.status(404).json({ error: '插件不存在' }); return; }
  const next = !pluginEnabled(p.id);
  setPluginEnabled(p.id, next);          // 写入 plugins 表 enabled 列
  res.json({ success: true, id: p.id, enabled: next });
});
```

前端 `PluginManagePage.tsx:28-35` 调用 `POST /api/plugins/:id/toggle` 后重新拉取 `/api/plugins`，卡片状态即时翻转。

**定时任务 CRUD**：`scheduled_tasks` 已列入通用 CRUD 白名单 `ALLOWED`（`server/standalone.ts:1111`）。前端 `TaskManagePage.tsx:35` 的 `GET /api/scheduled_tasks`、`:59` 的 `POST`、`83/96` 的 `PUT`、`110` 的 `DELETE`，全部命中通用处理器 `server/standalone.ts:4065-4176`。该处理器会校验表名是否在 `ALLOWED` 内、按 `PRAGMA table_info` 过滤非法字段，并自动补全 `createdAt/updatedAt`。

## 原理剖析

插件系统采用「**注册 + 网关**」两段式：插件在代码里静态 `definePlugin` 注册，每个插件路由先过 `pluginGate` 检查 `enabled`，未启用即返回 403。这样新增能力的代码始终在编译期可控，避免动态加载外部脚本带来的风险。这与第 12 篇所述的「插件生态」一脉相承——核心不变，能力外挂。

定时任务则是「**数据驱动**」：Cron 表达式与状态存表，前端即可启停与监控进度。当前版本的任务执行以状态标记（`running/pending`）为主，调度器按 `schedule` 触发对应的 `type` 作业（同步、备份、报表、通知、清理、导入、导出），进度通过 `progress` 字段回写，因此「任务管理」页能实时呈现执行状态与百分比。

API 文档页是「**静态清单 + 模板示例**」：接口按业务模块硬编码在 `API_MODULES`（`ApiDocPage.tsx:5-48`），选中后右侧用固定模板渲染 curl 与响应示例。它不读取运行时 OpenAPI，而是把常用端点结构化展示，足够作为对接方的快速索引。

## 管理者视角

- **IM 集成提升触达**：企业微信/钉钉打通后，审批、预警、公告可直达员工手机，减少「系统发了但没人看」的盲区。
- **API 文档降低对接成本**：无需开发介入，业务/外部厂商即可自助查询接口，缩短 ERP 与 OA、WMS、商城等系统的对接周期。
- **插件生态免改核心**：新功能以插件形式接入并按需启停，升级核心时不破坏既有能力，也便于灰度与回滚。
- **任务可视化保障稳定**：定时任务的执行/失败状态在管理后台一览无余，运维可第一时间发现异常作业。

## 注意事项

⚠️ 企业微信 / 钉钉集成必须配置正确的 CorpId、Secret / AppKey 与回调 URL，且回调域名需与开放平台后台一致，否则「测试连接」与消息推送都会失败。

🔑 插件停用会影响所有依赖它的功能（如「站点统计插件」停用后 `/api/plugin/stats/overview` 返回 403），停前请确认下游无人调用。

✅ 定时任务可在任务管理页监控状态与进度；若某任务长期 `failed`，应检查其类型对应的后端作业与依赖配置，而非仅在前端点「执行」掩盖问题。

⚠️ 本篇 IM 与 API 文档页面当前为前端演示态，生产化部署时请务必把密钥迁移到受保护的后端存储，避免明文出现在前端代码中。

## 小结与练习

本篇带你走通了 Sowork AI 企业智能ERP系统 的 5 个集成子页：IM 连接（企微/钉钉）、对外窗口（API 文档）、自动执行（任务管理）与可插拔扩展（插件管理），并精读了插件网关 `server/standalone.ts:3979-4025` 与定时任务通用 CRUD `server/standalone.ts:4065-4176` 两段真实代码。

练习建议：

1. 进入「插件管理」，停用 `demo` 插件，再用 `curl http://localhost:3000/api/plugin/demo/ping` 验证是否返回 403。
2. 在「任务管理」新建一条类型为 `report`、Cron 为 `0 9 * * *` 的任务，观察统计卡计数变化。
3. 在「API 文档」搜索 `/api/employees`，尝试用页面「在线测试」发起请求（账号 `admin/admin123`，服务端口 `3000`）。

> 安装依赖请使用：`npm install --legacy-peer-deps`

> **系列导航**：[上一篇：40-系统管理](./40-系统管理-用户角色配置数据日志.md) ｜ [下一篇：42-仪表盘统计](./42-仪表盘与数据统计.md) ｜ [大纲](../教程系列写作大纲V2.md)
