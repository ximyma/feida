/**
 * ConversationStore — 对话持久化
 * 参照 CowAgent agent/memory/conversation_store.py
 *
 * SQLite 存储 sessions + messages
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const AGENT_DIR = path.resolve(__dirname, '..', '..', '..', 'agent');
const DB_PATH = path.join(AGENT_DIR, 'conversations.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(AGENT_DIR, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        title TEXT DEFAULT '',
        created_at INTEGER NOT NULL,
        last_active INTEGER NOT NULL,
        msg_count INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        seq INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        UNIQUE(session_id, seq)
      );
      CREATE INDEX IF NOT EXISTS idx_msgs_session ON messages(session_id, seq);
    `);
  }
  return db;
}

export interface Session {
  session_id: string;
  title: string;
  created_at: number;
  last_active: number;
  msg_count: number;
}

export interface StoredMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
}

/** 创建新会话 */
export function createSession(sessionId: string, title = ''): Session {
  const d = getDb();
  const now = Date.now();
  d.prepare('INSERT OR REPLACE INTO sessions (session_id, title, created_at, last_active, msg_count) VALUES (?, ?, ?, ?, 0)')
    .run(sessionId, title || '新对话', now, now);
  return { session_id: sessionId, title: title || '新对话', created_at: now, last_active: now, msg_count: 0 };
}

/** 加载会话消息 (最近 maxTurns 条 user+assistant 对) */
export function loadMessages(sessionId: string, maxTurns = 20): StoredMessage[] {
  const d = getDb();
  const rows = d.prepare(
    'SELECT role, content FROM messages WHERE session_id = ? ORDER BY seq DESC LIMIT ?'
  ).all(sessionId, maxTurns * 2) as any[];
  return rows.reverse().map(r => ({ role: r.role, content: r.content }));
}

/** 追加消息 */
export function appendMessages(sessionId: string, messages: StoredMessage[]): void {
  const d = getDb();
  const now = Date.now();
  const maxSeq = (d.prepare('SELECT COALESCE(MAX(seq), 0) as m FROM messages WHERE session_id = ?').get(sessionId) as any).m;

  const stmt = d.prepare('INSERT OR IGNORE INTO messages (session_id, seq, role, content, created_at) VALUES (?, ?, ?, ?, ?)');
  const tx = d.transaction(() => {
    for (let i = 0; i < messages.length; i++) {
      stmt.run(sessionId, maxSeq + i + 1, messages[i].role, messages[i].content, now);
    }
    d.prepare('UPDATE sessions SET last_active = ?, msg_count = msg_count + ? WHERE session_id = ?')
      .run(now, messages.length, sessionId);
  });
  tx();
}

/** 更新会话标题 */
export function updateSessionTitle(sessionId: string, title: string): void {
  const d = getDb();
  d.prepare('UPDATE sessions SET title = ? WHERE session_id = ?').run(title.slice(0, 100), sessionId);
}

/** 自动生成标题 (取首条用户消息前30字) */
export function generateTitle(firstMessage: string): string {
  const cleaned = firstMessage.replace(/[\n\r]/g, ' ').trim();
  return cleaned.slice(0, 30) + (cleaned.length > 30 ? '...' : '');
}

/** 列出所有会话 */
export function listSessions(page = 1, pageSize = 50): Session[] {
  const d = getDb();
  return d.prepare('SELECT * FROM sessions ORDER BY last_active DESC LIMIT ? OFFSET ?')
    .all(pageSize, (page - 1) * pageSize) as Session[];
}

/** 清空会话消息 */
export function clearSession(sessionId: string): void {
  const d = getDb();
  d.prepare('DELETE FROM messages WHERE session_id = ?').run(sessionId);
  d.prepare('UPDATE sessions SET msg_count = 0, last_active = ? WHERE session_id = ?').run(Date.now(), sessionId);
}

/** 清理过期会话 (默认 30 天) */
export function cleanupOldSessions(maxAgeDays = 30): void {
  const d = getDb();
  const cutoff = Date.now() - maxAgeDays * 86400000;
  d.prepare('DELETE FROM messages WHERE session_id IN (SELECT session_id FROM sessions WHERE last_active < ?)').run(cutoff);
  d.prepare('DELETE FROM sessions WHERE last_active < ?').run(cutoff);
}

/** 获取会话标题 */
export function getSessionTitle(sessionId: string): string {
  const d = getDb();
  const row = d.prepare('SELECT title FROM sessions WHERE session_id = ?').get(sessionId) as any;
  return row?.title || '新对话';
}

export function closeDb(): void {
  if (db) { db.close(); db = null; }
}
