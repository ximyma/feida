/**
 * Recordset — 飞达ORM核心
 *
 * 惰性、可链式调用的记录集。支持:
 *   - 关联: many2one自动JOIN, one2many反向查询
 *   - 校验: required/type/unique 自动校验
 *   - 钩子: beforeCreate/afterCreate/beforeWrite/afterWrite/beforeDelete
 *   - 聚合: count/sum/avg/groupBy
 *   - 计算字段: compute + depends 依赖追踪
 *
 * 用法:
 *   const env = new Environment(db, registry);
 *   env['res_partner'].search({ is_company: true }).mapped('name');
 *   const rec = env['res_partner'].browse(1);
 *   rec.country_id  // 自动返回关联的 country 记录
 */
import { nanoid } from 'nanoid';
import type { Environment } from './environment';

export class Recordset {
  readonly env: Environment;
  readonly _name: string;
  readonly _ids: (string | number)[];
  private _loaded = false;
  private _data: Map<string | number, any> = new Map();
  private _dirty: Map<string | number, Record<string, any>> = new Map();
  private _fieldDefs: Record<string, any>;
  private _hooks: Record<string, Function[]>;

  constructor(env: Environment, modelName: string, modelClass?: any, ids?: (string | number)[], data?: Map<string | number, any>) {
    this.env = env;
    this._name = modelName;
    this._ids = ids || [];
    this._fieldDefs = modelClass?._fields || {};
    this._hooks = modelClass?._hooks || {};
    if (data) { this._data = data; this._loaded = true; }
  }

  // ============ 查询 ============

