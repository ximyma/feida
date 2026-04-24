const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

const empId = 'emp_admin_virtual';

const balances = [
  { id: 'lb_admin_1', employeeId: empId, leaveType: '年假', totalDays: 15, usedDays: 0, pendingDays: 0, availableDays: 15, year: 2026, lastUpdated: new Date().toISOString() },
  { id: 'lb_admin_2', employeeId: empId, leaveType: '病假', totalDays: 10, usedDays: 0, pendingDays: 0, availableDays: 10, year: 2026, lastUpdated: new Date().toISOString() },
  { id: 'lb_admin_3', employeeId: empId, leaveType: '事假', totalDays: 5, usedDays: 0, pendingDays: 0, availableDays: 5, year: 2026, lastUpdated: new Date().toISOString() },
];

try {
  const stmt = db.prepare(`INSERT OR REPLACE INTO leave_balances (id, employeeId, year, leaveType, totalDays, usedDays, pendingDays, availableDays, lastUpdated) VALUES (@id, @employeeId, @year, @leaveType, @totalDays, @usedDays, @pendingDays, @availableDays, @lastUpdated)`);
  for (const lb of balances) {
    stmt.run(lb);
    console.log('✅ Inserted:', lb.leaveType);
  }
} catch (e) {
  console.log('❌ Error:', e.message);
}

const check = db.prepare('SELECT leaveType, availableDays, totalDays FROM leave_balances WHERE employeeId = ?').all(empId);
console.log('\nAdmin leave balances:', check);

db.close();
