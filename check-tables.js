const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db', { readonly: true });
// 现有所有表
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
console.log('现有表:');
tables.forEach(t => {
  const cols = db.prepare("PRAGMA table_info('" + t.name + "')").all();
  console.log('  ' + t.name + ': ' + cols.map(c => c.name).join(', '));
});
db.close();
