const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

const info = db.prepare('PRAGMA table_info(leave_records)').all();
console.log('leave_records columns:', info.map(c => c.name).join(', '));

const info2 = db.prepare('PRAGMA table_info(overtime_records)').all();
console.log('overtime_records columns:', info2.map(c => c.name).join(', '));

db.close();
