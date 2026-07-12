/**
 * 登录安全模块 — 参照 Odoo auth_totp / login rate limiting
 *
 * 功能:
 *   1. 失败锁定: 连续N次失败后锁定账户M分钟
 *   2. 速率限制: 单IP每分钟最多K次尝试
 *   3. 登录日志: 记录所有登录事件
 */
import { IDatabaseDriver } from './database/database-driver';

const MAX_FAILURES = 5;         // 最大失败次数
const LOCK_MINUTES = 30;        // 锁定时长(分钟)
const RATE_LIMIT_PER_IP = 10;   // 单IP每分钟最大尝试
const RATE_WINDOW_SEC = 60;     // 速率窗口(秒)

let db: IDatabaseDriver;

export function initLoginSecurity(database: IDatabaseDriver) {
  db = database;
  const raw = (db as any).db || db;
  try { raw.exec(`CREATE TABLE IF NOT EXISTS login_logs (
    id TEXT PRIMARY KEY, username TEXT, ip TEXT, success INTEGER,
    fail_reason TEXT, user_agent TEXT, created_at TEXT DEFAULT (datetime('now'))
  )`); } catch {}
  try { raw.exec(`CREATE TABLE IF NOT EXISTS login_lockouts (
    id TEXT PRIMARY KEY, username TEXT UNIQUE, locked_until TEXT,
    fail_count INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
  )`); } catch {}
}

/** 检查账户是否被锁定 */
export function isAccountLocked(username: string): { locked: boolean; remainingMinutes?: number } {
  const row = (db.query('SELECT locked_until FROM login_lockouts WHERE username = ?', [username]) as any[])[0];
  if (!row?.locked_until) return { locked: false };
  const until = new Date(row.locked_until);
  if (until < new Date()) {
    // 锁定过期，清除记录
    db.delete('login_lockouts', username);
    return { locked: false };
  }
  const remaining = Math.ceil((until.getTime() - Date.now()) / 60000);
  return { locked: true, remainingMinutes: remaining };
}

/** 记录登录失败 */
export function recordLoginFailure(username: string, ip: string, reason: string): void {
  db.insert('login_logs', {
    id: `log_${Date.now()}`,
    username, ip, success: 0, fail_reason: reason || 'invalid_credentials',
  });

  const existing = (db.query('SELECT id, fail_count FROM login_lockouts WHERE username = ?', [username]) as any[])[0];
  const newCount = (existing?.fail_count || 0) + 1;

  if (existing) {
    if (newCount >= MAX_FAILURES) {
      const lockUntil = new Date(Date.now() + LOCK_MINUTES * 60000).toISOString();
      db.update('login_lockouts', existing.id, { fail_count: newCount, locked_until: lockUntil });
    } else {
      db.update('login_lockouts', existing.id, { fail_count: newCount });
    }
  } else {
    const lockUntil = newCount >= MAX_FAILURES
      ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString()
      : null;
    db.insert('login_lockouts', { id: `lock_${username}`, username, fail_count: newCount, locked_until: lockUntil });
  }
}

/** 记录登录成功，清除失败计数 */
export function recordLoginSuccess(username: string, ip: string): void {
  db.insert('login_logs', { id: `log_${Date.now()}`, username, ip, success: 1 });
  db.delete('login_lockouts', username);
}

/** IP速率限制 */
const ipRateMap = new Map<string, { count: number; resetAt: number }>();
export function checkIpRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const entry = ipRateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_SEC * 1000 });
    return { allowed: true };
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_PER_IP) {
    return { allowed: false, waitSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

/** Express 中间件: 登录安全检查 */
export function loginSecurityMiddleware(req: any, res: any, next: any) {
  if (req.path !== '/api/login' && req.path !== '/api/auth/login') return next();

  const ip = req.ip || req.socket?.remoteAddress || 'unknown';

  // IP速率限制
  const rate = checkIpRateLimit(ip);
  if (!rate.allowed) {
    return res.status(429).json({ success: false, error: `请求过于频繁，请${rate.waitSeconds}秒后重试` });
  }

  // 账户锁定检查
  const username = req.body?.username || req.body?.account;
  if (username) {
    const lock = isAccountLocked(username);
    if (lock.locked) {
      return res.status(423).json({ success: false, error: `账户已锁定，请${lock.remainingMinutes}分钟后重试` });
    }
  }

  next();
}
