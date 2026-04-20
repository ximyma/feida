const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

console.log('=== 数据库表统计 ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
const emptyTables = [];
const hasDataTables = [];

tables.forEach(t => {
  try {
    const c = db.prepare('SELECT COUNT(*) as c FROM ' + t.name).get();
    if (c.c === 0) {
      emptyTables.push(t.name);
    } else {
      hasDataTables.push({ name: t.name, count: c.c });
    }
  } catch(e) {}
});

console.log('\n空表 (' + emptyTables.length + '):');
emptyTables.forEach(t => console.log('  - ' + t));

console.log('\n有数据的表 (' + hasDataTables.length + '):');
hasDataTables.sort((a, b) => b.count - a.count).forEach(t => console.log('  ' + t.name + ': ' + t.count));

db.close();
