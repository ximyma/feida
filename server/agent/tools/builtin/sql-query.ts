/**
 * sql_query 工具 — 数据库查询
 */
import { BaseTool, ToolParameters, ToolResult } from '../base-tool';
import path from 'path';

import fs from 'fs';

const PROJECT_ROOT = process.cwd();

export class SqlQueryTool extends BaseTool {
  name = "sql_query";
  description = "sql_query tool";
  parameters: ToolParameters = {
    type: 'object',
    properties: {
      sql: { type: 'string', description: 'SQL查询语句' },
      confirm: { type: 'boolean', description: '确认执行(必须为true)' },
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
      const dbPath = path.join(PROJECT_ROOT, 'data', 'ehr.db');
      const db = new betterSqlite3(dbPath, { readonly: true });
      const rows = db.prepare(sql).all();
      db.close();
      return this.ok({ type: 'query', sql, rowCount: rows.length, rows: rows.slice(0, 200) });
    } catch (e: any) {
      return this.fail(`SQL 错误: ${e.message}`);
    }
  }
}
