const db = require('better-sqlite3')('D:/feida/data/ehr.db');

console.log('=== 审批相关表结构 ===\n');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%approval%'").all();

tables.forEach(t => {
  const cols = db.prepare(`PRAGMA table_info(${t.name})`).all();
  console.log(`\n${t.name}:`);
  cols.forEach(c => console.log(`  ${c.name} (${c.type})`));
});

console.log('\n=== audit_logs 表结构 ===');
const auditCols = db.prepare('PRAGMA table_info(audit_logs)').all();
auditCols.forEach(c => console.log(`  ${c.name} (${c.type})`));

db.close();