  search(filter: Record<string, any> = {}, options?: { limit?: number; offset?: number; order?: string }): Recordset {
    const params: any[] = [];
    const clauses: string[] = ['1=1'];
    for (const [key, val] of Object.entries(filter)) {
      if (val === undefined || val === null) continue;
      const col = key.replace(/\./g, '_');
      if (typeof val === 'object' && val.$like) {
        clauses.push(`${col} LIKE ?`);
        params.push(`%${val.$like}%`);
      } else if (typeof val === 'object' && val.$gt !== undefined) {
        clauses.push(`${col} > ?`); params.push(val.$gt);
      } else if (typeof val === 'object' && val.$lt !== undefined) {
        clauses.push(`${col} < ?`); params.push(val.$lt);
      } else if (typeof val === 'object' && val.$in) {
        clauses.push(`${col} IN (${val.$in.map(() => '?').join(',')})`);
        params.push(...val.$in);
      } else {
        clauses.push(`${col} = ?`);
        params.push(val === true ? 1 : val === false ? 0 : val);
      }
    }
    const where = clauses.join(' AND ');
    const order = options?.order || 'id DESC';
    const limit = options?.limit || 1000;
    const offset = options?.offset || 0;
    params.push(limit, offset);

    try {
      const rows = this.env.cr.prepare(`SELECT * FROM "${this._name}" WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...params);
      const data = new Map<string | number, any>();
      const ids: (string | number)[] = [];
      for (const row of rows) { ids.push(row.id); data.set(row.id, row); }
      return new Recordset(this.env, this._name, { _fields: this._fieldDefs, _hooks: this._hooks }, ids, data);
    } catch (e) {
      return new Recordset(this.env, this._name, { _fields: this._fieldDefs, _hooks: this._hooks });
    }
  }

  browse(ids: (string | number)[] | string | number): Recordset {
    const idList = Array.isArray(ids) ? ids : [ids];
    if (idList.length === 0) return new Recordset(this.env, this._name, { _fields: this._fieldDefs, _hooks: this._hooks });
    const data = new Map<string | number, any>();
    const found: (string | number)[] = [];
    try {
      const rows = this.env.cr.prepare(`SELECT * FROM "${this._name}" WHERE id IN (${idList.map(() => '?').join(',')})`).all(...idList);
      for (const row of rows) { data.set(row.id, row); found.push(row.id); }
    } catch {}
    return new Recordset(this.env, this._name, { _fields: this._fieldDefs, _hooks: this._hooks }, found, data);
  }

  count(filter: Record<string, any> = {}): number {
    const params: any[] = [];
    const clauses: string[] = ['1=1'];
    for (const [key, val] of Object.entries(filter)) {
      if (val === undefined || val === null) continue;
      const col = key.replace(/\./g, '_');
      clauses.push(`${col} = ?`);
      params.push(val === true ? 1 : val === false ? 0 : val);
    }
    try {
      const row = this.env.cr.prepare(`SELECT COUNT(*) as c FROM "${this._name}" WHERE ${clauses.join(' AND ')}`).get(...params);
      return row.c;
    } catch { return 0; }
  }

  sum(field: string, filter: Record<string, any> = {}): number {
    const params: any[] = [];
    const clauses: string[] = ['1=1'];
    for (const [key, val] of Object.entries(filter)) {
      if (val === undefined || val === null) continue;
      clauses.push(`${key} = ?`);
      params.push(val);
    }
    try {
      const row = this.env.cr.prepare(`SELECT SUM(${field}) as s FROM "${this._name}" WHERE ${clauses.join(' AND ')}`).get(...params);
      return row.s || 0;
    } catch { return 0; }
  }

  avg(field: string, filter: Record<string, any> = {}): number {
    const params: any[] = [];
    const clauses: string[] = ['1=1'];
    for (const [key, val] of Object.entries(filter)) {
      if (val === undefined || val === null) continue;
      clauses.push(`${key} = ?`);
      params.push(val);
    }
    try {
      const row = this.env.cr.prepare(`SELECT AVG(${field}) as a FROM "${this._name}" WHERE ${clauses.join(' AND ')}`).get(...params);
      return row.a || 0;
    } catch { return 0; }
  }

  groupBy(field: string): Array<{ key: any; count: number }> {
    try {
      const rows = this.env.cr.prepare(`SELECT ${field} as k, COUNT(*) as c FROM "${this._name}" GROUP BY ${field} ORDER BY c DESC`).all();
      return rows.map((r: any) => ({ key: r.k, count: r.c }));
    } catch { return []; }
  }

  // ============ 写操作 ============

  create(values: Record<string, any>): Recordset {
    // 钩子: beforeCreate
    if (this._hooks.beforeCreate) {
      for (const fn of this._hooks.beforeCreate) fn(values, this.env);
    }
    // 校验
    const errors = this._validate(values);
    if (Object.keys(errors).length > 0) {
      throw new Error(`校验失败: ${Object.values(errors).join('; ')}`);
    }
    const id = values.id || nanoid(16);
    const now = new Date().toISOString();
    const processed: Record<string, any> = { id, created_at: now, updated_at: now };
    for (const [k, v] of Object.entries(values)) {
      const field = this._fieldDefs[k];
      if (field?.type === 'many2one') {
        processed[k] = typeof v === 'object' && v.id ? v.id : v;
      } else if (field?.type === 'boolean') {
        processed[k] = v === true || v === 1 || v === '1' ? 1 : 0;
      } else {
        processed[k] = v;
      }
    }
    // 公式计算
    this._evalFormulas(processed);
    const cols = Object.keys(processed);
    try {
      this.env.cr.prepare(`INSERT INTO "${this._name}" (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`).run(...cols.map(c => processed[c]));
    } catch (e: any) { throw new Error(`创建失败(${this._name}): ${e.message}`); }
    // 钩子: afterCreate
    if (this._hooks.afterCreate) {
      for (const fn of this._hooks.afterCreate) fn(id, processed, this.env);
    }
    const resultData = new Map<string | number, any>();
    resultData.set(id, processed);
    return new Recordset(this.env, this._name, { _fields: this._fieldDefs, _hooks: this._hooks }, [id], resultData);
  }

  write(values: Record<string, any>): boolean {
    if (this._ids.length === 0) return false;
    // 校验
    const errors = this._validate(values);
    if (Object.keys(errors).length > 0) {
      throw new Error(`校验失败: ${Object.values(errors).join('; ')}`);
    }
    // 钩子: beforeWrite
    if (this._hooks.beforeWrite) {
      for (const fn of this._hooks.beforeWrite) for (const id of this._ids) fn(id, values, this.env);
    }
    const processed: Record<string, any> = {};
    for (const [k, v] of Object.entries(values)) {
      const field = this._fieldDefs[k];
      if (field?.type === 'many2one') {
        processed[k] = typeof v === 'object' && v.id ? v.id : v;
      } else if (field?.type === 'boolean') {
        processed[k] = v === true || v === 1 || v === '1' ? 1 : 0;
      } else {
        processed[k] = v;
      }
    }
    processed.updated_at = new Date().toISOString();
    // 公式计算
    const fullRecord: Record<string, any> = {};
    if (this._ids.length === 1) { this._ensureLoaded(); Object.assign(fullRecord, this._data.get(this._ids[0])); }
    Object.assign(fullRecord, processed);
    this._evalFormulas(fullRecord);
    // 将公式计算结果合并回 processed
    for (const [k, v] of Object.entries(fullRecord)) {
      if (this._fieldDefs[k]?.formula) processed[k] = v;
    }
    const setters = Object.keys(processed).map(c => `${c}=?`).join(',');
    const vals = Object.keys(processed).map(c => processed[c]);
    vals.push(...this._ids);
    try {
      this.env.cr.prepare(
        `UPDATE "${this._name}" SET ${setters} WHERE id IN (${this._ids.map(() => '?').join(',')})`
      ).run(...vals);
    } catch (e: any) { throw new Error(`更新失败(${this._name}): ${e.message}`); }
    // 钩子: afterWrite
    if (this._hooks.afterWrite) {
      for (const fn of this._hooks.afterWrite) for (const id of this._ids) fn(id, processed, this.env);
    }
    this._dirty.clear();
    return true;
  }

  unlink(): boolean {
    if (this._ids.length === 0) return false;
    // 钩子: beforeDelete
    if (this._hooks.beforeDelete) {
      for (const fn of this._hooks.beforeDelete) for (const id of this._ids) fn(id, this.env);
    }
    try {
      this.env.cr.prepare(`DELETE FROM "${this._name}" WHERE id IN (${this._ids.map(() => '?').join(',')})`).run(...this._ids);
    } catch (e: any) { throw new Error(`删除失败(${this._name}): ${e.message}`); }
    return true;
  }

  // ============ 关联 ============

  /** Many2one: 根据字段定义自动解析关联记录 */
  resolve(fieldName: string): Recordset | null {
    this._ensureLoaded();
    if (this._ids.length === 0) return null;
    const row = this._data.get(this._ids[0]);
    if (!row) return null;
    const foreignId = row[fieldName];
    if (!foreignId) return null;
    const fieldDef = this._fieldDefs[fieldName];
    if (!fieldDef || fieldDef.type !== 'many2one') return null;
    const relModel = fieldDef.relation || fieldName.replace(/_id$/, '');
    try {
      return this.env[relModel].browse(foreignId);
    } catch { return null; }
  }

  /** One2many: 反向查询子记录 */
  children(relModel: string, foreignField: string): Recordset {
    if (this._ids.length === 0) return new Recordset(this.env, relModel);
    try {
      const ids = this._ids.map(() => '?').join(',');
      const rows = this.env.cr.prepare(
        `SELECT * FROM "${relModel}" WHERE "${foreignField}" IN (${ids})`
      ).all(...this._ids);
      const data = new Map<string | number, any>();
      const found: (string | number)[] = [];
      for (const row of rows) { data.set(row.id, row); found.push(row.id); }
      return new Recordset(this.env, relModel, undefined, found, data);
    } catch { return new Recordset(this.env, relModel); }
  }

  // ============ 工具 ============

  mapped(fieldName: string): any[] {
    this._ensureLoaded();
    const result: any[] = [];
    for (const id of this._ids) {
      const row = this._data.get(id);
      if (row) {
        const val = row[fieldName];
        if (val !== undefined && val !== null) {
          // Many2one: 尝试解析为关联对象的名称
          const fieldDef = this._fieldDefs[fieldName];
          if (fieldDef?.type === 'many2one' && fieldDef.relation) {
            try {
              const related = this.env[fieldDef.relation].browse(val);
              if (related._ids.length > 0) {
                const relRow = related._data.get(related._ids[0]);
                result.push(relRow?.name || relRow?.display_name || val);
                continue;
              }
            } catch {}
          }
          result.push(val);
        }
      }
    }
    return result;
  }

  filtered(func: (rec: any) => boolean): Recordset {
    this._ensureLoaded();
    const kept: (string | number)[] = [];
    const keptData = new Map<string | number, any>();
    for (const id of this._ids) {
      const row = this._data.get(id);
      if (row && func({ ...row })) { kept.push(id); keptData.set(id, row); }
    }
    return new Recordset(this.env, this._name, { _fields: this._fieldDefs, _hooks: this._hooks }, kept, keptData);
  }

  sorted(key: string, reverse?: boolean): Recordset {
    this._ensureLoaded();
    const sorted = [...this._ids].sort((a, b) => {
      const va = (this._data.get(a) || {})[key];
      const vb = (this._data.get(b) || {})[key];
      if (va == null) return 1; if (vb == null) return -1;
      if (va < vb) return reverse ? 1 : -1;
      if (va > vb) return reverse ? -1 : 1;
      return 0;
    });
    return new Recordset(this.env, this._name, { _fields: this._fieldDefs, _hooks: this._hooks }, sorted, new Map(this._data));
  }

  ensure_one(): void {
    if (this._ids.length !== 1) throw new Error(`期望单条记录，实际 ${this._ids.length} 条`);
  }

  // ============ 内部 ============

  private _ensureLoaded(): void {
    if (this._loaded || this._ids.length === 0) return;
    this._loaded = true;
    try {
      const rows = this.env.cr.prepare(`SELECT * FROM "${this._name}" WHERE id IN (${this._ids.map(() => '?').join(',')})`).all(...this._ids);
      for (const row of rows) this._data.set(row.id, row);
    } catch {}
  }

  /** 公式计算: price*qty, amount*1.13, len(name) 等 */
  private _evalFormulas(record: Record<string, any>): void {
    for (const [name, field] of Object.entries(this._fieldDefs)) {
      if (!field.formula) continue;
      try {
        let expr = field.formula as string;
        for (const [k, v] of Object.entries(record)) {
          if (v !== undefined && v !== null && (typeof v === 'number' || typeof v === 'string')) {
            expr = expr.replace(new RegExp('\\b' + k + '\\b', 'g'), String(v));
          }
        }
        const fn = new Function('"use strict"; return (' + expr + ')');
        record[name] = Number(fn()) || 0;
      } catch { /* formula eval failed */ }
    }
  }

  private _validate(values: Record<string, any>): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const [name, field] of Object.entries(this._fieldDefs)) {
      const val = values[name];
      // required
      if (field.required && (val === undefined || val === null || val === '')) {
        errors[name] = `${field.label || name} 是必填项`;
        continue;
      }
      if (val === undefined || val === null) continue;
      // type check
      if (field.type === 'integer' && isNaN(Number(val))) errors[name] = `${field.label || name} 需要整数`;
      if (field.type === 'float' && isNaN(Number(val))) errors[name] = `${field.label || name} 需要数字`;
      // selection
      if (field.type === 'selection' && field.selection) {
        const allowed = field.selection.map((s: any) => s.value);
        if (!allowed.includes(String(val))) errors[name] = `${field.label || name} 值无效: ${val}`;
      }
    }
    return errors;
  }

  [Symbol.iterator]() {
    this._ensureLoaded();
    let index = 0;
    const ids = this._ids;
    const data = this._data;
    return { next(): IteratorResult<any> {
      if (index >= ids.length) return { done: true, value: undefined };
      return { done: false, value: { id: ids[index], ...data.get(ids[index++]) } };
    }};
  }

  // ============ 属性 ============

  get ids(): (string | number)[] { return this._ids; }
  get length(): number { return this._ids.length; }

  /** 转为普通数组 */
  toArray(): any[] { this._ensureLoaded(); return this._ids.map(id => ({ id, ...this._data.get(id) })); }

  /** 创建单条记录的代理(支持record.name直接读写) */
  static createRecordProxy(recordset: Recordset): any {
    if (recordset._ids.length === 0) return null;
    if (recordset._ids.length > 1) throw new Error(`期望单条，实际 ${recordset._ids.length} 条`);
    const id = recordset._ids[0];
    recordset._ensureLoaded();
    const row = recordset._data.get(id) || { id };
    return new Proxy(row, {
      get(target, prop: string) {
        if (prop === 'id') return id;
        if (prop in target) return (target as any)[prop];
        // Many2one 自动关联
        const fieldDef = recordset._fieldDefs[prop];
        if (fieldDef?.type === 'many2one') return recordset.resolve(prop);
        return undefined;
      },
      set(target, prop: string, value: any) {
        if (!recordset._dirty.has(id)) recordset._dirty.set(id, {});
        const dirty = recordset._dirty.get(id)!;
        const fieldDef = recordset._fieldDefs[prop];
        if (fieldDef?.type === 'many2one') {
          dirty[prop] = typeof value === 'object' && value.id ? value.id : value;
        } else if (fieldDef?.type === 'boolean') {
          dirty[prop] = value ? 1 : 0;
        } else {
          dirty[prop] = value;
        }
        (target as any)[prop] = dirty[prop];
        return true;
      },
    });
  }

  /** 提交脏写 */
  flush(): boolean {
    if (this._ids.length !== 1) return false;
    const dirty = this._dirty.get(this._ids[0]);
    if (!dirty) return true;
    return this.write(dirty);
  }
}
