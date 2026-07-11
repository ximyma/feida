/**
 * MemoryManager — 记忆系统高层接口
 * 参照 CowAgent agent/memory/manager.py
 *
 * 三层记忆:
 * - 每日日志: agent/memory/YYYY-MM-DD.md
 * - 长期记忆: agent/MEMORY.md
 * - FTS5 搜索: agent/memory/long-term/index.db
 */
import fs from 'fs';
import path from 'path';

const AGENT_DIR = path.resolve(__dirname, '..', '..', '..', 'agent');
const MEMORY_DIR = path.join(AGENT_DIR, 'memory');
const LONG_TERM_DB = path.join(MEMORY_DIR, 'long-term', 'index.db');
const LONG_TERM_MD = path.join(AGENT_DIR, 'MEMORY.md');

/** 每日记忆文件路径 */
export function todayMemoryPath(): string {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(MEMORY_DIR, `${date}.md`);
}

/** 追加到每日记忆 */
export function appendDailyMemory(content: string): void {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
  const file = todayMemoryPath();
  const timestamp = new Date().toISOString().slice(11, 19);
  const entry = `\n## ${timestamp}\n\n${content}\n`;
  fs.appendFileSync(file, entry, 'utf-8');
}

/** 读取今日记忆 */
export function readDailyMemory(): string {
  const file = todayMemoryPath();
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : '';
}

/** 读取最近 N 天的记忆 */
export function readRecentMemories(days: number): string {
  const results: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const file = path.join(MEMORY_DIR, `${d}.md`);
    if (fs.existsSync(file)) results.push(fs.readFileSync(file, 'utf-8'));
  }
  return results.join('\n---\n');
}

/** 读取/创建长期记忆索引 */
export function getLongTermMemory(): string {
  if (!fs.existsSync(LONG_TERM_MD)) {
    const template = `# 飞达 Agent 长期记忆\n\n> 此文件由 AI Agent 自动维护，记录重要的项目决策、用户偏好、经验教训\n\n`;
    fs.mkdirSync(AGENT_DIR, { recursive: true });
    fs.writeFileSync(LONG_TERM_MD, template, 'utf-8');
  }
  return fs.readFileSync(LONG_TERM_MD, 'utf-8');
}

/** 更新长期记忆 (Agent 调用) */
export function updateLongTermMemory(content: string): void {
  fs.mkdirSync(path.dirname(LONG_TERM_MD), { recursive: true });
  fs.writeFileSync(LONG_TERM_MD, content, 'utf-8');
}

/** FTS5 关键词搜索记忆和知识 */                      
export function searchMemory(query: string, maxResults = 10): Array<{ path: string; snippet: string }> {
  fs.mkdirSync(path.dirname(LONG_TERM_DB), { recursive: true });
  
  try {
    // 使用已有的 FTS5 索引或创建临时搜索
    const allFiles = findAllMemoryFiles();
    const results: Array<{ path: string; snippet: string }> = [];
    const terms = query.toLowerCase().split(/\s+/);

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (terms.every(t => line.includes(t))) {
          const start = Math.max(0, i - 1);
          const end = Math.min(lines.length, i + 2);
          results.push({
            path: path.relative(AGENT_DIR, file),
            snippet: lines.slice(start, end).join('\n').slice(0, 300),
          });
          if (results.length >= maxResults) break;
        }
      }
      if (results.length >= maxResults) break;
    }
    return results;
  } catch {
    return [];
  }
}

/** 查找所有记忆文件 */
function findAllMemoryFiles(): string[] {
  const files: string[] = [];
  if (fs.existsSync(LONG_TERM_MD)) files.push(LONG_TERM_MD);

  const memDir = MEMORY_DIR;
  if (fs.existsSync(memDir)) {
    for (const entry of fs.readdirSync(memDir)) {
      if (entry.endsWith('.md')) files.push(path.join(memDir, entry));
    }
  }
  return files;
}

/** 记忆刷新——将对话摘要写入每日日志 (当上下文超限时调用) */
export async function flushMemory(summary: string, source = 'context_overflow'): Promise<void> {
  const entry = `> 来源: ${source}\n> 时间: ${new Date().toISOString()}\n\n${summary}`;
  appendDailyMemory(`${entry}\n`);
}
