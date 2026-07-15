/**
 * Recordset — 参照 Odoo models.BaseModel
 *
 * 惰性、可链式调用的记录集。代表零或多条数据库记录。
 * 支持: search/browse/create/write/unlink/mapped/filtered/sorted/ensure_one
 *
 * 用法:
 *   const partner = env['res.partner'].browse(1);
 *   partner.name = 'New Name';  // 自动记录脏写
 *   partner.flush();            // 提交到DB
 *   // 链式
 *   env['res.partner'].search([['is_company','=',true]]).mapped('name');
 */
import { nanoid } from 'nanoid';
import type { Environment } from './environment';

export interface DomainItem {
  field: string;
  operator: string;
  value: any;
}

// 将Odoo domain三元组转换为SQL WHERE子句
function domainToSQL(domain: any[], params: any[]): string {
  if (!Array.isArray(domain) || domain.length === 0) return '1=1';
  
  // 检查是三元组列表还是逻辑运算符
  if (typeof domain[0] === 'string' && domain.length === 3) {
    // 单三元组: ['name', '=', 'Bob']
    const [field, op, val] = domain;
    // SQLite 绑定: 布尔值 → 0/1
    params.push(val === true ? 1 : val === false ? 0 : val);
    const col = field.replace(/\./g, '_');
    switch (op) {
      case '=': return `${col} = ?`;
      case '!=': case '<>': return `${col} != ?`;
      case '>': return `${col} > ?`;
      case '>=': return `${col} >= ?`;
      case '<': return `${col} < ?`;
      case '<=': return `${col} <= ?`;
      case 'like': case 'ilike': params[params.length-1] = `%${val}%`; return `${col} LIKE ?`;
      case 'in': return `${col} IN (${val.map(() => '?').join(',')})`;
      case 'not in': return `${col} NOT IN (${val.map(() => '?').join(',')})`;
      default: return `${col} = ?`;
    }
  }

  // 多个三元组用 AND 连接
  if (Array.isArray(domain[0]) && Array.isArray(domain[0]) && domain[0].length === 3) {
    return domain.map((d: any[]) => domainToSQL(d, params)).join(' AND ');
  }

  return '1=1';
}

export class Recordset {
  readonly env: Environment;
  readonly _name: string;
  readonly _ids: (string | number)[];
  private _loaded: boolean = false;
  private _data: Map<string | number, any> = new Map();
  private _dirty: Map<string | number, Record<string, any>> = new Map(); // 脏写追踪
  private _fieldDefs: Record<string, any>;
  private _modelClass: any;

  constructor(env: Environment, modelName: string, modelClass?: any, ids?: (string | number)[], data?: Map<string | number, any>) {
    this.env = env;
    this._name = modelName;
    this._modelClass = modelClass;
    this._ids = ids || (modelClass?.getFieldDefs ? [] : []);
    this._fieldDefs = modelClass?._fields || {};
    if (data) {
      this._data = data;
      this._loaded = true;
    }
  }

  // ============ 核心查询 ============

