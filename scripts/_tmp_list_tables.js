const db = require('D:/feida/node_modules/better-sqlite3')('D:/feida/data/ehr.db');
const t = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log(t.map(x => x.name).join('\n'));
db.close();
