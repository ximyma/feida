const db = require('better-sqlite3')('data/ehr.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
tables.forEach(t => {
  try {
    const count = db.prepare('SELECT COUNT(*) as c FROM ' + t.name).get();
    console.log(t.name + ': ' + count.c);
  } catch(e) { console.log(t.name + ': ERROR'); }
});