  /** 搜索: 返回新 Recordset */
  search(domain: any[] = [], options?: { limit?: number; offset?: number; order?: string }): Recordset {
    const params: any[] = [];
    const where = domainToSQL(domain, params);
    const order = options?.order || 'id DESC';
    const limit = options?.limit || 1000;
    const offset = options?.offset || 0;

    const sql = `SELECT * FROM "${this._name}" WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    try {
      const rows = this.env.cr.prepare(sql).all(...params);
      const data = new Map<string | number, any>();
      const ids: (string | number)[] = [];
      for (const row of rows) {
        const id = row.id;
        ids.push(id);
        data.set(id, this._postProcess(row));
      }
      return new Recordset(this.env, this._name, this._modelClass, ids, data);
    } catch (e: any) {
      console.warn(`[Recordset] search(${this._name}) failed:`, e.message);
      return new Recordset(this.env, this._name, this._modelClass);
    }
  }

  /** 读取单条 */
  browse(ids: (string | number)[] | string | number): Recordset {
    const idList = Array.isArray(ids) ? ids : [ids];
    if (idList.length === 0) return new Recordset(this.env, this._name, this._modelClass);

    const data = new Map<string | number, any>();
    const found: (string | number)[] = [];
    const placeholders = idList.map(() => '?').join(',');

    try {
      const rows = this.env.cr.prepare(`SELECT * FROM "${this._name}" WHERE id IN (${placeholders})`).all(...idList);
      for (const row of rows) {
        data.set(row.id, this._postProcess(row));
        found.push(row.id);
      }
    } catch (e: any) {
      console.warn(`[Recordset] browse(${this._name}) failed:`, e.message);
    }

    return new Recordset(this.env, this._name, this._modelClass, found, data);
  }

  /** 创建记录 */
  create(values: Record<string, any>): Recordset {
    const id = values.id || nanoid(16);
    const processed = this._preProcess(values);
    processed.id = id;
    processed.created_at = processed.created_at || new Date().toISOString();
    processed.updated_at = new Date().toISOString();

    const columns = Object.keys(processed);
    const placeholders = columns.map(() => '?').join(',');
    const vals = columns.map(c => processed[c]);

    try {
      this.env.cr.prepare(`INSERT INTO "${this._name}" (${columns.join(',')}) VALUES (${placeholders})`).run(...vals);
    } catch (e: any) {
      console.error(`[Recordset] create(${this._name}) failed:`, e.message);
      throw e;
    }

    const createdData = new Map<string | number, any>();
    createdData.set(id, processed);
    return new Recordset(this.env, this._name, this._modelClass, [id], createdData);
  }

  /** 写入 */
  write(values: Record<string, any>): boolean {
    if (this._ids.length === 0) return false;
    const writeThis = this;
    if (Object.keys(writeThis._dirty).length > 0) {
      // 有脏写: 仅写变更的
      this._ids.forEach(id => {
        const changes: Record<string, any> = writeThis._dirty.get(id) || {};
        if (Object.keys(changes).length === 0) return;
        const flattened: Record<string, any> = {};
        for (const [k, v] of Object.entries(changes)) {
          if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
            // Many2one: partner_id = {id: 3} → partner_id = 3
            flattened[k] = v.id || v;
          } else {
            flattened[k] = v;
          }
        }
        flattened.updated_at = new Date().toISOString();
        const cols = Object.keys(flattened);
        const setters = cols.map(c => `${c}=?`).join(',');
        const vals = cols.map(c => flattened[c]);
        try {
          this.env.cr.prepare(`UPDATE "${this._name}" SET ${setters} WHERE id=?`).run(...vals, id);
        } catch (e: any) { console.error(`write(${id}) failed:`, e.message); }
      });
      writeThis._dirty.clear();
      return true;
    } else {
      // 无脏写: 批量应用
      const processed = this._preProcess(values);
      const cols = Object.keys(processed);
      const setters = cols.map(c => `${c}=?`).join(',');
      const vals = cols.map(c => processed[c]);
      vals.push(...this._ids);
      const placeholders = this._ids.map(() => '?').join(',');
      try {
        this.env.cr.prepare(
          `UPDATE "${this._name}" SET ${setters} WHERE id IN (${placeholders})`
        ).run(...vals);
      } catch (e: any) { console.error(`write(${this._name}) failed:`, e.message); return false; }
      return true;
    }
  }

  /** 删除 */
  unlink(): boolean {
    if (this._ids.length === 0) return false;
    const placeholders = this._ids.map(() => '?').join(',');
    try {
      this.env.cr.prepare(`DELETE FROM "${this._name}" WHERE id IN (${placeholders})`).run(...this._ids);
    } catch (e: any) { console.error(`unlink(${this._name}) failed:`, e.message); return false; }
    return true;
  }

  // ============ 高级操作 ============

  /** 提取字段值列表 */
  mapped(fieldName: string): any[] {
    this._ensureLoaded();
    const result: any[] = [];
    for (const id of this._ids) {
      const row = this._data.get(id);
      if (row) result.push(row[fieldName]);
    }
    return result;
  }

  /** 过滤 */
  filtered(func: (rec: any) => boolean): Recordset {
    this._ensureLoaded();
    const kept: (string | number)[] = [];
    const keptData = new Map<string | number, any>();
    for (const id of this._ids) {
      const row = this._data.get(id);
      if (row && func(row)) {
        kept.push(id);
        keptData.set(id, row);
      }
    }
    return new Recordset(this.env, this._name, this._modelClass, kept, keptData);
  }

  /** 排险 */
  sorted(key: string, reverse?: boolean): Recordset {
    this._ensureLoaded();
    const sorted = [...this._ids].sort((a, b) => {
      const va = (this._data.get(a) || {})[key];
      const vb = (this._data.get(b) || {})[key];
      if (va < vb) return reverse ? 1 : -1;
      if (va > vb) return reverse ? -1 : 1;
      return 0;
    });
    return new Recordset(this.env, this._name, this._modelClass, sorted, new Map(this._data));
  }

  /** 确保单条 */
  ensure_one(): void {
    if (this._ids.length !== 1) {
      throw new Error(`Expected singleton: ${this._name} has ${this._ids.length} records`);
    }
  }

  /** 检查是否存在 */
  exists(): Recordset {
    if (this._ids.length === 0) return this;
    this._ensureLoaded();
    const actual = this.browse(this._ids as any);
    return actual;
  }

  // ============ 对单个记录的操作 (Recordset是单条时) ============

  /** 提交单条记录的变更 */
  flush(): boolean {
    if (this._ids.length !== 1) return false;
    const dirty = this._dirty.get(this._ids[0]);
    if (!dirty) return true;
    return this.write(dirty);
  }

  // ============ 属性访问 (记录级) ============

  /** 读取字段 (返回最新值: 脏写 > 存储) */
  private _getField(name: string): any {
    if (this._ids.length === 0) return undefined;
    this._ensureLoaded();
    const id = this._ids[0];
    const dirty: any = this._dirty.get(id) || {};
    if (name in dirty) {
      const val = dirty[name];
      // Many2one: 返回可能的Recordset
      const fieldDef = this._fieldDefs[name];
      if (fieldDef && fieldDef.type === 'many2one' && val && typeof val === 'object' && val.id) {
        try {
          const relModel = fieldDef.relation || name.replace(/_id$/, '');
          return this.env[relModel]?.browse(val.id);
        } catch { return val; }
      }
      return val;
    }
    const row = this._data.get(id);
    if (row && name in row) {
      const val = row[name];
      const fieldDef = this._fieldDefs[name];
      // Many2one 惰性解析
      if (fieldDef && fieldDef.type === 'many2one' && val) {
        try {
          const relModel = fieldDef.relation || name.replace(/_id$/, '');
          const proxy = this.env[relModel]?.browse(val);
          if (proxy && proxy._ids.length > 0) return proxy;
        } catch {}
      }
      // One2many 反向搜索
      if (fieldDef && fieldDef.type === 'one2many' && val === undefined) {
        // 检测相关字段
        return undefined; // 需要明确的反向定义
      }
      return val;
    }
    return undefined;
  }

  /** 设置字段 */
  private _setField(name: string, value: any): void {
    if (this._ids.length === 0) return;
    for (const id of this._ids) {
      if (!this._dirty.has(id)) this._dirty.set(id, {});
      const dirty = this._dirty.get(id)!;
      // 如果值是Recordset，展开id
      if (value && typeof value === 'object' && value._ids) {
        const fieldDef = this._fieldDefs[name];
        if (fieldDef && fieldDef.type === 'many2one') {
          dirty[name] = (value.ids || value._ids)[0];
        } else {
          dirty[name] = value;
        }
      } else {
        dirty[name] = value;
      }
    }
  }

  // ============ 辅助 ============

  /** 确保数据已加载 */
  private _ensureLoaded(): void {
    if (this._loaded || this._ids.length === 0) return;
    this._loaded = true;
    try {
      const placeholders = this._ids.map(() => '?').join(',');
      const rows = this.env.cr.prepare(`SELECT * FROM "${this._name}" WHERE id IN (${placeholders})`).all(...this._ids);
      for (const row of rows) {
        this._data.set(row.id, this._postProcess(row));
      }
    } catch (e) { /* table may not exist */ }
  }

  /** 写入前处理 */
  private _preProcess(values: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val === undefined || val === null) continue;
      const field = this._fieldDefs[key];
      if (!field) { result[key] = val; continue; }
      switch (field.type) {
        case 'many2one':
          result[key] = typeof val === 'object' && val._ids ? val._ids[0] : val;
          break;
        case 'boolean':
          result[key] = val === true || val === 1 || val === '1' ? 1 : 0;
          break;
        default:
          result[key] = val;
      }
    }
    return result;
  }

  /** 读取后处理 */
  private _postProcess(row: any): any {
    const result: any = {};
    for (const [key, val] of Object.entries(row)) {
      const field = this._fieldDefs[key];
      if (field) {
        if (field.type === 'boolean') {
          result[key] = val === 1 || val === true;
        } else {
          result[key] = val;
        }
      } else {
        result[key] = val;
      }
    }
    return result;
  }

  // ============ 便捷属性 ============

  get ids(): (string | number)[] { return this._ids; }
  get length(): number { return this._ids.length; }

  // 迭代
  [Symbol.iterator]() {
    this._ensureLoaded();
    let index = 0;
    const ids = this._ids;
    const data = this._data;
    const dirty = this._dirty;
    return {
      next(): IteratorResult<any> {
        if (index >= ids.length) return { done: true, value: undefined };
        const id = ids[index++];
        // 返回代理对象
        const record = { id, ...data.get(id) };
        return { done: false, value: record };
      },
    };
  }

  forEach(fn: (rec: any) => void): void {
    for (const rec of this) fn(rec);
  }

  // ============ 直接属性访问代理(仅单条时) ============
  // 通过 Proxy 实现 record.name 直接访问
  static createRecordProxy(recordset: Recordset): any {
    if (recordset._ids.length === 0) return null;
    if (recordset._ids.length > 1) {
      throw new Error(`Expected singleton: got ${recordset._ids.length} records`);
    }
    const id = recordset._ids[0];
    recordset._ensureLoaded();
    const row = recordset._data.get(id) || { id };

    return new Proxy(row, {
      get(target, prop: string) {
        if (prop === 'id') return id;
        // 先检查脏写
        const dirty = recordset._dirty.get(id);
        if (dirty && (prop in dirty)) {
          const val = dirty[prop];
          return val;
        }
        if (prop in target) return (target as any)[prop];
        // 特判方法
        if (prop === 'write') return (v: any) => recordset.write(v);
        if (prop === 'unlink') return () => recordset.unlink();
        if (prop === 'flush') return () => recordset.flush();
        if (prop === '_get') return (name: string) => (recordset as any)._getField(name);
        if (prop === '_set') return (name: string, v: any) => (recordset as any)._setField(name, v);
        return undefined;
      },
      set(target, prop: string, value: any) {
        (recordset as any)._setField(prop, value);
        return true;
      },
    });
  }
}
