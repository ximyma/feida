/**
 * 补全所有空表的种子数据（修正版）
 * 运行: node seed-all-tables-fixed.js
 */

const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

const now = new Date().toISOString();
const today = new Date().toISOString().slice(0, 10);

// 获取员工、部门、职位等基础数据
const employees = db.prepare('SELECT id, name, department, position, status FROM employees').all();
const activeEmployees = employees.filter(e => e.status === 'active');
const departments = db.prepare('SELECT id, name FROM departments').all();
const positions = db.prepare('SELECT id, name FROM positions').all();
const shiftTypes = db.prepare('SELECT id, name FROM shift_types').all();
const users = db.prepare('SELECT id, username, realName FROM users').all();
const recruitmentPositions = db.prepare('SELECT id, title, department FROM recruitment_positions').all();

console.log('基础数据: 员工=' + employees.length + ', 部门=' + departments.length + ', 职位=' + positions.length);

// ============ 1. 考勤排班 (schedules) ============
console.log('Seeding schedules...');
const scheduleStmt = db.prepare(`INSERT OR IGNORE INTO schedules 
  (id, employeeId, employeeName, department, date, shiftTypeId, shiftTypeName, scheduledStart, scheduledEnd, isRestDay, isHoliday, remark, createdAt) 
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);

for (let d = 0; d < 30; d++) {
  const date = new Date();
  date.setDate(date.getDate() - d);
  const dateStr = date.toISOString().slice(0, 10);
  const isRest = date.getDay() === 0 || date.getDay() === 6;
  
  activeEmployees.slice(0, 30).forEach((emp, i) => {
    const shift = shiftTypes[i % shiftTypes.length];
    scheduleStmt.run(
      `sch_${emp.id}_${dateStr.replace(/-/g, '')}`,
      emp.id, emp.name, emp.department,
      dateStr, shift.id, shift.name,
      '09:00', '18:00', isRest ? 1 : 0, 0, '', now
    );
  });
}

// ============ 2. 考勤记录 (attendance_records) ============
console.log('Seeding attendance_records...');
const attStmt = db.prepare(`INSERT OR IGNORE INTO attendance_records 
  (id, employeeId, employeeName, date, shiftTypeId, shiftTypeName, scheduledStart, scheduledEnd, clockIn, clockOut, workHours, lateMinutes, earlyLeaveMinutes, status, lateCount, isRestDay, isHoliday, remark, createdAt) 
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

for (let d = 0; d < 30; d++) {
  const date = new Date();
  date.setDate(date.getDate() - d);
  const dateStr = date.toISOString().slice(0, 10);
  const isRest = date.getDay() === 0 || date.getDay() === 6;
  if (isRest) continue;
  
  activeEmployees.slice(0, 30).forEach((emp, i) => {
    const isLate = Math.random() < 0.1;
    const isEarly = Math.random() < 0.05;
    const lateMinutes = isLate ? Math.floor(Math.random() * 30) + 1 : 0;
    const earlyMinutes = isEarly ? Math.floor(Math.random() * 30) + 1 : 0;
    const clockInHour = isLate ? 9 : 8;
    const clockInMin = isLate ? lateMinutes : Math.floor(Math.random() * 45);
    const clockOutHour = isEarly ? 17 : 18 + Math.floor(Math.random() * 2);
    const clockOutMin = isEarly ? 30 - earlyMinutes : Math.floor(Math.random() * 30);
    
    const status = isLate ? '迟到' : (isEarly ? '早退' : '正常');
    const shift = shiftTypes[i % shiftTypes.length];
    
    attStmt.run(
      `ar_${emp.id}_${dateStr.replace(/-/g, '')}`,
      emp.id, emp.name, dateStr,
      shift.id, shift.name,
      '09:00', '18:00',
      `${String(clockInHour).padStart(2, '0')}:${String(clockInMin).padStart(2, '0')}:00`,
      `${String(clockOutHour).padStart(2, '0')}:${String(clockOutMin).padStart(2, '0')}:00`,
      '8.0', lateMinutes, earlyMinutes, status, isLate ? 1 : 0, isRest ? 1 : 0, 0, '', now
    );
  });
}

// ============ 3. 请假余额 (leave_balances) ============
console.log('Seeding leave_balances...');
const leaveTypes = [
  { type: '年假', days: 15 },
  { type: '病假', days: 10 },
  { type: '事假', days: 5 },
  { type: '婚假', days: 3 },
  { type: '产假', days: 128 },
  { type: '陪产假', days: 15 },
  { type: '丧假', days: 3 }
];

const lbStmt = db.prepare(`INSERT OR IGNORE INTO leave_balances 
  (id, employeeId, year, leaveType, totalDays, usedDays, pendingDays, availableDays, lastUpdated) 
  VALUES (?,?,?,?,?,?,?,?,?)`);

employees.forEach(emp => {
  leaveTypes.forEach((lt, i) => {
    const used = Math.floor(Math.random() * lt.days);
    const pending = Math.floor(Math.random() * 3);
    lbStmt.run(
      `lb_${emp.id}_${i}_${new Date().getFullYear()}`,
      emp.id, new Date().getFullYear(), lt.type,
      lt.days, used, pending, lt.days - used - pending, now
    );
  });
});

// ============ 4. 请假记录 (leave_records) ============
console.log('Seeding leave_records...');
try {
  const lrInfo = db.prepare('PRAGMA table_info(leave_records)').all();
  console.log('leave_records columns:', lrInfo.map(c => c.name).join(', '));
  
  const lrStmt = db.prepare(`INSERT OR IGNORE INTO leave_records 
    (id, employeeId, employeeName, department, leaveType, startDate, endDate, days, reason, status, approver, approverName, approvedAt, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  employees.slice(0, 20).forEach((emp, i) => {
    const type = leaveTypes[i % leaveTypes.length].type;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 20));
    const days = Math.floor(Math.random() * 3) + 1;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    
    lrStmt.run(
      `lr_${emp.id}_${i}`,
      emp.id, emp.name, emp.department || '研发部',
      type,
      startDate.toISOString().slice(0, 10),
      endDate.toISOString().slice(0, 10),
      days + 1,
      '个人事务申请',
      ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
      'user_admin', '系统管理员', now, now
    );
  });
} catch(e) {
  console.log('leave_records error:', e.message);
}

// ============ 5. 加班记录 (overtime_records) ============
console.log('Seeding overtime_records...');
try {
  const otStmt = db.prepare(`INSERT OR IGNORE INTO overtime_records 
    (id, employeeId, employeeName, department, date, startTime, endTime, hours, reason, status, approver, approvedAt, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  employees.slice(0, 15).forEach((emp, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 20));
    const hours = [2, 3, 4, 5, 6, 8][Math.floor(Math.random() * 6)];
    
    otStmt.run(
      `or_${emp.id}_${i}`,
      emp.id, emp.name, emp.department || '研发部',
      date.toISOString().slice(0, 10),
      '18:00', `${String(18 + Math.floor(hours / 60)).padStart(2, '0')}:${hours % 60}`,
      hours,
      '项目赶工加班',
      ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
      'user_admin', now, now
    );
  });
} catch(e) {
  console.log('overtime_records error:', e.message);
}

// ============ 6. 薪资记录 (salaries) ============
console.log('Seeding salaries...');
try {
  const salStmt = db.prepare(`INSERT OR IGNORE INTO salaries 
    (id, employeeId, employeeName, department, month, baseSalary, positionSalary, performance, overtime, mealAllowance, transportAllowance, otherAllowance, socialInsurance, medicalInsurance, housingFund, otherDeduction, tax, grossSalary, netSalary, status, paidAt, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  employees.slice(0, 25).forEach((emp, i) => {
    const base = 8000 + Math.floor(Math.random() * 15000);
    const position = 1000 + Math.floor(Math.random() * 3000);
    const performance = Math.floor(Math.random() * 2000);
    const overtime = Math.floor(Math.random() * 1000);
    const mealAllowance = 300;
    const transportAllowance = 500;
    const gross = base + position + performance + overtime + mealAllowance + transportAllowance;
    const social = Math.floor(base * 0.08);
    const medical = Math.floor(base * 0.02);
    const housing = Math.floor(base * 0.12);
    const tax = Math.floor(gross * 0.05);
    const net = gross - social - medical - housing - tax;
    
    salStmt.run(
      `sal_${emp.id}_${new Date().getFullYear()}_${String(new Date().getMonth()).padStart(2, '0')}`,
      emp.id, emp.name, emp.department || '研发部',
      `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2, '0')}`,
      base, position, performance, overtime, mealAllowance, transportAllowance, 0,
      social, medical, housing, 0, tax, gross, net, 'paid', now, now
    );
  });
} catch(e) {
  console.log('salaries error:', e.message);
}

// ============ 7. 合同 (contracts) ============
console.log('Seeding contracts...');
try {
  const contractStmt = db.prepare(`INSERT OR IGNORE INTO contracts (id, employeeId, employeeName, contractType, startDate, endDate, duration, signCount, status, remindDays, attachment, remark, electronicContractId, signedAt, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  employees.forEach(emp => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 24));
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 3);
    
    contractStmt.run(
      `con_${emp.id}`,
      emp.id, emp.name, 'fixed',
      startDate.toISOString().slice(0, 10),
      endDate.toISOString().slice(0, 10),
      36, 1, 'active', 30, null, '', null, startDate.toISOString().slice(0, 10), now
    );
  });
} catch(e) {
  console.log('contracts error:', e.message);
}

