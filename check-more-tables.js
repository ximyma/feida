const sqlite3 = require('better-sqlite3');
const db = sqlite3('D:/feida/data/ehr.db');
const tables = ['talent_profiles', 'talent_reports', 'recruitment_demands'];
tables.forEach(t => {
  try {
    const info = db.prepare(`PRAGMA table_info(${t})`).all();
    const count = db.prepare(`SELECT count(*) as c FROM ${t}`).get().c;
    console.log(`\n=== ${t} (${count} rows) ===`);
    info.forEach(c => console.log(`  ${c.name} (${c.type}) ${c.pk ? 'PK' : ''}`));
  } catch(e) {
    console.log(`\n=== ${t} === NOT FOUND`);
  }
});
db.close();
