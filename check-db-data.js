const db = require('better-sqlite3')('D:/feida/data/ehr.db');

console.log('=== 数据库表数据统计 ===\n');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();

let hasData = [];
let empty = [];

tables.forEach(t => {
  try {
    const count = db.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get();
    if (count.c > 0) {
      hasData.push({ name: t.name, count: count.c });
    } else {
      empty.push(t.name);
    }
  } catch(e) {
    empty.push(t.name + '(ERR)');
  }
});

console.log(`有数据的表 (${hasData.length}):`);
hasData.forEach(t => console.log(`  ${t.name}: ${t.count}条`));

console.log(`\n空表 (${empty.length}):`);
empty.forEach(t => console.log(`  ${t}`));

console.log(`\n总计: ${tables.length}张表, ${hasData.length}张有数据, ${empty.length}张空表`);

db.close();
