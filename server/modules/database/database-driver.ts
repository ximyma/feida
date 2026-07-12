/**
 * IDatabaseDriver — 数据库驱动抽象接口
 * 为 SQLite → PostgreSQL 迁移做准备
 *
 * 参照 Odoo ORM: sql_db.py / models.py
 * SQLite 驱动: 同步 (better-sqlite3)
 * PG 驱动: 异步 (pg-pool)
 * 接口使用联合类型兼容两者
 */
export interface IDatabaseDriver {
  query(sql: string, params?: any[]): any[] | Promise<any[]>;
  get(sql: string, params?: any[]): any | null | Promise<any | null>;
  run(sql: string, params?: any[]): { changes: number; lastInsertRowid?: number | bigint } | Promise<{ changes: number }>;
  exec(sql: string): void | Promise<void>;
  prepare(sql: string): IPreparedStatement;
  getTableInfo(table: string): Array<any> | Promise<Array<any>>;
  listTables(): string[] | Promise<string[]>;
  insert(table: string, data: Record<string, any>): { id: string } | Promise<{ id: string }>;
  update(table: string, id: string, data: Record<string, any>): { changes: number } | Promise<{ changes: number }>;
  delete(table: string, id: string): { changes: number } | Promise<{ changes: number }>;
  backup(targetPath: string): Promise<void>;
  close(): void;
}

export interface IPreparedStatement {
  all(...params: any[]): any[] | Promise<any[]>;
  get(...params: any[]): any | null | Promise<any | null>;
  run(...params: any[]): { changes: number; lastInsertRowid?: number | bigint } | Promise<{ changes: number }>;
}

export type DriverType = 'sqlite' | 'postgres';