# 飞达智能 HR 系统 (Feida Intelligent HR System) v1.0.0

> 基于 AI 大模型的**智能人力资源管理 + 企业门户 + 商城**一体化全栈平台。
> 首个开源发布版本（Apache 2.0）。

飞达是一套开箱即用的企业数字化平台：以人力资源管理（HR）为核心，向上集成 AI 助手/知识库/BI/预警，横向覆盖 ERP 制造（产品/工艺/仓储/销售/采购/生产/财务/质量）、内容门户（CMS）与在线商城（ShopXO 超集），并通过 **RBAC 细粒度权限（#108）+ 站点级权限作用域（#130）+ 多语言 i18n（#107/#129）** 实现企业级管控。

---

## ✨ 功能矩阵

| 域 | 模块 | 关键能力 |
|----|------|----------|
| **AI** | 智能助手 / 知识库 / BI 看板 / 智能预警 / AI 配置 | 流式对话、混合检索(RAG)、ECharts+AI 洞察、5 类预警规则、多提供商(DeepSeek/OpenAI/Ollama) |
| **人力资源** | 人事 / 考勤 / 薪酬 / 绩效 / 招聘 / 培训 / 人才 / 统计 | 员工档案+字段自定义、排班、薪资公式引擎、KPI、简历/Offer、课程中心、组织架构图 |
| **流程** | 审批 / 工作流 | 请假/加班/离职申请、可视化流程设计器、审批历史 |
| **后勤** | 宿舍 / 食堂 / 车辆 / 访客 | 后勤事务一体化 |
| **ERP 制造** | 产品 / 工艺(PLM) / 仓储 / 销售 / 采购 / 生产 / 财务 / 质量 | SKU/款号、BOM/工序、出入库盘点、订单发货、供应商、工单报工、凭证应收应付、质检 |
| **内容门户 CMS** | 栏目 / 文章 / 评论 / 标签 / 素材库 / 表单 / SEO / Sitemap / 插件 / 敏感词 / Word 导入 / 图片裁剪 / 拼写检查 / 多语言 | 富文本(Tiptap)、回收站、定时发布、跨栏目复制、批量替换、导入导出 |
| **在线商城 Shop** | 商品 / 品牌 / 分类 / 优惠券 / 秒杀 / 拼团 / 砍价 / 分销 / 钱包余额 / 积分 / 仓库库存 / 快递 / 订单 / 售后 / 地区联动 | 完整电商闭环（ShopXO 付费插件的自建超集） |
| **系统** | 用户 / 角色 / 权限 / 站点作用域 / 多语言 | 细粒度权限点驱动按钮显隐、站点级 scope、中英文切换 |

---

## 🏗️ 技术架构

```
feida/
├── server/                         # 后端 (TypeScript, Express 风格)
│   ├── standalone.ts               # 主入口：API 路由 + 静态托管 + 自动 seed
│   ├── ai-service.js               # AI 服务 (LLM / 知识库 / 智能体)
│   ├── workflow-engine.ts          # 工作流引擎
│   ├── approval-engine.ts          # 审批引擎
│   ├── salary-formula-engine.ts    # 薪资公式引擎
│   ├── schedule-engine.ts          # 排班引擎
│   ├── modules/database/
│   │   └── database.service.ts     # SQLite 服务 (建表 / 迁移 / 种子)
│   └── seed-cms-shop.ts            # CMS + 商城 种子数据
├── client/                         # 前端 (React 19 + Vite + TypeScript)
│   └── src/
│       ├── app.tsx                 # 路由 (全域路由)
│       ├── components/Layout.tsx   # 侧边栏布局 + 菜单 + 权限过滤
│       ├── hooks/usePermission.tsx # 权限 hook (computePermissions / siteScope / canAccessSite)
│       ├── i18n/                   # 多语言 (zh-CN / en, 138 词条)
│       └── pages/                  # 所有业务页面 (HR/ERP/CMS/Shop/AI/System)
├── data/                           # SQLite 数据库 (首次启动自动创建, 已 gitignore)
├── dist/                           # 构建输出 (已 gitignore)
└── test-*.js                       # 22 个功能/接口测试脚本
```

**技术栈**

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript + Vite 7 + React Router 6 + Ant Design 5 + Tiptap 3 + ECharts 5 |
| 后端 | Node 22 + TypeScript + Express 4 风格路由 |
| 数据库 | better-sqlite3 (SQLite, 文件级 `data/ehr.db`) |
| AI | DeepSeek / OpenAI / Ollama API (SSE 流式) |
| 运行时 | tsx (开发) / tsc (生产构建) |

---

## 🚀 快速开始

### 环境要求
- **Node.js** ≥ 22.x
- **npm** ≥ 10.x
- 操作系统：Windows 10/11、macOS、Linux

### 1. 安装依赖
```bash
npm install --legacy-peer-deps
```
> 说明：部分历史依赖未在 `package.json` 中显式声明，安装时请使用 `--legacy-peer-deps`，避免依赖被 `npm` 以 `package.json` 为准做 prune（会丢失 antd 等核心包）。

### 2. 开发模式（前端热更新 + 后端 watch）
```bash
npm run dev
# 前端: http://localhost:8080   (Vite)
# 后端 API: http://localhost:3000/api  (tsx watch)
```

### 3. 生产模式（单端口托管 SPA + API）
```bash
npm run build        # 构建 server + client
npm start            # 启动 dist/server/standalone.js
# 访问: http://localhost:3000  (SPA 与 API 同一端口)
```
自定义端口：
```bash
SERVER_PORT=3400 npm start
```