// ============ 8. 绩效记录 (performance_records) ============
console.log('Seeding performance_records...');
try {
  const cycles = db.prepare('SELECT id, name FROM performance_cycles').all();
  const prStmt = db.prepare(`INSERT OR IGNORE INTO performance_records (id, employeeId, employeeName, cycleId, cycleName, kpiScores, totalScore, grade, level, selfScore, managerScore, hrScore, feedback, improvement, status, submittedAt, reviewedAt, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  employees.slice(0, 25).forEach((emp, i) => {
    const cycle = cycles[i % cycles.length] || { id: 'pc_default', name: '2024年度考核' };
    const score = 70 + Math.floor(Math.random() * 30);
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D';
    
    prStmt.run(
      `pr_${emp.id}_${cycle.id}`,
      emp.id, emp.name, cycle.id, cycle.name,
      JSON.stringify({ k1: 85, k2: 90, k3: 78 }),
      score, grade, grade,
      score - 5, score + 3, score,
      '整体表现良好，继续保持',
      '需要提升沟通能力',
      'completed', now, now, now
    );
  });
} catch(e) {
  console.log('performance_records error:', e.message);
}

// ============ 9. 培训记录 (training_records) ============
console.log('Seeding training_records...');
try {
  const trStmt = db.prepare(`INSERT OR IGNORE INTO training_records (id, employeeId, employeeName, trainingPlanId, courseId, trainingType, trainingDate, duration, score, passed, certificateNo, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  employees.slice(0, 20).forEach((emp, i) => {
    trStmt.run(
      `tr_${emp.id}_${i}`,
      emp.id, emp.name, 'tpl_1', 'tc_1', 'internal', today, 120, 85 + Math.floor(Math.random() * 15), 1, `CERT${Date.now()}`, now
    );
  });
} catch(e) {
  console.log('training_records error:', e.message);
}

// ============ 10. 访客 (visitors) ============
console.log('Seeding visitors...');
try {
  const visStmt = db.prepare(`INSERT OR IGNORE INTO visitors (id, name, company, idCard, phone, purpose, contactPerson, contactDept, visitTime, leaveTime, badgeNo, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  for (let i = 0; i < 10; i++) {
    visStmt.run(`vis_${i}`, `访客${i + 1}`, `合作公司${i + 1}`, `110101199001010${i + 1}1`, `1380013800${i}`, '商务洽谈', 'user_admin', '行政部', `${today} 10:00`, `${today} 12:00`, `V${String(i).padStart(4, '0')}`, 'left', now);
  }
} catch(e) {
  console.log('visitors error:', e.message);
}

console.log('\n=== 种子数据完成 ===');

// 统计最终结果
const finalStats = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
let emptyCount = 0;
let hasDataCount = 0;
finalStats.forEach(t => {
  try {
    const c = db.prepare('SELECT COUNT(*) as c FROM ' + t.name).get();
    if (c.c === 0) emptyCount++;
    else hasDataCount++;
  } catch(e) {}
});

console.log(`有数据表: ${hasDataCount}`);
console.log(`空表: ${emptyCount}`);

db.close();
