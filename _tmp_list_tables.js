process.chdir('D:/feida');
const db = require('better-sqlite3')('./data/ehr.db');
const t = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log(t.map(x => x.name).join('\n'));
db.close();
