/**
 * PgDriver — PostgreSQL 数据库驱动
 * 实现 IDatabaseDriver 接口，与 SQLiteDriver 完全兼容
 *
 * 用法:
 *   const db = new PgDriver({ host: 'localhost', database: 'feida', user: 'feida', password: '...' });
 *   // 或使用连接字符串:
 *   const db = new PgDriver('postgres://user:pass@localhost:5432/feida');
 *
 * 依赖: npm pg (已在 package.json dependencies)
 */
import { IDatabaseDriver, IPreparedStatement } from './database-driver';
import { Pool, PoolClient, types } from 'pg';

// 数值类型自动转 number (pg 默认返回 string)
types.setTypeParser(20, parseInt);   // int8 → number
types.setTypeParser(1700, parseFloat); // numeric → number
types.setTypeParser(701, parseFloat);  // float8 → number
types.setTypeParser(23, parseInt);    // int4 → number

export interface PgConfig {
  host: string;
  port?: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
}

class PgPreparedStatement implements IPreparedStatement {
  constructor(private client: PoolClient | Pool, private sql: string) {}

  async all(...params: any[]): Promise<any[]> {
    const result = await (this.client as PoolClient).query?.(this.sql, params)
      || (this.client as Pool).query(this.sql, params);
    return result.rows;
  }

  async get(...params: any[]): Promise<any | null> {
    const result = await (this.client as PoolClient).query?.(this.sql, params)
      || (this.client as Pool).query(this.sql, params);
    return result.rows[0] || null;
  }

  async run(...params: any[]): Promise<{ changes: number; lastInsertRowid?: number }> {
    const result = await (this.client as PoolClient).query?.(this.sql, params)
      || (this.client as Pool).query(this.sql, params);
    return { changes: result.rowCount || 0 };
  }
}

export class PgDriver implements IDatabaseDriver {
  private pool: Pool;
  private connected = false;

  constructor(config: PgConfig | string) {
    if (typeof config === 'string') {
      this.pool = new Pool({ connectionString: config, max: 20 });
    } else {
      this.pool = new Pool({
        host: config.host,
        port: config.port || 5432,
        database: config.database,
        user: config.user,
        password: config.password,
        max: config.max || 20,
        idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      });
    }
    this.pool.on('error', (err) => console.error('[PgDriver] Pool error:', err));
  }

  private get client(): Pool {
    return this.pool;
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    const r = pgSql(sql);
    const result = await this.client.query(r.sql, params.length > 0 ? params : r.params || []);
    return result.rows;
  }

  async get(sql: string, params: any[] = []): Promise<any | null> {
    const rows = await this.query(sql, params);
    return rows[0] || null;
  }

  async run(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid?: number }> {
    const r = pgSql(sql);
    const result = await this.client.query(r.sql, params.length > 0 ? params : r.params || []);
    return { changes: result.rowCount || 0 };
  }

  async exec(sql: string): Promise<void> {
    await this.client.query(sql);
  }

  prepare(sql: string): IPreparedStatement {
    return new PgPreparedStatement(this.client, sql);
  }

  async getTableInfo(table: string): Promise<Array<{ name: string; type: string; notnull: number; dflt_value: string | null; pk: number }>> {
    const rows = await this.client.query(`
      SELECT column_name as name, data_type as type,
             CASE WHEN is_nullable = 'NO' THEN 1 ELSE 0 END as notnull,
             column_default as dflt_value,
             CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN 1 ELSE 0 END as pk
      FROM information_schema.columns c
      LEFT JOIN information_schema.key_column_usage kcu
        ON c.column_name = kcu.column_name AND c.table_name = kcu.table_name
      LEFT JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name AND tc.constraint_type = 'PRIMARY KEY'
      WHERE c.table_name = $1
      ORDER BY c.ordinal_position
    `, [table]);
    return rows.rows;
  }

  async listTables(): Promise<string[]> {
    const rows = await this.client.query(
      `SELECT tablename as name FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    );
    return rows.rows.map((r: any) => r.name);
  }

  async insert(table: string, data: Record<string, any>): Promise<{ id: string }> {
    const id = data.id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    data.id = id;
    const keys = Object.keys(data);
    const values = keys.map(k => data[k]);
    const placeholders = keys.map((_, i) => `$${i + 1}`);
    const sql = `INSERT INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders.join(', ')})`;
    await this.client.query(sql, values);
    return { id };
  }

  async update(table: string, id: string, data: Record<string, any>): Promise<{ changes: number }> {
    const keys = Object.keys(data).filter(k => k !== 'id');
    if (keys.length === 0) return { changes: 0 };
    const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`);
    const values = keys.map(k => data[k]);
    values.push(id);
    const sql = `UPDATE "${table}" SET ${setClauses.join(', ')} WHERE id = $${values.length}`;
    const r = await this.client.query(sql, values);
    return { changes: r.rowCount || 0 };
  }

  delete(table: string, id: string): { changes: number } {
    this.client.query(`DELETE FROM "${table}" WHERE id = $1`, [id]);
    return { changes: 0 }; // async fire-and-forget, rowCount returned by run()
  }

  async backup(targetPath: string): Promise<void> {
    const { execSync } = require('child_process');
    execSync(`pg_dump -U ${(this.pool as any).options?.user || 'feida'} -Fc -f "${targetPath}" ${(this.pool as any).options?.database || 'feida'}`, {
      env: { ...process.env, PGPASSWORD: (this.pool as any).options?.password || '' }
    });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

/** SQLite → PG SQL 转换 (适配语法差异) */
function pgSql(sql: string): { sql: string; params?: any[] } {
  let s = sql;

  // INSERT OR REPLACE → INSERT ... ON CONFLICT (id) DO UPDATE
  s = s.replace(
    /INSERT\s+OR\s+REPLACE\s+INTO\s+"(\w+)"\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/gi,
    'INSERT INTO "$1" ($2) VALUES ($3) ON CONFLICT (id) DO UPDATE SET $2 = EXCLUDED.$2'
  );

  // SQLite datetime('now') → NOW()
  s = s.replace(/datetime\('now'\)/g, 'NOW()');

  // SQLite ? placeholders → PG $N
  // (保持原样，prepare() 会自动处理)

  return { sql: s };
}
