/**
 * 飞达代码助手工具集
 * 参考 sowork2 FileTools/BashTool，适配飞达项目架构
 * 
 * 工具：read_file / write_file / patch / grep / glob / bash / sql_query
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

// ========== 安全配置 ==========
const PROJECT_ROOT = (() => {
  // 兼容两种加载路径：server/code-agent-tools.js 和 dist/server/code-agent-tools.js
  let root = path.resolve(__dirname, '..');
  if (!fs.existsSync(path.join(root, 'package.json'))) {
    root = path.resolve(__dirname, '..', '..');
  }
  return root;
})();
const ALLOWED_PATHS = [PROJECT_ROOT, path.resolve(PROJECT_ROOT, 'data'), path.resolve(PROJECT_ROOT, 'client'), path.resolve(PROJECT_ROOT, 'server')];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const BASH_TIMEOUT = 30000; // 30s

let db = null;
function getDb() {
  if (!db) {
    try { db = require('better-sqlite3')(path.join(PROJECT_ROOT, 'data', 'ehr.db')); }
    catch { /* ignore */ }
  }
  return db;
}

// ========== 路径安全检查 ==========
function sanitizePath(filePath) {
  // 相对路径基于项目根
  let resolved = path.resolve(PROJECT_ROOT, filePath.startsWith('/') ? '.' + filePath : filePath);
  // 校验是否在允许路径内
  const allowed = ALLOWED_PATHS.some(p => resolved.startsWith(p + path.sep) || resolved === p || resolved.startsWith(p));
  if (!allowed) throw new Error(`路径不在允许范围内: ${resolved}`);
  if (resolved.includes('..')) throw new Error(`路径包含非法字符: ${filePath}`);
  return resolved;
}

// ============ 工具定义 ============

const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: '读取项目文件内容。可以指定起始行和读取行数。',
      parameters: {
        type: 'object',
        properties: {
          file_path: { type: 'string', description: '相对于项目根的文件路径，如 server/standalone.ts' },
          offset: { type: 'integer', description: '起始行号（从1开始），不填则从开头读' },
          limit: { type: 'integer', description: '读取行数，默认500行' },
        },
        required: ['file_path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: '创建或覆写一个项目文件。会自动创建父目录。',
      parameters: {
        type: 'object',
        properties: {
          file_path: { type: 'string', description: '相对于项目根的文件路径' },
          content: { type: 'string', description: '要写入的文件内容' },
        },
        required: ['file_path', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'patch',
      description: '在文件中查找并替换指定文本（精确匹配）。适合小范围修改。',
      parameters: {
        type: 'object',
        properties: {
          file_path: { type: 'string', description: '相对于项目根的文件路径' },
          old_string: { type: 'string', description: '要查找的原文本（必须精确匹配）' },
          new_string: { type: 'string', description: '替换后的新文本' },
        },
        required: ['file_path', 'old_string', 'new_string']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'grep',
      description: '在项目文件中搜索匹配的文本（支持正则）。返回匹配的文件和行。',
      parameters: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: '搜索模式（支持正则表达式）' },
          path: { type: 'string', description: '搜索目录（相对路径），不填则搜索整个项目' },
          glob: { type: 'string', description: '文件名过滤，如 *.ts 或 **/*.tsx' },
          max_results: { type: 'integer', description: '最大返回结果数，默认30' },
        },
        required: ['pattern']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'glob',
      description: '按文件名模式查找文件。支持通配符 ** 递归匹配。',
      parameters: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: '文件匹配模式，如 **/*.tsx 或 server/*.js' },
          limit: { type: 'integer', description: '最大返回文件数，默认50' },
        },
        required: ['pattern']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'bash',
      description: '在项目目录执行shell命令。结果会被截断（最大8000字符）。',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: '要执行的命令（在项目根目录执行）' },
          timeout: { type: 'integer', description: '超时毫秒数，默认30000' },
        },
        required: ['command']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'sql_query',
      description: '对项目SQLite数据库执行查询（只读SELECT）或修改（INSERT/UPDATE/DELETE）。修改操作需要confirm参数。',
      parameters: {
        type: 'object',
        properties: {
          sql: { type: 'string', description: 'SQL语句。只读查询直接执行，写操作需confirm=true' },
          confirm: { type: 'boolean', description: '执行写操作时必须设为true确认' },
        },
        required: ['sql']
      }
    }
  },
];

// ============ 工具执行函数 ============

