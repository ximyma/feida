# 飞达智能 HR 系统 — 程序与数据库初始化指南

> 适用于 v1.0.0。系统采用 **SQLite 文件数据库 + 首次启动自动建表与播种** 的设计，绝大多数情况下无需手动初始化。

---

## 一、程序初始化（首次运行）

### 1.1 安装依赖

```bash
npm install --legacy-peer-deps
```

> ⚠️ 项目 `package.json` 未完整声明全部历史依赖。请务必使用 `--legacy-peer-deps`，否则 `npm` 会以 `package.json` 为基准执行 prune，导致 `antd` 等核心包被移除、前端编译失败。

### 1.2 启动方式

**开发模式**（前端热更新 + 后端 watch）：
```bash
npm run dev
# 前端 http://localhost:8080 | 后端 API http://localhost:3000/api
```

**生产模式**（单端口托管 SPA + API，**推荐**）：
```bash
npm run build      # 同时构建 server(tsc) 与 client(vite)
npm start          # 运行 dist/server/standalone.js
# 默认 http://localhost:3000 （SPA 与 API 同端口）
SERVER_PORT=3400 npm start   # 自定义端口
```

### 1.3 自动初始化流程

执行 `npm start`（或 `npm run dev:server`）后，后端在监听前自动完成：

1. 创建 `data/` 目录（若不存在）。
2. 打开 / 创建 SQLite 文件 **`data/ehr.db`**。
3. 执行建表（`database.service.ts` 内含 70+ 张业务表 DDL）。
4. 执行迁移（`ALTER TABLE ... ADD COLUMN`，兼容旧库，幂等）。
5. 播种默认数据：
   - **用户与角色**（见第二节）。
   - **RBAC 目录与内置角色**（`ensureRbacSeeded`：细粒度权限点 + 站点作用域 `siteScope`）。
   - **CMS 数据**（`seedCmsShopData`：栏目、文章、地区三级联动 `shop_region` 1399 条、支付方式、系统配置、装修页等）。
   - **AI 知识库**（默认 HR 知识条目）。
6. 监听 `SERVER_PORT`（默认 3000）。

> 启动日志示例：`[Database] SQLite at D:\feida\data\ehr.db` → `[Database] Seeding completed`。

---

## 二、默认账户

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| `admin` | `admin123` | 超级管理员 (`role_super_admin`) | 全部权限，含系统管理 |
| `hr_admin` | `hr123456` | HR 管理员 (`role_hr_admin`) | 人事/考勤/薪酬/绩效/招聘/培训/审批/统计 |
| `hr_staff` | `hr123456` | 人事专员 (`role_hr_staff`) | 人事/考勤/薪酬/审批 |

内置角色集：`super_admin` / `sys_admin` / `hr_admin` / `hr_staff` / `dept_manager` / `employee`。

> ⚠️ 生产环境请立即修改默认密码（登录后「系统管理 → 用户管理」或调用 `/api/auth/change-password`）。

---

## 三、权限与站点作用域

- **细粒度权限点**：如 `cms:article:delete`、`cms:channel:manage`、`cms:comment:moderate`、`shop:goods:manage`。角色 `permissionIds` 存权限点数组，前端 `usePermission().can('point')` 控制按钮显隐。
- **站点作用域**：角色 `siteScope` 存站点码数组，`["*"]` 表示全部；可选 `main`(主站) / `shop`(商城) / `portal`(门户资讯)。`POST /api/rbac/resolve` 返回权限点与站点并集。
- 端点：`GET /api/rbac/sites`、`GET /api/rbac/roles`、`POST /api/rbac/roles`、`POST /api/rbac/resolve`。

---

## 四、数据库结构概览

| 分类 | 代表性表 |
|------|----------|
| 核心 HR | `employees`、`emp_contracts`、`attendance_records`、`attendance_rules`、`leave_records`、`salaries`、`salary_items`、`performance_records`、`recruitment_positions`、`training_courses` |
| 审批/工作流 | `approval_requests`、`approval_history`、`approval_flows`、`workflow_definitions`、`workflow_instances` |
| ERP 制造 | `product`、`plm_bom`、`warehouse`、`warehouse_stock`、`sales_orders`、`purchase_orders`、`production_orders`、`finance_vouchers`、`quality_checks` |
| CMS 门户 | `cms_channels`、`cms_articles`、`cms_comments`、`cms_tags`、`cms_materials`、`cms_forms`、`cms_config` |
| 商城 Shop | `shop_goods`、`shop_orders`、`shop_categories`、`shop_brands`、`shop_coupons`、`shop_distribution`、`shop_region`、`shop_aftersale`、`shop_stock_logs` |
| 权限/系统 | `users`、`roles`、`rbac_*`、`sys_config`、`i18n_messages` |
| AI | `ai_knowledge`、`ai_conversations`、`ai_alert_rules` |

> 通用 CRUD：`GET/POST /:table`、`GET/PUT/DELETE /:table/:id`（受白名单约束）。

---

## 五、环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SERVER_PORT` | `3000` | 服务端口 |
| `SERVER_HOST` | `localhost` | 绑定地址（`0.0.0.0` 可外网访问） |
| `DEEPSEEK_API_KEY` | (空) | DeepSeek API 密钥（AI 功能可选，也可在「系统管理 → AI 配置」页设置） |

---

## 六、重置 / 重建数据库

```bash
# 1. 停止服务
# 2. 删除数据库文件（将丢失所有数据，仅保留代码）
rm -f data/ehr.db data/ehr.db-shm data/ehr.db-wal

# 3. 重新启动，自动重新建表并播种
npm start
```

---

## 七、数据备份

SQLite 为单文件数据库，直接复制即可备份：

```bash
# Windows
copy data\ehr.db data\ehr_backup_%date:~0,10%.db

# macOS / Linux
cp data/ehr.db "data/ehr_backup_$(date +%F).db"
```

建议定期备份 `data/` 目录；生产环境可配合定时任务或存储快照。

---

## 八、首次启动检查清单

- [ ] Node.js ≥ 22.x 已安装
- [ ] `npm install --legacy-peer-deps` 成功
- [ ] `npm run build` 无报错
- [ ] `npm start` 后日志出现 `Seeding completed`
- [ ] 浏览器访问 `http://localhost:3000` 看到登录页
- [ ] 使用 `admin / admin123` 登录成功
- [ ] 进入「系统管理 → 角色管理」可见站点作用域配置
- [ ] 右上角语言切换中 / English 生效
- [ ] （可选）「系统管理 → AI 配置」填入 API Key 后测试 AI 助手
