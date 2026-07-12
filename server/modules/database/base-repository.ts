/**
 * Repository 基类 — 参照 Odoo ORM model 模式
 * 替代裸 db.query() 调用，封装业务查询逻辑
 *
 * 用法:
 *   class EmployeeRepo extends BaseRepository {
 *     tableName = 'employees';
 *     findByDepartment(deptId: string) { return this.where({ deptId }); }
 *   }
 */
import { IDatabaseDriver } from './database-driver';

export abstract class BaseRepository {
  abstract tableName: string;
  protected db: IDatabaseDriver;

  constructor(db: IDatabaseDriver) {
    this.db = db;
  }

  /** 查询所有 */
  findAll(orderBy?: string, limit?: number): any[] {
    let sql = `SELECT * FROM "${this.tableName}"`;
    if (orderBy) sql += ` ORDER BY ${orderBy}`;
    if (limit) sql += ` LIMIT ${limit}`;
    return this.db.query(sql);
  }

  /** 按 ID 查找 */
  findById(id: string): any | null {
    return this.db.get(`SELECT * FROM "${this.tableName}" WHERE id = ?`, [id]);
  }

  /** 条件查询 */
  where(conditions: Record<string, any>, orderBy?: string): any[] {
    const keys = Object.keys(conditions);
    const clauses = keys.map(k => `"${k}" = ?`).join(' AND ');
    const values = keys.map(k => conditions[k]);
    let sql = `SELECT * FROM "${this.tableName}" WHERE ${clauses}`;
    if (orderBy) sql += ` ORDER BY ${orderBy}`;
    return this.db.query(sql, values);
  }

  /** 计数 */
  count(conditions?: Record<string, any>): number {
    if (!conditions || Object.keys(conditions).length === 0) {
      const r = this.db.get(`SELECT COUNT(*) as cnt FROM "${this.tableName}"`);
      return r?.cnt || 0;
    }
    const keys = Object.keys(conditions);
    const clauses = keys.map(k => `"${k}" = ?`).join(' AND ');
    const r = this.db.get(`SELECT COUNT(*) as cnt FROM "${this.tableName}" WHERE ${clauses}`, keys.map(k => conditions[k]));
    return r?.cnt || 0;
  }

  /** 插入 */
  create(data: Record<string, any>): { id: string } {
    return this.db.insert(this.tableName, data);
  }

  /** 更新 */
  update(id: string, data: Record<string, any>): { changes: number } {
    return this.db.update(this.tableName, id, data);
  }

  /** 删除 */
  delete(id: string): { changes: number } {
    return this.db.delete(this.tableName, id);
  }

  /** 分页 */
  paginate(page: number, pageSize: number, conditions?: Record<string, any>, orderBy?: string): { items: any[]; total: number } {
    const total = this.count(conditions);
    const offset = (page - 1) * pageSize;
    const keys = conditions ? Object.keys(conditions) : [];
    const clauses = keys.length > 0 ? `WHERE ${keys.map(k => `"${k}" = ?`).join(' AND ')}` : '';
    const values = keys.map(k => conditions![k]);
    let sql = `SELECT * FROM "${this.tableName}" ${clauses}`;
    if (orderBy) sql += ` ORDER BY ${orderBy}`;
    sql += ` LIMIT ${pageSize} OFFSET ${offset}`;
    return { items: this.db.query(sql, values), total };
  }
}

/** 轻量级查询构建器 — 链式调用替代裸 SQL 拼接 */
export class QueryBuilder {
  private table: string;
  private _select = '*';
  private _where: string[] = [];
  private _params: any[] = [];
  private _orderBy = '';
  private _limit = 0;
  private _offset = 0;

  constructor(private db: IDatabaseDriver, table: string) {
    this.table = table;
  }

  select(cols: string) { this._select = cols; return this; }
  eq(field: string, value: any) { this._where.push(`"${field}" = ?`); this._params.push(value); return this; }
  like(field: string, value: string) { this._where.push(`"${field}" LIKE ?`); this._params.push(`%${value}%`); return this; }
  gt(field: string, value: any) { this._where.push(`"${field}" > ?`); this._params.push(value); return this; }
  lt(field: string, value: any) { this._where.push(`"${field}" < ?`); this._params.push(value); return this; }
  in(field: string, values: any[]) { this._where.push(`"${field}" IN (${values.map(() => '?').join(',')})`); this._params.push(...values); return this; }
  orderBy(field: string, dir: 'ASC' | 'DESC' = 'ASC') { this._orderBy = `ORDER BY ${field} ${dir}`; return this; }
  limit(n: number) { this._limit = n; return this; }
  offset(n: number) { this._offset = n; return this; }

  all(): any[] {
    const where = this._where.length > 0 ? `WHERE ${this._where.join(' AND ')}` : '';
    let sql = `SELECT ${this._select} FROM "${this.table}" ${where} ${this._orderBy}`.trim();
    if (this._limit > 0) { sql += ` LIMIT ${this._limit}`; if (this._offset > 0) sql += ` OFFSET ${this._offset}`; }
    return this.db.query(sql, this._params);
  }

  first(): any | null {
    const rows = this.limit(1).all();
    return rows[0] || null;
  }

  count(): number {
    const where = this._where.length > 0 ? `WHERE ${this._where.join(' AND ')}` : '';
    const r = this.db.query(`SELECT COUNT(*) as cnt FROM "${this.table}" ${where}`, this._params);
    return r[0]?.cnt || 0;
  }
}
