/**
 * 多公司/多组织支持 — 参照 Odoo multi-company
 *
 * 通过 company_id 字段实现数据隔离:
 *   - 每个核心表增加 company_id 列
 *   - 查询自动注入 WHERE company_id = ?
 *   - 超级管理员可跨公司
 */
import { IDatabaseDriver } from './database/database-driver';

let db: IDatabaseDriver;

export function initMultiCompany(database: IDatabaseDriver) {
  db = database;
  const raw = (db as any).db || db;
  try { raw.exec(`CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY, code TEXT UNIQUE, name TEXT NOT NULL,
    short_name TEXT, parent_id TEXT, currency TEXT DEFAULT 'CNY',
    timezone TEXT DEFAULT 'Asia/Shanghai', is_active INTEGER DEFAULT 1,
    address TEXT, phone TEXT, email TEXT, tax_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`); } catch {}
}

/** 获取用户可访问的公司列表 */
export function getUserCompanies(userId: string): Array<{ id: string; name: string }> {
  return db.query(
    `SELECT c.id, c.name FROM companies c
     JOIN user_companies uc ON c.id = uc.company_id
     WHERE uc.user_id = ? AND c.is_active = 1`, [userId]
  ) as any[];
}

/** 生成 company_id 过滤子句 */
export function companyFilter(companyId?: string, isSuperAdmin?: boolean): { clause: string; params: string[] } {
  if (isSuperAdmin || !companyId) return { clause: '', params: [] };
  return { clause: '"company_id" = ?', params: [companyId] };
}

/**
 * 多公司核心表: 自动迁移所有核心表增加 company_id
 * 参照 Odoo base 模块: 所有模型自动继承 company_id
 */
export const MULTI_COMPANY_TABLES = [
  'employees', 'departments', 'positions', 'salaries',
  'shop_orders', 'shop_goods', 'shop_categories',
  'cms_articles', 'cms_channels',
  'sales_orders', 'purchase_orders',
  'inventory', 'journal_entries',
  'documents', 'announcements',
];

/** 为指定表添加 company_id 列 */
export function addCompanyIdColumn(table: string): void {
  const raw = (db as any).db || db;
  try {
    const info = (raw.prepare ? raw : (db as any)).prepare(`PRAGMA table_info(${table})`).all() as any[];
    if (!info.find((c: any) => c.name === 'company_id')) {
      raw.exec(`ALTER TABLE "${table}" ADD COLUMN company_id TEXT DEFAULT 'default'`);
    }
  } catch {}
}
