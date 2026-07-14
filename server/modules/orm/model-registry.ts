/**
 * Model Registry — 连接模块和ORM模型
 *
 * 核心流程:
 *   1. 模块安装时 → auto-discover models/ 目录
 *   2. 加载 model 文件 → 注册 Model 实例
 *   3. 调用 ensureTable() → 自动建表/迁检
 *   4. 提供 search/read/write/unlink 统一入口
 */
import fs from 'fs';
import path from 'path';
import { IDatabaseDriver } from '../database/database-driver';
import { BaseModel, ModelOptions } from './orm-model';

export class ModelRegistry {
  /** 已注册的模型: 表名 → Model实例 */
  private models: Map<string, BaseModel> = new Map();
  /** 继承链: 表名 → 父模型名 */
  private inheritance: Map<string, string> = new Map();

  constructor(private db: IDatabaseDriver) {}

  /** 注册一个模型 */
  register(options: ModelOptions): BaseModel {
    const model = new BaseModel(this.db, options);
    if (options._inherit) {
      this.inheritance.set(options._inherit, options._name);
    } else {
      model.ensureTable();
    }
    const key = options._inherit || options._name;
    this.models.set(key, model);
    // _inherit: 立即向父表添加新列
    if (options._inherit) {
      model.migrateColumns();
      // 把 _inherit 模型的字段合并到父模型中
      const parent = this.models.get(options._inherit);
      if (parent) {
        parent._fields = { ...parent._fields, ...options._fields };
      }
    }
    return model;
  }

  /** 获取模型 */
  get(name: string): BaseModel | undefined {
    return this.models.get(name);
  }

  /** 从模块目录加载模型 */
  loadFromModule(moduleDir: string): BaseModel[] {
    const modelsDir = path.join(moduleDir, 'models');
    if (!fs.existsSync(modelsDir)) return [];

    const loaded: BaseModel[] = [];
    const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') || f.endsWith('.ts'));

    for (const file of files) {
      const fp = path.join(modelsDir, file);
      try {
        const mod = require(fp);
        const modelDefs: ModelOptions[] = [];
        if (mod.models && Array.isArray(mod.models)) {
          modelDefs.push(...mod.models);
        } else if (mod.model && mod.model._name) {
          modelDefs.push(mod.model as ModelOptions);
        } else if (mod.default && mod.default._name) {
          modelDefs.push(mod.default as ModelOptions);
        } else if (Array.isArray(mod)) {
          modelDefs.push(...(mod as ModelOptions[]));
        }
        for (const modelDef of modelDefs) {
          if (modelDef._name) {
            this.register(modelDef);
            loaded.push(this.models.get(modelDef._inherit || modelDef._name)!);
          }
        }
      } catch (e) {
        console.error(`[ModelRegistry] 加载失败: ${fp}`, (e as Error).message);
      }
    }

    return loaded;
  }

  /** 处理继承链 (先加载父模型，再加载子模型) */
  resolveInheritance(): void {
    for (const [parent, child] of this.inheritance) {
      const parentModel = this.models.get(parent);
      const childModel = this.models.get(child);
      if (parentModel && childModel) {
        // 合并字段
        parentModel._fields = { ...parentModel._fields, ...childModel._fields };
        // 迁检父表新增列
        childModel.migrateColumns();
      }
    }
  }

  /** 列出所有模型 */
  list(): Array<{ name: string; description: string; fields: number }> {
    return [...this.models.values()].map(m => ({
      name: m._name,
      description: m._description,
      fields: Object.keys(m._fields).length,
    }));
  }
}
