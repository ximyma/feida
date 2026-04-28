const Database = require('better-sqlite3');
const db = new Database('./data/ehr.db');

const cols = db.prepare('PRAGMA table_info(employees)').all();
console.log('Employees columns:');
cols.forEach(c => console.log('  ' + c.name));

const sample = db.prepare('SELECT * FROM employees LIMIT 2').all();
console.log('\nSample employee:');
console.log(sample[0]);

db.close();
