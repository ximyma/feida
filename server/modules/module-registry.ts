/**
 * Module System — 参照 Odoo __manifest__.py + ir.module.module
 *
 * 设计原则:
 *   1. manifest.json 声明元数据 (name/depends/data/hooks/views/migrations)
 *   2. ModuleRegistry 管理生命周期 (发现/安装/升级/卸载)
 *   3. 模块表 ir_module_module 持久化状态
 *   4. 向前兼容: 现有代码无需改动, 逐步迁移到模块化
 */
import { IDatabaseDriver } from './database/database-driver';
import fs from 'fs';
import path from 'path';

/** 模块清单 — 对应 Odoo __manifest__.py */
export interface ModuleManifest {
  name: string;
  name_en?: string;
  version: string;
  author: string;
  license?: string;
  category: string;
  depends: string[];
  description?: string;
  summary?: string;
  installable: boolean;
  auto_install?: boolean;
  application?: boolean;
  sequence?: number;
  data?: string[];
  /** 视图文件列表 (自动注册前端路由) */
  views?: string[];
  /** 迁移脚本目录 */
  migrations?: string;
  hooks?: {
    pre_init?: string;
    post_init?: string;
    post_load?: string;
    uninstall?: string;
  };
  icon?: string;
  countries?: string[];
}

export type ModuleState = 'uninstalled' | 'installed' | 'to_install' | 'to_upgrade' | 'to_remove';

/** 已注册的视图路由 */
export interface ModuleView {
  moduleName: string;
  path: string;          // 前端路由 e.g. "/payroll"
  label: string;         // 菜单名
  icon?: string;         // Ant Design 图标
  component: string;     // JS文件名
  category: string;      // 分类
}

/** 模块注册表 */
export class ModuleRegistry {
  private modules: Map<string, { manifest: ModuleManifest; dir: string; state: ModuleState }> = new Map();
  private modulesDir: string;
  /** 视图注册表 */
  private views: ModuleView[] = [];

