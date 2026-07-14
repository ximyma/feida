/**
 * ORM Model 基类 — 参照 Odoo models.BaseModel
 *
 * 核心能力:
 *   1. _name   → 表名
 *   2. _fields → 字段声明(自动建表+迁检)
 *   3. _inherit → 模型继承(扩展已有表)
 *   4. search/create/write/unlink → 标准CRUD
 *   5. browse(id) → 读取单条
 */
import { IDatabaseDriver } from '../database/database-driver';
import { FieldDefinition, fieldToColumnDDL, validateField, coerceField } from './fields';
import { nanoid } from 'nanoid';

export interface ModelOptions {
  /** 表名 (对应 Odoo _name) */
  _name: string;
  /** 字段定义 */
  _fields: Record<string, FieldDefinition>;
  /** 继承模型 */
  _inherit?: string;
  /** 人类可读描述 */
  _description?: string;
  /** 排序 */
  _order?: string;
  /** 表显名列 */
  _rec_name?: string;
}

export class BaseModel {
  readonly _name: string;
  readonly _inherit?: string;
  _fields: Record<string, FieldDefinition>;
  _description: string;
  _order: string;
  _rec_name: string;

  constructor(
    protected db: IDatabaseDriver,
    options: ModelOptions,
  ) {
    this._name = options._name;
    this._inherit = options._inherit;
    this._fields = { ...options._fields };
    this._description = options._description || options._name;
    this._order = options._order || 'id DESC';
    this._rec_name = options._rec_name || 'name';
  }

  // ========== Schema 管理 ==========

  /** 自动建表 (如果不存在) */
  ensureTable(): void {
    const hasInherit = this._inherit;
    const cols: string[] = [];
    if (!hasInherit) {
      // 新表: 完整创建
      cols.push('id TEXT PRIMARY KEY');
      for (const [name, field] of Object.entries(this._fields)) {
        cols.push(fieldToColumnDDL(name, field));
      }
      cols.push('created_at TEXT DEFAULT CURRENT_TIMESTAMP');
      cols.push('updated_at TEXT DEFAULT CURRENT_TIMESTAMP');

      try {
        (this.db as any).db.exec(`CREATE TABLE IF NOT EXISTS ${this._name} (${cols.join(', ')})`);
      } catch (e: any) { /* race */ }
    } else {
      // 继承: 只加增量列
      this.migrateColumns();
    }
  }

  /** 表继承：为_inherit表添加新增列 */
  migrateColumns(): void {
    if (!this._inherit) return;
    const existing = this.getTableColumns(this._inherit);
    for (const [name, field] of Object.entries(this._fields)) {
      if (!existing.includes(name)) {
        try {
          (this.db as any).db.exec(`ALTER TABLE ${this._inherit} ADD COLUMN ${fieldToColumnDDL(name, field)}`);
        } catch (e: any) {
          // 列已存在, 忽略
        }
      }
    }
  }

  /** 获取表现有列名 */
  getTableColumns(table: string): string[] {
    try {
      const info = this.db.getTableInfo(table) as any[];
      return Array.isArray(info) ? info.map(c => c.name) : [];
    } catch { return []; }
  }

  // ========== CRUD 操作 ==========

  /** 搜索 */
  search(domain: Record<string, any> = {}, options?: { limit?: number; offset?: number; order?: string }): any[] {
    const keys = Object.keys(domain);
    if (keys.length === 0) {
      const rows = this.db.query(`SELECT * FROM ${this._inherit || this._name} ORDER BY ${options?.order || this._order} LIMIT ? OFFSET ?`,
        [options?.limit || 1000, options?.offset || 0]);
      return Array.isArray(rows) ? rows : [];
    }
    const clauses = keys.map(k => `${k} = ?`).join(' AND ');
    const sql = `SELECT * FROM ${this._inherit || this._name} WHERE ${clauses} ORDER BY ${options?.order || this._order} LIMIT ? OFFSET ?`;
    const params = [...keys.map(k => domain[k]), options?.limit || 1000, options?.offset || 0];
    const rows = this.db.query(sql, params);
    return Array.isArray(rows) ? rows : [];
  }

  /** 计数 */
  searchCount(domain: Record<string, any> = {}): number {
    const keys = Object.keys(domain);
    if (keys.length === 0) {
      const r = this.db.get(`SELECT COUNT(*) as c FROM ${this._inherit || this._name}`) as any;
      return r?.c || 0;
    }
    const clauses = keys.map(k => `${k} = ?`).join(' AND ');
    const r = this.db.get(`SELECT COUNT(*) as c FROM ${this._inherit || this._name} WHERE ${clauses}`, keys.map(k => domain[k])) as any;
    return r?.c || 0;
  }

  /** 读取单条 */
  browse(id: string): any | null {
    return this.db.get(`SELECT * FROM ${this._inherit || this._name} WHERE id = ?`, [id]);
  }

  /** 创建 */
  create(values: Record<string, any>): any {
    const coerced: Record<string, any> = {};
    for (const [key, val] of Object.entries(values)) {
      const field = this._fields[key];
      if (field) coerced[key] = coerceField(field, val);
    }
    if (!coerced.id) coerced.id = nanoid(16);
    return this.db.insert(this._inherit || this._name, coerced);
  }

  /** 更新 */
  write(id: string, values: Record<string, any>): any {
    const coerced: Record<string, any> = {};
    for (const [key, val] of Object.entries(values)) {
      const field = this._fields[key];
      if (field) coerced[key] = coerceField(field, val);
      else coerced[key] = val;
    }
    coerced.updated_at = new Date().toISOString();
    return this.db.update(this._inherit || this._name, id, coerced);
  }

  /** 删除 */
  unlink(id: string): any {
    return this.db.delete(this._inherit || this._name, id);
  }

  /** 校验输入 */
  validate(values: Record<string, any>): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const [name, field] of Object.entries(this._fields)) {
      const err = validateField(name, field, values[name]);
      if (err) errors[name] = err;
    }
    return errors;
  }

  /** 获取字段列表(前用) */
  getFieldDefs(): Array<{ name: string; type: string; label: string; required: boolean; selection?: any[] }> {
    return Object.entries(this._fields).map(([name, f]) => ({
      name, type: f.type, label: f.label || name, required: f.required || false, selection: f.selection,
    }));
  }
}
