const Database = require('better-sqlite3');
const db = new Database('./data/ehr.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('All tables:');
tables.forEach(t => console.log(t.name));
