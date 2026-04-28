const db = require('better-sqlite3')('D:/feida/data/ehr.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
tables.forEach(r => console.log(r.name));
