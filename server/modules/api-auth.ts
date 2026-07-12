/**
 * JWT API Token 认证中间件
 * 参照 Odoo API Key / OAuth2 模式
 *
 * - GET /api/* 公开端点: 无需认证
 * - POST/PUT/DELETE /api/*: 需 Bearer Token
 * - 豁免: /api/ai/*, /api/cms-* (已有前端会话认证)
 */
import crypto from 'crypto';
import { IDatabaseDriver } from './database/database-driver';

let _db: IDatabaseDriver | null = null;
let _secretKey: string = '';

/** 初始化 JWT 密钥表 */
export function initAuth(db: IDatabaseDriver, secretKey?: string): void {
  _db = db;
  _secretKey = secretKey || crypto.randomBytes(32).toString('hex');

  // 使用 raw exec (兼容 DatabaseService)
  const raw = (db as any).db || db;
  raw.exec(`
    CREATE TABLE IF NOT EXISTS api_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      name TEXT DEFAULT '',
      scopes TEXT DEFAULT '*',
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      last_used_at TEXT
    )
  `);

  // 确保有系统 API Token
  const rows = db.query('SELECT COUNT(*) as c FROM api_tokens WHERE user_id = ?', ['system']);
  if (!rows[0]?.c) {
    const token = crypto.randomBytes(24).toString('hex');
    db.insert('api_tokens', { id: 'tok_system', user_id: 'system', token, name: '系统默认Token', scopes: '*' });
    console.log(`[Auth] System API Token: ${token}`);
  }
}

/** 签发 Token */
export function issueToken(userId: string, name: string, scopes: string = '*', expiresDays: number = 365): string {
  if (!_db) throw new Error('Auth not initialized');
  const token = crypto.randomBytes(24).toString('hex');
  const id = 'tok_' + Date.now();
  const expiresAt = new Date(Date.now() + expiresDays * 86400000).toISOString();
  _db.insert('api_tokens', { id, user_id: userId, token, name, scopes, expires_at: expiresAt });
  return token;
}

/** 验证 Token */
export function verifyToken(token: string): { userId: string; scopes: string } | null {
  if (!_db) return null;
  const rows = _db.query(
    'SELECT user_id, scopes, expires_at FROM api_tokens WHERE token = ?',
    [token]
  );
  const row = rows[0];
  if (!row) return null;
  if (row.expires_at && new Date(row.expires_at) < new Date()) return null;
  // 更新最后使用时间
  _db.query('UPDATE api_tokens SET last_used_at = datetime("now") WHERE token = ?', [token]);
  return { userId: row.user_id, scopes: row.scopes };
}

/** 吊销 Token */
export function revokeToken(token: string): boolean {
  if (!_db) return false;
  const r = _db.delete('api_tokens', token);
  return r.changes > 0;
}

/** Express 中间件: API Token 认证 */
export function apiAuthMiddleware(req: any, res: any, next: any): void {
  // 豁免公开 GET 端点
  if (req.method === 'GET') return next();

  // 豁免 AI 端点 (已有会话认证)
  if (req.path.startsWith('/api/ai/')) return next();

  // 豁免健康检查
  if (req.path === '/api/health') return next();

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    // 开发模式: 允许无 Token (向前兼容)
    if (process.env.NODE_ENV !== 'production') return next();

    return res.status(401).json({ success: false, error: '缺少 API Token，请在 Authorization header 中提供 Bearer token' });
  }

  const verified = verifyToken(token);
  if (!verified) {
    return res.status(403).json({ success: false, error: 'API Token 无效或已过期' });
  }

  req.apiUser = verified;
  next();
}
