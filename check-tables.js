const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

const tables = ['schedules', 'attendance_records', 'leave_balances'];
tables.forEach(t => {
  console.log(`\n=== ${t} 表结构 ===`);
  const info = db.prepare(`PRAGMA table_info(${t})`).all();
  console.log(info.map(c => c.name).join(', '));
});

db.close();