### 4. 默认账户
| 用户名 | 密码 | 角色 | 权限 |
|--------|------|------|------|
| `admin` | `admin123` | 超级管理员 | 全部权限 |
| `hr_admin` | `hr123456` | HR 管理员 | 人事/考勤/薪酬/绩效/招聘/培训/审批/统计 |
| `hr_staff` | `hr123456` | 人事专员 | 人事/考勤/薪酬/审批 |

> ⚠️ **生产环境请务必修改默认密码！**

---

## 🔐 权限与多语言

- **细粒度权限（#108/#128）**：权限点形如 `cms:article:delete`、`cms:channel:manage`、`cms:comment:moderate`、`shop:goods:manage`。前端按钮按 `can('point')` 真实显隐；后端 `POST /api/rbac/resolve` 返回权威权限点集合。
- **站点级作用域（#130）**：角色可绑定站点范围（`main` 主站 / `shop` 商城 / `portal` 门户资讯，`["*"]` 表示全部）。`usePermission` 暴露 `siteScope` 与 `canAccessSite(code)`。
- **多语言（#107/#129）**：内置中文(原文即 key) 与英文词典（138 条）。切换语言后界面文案实时刷新；后端 `GET /api/i18n/messages?lang=en` 提供词条。

---

## 🧪 测试

项目内含 **22 个功能/接口测试脚本**（`test-*.js`），覆盖 HR、ERP、CMS、商城、RBAC、i18n 等。需先启动服务：

```bash
# 终端 A：启动服务
SERVER_PORT=3400 npm start

# 终端 B：运行测试（默认 BASE=http://localhost:3400）
node test-new-features.js
node test-perm-points.js      # 权限点解析 (#128)
node test-site-scope.js       # 站点作用域 (#130)
node test-i18n-expand.js      # i18n 词条 (#129)
# ... 其余脚本见仓库根目录 test-*.js
```
每个脚本以断言计数输出通过/失败，全部通过即代表对应模块功能可用。

---

## ⚙️ 配置（环境变量）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SERVER_PORT` | `3000` | 服务端口 |
| `SERVER_HOST` | `localhost` | 绑定地址 (`0.0.0.0` 可外网访问) |
| `DEEPSEEK_API_KEY` | (空) | DeepSeek API 密钥（AI 功能可选） |

数据库无需手动初始化：首次启动自动建表 + 播种（HR / CMS / 商城 / RBAC / AI 知识库）。详见 [`SYSTEM_INIT.md`](./SYSTEM_INIT.md)。

---

## 📚 文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 用户操作手册 | `FEIDA_HR_SYSTEM_USER_MANUAL.md` | 各模块使用说明 |
| 开发手册 | `开发手册.md` | 架构、数据库、权限、i18n、扩展指南 |
| 系统初始化 | `SYSTEM_INIT.md` | 程序与数据库初始化、默认账户、备份 |
| 部署指南 | `DEPLOYMENT_GUIDE.md` | 生产部署 |
| AI 配置指南 | `AI_SETUP_GUIDE.md` | AI 功能接入 |
| 功能对照审计 | `CMS和Shop功能对照审计报告.md` | CMS/Shop 与上游源码功能对齐记录 |

---

## 📦 开源与许可

- **协议**：Apache License 2.0（详见 [`LICENSE`](./LICENSE)）。
- **仓库范围**：本仓库为飞达平台的可运行源代码。**`cms/` 与 `shopxo/` 目录为上游参照源码（SSCMS / ShopXO），不纳入本仓库**，仅作为功能对照基线。
- **Issue / PR**：欢迎通过 GitHub / Gitee 提交问题与新功能建议。

---

## 📥 预构建发布包（GitHub Releases）

每次推送 `v*` 标签，GitHub Actions（[`.github/workflows/release.yml`](./.github/workflows/release.yml)）会自动构建并上传**开箱即用**的可运行程序包到 Release：

| 平台 | 资产 | 使用 |
|------|------|------|
| Linux x64 | `feida-linux-x64.tar.gz` | `tar -xzf feida-linux-x64.tar.gz && cd feida-linux-x64 && ./start.sh` |
| Windows x64 | `feida-win-x64.zip` | 解压后双击 `start.bat` |

包内已含编译产物 `dist/`、生产依赖 `node_modules/`、`package.json`、启动脚本与 `LICENSE`。
默认端口 `3000`（可用 `SERVER_PORT` 覆盖），首次启动自动建库并播种（`data/ehr.db`）。
默认账户：`admin / admin123`、`hr_admin / hr123456`。

> 手动触发：在仓库根目录执行 `git tag v1.0.1 && git push origin v1.0.1` 即可生成对应 Release。

---

## 📝 版本说明

### v1.0.0 (2026-07-10) — 首个开源发布版本
- ✅ 全栈整合：HR + ERP 制造 + CMS 门户 + ShopXO 商城 + AI
- ✅ RBAC 细粒度权限点驱动前端按钮显隐（#108/#128）
- ✅ 站点级权限作用域（#130）
- ✅ 多语言 i18n 骨架与 138 条界面文案（#107/#129）
- ✅ 售后退货退款闭环、商品增强、内容标签/智能提取/批量运维/栏目增强
- ✅ 22 个功能测试脚本，全模块可用
- ✅ 生产模式单端口托管 SPA + API（修复静态资源路径）
