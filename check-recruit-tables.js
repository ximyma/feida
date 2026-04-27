const sqlite3 = require('better-sqlite3');
const db = sqlite3('D:/feida/data/ehr.db');
const tables = ['recruitment_positions', 'candidates', 'talent_pools', 'interviews', 'talent_tags', 'email_templates', 'email_logs'];
tables.forEach(t => {
  try {
    const info = db.prepare(`PRAGMA table_info(${t})`).all();
    const count = db.prepare(`SELECT count(*) as c FROM ${t}`).get().c;
    console.log(`\n=== ${t} (${count} rows) ===`);
    info.forEach(c => console.log(`  ${c.name} (${c.type}) ${c.pk ? 'PK' : ''} ${c.notnull ? 'NOT NULL' : ''} dflt=${c.dflt_value}`));
  } catch(e) {
    console.log(`\n=== ${t} === NOT FOUND: ${e.message}`);
  }
});
db.close();
