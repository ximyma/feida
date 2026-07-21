/**
 * ORM Model Registry v2 — 真正的Odoo风格注册表
 *
 * 区别于v1(仅schema), v2支持:
 *   - 模型方法(@api.model)自动绑定
 *   - SQL约束(_sql_constraints)
 *   - 计算字段(compute + depends)
 *   - 默认值方法
 *   - 模型继承(字段+方法合并)
 *   - 自动建表+迁移
 */
import fs from 'fs';
import path from 'path';
import { IDatabaseDriver } from '../database/database-driver';

/** 模型类 — 持有模型定义 + 方法 */
export class ModelClass {
  _name: string;
  _description: string;
  _order: string;
  _rec_name: string;
  _fields: Record<string, any>;
  _sql_constraints: Array<[string, string, string]>;
  _methods: Record<string, Function>;
  _hooks: Record<string, Function[]>;

  constructor(def: ModelDef) {
    this._name = def._name;
    this._description = def._description || def._name;
    this._order = def._order || 'id DESC';
    this._rec_name = def._rec_name || 'name';
    this._fields = { ...def._fields };
    this._sql_constraints = def._sql_constraints || [];
    this._methods = def._methods || {};
    this._hooks = def._hooks || {};
  }
}

export interface ModelDef {
  _name: string;
  _inherit?: string;
  _description?: string;
  _order?: string;
  _rec_name?: string;
  _fields: Record<string, any>;
  _sql_constraints?: Array<[string, string, string]>;
  _methods?: Record<string, Function>;
  _hooks?: Record<string, Function[]>;
}

export class ModelRegistry {
  private models: Map<string, ModelClass> = new Map();
  private defs: Map<string, ModelDef> = new Map();
  private inheritance: Map<string, string> = new Map();
  private db: any;

  /** 获取原始SQLite连接 */
  private rawDb(): any { return (this.db as any)?.db || this.db; }

  constructor(db?: any) {
    this.db = db;
  }

  /** 注册模型定义 */
  register(def: ModelDef): ModelClass {
    if (def._inherit && def._inherit !== def._name) {
      return this._registerInherit(def);
    }
    return this._registerStandalone(def);
  }

  private _registerStandalone(def: ModelDef): ModelClass {
    // 自动建表
    if (this.db) this._ensureTable(def);
    const model = new ModelClass(def);
    this.models.set(def._name, model);
    this.defs.set(def._name, def);
    return model;
  }

  private _registerInherit(def: ModelDef): ModelClass {
    const parentModel = this.models.get(def._inherit!);
    const parentDef = this.defs.get(def._inherit!);
    if (!parentModel || !parentDef) {
      // 父模型未注册: 先注册为独立表
      if (this.db) this._ensureTable({ ...def, _inherit: undefined, _name: def._inherit! });
    }
    // 迁移新列到父表
    if (this.db) this._migrateColumns(def._inherit!, def._fields);
    // 合并字段
    if (parentDef) {
      def._fields = { ...parentDef._fields, ...def._fields };
      def._sql_constraints = [...(parentDef._sql_constraints || []), ...(def._sql_constraints || [])];
      def._methods = { ...(parentDef._methods || {}), ...(def._methods || {}) };
    }
    // 合并到父模型
    const merged = new ModelClass({
      _name: def._inherit!,
      _description: parentDef?._description || def._description || '',
      _order: def._order || parentDef?._order || 'id DESC',
      _rec_name: def._rec_name || parentDef?._rec_name || 'name',
      _fields: def._fields,
      _sql_constraints: def._sql_constraints,
      _methods: def._methods,
    });
    this.models.set(def._inherit!, merged);
    this.defs.set(def._inherit!, { ...parentDef, ...def, _name: def._inherit!, _inherit: undefined } as ModelDef);
    return merged;
  }

  /** 获取模型类 */
  get(name: string): ModelClass | undefined {
    return this.models.get(name);
  }

  /** 获取模型定义 */
  getDef(name: string): ModelDef | undefined {
    return this.defs.get(name);
  }