  constructor(private db: IDatabaseDriver, modulesDir: string) {
    this.modulesDir = modulesDir;
    this.ensureModuleTable();
    this.ensureViewTable();
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

        // 从数据库读取状态和版本
        const rawDb: any = (this.db as any).db || this.db;
        const row = rawDb.prepare?.('SELECT state, version FROM ir_module_module WHERE name = ?')?.get(entry.name);
        const state: ModuleState = row ? row.state : 'uninstalled';
        // 检测是否需要升级 (文件版本 > 数据库版本)
        if (state === 'installed' && row && this.isNewerVersion(manifest.version, row.version)) {
          this.modules.set(entry.name, { manifest, dir: path.join(this.modulesDir, entry.name), state: 'to_upgrade' });
        } else {
          this.modules.set(entry.name, { manifest, dir: path.join(this.modulesDir, entry.name), state });
        }
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

  /** 列出所有模块详情(含状态) */
  listWithState(): Array<{ name: string; shortdesc: string; version: string; state: ModuleState; category: string; depends: string[] }> {
    return [...this.modules.entries()].map(([name, m]) => ({
      name, shortdesc: m.manifest.name,
      version: m.manifest.version, state: m.state,
      category: m.manifest.category,
      depends: m.manifest.depends,
    }));
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
          try { this.db.exec(fs.readFileSync(fp, 'utf-8')); }
          catch (e) { console.warn(`[ModuleRegistry] 数据加载失败: ${dataFile}`, e); }
        }
      }
    }

    // 注册视图
    this.registerViews(name, mod.dir, mod.manifest);

    // 更新状态
    mod.state = 'installed';
    const raw: any = (this.db as any).db || this.db;
    raw.prepare(
      'INSERT OR REPLACE INTO ir_module_module (name, shortdesc, state, version, author, category, updated_at) VALUES (?,?,?,?,?,?,?)'
    ).run(name, mod.manifest.name, 'installed', mod.manifest.version, mod.manifest.author, mod.manifest.category, new Date().toISOString());

    // 运行 post_init hook
    if (mod.manifest.hooks?.post_init) this.runHook(mod, 'post_init');

    return true;
  }

  /** 升级模块 (执行迁移脚本) */
  upgrade(name: string): boolean {
    const mod = this.modules.get(name);
    if (!mod || mod.state !== 'to_upgrade') return false;

    const migrationsDir = mod.manifest.migrations || 'migrations';
    const mdir = path.join(mod.dir, migrationsDir);
    if (fs.existsSync(mdir)) {
      const raw: any = (this.db as any).db || this.db;
      const row = raw.prepare?.('SELECT version FROM ir_module_module WHERE name = ?')?.get(name);
      const oldVer = row?.version || '0.0.0';
      const files = fs.readdirSync(mdir).filter(f => /^[\d.]+\.(js|sql)$/.test(f)).sort();
      for (const file of files) {
        const fileVer = file.replace(/\.(js|sql)$/, '');
        if (this.isVersionInRange(fileVer, oldVer, mod.manifest.version)) {
          try {
            if (file.endsWith('.sql')) {
              this.db.exec(fs.readFileSync(path.join(mdir, file), 'utf-8'));
            } else if (file.endsWith('.js')) {
              const migrateModule = require(path.join(mdir, file));
              if (typeof migrateModule === 'function') migrateModule(this.db);
            }
            console.log(`[ModuleRegistry] 迁移: ${name} - ${file}`);
          } catch (e) { console.error(`[ModuleRegistry] 迁移失败: ${file}`, e); }
        }
      }
    }

    mod.state = 'installed';
    const raw2: any = (this.db as any).db || this.db;
    raw2.prepare('UPDATE ir_module_module SET version = ?, state = ?, updated_at = ? WHERE name = ?')
      .run(mod.manifest.version, 'installed', new Date().toISOString(), name);
    return true;
  }

  /** 卸载模块 */
  uninstall(name: string): boolean {
    const mod = this.modules.get(name);
    if (!mod || mod.state !== 'installed' && mod.state !== 'to_upgrade') return false;

    if (mod.manifest.hooks?.uninstall) this.runHook(mod, 'uninstall');

    // 注销视图
    this.views = this.views.filter(v => v.moduleName !== name);

    mod.state = 'uninstalled';
    const raw: any = (this.db as any).db || this.db;
    raw.prepare?.('UPDATE ir_module_module SET state = ? WHERE name = ?')?.run('uninstalled', name);
    return true;
  }

  // ========== 视图管理 ==========

  /** 获取所有已注册视图 */
  getViews(): ModuleView[] { return this.views; }

  /** 从 manifest 注册视图 */
  private registerViews(moduleName: string, dir: string, manifest: ModuleManifest): void {
    if (!manifest.views) return;
    for (const viewFile of manifest.views) {
      const fp = path.join(dir, viewFile);
      if (!fs.existsSync(fp)) continue;
      try {
        const viewDefs = require(fp);
        const defs: ModuleView[] = (viewDefs.views || viewDefs.default?.views || [viewDefs].filter((v: any) => v.path));
        for (const def of defs) {
          if (def.path && def.label) {
            this.views.push({ ...def, moduleName });
          }
        }
      } catch (e) { console.warn(`[ModuleRegistry] 视图加载失败: ${viewFile}`, e); }
    }
  }

  /** 视图持久化表 */
  private ensureViewTable(): void {
    const raw: any = (this.db as any).db || this.db;
    try { raw.exec("CREATE TABLE IF NOT EXISTS ir_module_view (module TEXT, path TEXT, label TEXT, icon TEXT, component TEXT, category TEXT, PRIMARY KEY(module, path))"); }
    catch (e) { /* exists */ }
  }

  // ========== 版本工具 ==========

  private isNewerVersion(newVer: string, oldVer: string): boolean {
    const n = newVer.split('.').map(Number);
    const o = oldVer.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if ((n[i] || 0) > (o[i] || 0)) return true;
      if ((n[i] || 0) < (o[i] || 0)) return false;
    }
    return false;
  }

  private isVersionInRange(target: string, from: string, to: string): boolean {
    return this.isNewerVersion(target, from) && !this.isNewerVersion(target, to);
  }

  /** 检查依赖 */
  checkDependencies(manifest: ModuleManifest): boolean {
    for (const dep of manifest.depends) {
      const depMod = this.modules.get(dep);
      if (!depMod || (depMod.state !== 'installed' && depMod.state !== 'to_upgrade')) return false;
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
        order.push(name);
      }
    };

    this.modules.forEach((_, name) => visit(name));
    return order;
  }

  /** 模块表初始化 */
  private ensureModuleTable(): void {
    const raw: any = (this.db as any).db || this.db;
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
