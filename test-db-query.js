const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

// 测试直接查询
const tables = ['employee_changes', 'schedules', 'company_contributions', 'offers', 'leave_records', 'overtime_records'];
tables.forEach(t => {
  try {
    const rows = db.prepare(`SELECT * FROM ${t} LIMIT 3`).all();
    console.log(`${t}: ${rows.length} 条 (前3条)`);
    if (rows.length > 0) console.log('  列:', Object.keys(rows[0]).join(', '));
  } catch(e) {
    console.log(`${t}: ERROR - ${e.message}`);
  }
});

db.close();