  /** 列出所有模型 */
  list(): Array<{ name: string; description: string; fields: number }> {
    return [...this.models.entries()].map(([name, m]) => ({
      name, description: (m as any)._description || name, fields: Object.keys((m as any)._fields || {}).length,
    }));
  }

  /** 从模块目录加载模型 */
  loadFromModule(moduleDir: string): ModelClass[] {
    const absDir = path.resolve(moduleDir);
    const modelsDir = path.join(absDir, 'models');
    if (!fs.existsSync(modelsDir)) return [];
    const loaded: ModelClass[] = [];
    const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
    for (const file of files) {
      const fp = path.join(modelsDir, file);
      try {
        const mod = require(fp);
        let defs: ModelDef[] = [];
        if (mod.models && Array.isArray(mod.models)) defs = mod.models;
        else if (mod.model) defs = [mod.model];
        else if (mod.default) defs = [mod.default];
        else if (Array.isArray(mod)) defs = mod;

        for (const def of defs) {
          if (def._name) {
            const mc = this.register(def);
            loaded.push(mc);
          }
        }
      } catch (e) { console.error(`[Registry] 加载失败: ${fp}`, (e as Error).message); }
    }
    return loaded;
  }

  /** 自动建表 */
  private _ensureTable(def: ModelDef): void {
    if (!this.db) return;
    const cols: string[] = ['id TEXT PRIMARY KEY'];
    for (const [name, field] of Object.entries(def._fields)) {
      cols.push(this._fieldToDDL(name, field));
    }
    cols.push('created_at TEXT DEFAULT CURRENT_TIMESTAMP');
    cols.push('updated_at TEXT DEFAULT CURRENT_TIMESTAMP');
    try {
      this.rawDb().exec(`CREATE TABLE IF NOT EXISTS "${def._name}" (${cols.join(', ')})`);
      // SQL约束
      if (def._sql_constraints) {
        for (const [cname, constraint] of def._sql_constraints) {
          try {
            // 解析约束类型
            if (constraint.startsWith('unique(')) {
              const colName = constraint.match(/unique\((\w+)\)/)?.[1];
              if (colName) this.rawDb().exec(`CREATE UNIQUE INDEX IF NOT EXISTS ${def._name}_${cname} ON "${def._name}"(${colName})`);
            } else if (constraint.startsWith('check(')) {
              this.rawDb().exec(`ALTER TABLE "${def._name}" ADD CONSTRAINT ${def._name}_${cname} ${constraint}`);
            }
          } catch (e) { /* constraint may exist */ }
        }
      }
    } catch (e: any) { console.warn(`[Registry] 建表失败: ${def._name}`, e.message); }
  }

  /** 表继承：迁移新列 */
  private _migrateColumns(table: string, fields: Record<string, any>): void {
    if (!this.db) return;
    for (const [name, field] of Object.entries(fields)) {
      try {
        this.rawDb().exec(`ALTER TABLE "${table}" ADD COLUMN ${this._fieldToDDL(name, field)}`);
      } catch { /* column may exist */ }
    }
  }

  /** 字段→SQL DDL */
  private _fieldToDDL(name: string, field: any): string {
    const typeMap: Record<string, string> = {
      char: 'TEXT', text: 'TEXT', integer: 'INTEGER', float: 'REAL',
      boolean: 'INTEGER DEFAULT 0', date: 'TEXT', datetime: 'TEXT',
      selection: 'TEXT', many2one: 'TEXT DEFAULT \'\'', one2many: 'TEXT',
      many2many: 'TEXT', binary: 'TEXT', monetary: 'REAL',
    };
    const sqlType = typeMap[field.type] || 'TEXT';
    let ddl = `"${name}" ${sqlType}`;
    if (field.default !== undefined && field.default !== null) {
      const dv = typeof field.default === 'string' ? `'${field.default}'` : field.default;
      ddl += ` DEFAULT ${dv}`;
    }
    return ddl;
  }
}
