const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
const allFields = new Set();

console.log('=== All table fields ===\n');
for (const { name } of tables) {
  const cols = db.pragma(`table_info(${name})`);
  const fields = cols.map(c => c.name);
  fields.forEach(f => allFields.add(f));
  console.log(`${name}: ${fields.join(', ')}`);
}

console.log('\n=== Unique field names (sorted) ===');
console.log([...allFields].sort().join('\n'));

db.close();
