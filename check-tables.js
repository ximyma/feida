const Database = require('better-sqlite3');
const db = new Database('./data/ehr.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
tables.forEach(t => {
  try {
    const cnt = db.prepare('SELECT COUNT(*) as c FROM ' + t.name).get();
    console.log(t.name + ': ' + cnt.c + ' rows');
  } catch(e) {
    console.log(t.name + ': error');
  }
});

db.close();
