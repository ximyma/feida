/**
 * IDatabaseDriver — 数据库驱动抽象接口
 * 为 SQLite → PostgreSQL 迁移做准备
 *
 * 参照 Odoo ORM: sql_db.py / models.py
 * 当前实现: SQLiteDriver (better-sqlite3)
 * 未来实现: PgDriver (pg / pg-pool)
 *
 * 设计原则:
 *   1. 接口 = 最小公共能力 (CRUD + 迁移 + 备份)
 *   2. SQL 保持标准，避免 PRAGMA 等私有语法
 *   3. Repository 层封装业务查询
 *   4. 驱动切换 = 改一行配置
 */
export interface IDatabaseDriver {
  /** 执行查询，返回行数组 */
  query(sql: string, params?: any[]): any[];

  /** 执行单条查询，返回第一行或 null */
  get(sql: string, params?: any[]): any | null;

  /** 执行非查询语句 (INSERT/UPDATE/DELETE) */
  run(sql: string, params?: any[]): { changes: number; lastInsertRowid?: number | bigint };

  /** 批量执行 (事务内) */
  exec(sql: string): void;

  /** 预处理语句工厂 */
  prepare(sql: string): IPreparedStatement;

  /** 表信息查询 */
  getTableInfo(table: string): Array<{ name: string; type: string; notnull: number; dflt_value: string | null; pk: number }>;

  /** 列出所有表名 */
  listTables(): string[];

  /** 插入一行，返回 id */
  insert(table: string, data: Record<string, any>): { id: string };

  /** 更新一行 */
  update(table: string, id: string, data: Record<string, any>): { changes: number };

  /** 删除一行 */
  delete(table: string, id: string): { changes: number };

  /** 数据库备份 */
  backup(targetPath: string): Promise<void>;

  /** 关闭连接 */
  close(): void;
}

export interface IPreparedStatement {
  all(...params: any[]): any[];
  get(...params: any[]): any | null;
  run(...params: any[]): { changes: number; lastInsertRowid?: number | bigint };
}

/** 驱动类型 */
export type DriverType = 'sqlite' | 'postgres';