function execReadFile(params) {
  const fp = sanitizePath(params.file_path);
  if (!fs.existsSync(fp)) return { error: `文件不存在: ${params.file_path}` };
  const stat = fs.statSync(fp);
  if (stat.isDirectory()) return { error: `${params.file_path} 是一个目录` };
  if (stat.size > MAX_FILE_SIZE) return { error: `文件过大 (${(stat.size/1024/1024).toFixed(1)}MB)，请用grep搜索` };
  // 拒绝二进制文件（.db .exe .dll .bin .so .zip 等）
  const ext = path.extname(fp).toLowerCase();
  const binaryExts = ['.db','.db-shm','.db-wal','.exe','.dll','.bin','.so','.dylib','.zip','.7z','.gz','.jpg','.png','.gif','.ico','.woff','.ttf','.mp4','.mp3'];
  if (binaryExts.includes(ext)) return { error: `${params.file_path} 是二进制文件（${ext}），无法直接读取。如需查询数据库请用 sql_query 工具。` };
  
  const content = fs.readFileSync(fp, 'utf-8');
  const lines = content.split('\n');
  const offset = params.offset || 1;
  const limit = params.limit || 500;
  
  let result = '';
  for (let i = Math.max(0, offset - 1); i < Math.min(lines.length, offset - 1 + limit); i++) {
    result += `${offset + (i - offset + 1)}: ${lines[i]}\n`;
  }
  
  return {
    file_path: params.file_path,
    total_lines: lines.length,
    shown_lines: `${offset}-${Math.min(lines.length, offset - 1 + limit)}`,
    content: result
  };
}

function execWriteFile(params) {
  const fp = sanitizePath(params.file_path);
  if (params.content && params.content.length > MAX_FILE_SIZE) return { error: '内容超过5MB限制' };
  
  const dir = path.dirname(fp);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  fs.writeFileSync(fp, params.content || '', 'utf-8');
  const written = fs.statSync(fp).size;
  return { success: true, file_path: params.file_path, size: written, message: `文件已写入: ${params.file_path} (${(written/1024).toFixed(1)}KB)` };
}

function execPatch(params) {
  const fp = sanitizePath(params.file_path);
  if (!fs.existsSync(fp)) return { error: `文件不存在: ${params.file_path}` };
  
  const content = fs.readFileSync(fp, 'utf-8');
  if (params.old_string === params.new_string) return { error: 'old_string 和 new_string 相同，无需修改' };
  
  const count = content.split(params.old_string).length - 1;
  if (count === 0) return { error: '未找到匹配的文本。请确保old_string精确匹配文件中的内容（包括空格和缩进）' };
  if (count > 1) return { error: `找到 ${count} 处匹配，请提供更精确的old_string（包含更多上下文以确保唯一性）` };
  
  const newContent = content.replace(params.old_string, params.new_string);
  fs.writeFileSync(fp, newContent, 'utf-8');
  return { success: true, file_path: params.file_path, message: '修改已应用' };
}

function execGrep(params) {
  const searchDir = params.path ? sanitizePath(params.path) : PROJECT_ROOT;
  const pattern = params.pattern;
  const maxResults = params.max_results || 30;
  const globFilter = params.glob;
  
  if (!fs.existsSync(searchDir)) return { error: `目录不存在: ${params.path}` };
  
  const results = [];
  try {
    let regex;
    try { regex = new RegExp(pattern, 'gi'); } catch { regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'); }
    
    const walkDir = (dir) => {
      if (results.length >= maxResults) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (results.length >= maxResults) break;
        if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'dist' || e.name === '.git') continue;
        const fullPath = path.join(dir, e.name);
        if (e.isDirectory()) { walkDir(fullPath); continue; }
        if (globFilter) {
          // 简单 glob 匹配
          const rel = path.relative(PROJECT_ROOT, fullPath).replace(/\\/g, '/');
          const g = globFilter.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*').replace(/\?/g, '.');
          try { if (!new RegExp('^' + g + '$').test(rel)) continue; } catch { /* fall through */ }
        }
        try {
          const stat = fs.statSync(fullPath);
          if (stat.size > MAX_FILE_SIZE) return;
          const lines = fs.readFileSync(fullPath, 'utf-8').split('\n');
          lines.forEach((line, idx) => {
            if (results.length >= maxResults) return;
            if (regex.test(line)) {
              const relPath = path.relative(PROJECT_ROOT, fullPath).replace(/\\/g, '/');
              results.push({ file: relPath, line: idx + 1, content: line.trim().slice(0, 200) });
            }
          });
        } catch { /* skip binary/unreadable */ }
      }
    };
    walkDir(searchDir);
  } catch(e) { return { error: e.message }; }
  
  return { pattern, results, total: results.length };
}

