---
name: code-assistant
description: 帮你分析飞达项目代码，理解架构和实现
always: false
default_enabled: true
---

# 飞达项目代码辅助技能

## 项目结构
- `server/` — Node.js + TypeScript 后端 (Express风格路由)
- `client/src/` — React 19 + Ant Design 前端
- `server/standalone.ts` — 主入口 (API路由 + 静态文件)
- `server/ai-service.js` — AI服务 (LLM调用 + 知识库)
- `server/agent/` — Agent系统 (工具/记忆/技能/循环)
- `data/ehr.db` — SQLite 数据库

## 常用探索命令
- 搜索代码: `grep` 查找函数/类定义
- 查看文件: `read_file` 读取源文件
- 查文件列表: `glob` 按模式查找
- 查询数据库: `sql_query` 通过SQL探索表结构

## 代码修改规则
- 修改前必读文件 (用 `read_file`)
- 修改后必验证 (用 `bash` 运行 `npm run build:server`)
- 使用 `patch` 做精确替换 (小改动)
- 使用 `write_file` 写完整文件 (大改动)
