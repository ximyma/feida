const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');
const cols = db.pragma('table_info(employees)');
console.log('employees columns:');
cols.forEach(c => console.log('  ' + c.name + ' (' + c.type + ')'));
db.close();
