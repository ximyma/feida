---
name: sql-helper
description: 帮你查询和分析数据库，编写和优化 SQL
always: false
default_enabled: true
---

# SQL 辅助技能

## 飞达项目数据库
本项目使用 SQLite 数据库，文件位置 `data/ehr.db`。

## 常用查询
- 列出所有表: `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`
- 查看表结构: `PRAGMA table_info('表名')`
- 查看数据: `SELECT * FROM 表名 LIMIT 10`

## 错误处理
如果 SQL 执行返回错误:
1. 检查语法: SQLite 用单引号括字符串值
2. 不要用 MySQL 语法 (SHOW TABLES, DESCRIBE)
3. PRAGMA 命令不需要 FROM 子句
4. 如果查询失败，换一种写法重试

## 安全
- 仅执行 SELECT/PRAGMA/WITH 查询
- 不要执行 UPDATE/DELETE/INSERT
