const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
const empty = [];
const hasData = [];
tables.forEach(t => {
  try {
    const c = db.prepare('SELECT COUNT(*) as c FROM "' + t.name + '"').get();
    if (c.c === 0) empty.push(t.name);
    else hasData.push(t.name + '(' + c.c + ')');
  } catch(e) { empty.push(t.name + '(ERR)'); }
});
console.log('=== 有数据的表 (' + hasData.length + ') ===');
hasData.forEach(t => console.log('  ' + t));
console.log('\n=== 空表 (' + empty.length + ') ===');
empty.forEach(t => console.log('  ' + t));
db.close();
