process.chdir('D:\\feida');
const db = require('better-sqlite3')('data/ehr.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
const names = tables.map(t => t.name);
console.log('Total tables:', names.length);
console.log(JSON.stringify(names, null, 2));
db.close();