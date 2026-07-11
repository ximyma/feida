/**
 * sql_query 工具 — 数据库查询
 */
import { BaseTool, ToolParameters, ToolResult } from '../base-tool';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const DB_PATH = path.join(PROJECT_ROOT, 'data', 'ehr.db');

export class SqlQueryTool extends BaseTool {
  name = 'sql_query';
  description = '执行 SQL 查询。参数: sql(SQL语句), confirm(必须为true)。数据库是 SQLite，查表名用 SELECT name FROM sqlite_master WHERE type="table"，查结构用 PRAGMA table_info("表名")';
  parameters: ToolParameters = {
    type: 'object',
    properties: {
      sql: { type: 'string', description: 'SQL 查询语句 (SELECT 或 PRAGMA)' },
      confirm: { type: 'boolean', description: '必须为 true 才会执行' },
    },
    required: ['sql', 'confirm'],
  };

  async execute(params: any): Promise<ToolResult> {
    if (!params.confirm) return this.fail('请设置 confirm: true 确认执行');
    const sql = params.sql?.trim();
    if (!sql) return this.fail('SQL 为空');
    if (!/^(SELECT|PRAGMA|WITH|EXPLAIN)/i.test(sql)) {
      return this.fail('仅允许 SELECT/PRAGMA/WITH 查询');
    }

    try {
      const betterSqlite3 = require('better-sqlite3');
      const db = new betterSqlite3(DB_PATH, { readonly: true });
      const rows = db.prepare(sql).all();
      db.close();
      return this.ok({ type: 'query', sql, rowCount: rows.length, rows: rows.slice(0, 200) });
    } catch (e: any) {
      return this.fail(`SQL 错误: ${e.message}`);
    }
  }
}