function execGlob(params) {
  const p = params.pattern.replace(/\*\*/g, '{{RECURSE}}').replace(/\*/g, '{{STAR}}').replace(/\?/g, '{{QMARK}}');
  const limit = params.limit || 50;
  const results = [];
  
  // 用简单的递归 glob
  const baseDir = PROJECT_ROOT;
  const walkForGlob = (dir, depth = 0) => {
    if (results.length >= limit || depth > 20) return;
    try {
      fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
        if (results.length >= limit) return;
        if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'dist' || e.name === '.git') return;
        const full = path.join(dir, e.name);
        const rel = path.relative(baseDir, full).replace(/\\/g, '/');
        if (e.isDirectory()) { walkForGlob(full, depth + 1); return; }
        
        // 匹配模式
        const regex = new RegExp('^' + params.pattern
          .replace(/\*\*/g, '§RECURSE§')
          .replace(/\*/g, '[^/]*')
          .replace(/\?/g, '.')
          .replace(/§RECURSE§/g, '.*')
          + '$');
        if (regex.test(rel)) results.push(rel);
      });
    } catch { /* skip unreadable */ }
  };
  walkForGlob(baseDir);
  
  return { pattern: params.pattern, files: results, total: results.length };
}

function execBash(params) {
  const cmd = params.command;
  const timeout = params.timeout || BASH_TIMEOUT;
  
  // 危险命令过滤
  const dangerous = ['rm -rf /', 'mkfs.', ':(){', 'chmod 777 /', 'shutdown', 'reboot', 'dd if=', 'format c:'];
  if (dangerous.some(d => cmd.toLowerCase().includes(d))) {
    return { error: '命令被安全策略拦截。请勿执行危险操作。' };
  }
  
  try {
    const result = execSync(cmd, { cwd: PROJECT_ROOT, timeout, encoding: 'utf-8', maxBuffer: 1024 * 1024 });
    const output = (result || '命令执行完成（无输出）').slice(0, 8000);
    return { success: true, command: cmd, output };
  } catch (e) {
    return { success: false, command: cmd, error: e.message?.slice(0, 1000), stdout: e.stdout?.slice(0, 2000), stderr: e.stderr?.slice(0, 2000) };
  }
}

function execSqlQuery(params) {
  const sql = (params.sql || '').trim();
  if (!sql) return { error: 'SQL语句为空' };
  
  const isWrite = /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b/i.test(sql);
  if (isWrite && !params.confirm) {
    return { error: '写操作需要添加 confirm: true 参数确认。请确认SQL正确后再执行。\nSQL: ' + sql.slice(0, 200) };
  }
  
  const dbi = getDb();
  if (!dbi) return { error: '数据库连接失败' };
  
  try {
    if (/^\s*SELECT\b/i.test(sql) || /^\s*PRAGMA\b/i.test(sql)) {
      const rows = dbi.prepare(sql).all();
      return { type: 'query', sql: sql.slice(0, 200), rowCount: rows.length, rows: rows.slice(0, 50) };
    } else if (/^\s*INSERT\b/i.test(sql)) {
      const result = dbi.prepare(sql).run();
      return { type: 'insert', lastID: result.lastInsertRowid, changes: result.changes };
    } else {
      const result = dbi.prepare(sql).run();
      return { type: 'write', changes: result.changes, sql: sql.slice(0, 200) };
    }
  } catch (e) {
    return { error: e.message, sql: sql.slice(0, 200) };
  }
}

// ============ 导出 ============

module.exports = {
  TOOL_DEFINITIONS,
  execute(name, params) {
    switch (name) {
      case 'read_file': return execReadFile(params);
      case 'write_file': return execWriteFile(params);
      case 'patch': return execPatch(params);
      case 'grep': return execGrep(params);
      case 'glob': return execGlob(params);
      case 'bash': return execBash(params);
      case 'sql_query': return execSqlQuery(params);
      default: return { error: `未知工具: ${name}` };
    }
  },
  // 辅助方法
  execReadFile, execWriteFile, execPatch, execGrep, execGlob, execBash, execSqlQuery,
};
