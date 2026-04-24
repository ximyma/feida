const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');
const info = db.pragma('table_info(audit_logs)');
console.log('audit_logs columns:');
info.forEach(c => console.log('  ' + c.name + ' (' + c.type + ')'));
db.close();
