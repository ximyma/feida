/**
 * 修复最后剩余的空表
 */

const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

const now = new Date().toISOString();
const today = new Date().toISOString().slice(0, 10);

const employees = db.prepare('SELECT id, name, department, position, status FROM employees').all();
const positions = db.prepare('SELECT id, name FROM positions').all();

console.log('修复剩余空表...');

// ============ overtime_records ============
console.log('Checking overtime_records schema...');
try {
  const info = db.prepare('PRAGMA table_info(overtime_records)').all();
  console.log('  columns:', info.map(c => c.name).join(', '));
  
  const otStmt = db.prepare(`INSERT OR IGNORE INTO overtime_records 
    (id, employeeId, employeeName, date, hours, overtimeType, reason, status, approver, approveTime, handlerId, handlerName, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  employees.slice(0, 15).forEach((emp, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 20));
    const hours = [2, 3, 4, 5, 6, 8][Math.floor(Math.random() * 6)];
    const status = ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)];
    
    otStmt.run(
      `or2_${emp.id}_${i}`,
      emp.id, emp.name,
      date.toISOString().slice(0, 10),
      hours, '工作日加班', '项目赶工加班', status,
      status === 'approved' ? 'user_admin' : null,
      status === 'approved' ? now : null,
      'user_admin', '系统管理员', now
    );
  });
  console.log('  ✓ overtime_records');
} catch(e) {
  console.log('  ✗ overtime_records:', e.message);
}

// ============ training_plans ============
console.log('Checking training_plans schema...');
try {
  const info = db.prepare('PRAGMA table_info(training_plans)').all();
  console.log('  columns:', info.map(c => c.name).join(', '));
} catch(e) {}

// ============ training_courses ============
console.log('Checking training_courses schema...');
try {
  const info = db.prepare('PRAGMA table_info(training_courses)').all();
  console.log('  columns:', info.map(c => c.name).join(', '));
} catch(e) {}

// ============ interviews ============
console.log('Checking interviews schema...');
try {
  const info = db.prepare('PRAGMA table_info(interviews)').all();
  console.log('  columns:', info.map(c => c.name).join(', '));
} catch(e) {}

// ============ shift_change_requests ============
console.log('Checking shift_change_requests schema...');
try {
  const info = db.prepare('PRAGMA table_info(shift_change_requests)').all();
  console.log('  columns:', info.map(c => c.name).join(', '));
  
  const scrStmt = db.prepare(`INSERT OR IGNORE INTO shift_change_requests 
    (id, employeeId, employeeName, fromDate, toDate, fromShift, toShift, reason, status, approverId, approverName, approvedAt, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  employees.slice(0, 10).forEach((emp, i) => {
    scrStmt.run(
      `scr_${emp.id}_${i}`,
      emp.id, emp.name,
      today, today, '早班', '晚班',
      '个人原因调整班次',
      ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
      'user_admin', '系统管理员', now, now
    );
  });
  console.log('  ✓ shift_change_requests');
} catch(e) {
  console.log('  ✗ shift_change_requests:', e.message);
}

// ============ daily_attendance_reports ============
console.log('Checking daily_attendance_reports schema...');
try {
  const info = db.prepare('PRAGMA table_info(daily_attendance_reports)').all();
  console.log('  columns:', info.map(c => c.name).join(', '));
} catch(e) {}

// ============ monthly_attendance_summary ============
console.log('Checking monthly_attendance_summary schema...');
try {
  const info = db.prepare('PRAGMA table_info(monthly_attendance_summary)').all();
  console.log('  columns:', info.map(c => c.name).join(', '));
} catch(e) {}

// ============ surveys ============
console.log('Checking surveys schema...');
try {
  const info = db.prepare('PRAGMA table_info(surveys)').all();
  console.log('  columns:', info.map(c => c.name).join(', '));
} catch(e) {}

// ============ documents ============
console.log('Checking documents schema...');
try {
  const info = db.prepare('PRAGMA table_info(documents)').all();
  console.log('  columns:', info.map(c => c.name).join(', '));
} catch(e) {}

// ============ approval_requests ============
console.log('Checking approval_requests schema...');
try {
  const info = db.prepare('PRAGMA table_info(approval_requests)').all();
  console.log('  columns:', info.map(c => c.name).join(', '));
} catch(e) {}

// ============ employee_changes ============
console.log('Checking employee_changes schema...');
try {
  const info = db.prepare('PRAGMA table_info(employee_changes)').all();
  console.log('  columns:', info.map(c => c.name).join(', '));
} catch(e) {}

// ============ competency_models ============
console.log('Seeding competency_models...');
try {
  const cmStmt = db.prepare(`INSERT OR IGNORE INTO competency_models (id, name, positionId, positionName, description, totalWeight, isActive, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
  positions.slice(0, 5).forEach(pos => {
    cmStmt.run(`cm_${pos.id}`, `${pos.name}胜任力模型`, pos.id, pos.name, '岗位胜任力要求', 100, 1, now);
  });
  console.log('  ✓ competency_models');
} catch(e) {
  console.log('  ✗ competency_models:', e.message);
}

console.log('\n=== 最终统计 ===');
const finalStats = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
let emptyCount = 0;
let hasDataCount = 0;
finalStats.forEach(t => {
  try {
    const c = db.prepare('SELECT COUNT(*) as c FROM ' + t.name).get();
    if (c.c === 0) {
      emptyCount++;
      console.log('空表: ' + t.name);
    } else hasDataCount++;
  } catch(e) {}
});

console.log(`\n有数据表: ${hasDataCount}`);
console.log(`空表: ${emptyCount}`);

db.close();
