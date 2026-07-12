/**
 * Module System — 参照 Odoo __manifest__.py + ir.module.module
 *
 * 设计原则:
 *   1. manifest.json 声明元数据 (name/depends/data/hooks)
 *   2. ModuleRegistry 管理生命周期 (发现/安装/升级/卸载)
 *   3. 模块表 ir_module_module 持久化状态
 *   4. 向前兼容: 现有代码无需改动, 逐步迁移到模块化
 */
import { IDatabaseDriver } from './database/database-driver';
import fs from 'fs';
import path from 'path';

/** 模块清单 — 对应 Odoo __manifest__.py */
export interface ModuleManifest {
  name: string;               // 人类可读名称
  name_en?: string;           // 英文名
  version: string;            // 语义化版本
  author: string;
  license?: string;
  category: string;           // 分类路径, 如 "HR/核心"
  depends: string[];          // 依赖模块名(技术名)
  description?: string;
  summary?: string;
  installable: boolean;       // 是否可安装
  auto_install?: boolean;     // 依赖满足时自动安装
  application?: boolean;      // 是否应用(在仪表板可见)
  sequence?: number;          // 加载顺序
  data?: string[];            // 种子数据文件列表
  hooks?: {                   // 生命周期钩子
    pre_init?: string;        // 安装前 (路径指向函数)
    post_init?: string;
    post_load?: string;
    uninstall?: string;
  };
  icon?: string;              // 图标文件
  countries?: string[];       // 国家代码
}

export type ModuleState = 'uninstalled' | 'installed' | 'to_install' | 'to_upgrade' | 'to_remove';

/** 模块注册表 */
export class ModuleRegistry {
  private modules: Map<string, { manifest: ModuleManifest; dir: string; state: ModuleState }> = new Map();
  private modulesDir: string;

  constructor(private db: IDatabaseDriver, modulesDir: string) {
    this.modulesDir = modulesDir;
    this.ensureModuleTable();
  }

  /** 从文件系统发现所有模块 */
  discoverAll(): ModuleManifest[] {
    this.modules.clear();
    if (!fs.existsSync(this.modulesDir)) return [];

    const entries = fs.readdirSync(this.modulesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const manifestPath = path.join(this.modulesDir, entry.name, 'manifest.json');
      if (!fs.existsSync(manifestPath)) continue;

      try {
        const raw = fs.readFileSync(manifestPath, 'utf-8');
        const manifest: ModuleManifest = JSON.parse(raw);
        if (!manifest.installable) continue;

        // 从数据库读取状态
        const dbRows = (this.db.query('SELECT state FROM ir_module_module WHERE name = ?', [entry.name]) as any[]);
        const state: ModuleState = dbRows[0] ? dbRows[0].state : 'uninstalled';

        this.modules.set(entry.name, { manifest, dir: path.join(this.modulesDir, entry.name), state });
      } catch (e) {
        console.warn(`[ModuleRegistry] 跳过无效模块: ${entry.name}`, (e as Error).message);
      }
    }

    return this.list();
  }

  /** 列出所有已发现模块 */
  list(): ModuleManifest[] {
    return [...this.modules.values()].map(m => m.manifest);
  }

  /** 获取模块详情 */
  get(name: string): { manifest: ModuleManifest; dir: string; state: ModuleState } | null {
    return this.modules.get(name) || null;
  }

  /** 安装模块 */
  install(name: string): boolean {
    const mod = this.modules.get(name);
    if (!mod || mod.state === 'installed') return false;

    // 检查依赖
    if (!this.checkDependencies(mod.manifest)) {
      console.warn(`[ModuleRegistry] 依赖不满足: ${mod.manifest.depends.join(', ')}`);
      return false;
    }

    // 运行 pre_init hook
    if (mod.manifest.hooks?.pre_init) this.runHook(mod, 'pre_init');

    // 加载数据文件
    if (mod.manifest.data) {
      for (const dataFile of mod.manifest.data) {
        const fp = path.join(mod.dir, dataFile);
        if (fs.existsSync(fp)) {
          try {
            const sql = fs.readFileSync(fp, 'utf-8');
            this.db.exec(sql);
          } catch (e) { console.warn(`[ModuleRegistry] 数据加载失败: ${dataFile}`, e); }
        }
      }
    }

    // 更新状态
    mod.state = 'installed';
    const raw = (this.db as any).db || this.db;
    raw.prepare(
      'INSERT OR REPLACE INTO ir_module_module (name, shortdesc, state, version, author, category) VALUES (?,?,?,?,?,?)'
    ).run(name, mod.manifest.name, 'installed', mod.manifest.version, mod.manifest.author, mod.manifest.category);

    // 运行 post_init hook
    if (mod.manifest.hooks?.post_init) this.runHook(mod, 'post_init');

    return true;
  }

  /** 卸载模块 */
  uninstall(name: string): boolean {
    const mod = this.modules.get(name);
    if (!mod || mod.state !== 'installed') return false;

    if (mod.manifest.hooks?.uninstall) this.runHook(mod, 'uninstall');

    mod.state = 'uninstalled';
    (this.db as any).query('DELETE FROM ir_module_module WHERE name = ?', [name]);
    return true;
  }

  /** 检查依赖 */
  checkDependencies(manifest: ModuleManifest): boolean {
    for (const dep of manifest.depends) {
      const depMod = this.modules.get(dep);
      if (!depMod || depMod.state !== 'installed') return false;
    }
    return true;
  }

  /** 拓扑排序 (按依赖加载) */
  getLoadOrder(): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (name: string) => {
      if (visited.has(name)) return;
      visited.add(name);
      const mod = this.modules.get(name);
      if (mod) {
        for (const dep of mod.manifest.depends) visit(dep);
        if (mod.state === 'installed') order.push(name);
      }
    };

    this.modules.forEach((_, name) => visit(name));
    return order;
  }

  /** 模块表初始化 */
  private ensureModuleTable(): void {
    const raw = (this.db as any).db || this.db;
    try {
      raw.exec(`
        CREATE TABLE IF NOT EXISTS ir_module_module (
          name TEXT PRIMARY KEY,
          shortdesc TEXT DEFAULT '',
          state TEXT DEFAULT 'uninstalled',
          version TEXT DEFAULT '1.0',
          author TEXT DEFAULT '',
          category TEXT DEFAULT 'Uncategorized',
          installable INTEGER DEFAULT 1,
          application INTEGER DEFAULT 0,
          sequence INTEGER DEFAULT 100,
          created_at TEXT,
          updated_at TEXT
        )
      `);
    } catch (e) { /* table exists */ }
  }

  /** 运行钩子 */
  private runHook(mod: { manifest: ModuleManifest; dir: string }, hook: 'pre_init' | 'post_init' | 'post_load' | 'uninstall'): void {
    const hookPath = mod.manifest.hooks?.[hook];
    if (!hookPath) return;
    try {
      const module = require(path.join(mod.dir, hookPath));
      if (typeof module === 'function') module(this.db);
    } catch (e) { console.warn(`[ModuleRegistry] Hook 失败: ${hook}`, e); }
  }
}
