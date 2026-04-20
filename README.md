# 飞达智能 HR 系统

## 快速启动

### 1. 安装依赖
```
npm install
```

### 2. 启动开发服务器
```
npm run dev
```
这会同时启动前端（http://localhost:8080）和后端（http://localhost:3000）。

### 3. 访问系统
打开浏览器访问 http://localhost:8080

### 默认管理员账户
- 用户名：admin
- 密码：admin123

## 项目架构

```
feida/
├── server/              # Express API 服务器（TypeScript）
│   ├── standalone.ts    # 独立服务器入口
│   └── modules/
│       └── database/   # SQLite 数据库服务
├── client/             # React 前端（Vite + TypeScript）
│   └── src/
│       ├── app.tsx     # 路由配置
│       ├── components/ # 公共组件
│       └── pages/      # 页面组件
├── data/               # SQLite 数据库文件（自动创建）
└── dist/               # 构建输出目录
```

## 技术栈

- **前端**: React 19 + Vite 7 + React Router 6 + TailwindCSS 4
- **后端**: Express 4 + better-sqlite3
- **构建**: TypeScript + tsx (开发) / tsc (生产)

## API 接口

所有 API 路由在 `/api` 前缀下：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 登录认证 |
| GET | /api/dashboard/stats | 仪表盘数据 |
| GET | /api/employees | 员工列表 |
| GET | /api/:table | 通用列表查询 |
| GET | /api/:table/:id | 通用单条查询 |
| POST | /api/:table | 通用创建 |
| PUT | /api/:table/:id | 通用更新 |
| DELETE | /api/:table/:id | 通用删除 |
