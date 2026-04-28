const Database = require('better-sqlite3');
const db = new Database('./data/ehr.db');

['users', 'roles', 'permissions'].forEach(t => {
  console.log('\n=== ' + t + ' ===');
  try {
    const cols = db.prepare('PRAGMA table_info(' + t + ')').all();
    cols.forEach(c => console.log('  ' + c.name + ' (' + c.type + ')' + (c.notnull ? ' NOT NULL' : '')));
    const count = db.prepare('SELECT COUNT(*) as cnt FROM ' + t).get();
    console.log('  -- ' + count.cnt + ' rows --');
    const sample = db.prepare('SELECT * FROM ' + t + ' LIMIT 3').all();
    sample.forEach(row => console.log('  ', row));
  } catch(e) {
    console.log('  Error:', e.message);
  }
});
