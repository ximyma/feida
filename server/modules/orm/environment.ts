/**
 * Environment — 参照 Odoo odoo.api.Environment
 *
 * 每个请求一个 Environment，封装:
 *   - 数据库连接
 *   - 用户上下文
 *   - 模型注册表
 *   - 缓存
 *
 * 用法:
 *   const env = new Environment(db, registry, { uid: 1 });
 *   const partners = env['res.partner'].search([['is_company', '=', true]]);
 */
import { ModelRegistry } from './model-registry';
import { Recordset } from './recordset';
import { nanoid } from 'nanoid';

export interface EnvContext {
  uid?: number;          // 当前用户ID
  lang?: string;         // 语言
  tz?: string;           // 时区
  allowed_company_ids?: number[];
  [key: string]: any;
}

export class Environment {
  readonly uid: number;
  readonly context: EnvContext;
  readonly cr: any;        // 原始数据库连接
  readonly registry: ModelRegistry;

  /** 模型缓存: 首次访问时惰性创建 Recordset */
  private _cache: Map<string, Recordset> = new Map();

  constructor(cr: any, registry: ModelRegistry, context: EnvContext = {}) {
    this.cr = cr;
    this.registry = registry;
    this.uid = context.uid || 0;
    this.context = { ...context, uid: this.uid };
  }

  /** env['model.name'] → 惰性 Recordset */
  get(modelName: string): Recordset {
    // 支持 Odoo 风格的 model_name → model_name 和 model.name → model_name
    const key = modelName.replace(/\./g, '_');
    if (!this._cache.has(key)) {
      const modelClass = this.registry.get(key);
      if (!modelClass) {
        throw new Error(`模型不存在: ${key}`);
      }
      this._cache.set(key, new Recordset(this, key, modelClass));
    }
    return this._cache.get(key)!;
  }

  /** 便捷: self[modelName] → self.get(modelName) */
  [model: string]: any;

  // Proxy-style access
  static createProxy(env: Environment): Environment & Record<string, Recordset> {
    return new Proxy(env, {
      get(target, prop: string) {
        if (prop in target) return (target as any)[prop];
        if (typeof prop === 'string' && !prop.startsWith('_')) {
          try { return target.get(prop); } catch { return undefined; }
        }
        return undefined;
      },
    }) as any;
  }

  /** 释放缓存 */
  clear() { this._cache.clear(); }
}
