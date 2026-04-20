/**
 * 补全所有空表的种子数据
 * 运行: node seed-all-tables.js
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
const recruitmentPositions = db.prepare('SELECT id, title AS name, department FROM recruitment_positions').all();

console.log('基础数据: 员工=' + employees.length + ', 部门=' + departments.length + ', 职位=' + positions.length);

// ============ 1. 考勤排班 (schedules) ============
console.log('Seeding schedules...');
const scheduleStmt = db.prepare(`INSERT OR IGNORE INTO schedules 
  (id, employeeId, employeeName, department, date, shiftType, shiftTypeId, startTime, endTime, status, createdAt) 
  VALUES (?,?,?,?,?,?,?,?,?,?,?)`);

for (let d = 0; d < 30; d++) {
  const date = new Date();
  date.setDate(date.getDate() - d);
  const dateStr = date.toISOString().slice(0, 10);
  if (date.getDay() === 0 || date.getDay() === 6) continue; // 跳过周末
  
  activeEmployees.slice(0, 30).forEach((emp, i) => {
    const shift = shiftTypes[i % shiftTypes.length];
    scheduleStmt.run(
      `sch_${emp.id}_${dateStr.replace(/-/g, '')}`,
      emp.id, emp.name, emp.department,
      dateStr, shift.name, shift.id,
      '09:00', '18:00', 'confirmed', now
    );
  });
}

// ============ 2. 考勤记录 (attendance_records) ============
console.log('Seeding attendance_records...');
const attStmt = db.prepare(`INSERT OR IGNORE INTO attendance_records 
  (id, employeeId, employeeName, department, date, checkIn, checkOut, workHours, status, shiftType, location, remark, createdAt) 
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);

for (let d = 0; d < 30; d++) {
  const date = new Date();
  date.setDate(date.getDate() - d);
  const dateStr = date.toISOString().slice(0, 10);
  if (date.getDay() === 0 || date.getDay() === 6) continue;
  
  activeEmployees.slice(0, 30).forEach((emp, i) => {
    const isLate = Math.random() < 0.1;
    const isEarly = Math.random() < 0.05;
    const checkInHour = isLate ? 9 + Math.floor(Math.random() * 2) : 8;
    const checkInMin = isLate ? Math.floor(Math.random() * 30) : Math.floor(Math.random() * 45);
    const checkOutHour = isEarly ? 17 : 18 + Math.floor(Math.random() * 2);
    const checkOutMin = Math.floor(Math.random() * 30);
    
    const status = isLate ? '迟到' : (isEarly ? '早退' : '正常');
    
    attStmt.run(
      `ar_${emp.id}_${dateStr.replace(/-/g, '')}`,
      emp.id, emp.name, emp.department,
      dateStr,
      `${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}:00`,
      `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}:00`,
      '8.0', status, shiftTypes[0]?.name || '标准班', '总部', '', now
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
  (id, employeeId, employeeName, leaveType, year, totalDays, usedDays, remainingDays, expiresAt, createdAt) 
  VALUES (?,?,?,?,?,?,?,?,?,?)`);

employees.forEach(emp => {
  leaveTypes.forEach((lt, i) => {
    const used = Math.floor(Math.random() * lt.days);
    lbStmt.run(
      `lb_${emp.id}_${i}_${new Date().getFullYear()}`,
      emp.id, emp.name, lt.type, new Date().getFullYear(),
      lt.days, used, lt.days - used,
      `${new Date().getFullYear()}-12-31`, now
    );
  });
});

// ============ 4. 请假记录 (leave_records) ============
console.log('Seeding leave_records...');
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

// ============ 5. 加班记录 (overtime_records) ============
console.log('Seeding overtime_records...');
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

// ============ 6. 班次变更申请 (shift_change_requests) ============
console.log('Seeding shift_change_requests...');
const scrStmt = db.prepare(`INSERT OR IGNORE INTO shift_change_requests 
  (id, employeeId, employeeName, department, fromDate, toDate, fromShift, toShift, reason, status, approverId, approverName, approvedAt, createdAt) 
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

employees.slice(0, 10).forEach((emp, i) => {
  scrStmt.run(
    `scr_${emp.id}_${i}`,
    emp.id, emp.name, emp.department || '研发部',
    today, today,
    '早班', '晚班',
    '个人原因调整班次',
    ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
    'user_admin', '系统管理员', now, now
  );
});

// ============ 7. 日考勤汇总 (daily_attendance_reports) ============
console.log('Seeding daily_attendance_reports...');
const darStmt = db.prepare(`INSERT OR IGNORE INTO daily_attendance_reports 
  (id, date, department, total, present, late, early, absent, leave, overtime, createdAt) 
  VALUES (?,?,?,?,?,?,?,?,?,?,?)`);

departments.forEach((dept, i) => {
  for (let d = 0; d < 30; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const total = 10 + Math.floor(Math.random() * 10);
    const present = total - Math.floor(Math.random() * 3);
    const late = Math.floor(Math.random() * 2);
    const early = Math.floor(Math.random() * 2);
    const absent = total - present;
    const leave = Math.floor(Math.random() * 2);
    const overtime = Math.floor(Math.random() * 3);
    
    darStmt.run(
      `dar_${dept.id}_${dateStr.replace(/-/g, '')}`,
      dateStr, dept.name, total, present, late, early, absent, leave, overtime, now
    );
  }
});

// ============ 8. 月考勤汇总 (monthly_attendance_summary) ============
console.log('Seeding monthly_attendance_summary...');
const masStmt = db.prepare(`INSERT OR IGNORE INTO monthly_attendance_summary 
  (id, employeeId, employeeName, department, year, month, workDays, presentDays, lateDays, earlyDays, absentDays, leaveDays, overtimeHours, totalHours, createdAt) 
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

employees.forEach(emp => {
  const workDays = 22;
  const lateDays = Math.floor(Math.random() * 3);
  const earlyDays = Math.floor(Math.random() * 2);
  const leaveDays = Math.floor(Math.random() * 3);
  const absentDays = Math.floor(Math.random() * 2);
  const presentDays = workDays - lateDays - earlyDays - leaveDays - absentDays;
  const overtimeHours = Math.floor(Math.random() * 20);
  
  masStmt.run(
    `mas_${emp.id}_${new Date().getFullYear()}_${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    emp.id, emp.name, emp.department || '研发部',
    new Date().getFullYear(), new Date().getMonth() + 1,
    workDays, presentDays, lateDays, earlyDays, absentDays, leaveDays, overtimeHours, presentDays * 8, now
  );
});

// ============ 9. 薪资记录 (salaries) ============
console.log('Seeding salaries...');
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

// ============ 10. 薪资项目 (salary_items) ============
console.log('Seeding salary_items...');
const salaryItems = [
  { id: 'si_base', name: '基本工资', code: 'BASE', type: 'earnings', defaultValue: 0, isTaxable: 1 },
  { id: 'si_position', name: '岗位工资', code: 'POSITION', type: 'earnings', defaultValue: 0, isTaxable: 1 },
  { id: 'si_performance', name: '绩效工资', code: 'PERFORMANCE', type: 'earnings', defaultValue: 0, isTaxable: 1 },
  { id: 'si_overtime', name: '加班费', code: 'OVERTIME', type: 'earnings', defaultValue: 0, isTaxable: 1 },
  { id: 'si_meal', name: '餐补', code: 'MEAL', type: 'allowance', defaultValue: 300, isTaxable: 0 },
  { id: 'si_transport', name: '交通补贴', code: 'TRANSPORT', type: 'allowance', defaultValue: 500, isTaxable: 0 },
  { id: 'si_social', name: '养老保险', code: 'SOCIAL', type: 'deductions', defaultValue: 0, isTaxable: 0 },
  { id: 'si_medical', name: '医疗保险', code: 'MEDICAL', type: 'deductions', defaultValue: 0, isTaxable: 0 },
  { id: 'si_housing', name: '住房公积金', code: 'HOUSING', type: 'deductions', defaultValue: 0, isTaxable: 0 },
  { id: 'si_tax', name: '个人所得税', code: 'TAX', type: 'deductions', defaultValue: 0, isTaxable: 0 }
];

const siStmt = db.prepare(`INSERT OR IGNORE INTO salary_items (id, name, code, type, dataType, decimalPlaces, formula, defaultValue, isTaxable, sortOrder, isActive, category, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
salaryItems.forEach((item, i) => {
  siStmt.run(item.id, item.name, item.code, item.type, 'number', 2, null, item.defaultValue, item.isTaxable, i, 1, 'salary', now);
});

// ============ 11. 薪资模板 (salary_item_templates) ============
console.log('Seeding salary_item_templates...');
const ranks = db.prepare('SELECT id, name FROM ranks').all();
const sitStmt = db.prepare(`INSERT OR IGNORE INTO salary_item_templates (id, name, rankId, items, isActive, createdAt) VALUES (?,?,?,?,?,?)`);
ranks.forEach(rank => {
  sitStmt.run(`sit_${rank.id}`, `${rank.name}薪资模板`, rank.id, JSON.stringify(salaryItems.map(i => i.id)), 1, now);
});

// ============ 12. 薪资调整 (salary_adjustments) ============
console.log('Seeding salary_adjustments...');
const sadjStmt = db.prepare(`INSERT OR IGNORE INTO salary_adjustments (id, employeeId, employeeName, month, itemType, itemName, amount, reason, isRecurring, startMonth, endMonth, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
employees.slice(0, 10).forEach((emp, i) => {
  sadjStmt.run(`sadj_${emp.id}_${i}`, emp.id, emp.name, today, 'allowance', '住房补贴', 1000, '新增住房补贴', 1, today, null, now);
});

// ============ 13. 企业缴纳 (company_contributions) ============
console.log('Seeding company_contributions...');
const ccStmt = db.prepare(`INSERT OR IGNORE INTO company_contributions (id, employeeId, month, pension, medical, unemployment, injury, maternity, housingFund, enterpriseAnnuity, total, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
employees.slice(0, 20).forEach(emp => {
  const base = 8000 + Math.floor(Math.random() * 10000);
  const pension = Math.floor(base * 0.16);
  const medical = Math.floor(base * 0.095);
  const unemployment = Math.floor(base * 0.005);
  const injury = Math.floor(base * 0.002);
  const maternity = Math.floor(base * 0.005);
  const housing = Math.floor(base * 0.12);
  const total = pension + medical + unemployment + injury + maternity + housing;
  
  ccStmt.run(
    `cc_${emp.id}_${new Date().getFullYear()}_${String(new Date().getMonth()).padStart(2, '0')}`,
    emp.id, `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2, '0')}`,
    pension, medical, unemployment, injury, maternity, housing, 0, total, now
  );
});

// ============ 14. 合同 (contracts) ============
console.log('Seeding contracts...');
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

// ============ 15. 合同模板 (contract_templates) ============
console.log('Seeding contract_templates...');
const ctStmt = db.prepare(`INSERT OR IGNORE INTO contract_templates (id, name, contractType, content, isActive, createdAt) VALUES (?,?,?,?,?,?)`);
[
  { id: 'ct_fixed', name: '固定期限劳动合同', contractType: 'fixed' },
  { id: 'ct_unfixed', name: '无固定期限劳动合同', contractType: 'unfixed' },
  { id: 'ct_probation', name: '试用期合同', contractType: 'probation' }
].forEach(t => {
  ctStmt.run(t.id, t.name, t.contractType, '<p>合同模板内容</p>', 1, now);
});

// ============ 16. 人才库 (talent_pools) ============
console.log('Seeding talent_pools...');
const tpStmt = db.prepare(`INSERT OR IGNORE INTO talent_pools (id, name, category, description, candidateCount, createdAt) VALUES (?,?,?,?,?,?)`);
[
  { id: 'tp_tech', name: '技术人才库', category: '技术' },
  { id: 'tp_mgmt', name: '管理人才库', category: '管理' },
  { id: 'tp_sales', name: '销售人才库', category: '销售' }
].forEach(t => {
  tpStmt.run(t.id, t.name, t.category, `${t.name}，储备优秀候选人`, Math.floor(Math.random() * 20), now);
});

// ============ 17. 面试记录 (interviews) ============
console.log('Seeding interviews...');
const intStmt = db.prepare(`INSERT OR IGNORE INTO interviews (id, candidateId, candidateName, positionId, positionTitle, interviewRound, interviewerId, interviewerName, interviewDate, interviewTime, interviewType, location, status, result, score, feedback, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const candidates = db.prepare('SELECT id, name, positionId, positionTitle FROM candidates LIMIT 10').all();
candidates.forEach((cand, i) => {
  intStmt.run(
    `int_${cand.id}`,
    cand.id, cand.name,
    cand.positionId || recruitmentPositions[0]?.id, cand.positionTitle || recruitmentPositions[0]?.title,
    1, 'user_admin', '系统管理员',
    today, '14:00', 'onsite', '会议室A',
    ['scheduled', 'completed', 'cancelled'][Math.floor(Math.random() * 3)],
    ['pass', 'fail', 'pending'][Math.floor(Math.random() * 3)],
    Math.floor(Math.random() * 40) + 60,
    '面试表现良好', now
  );
});

// ============ 18. Offer (offers) ============
console.log('Seeding offers...');
const offerStmt = db.prepare(`INSERT OR IGNORE INTO offers (id, candidateId, candidateName, positionId, positionTitle, salary, startDate, status, sentAt, acceptedAt, rejectedAt, signedContractUrl, remark, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
candidates.slice(0, 5).forEach((cand, i) => {
  offerStmt.run(
    `offer_${cand.id}`,
    cand.id, cand.name,
    cand.positionId || recruitmentPositions[0]?.id, cand.positionTitle || recruitmentPositions[0]?.title,
    15000 + Math.floor(Math.random() * 10000), today,
    ['pending', 'accepted', 'rejected'][Math.floor(Math.random() * 3)],
    now, null, null, null, '期待加入', now
  );
});

// ============ 19. 简历 (resumes) ============
console.log('Seeding resumes...');
const resumeStmt = db.prepare(`INSERT OR IGNORE INTO resumes (id, candidateId, fileName, fileUrl, parseResult, rawText, createdAt) VALUES (?,?,?,?,?,?,?)`);
candidates.forEach(cand => {
  resumeStmt.run(`res_${cand.id}`, cand.id, `${cand.name}_简历.pdf`, `/uploads/resumes/${cand.id}.pdf`, '{}', '', now);
});

// ============ 20. 绩效记录 (performance_records) ============
console.log('Seeding performance_records...');
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

// ============ 21. 培训计划 (training_plans) ============
console.log('Seeding training_plans...');
const tplStmt = db.prepare(`INSERT OR IGNORE INTO training_plans (id, title, department, trainer, targetEmployees, startDate, endDate, location, status, content, cost, participants, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
[
  { id: 'tpl_1', title: '新员工入职培训', department: '全部', trainer: 'HR部' },
  { id: 'tpl_2', title: '管理技能提升', department: '管理层', trainer: '外聘讲师' },
  { id: 'tpl_3', title: '技术分享会', department: '研发部', trainer: '技术专家' }
].forEach(t => {
  tplStmt.run(t.id, t.title, t.department, t.trainer, '[]', today, new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), '培训室', 'ongoing', '培训内容', 5000, 30, now);
});

// ============ 22. 培训课程 (training_courses) ============
console.log('Seeding training_courses...');
const tcStmt = db.prepare(`INSERT OR IGNORE INTO training_courses (id, title, category, type, url, duration, description, isRequired, isActive, viewCount, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
[
  { id: 'tc_1', title: '企业规章制度', category: '入职培训', type: 'video', duration: 120 },
  { id: 'tc_2', title: '安全生产培训', category: '安全培训', type: 'video', duration: 60 },
  { id: 'tc_3', title: '沟通技巧', category: '软技能', type: 'video', duration: 90 }
].forEach(t => {
  tcStmt.run(t.id, t.title, t.category, t.type, '/videos/' + t.id + '.mp4', t.duration, t.title + '课程描述', 1, 1, Math.floor(Math.random() * 100), now);
});

// ============ 23. 培训记录 (training_records) ============
console.log('Seeding training_records...');
const trStmt = db.prepare(`INSERT OR IGNORE INTO training_records (id, employeeId, employeeName, trainingPlanId, courseId, trainingType, trainingDate, duration, score, passed, certificateNo, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
employees.slice(0, 20).forEach((emp, i) => {
  trStmt.run(
    `tr_${emp.id}_${i}`,
    emp.id, emp.name, 'tpl_1', 'tc_1', 'internal', today, 120, 85 + Math.floor(Math.random() * 15), 1, `CERT${Date.now()}`, now
  );
});

// ============ 24. 培训评估 (training_evaluations) ============
console.log('Seeding training_evaluations...');
const teStmt = db.prepare(`INSERT OR IGNORE INTO training_evaluations (id, planId, employeeId, scores, totalScore, feedback, submittedAt, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
employees.slice(0, 15).forEach((emp, i) => {
  teStmt.run(`te_${emp.id}`, 'tpl_1', emp.id, JSON.stringify({ content: 4.5, trainer: 4.8, material: 4.2 }), 4.5, '培训很有帮助', now, now);
});

// ============ 25. 宿舍分配 (dormitory_assignments) ============
console.log('Seeding dormitory_assignments...');
const dorms = db.prepare('SELECT id, room FROM dormitories').all();
const daStmt = db.prepare(`INSERT OR IGNORE INTO dormitory_assignments (id, dormitoryId, employeeId, bedNo, checkInDate, checkOutDate, status, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
employees.slice(0, 10).forEach((emp, i) => {
  const dorm = dorms[i % dorms.length];
  if (dorm) {
    daStmt.run(`da_${emp.id}`, dorm.id, emp.id, (i % 4) + 1, today, null, 'active', now);
  }
});

// ============ 26. 宿舍账单 (dormitory_bills) ============
console.log('Seeding dormitory_bills...');
const dbStmt = db.prepare(`INSERT OR IGNORE INTO dormitory_bills (id, dormitoryId, month, waterUsed, waterFee, electricityUsed, electricityFee, total, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
dorms.forEach((dorm, i) => {
  dbStmt.run(`dbill_${dorm.id}_${new Date().getFullYear()}_${String(new Date().getMonth()).padStart(2, '0')}`, dorm.id, `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2, '0')}`, 5 + Math.random() * 10, 20 + Math.random() * 40, 50 + Math.random() * 100, 30 + Math.random() * 60, 80 + Math.random() * 100, 'unpaid', now);
});

// ============ 27. 食堂 (canteens) ============
console.log('Seeding canteens...');
const canStmt = db.prepare(`INSERT OR IGNORE INTO canteens (id, name, location, capacity, managerId, isActive, createdAt) VALUES (?,?,?,?,?,?,?)`);
[
  { id: 'can_1', name: '一号食堂', location: 'A栋一楼' },
  { id: 'can_2', name: '二号食堂', location: 'B栋二楼' }
].forEach(c => {
  canStmt.run(c.id, c.name, c.location, 200, 'user_admin', 1, now);
});

// ============ 28. 就餐记录 (meal_records) ============
console.log('Seeding meal_records...');
const mrStmt = db.prepare(`INSERT OR IGNORE INTO meal_records (id, employeeId, employeeName, date, mealType, cost, createdAt) VALUES (?,?,?,?,?,?,?)`);
employees.slice(0, 30).forEach(emp => {
  ['breakfast', 'lunch', 'dinner'].forEach((meal, i) => {
    mrStmt.run(`mr_${emp.id}_${today}_${i}`, emp.id, emp.name, today, meal, meal === 'lunch' ? 15 : 8, now);
  });
});

// ============ 29. 车辆使用 (vehicle_usage) ============
console.log('Seeding vehicle_usage...');
const vehs = db.prepare('SELECT id, plateNumber FROM vehicles').all();
const vuStmt = db.prepare(`INSERT OR IGNORE INTO vehicle_usage (id, vehicleId, driverId, driverName, userId, userName, purpose, startTime, endTime, mileageStart, mileageEnd, status, remark, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
vehs.forEach((veh, i) => {
  vuStmt.run(`vu_${veh.id}`, veh.id, 'user_admin', '系统管理员', employees[i % employees.length].id, employees[i % employees.length].name, '外出办事', `${today} 09:00`, `${today} 17:00`, 10000, 10200, 'completed', '正常使用', now);
});

// ============ 30. 访客 (visitors) ============
console.log('Seeding visitors...');
const visStmt = db.prepare(`INSERT OR IGNORE INTO visitors (id, name, company, idCard, phone, purpose, contactPerson, contactDept, visitTime, leaveTime, badgeNo, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
for (let i = 0; i < 10; i++) {
  visStmt.run(`vis_${i}`, `访客${i + 1}`, `合作公司${i + 1}`, `110101199001010${i + 1}1`, `1380013800${i}`, '商务洽谈', 'user_admin', '行政部', `${today} 10:00`, `${today} 12:00`, `V${String(i).padStart(4, '0')}`, 'left', now);
}

// ============ 31-40. 其他表（简化版） ============
console.log('Seeding remaining tables...');

// announcement_reads
const arStmt = db.prepare(`INSERT OR IGNORE INTO announcement_reads (id, announcementId, userId, readAt) VALUES (?,?,?,?)`);
const anns = db.prepare('SELECT id FROM announcements').all();
anns.forEach(ann => {
  users.slice(0, 2).forEach(user => {
    arStmt.run(`ar_${ann.id}_${user.id}`, ann.id, user.id, now);
  });
});

// surveys
const survStmt = db.prepare(`INSERT OR IGNORE INTO surveys (id, title, description, type, status, startDate, endDate, anonymous, multipleResponses, responseCount, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
survStmt.run('surv_1', '员工满意度调查', '2024年度员工满意度调查', 'survey', 'active', today, new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), 1, 0, 15, now);

// survey_questions
const sqStmt = db.prepare(`INSERT OR IGNORE INTO survey_questions (id, surveyId, question, type, options, required, sortOrder, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
[
  { id: 'sq_1', q: '您对公司的整体满意度？', type: 'radio', opts: ['非常满意', '满意', '一般', '不满意'] },
  { id: 'sq_2', q: '您最看重的福利是？', type: 'checkbox', opts: ['五险一金', '带薪年假', '节日福利', '培训机会'] }
].forEach((sq, i) => {
  sqStmt.run(sq.id, 'surv_1', sq.q, sq.type, JSON.stringify(sq.opts), 1, i, now);
});

// survey_responses
const srStmt = db.prepare(`INSERT OR IGNORE INTO survey_responses (id, surveyId, userId, answers, submittedAt) VALUES (?,?,?,?,?)`);
employees.slice(0, 15).forEach(emp => {
  srStmt.run(`sr_${emp.id}`, 'surv_1', emp.id, JSON.stringify({ sq_1: '满意', sq_2: ['五险一金', '带薪年假'] }), now);
});

// documents
const docStmt = db.prepare(`INSERT OR IGNORE INTO documents (id, name, folderId, type, size, mimeType, url, content, accessLevel, uploaderId, uploaderName, isFavorite, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
['员工手册', '考勤制度', '薪酬制度'].forEach((doc, i) => {
  docStmt.run(`doc_${i}`, doc, null, 'file', 102400, 'application/pdf', `/docs/${i}.pdf`, '', 'public', 'user_admin', '系统管理员', 0, now, now);
});

// document_folders
const dfStmt = db.prepare(`INSERT OR IGNORE INTO document_folders (id, name, parentId, accessLevel, createdAt) VALUES (?,?,?,?,?)`);
dfStmt.run('df_1', '公司制度', null, 'public', now);
dfStmt.run('df_2', '部门文档', null, 'department', now);

// assessment_questions
const aqStmt = db.prepare(`INSERT OR IGNORE INTO assessment_questions (id, toolId, question, type, options, dimension, sortOrder, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
const tools = db.prepare('SELECT id FROM assessment_tools').all();
tools.forEach(tool => {
  ['问题1：您通常如何处理压力？', '问题2：您如何与团队协作？'].forEach((q, i) => {
    aqStmt.run(`aq_${tool.id}_${i}`, tool.id, q, 'single', JSON.stringify(['A. 积极面对', 'B. 寻求帮助', 'C. 独立思考']), '性格', i, now);
  });
});

// assessment_results
const asrStmt = db.prepare(`INSERT OR IGNORE INTO assessment_results (id, employeeId, employeeName, toolId, toolName, score, result, dimensionScores, completedAt, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
employees.slice(0, 10).forEach((emp, i) => {
  const tool = tools[i % tools.length];
  if (tool) {
    asrStmt.run(`asr_${emp.id}`, emp.id, emp.name, tool.id, '职业性格测试', 75 + Math.floor(Math.random() * 25), '外向型', JSON.stringify({ 性格: 80, 沟通: 75 }), now, now);
  }
});

// competency_levels
const clStmt = db.prepare(`INSERT OR IGNORE INTO competency_levels (id, itemId, level, name, description, behavior, scoreRange, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
const compItems = db.prepare('SELECT id FROM competency_items').all();
compItems.forEach(item => {
  [1, 2, 3, 4, 5].forEach(level => {
    clStmt.run(`cl_${item.id}_${level}`, item.id, level, `Level ${level}`, `能力等级${level}`, `表现出${level}级行为`, `${level * 20}-${(level + 1) * 20}`, now);
  });
});

// competency_models
const cmStmt = db.prepare(`INSERT OR IGNORE INTO competency_models (id, name, positionId, positionName, description, totalWeight, isActive, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
positions.slice(0, 5).forEach(pos => {
  cmStmt.run(`cm_${pos.id}`, `${pos.title}胜任力模型`, pos.id, pos.title, '岗位胜任力要求', 100, 1, now);
});

// model_competencies
const mcStmt = db.prepare(`INSERT OR IGNORE INTO model_competencies (id, modelId, itemId, weight, requiredLevel, sortOrder) VALUES (?,?,?,?,?,?)`);
const compModels = db.prepare('SELECT id FROM competency_models').all();
compModels.forEach(model => {
  compItems.slice(0, 5).forEach((item, i) => {
    mcStmt.run(`mc_${model.id}_${i}`, model.id, item.id, 20, 3, i);
  });
});

// talent_profiles
const tpStmt2 = db.prepare(`INSERT OR IGNORE INTO talent_profiles (id, employeeId, employeeName, department, position, performanceData, competencyData, overallScore, talentLevel, talentGrid, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
employees.slice(0, 20).forEach(emp => {
  tpStmt2.run(`tp_${emp.id}`, emp.id, emp.name, emp.department || '研发部', emp.position || '员工', JSON.stringify({ avgScore: 82 }), JSON.stringify({ leadership: 75 }), 80, 'B', '中坚力量', now);
});

// talent_reports
const trStmt2 = db.prepare(`INSERT OR IGNORE INTO talent_reports (id, name, cycleId, talentSummary, nineBoxGrid, successionPlans, createdBy, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
trStmt2.run('tr_1', '2024年度人才盘点报告', 'pc_default', JSON.stringify({ highPotentials: 10, coreTalent: 25 }), JSON.stringify({ A1: 5, A2: 10, B1: 15 }), JSON.stringify({ CEO: ['候选人1', '候选人2'] }), 'user_admin', now);

// approval_flows
const afStmt = db.prepare(`INSERT OR IGNORE INTO approval_flows (id, name, module, steps, isActive, createdAt) VALUES (?,?,?,?,?,?)`);
[
  { id: 'af_leave', name: '请假审批', module: 'leave' },
  { id: 'af_overtime', name: '加班审批', module: 'overtime' },
  { id: 'af_salary', name: '调薪审批', module: 'salary' }
].forEach(af => {
  afStmt.run(af.id, af.name, af.module, JSON.stringify([
    { step: 1, role: 'dept_manager', name: '部门主管审批' },
    { step: 2, role: 'hr_admin', name: '人事审批' }
  ]), 1, now);
});

// approval_requests
const arqStmt = db.prepare(`INSERT OR IGNORE INTO approval_requests (id, flowId, module, title, applicantId, applicantName, status, currentStep, formData, attachmentUrl, submittedAt, completedAt, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
employees.slice(0, 10).forEach((emp, i) => {
  arqStmt.run(`arq_${emp.id}`, 'af_leave', 'leave', `${emp.name}请假申请`, emp.id, emp.name, ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)], 1, JSON.stringify({ days: 2, reason: '个人事务' }), null, now, null, now);
});

// approval_records
const aprecStmt = db.prepare(`INSERT OR IGNORE INTO approval_records (id, requestId, stepIndex, approverId, approverName, action, comment, handledAt, nextApprover, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
const arqs = db.prepare('SELECT id FROM approval_requests LIMIT 5').all();
arqs.forEach(arq => {
  aprecStmt.run(`aprec_${arq.id}`, arq.id, 1, 'user_admin', '系统管理员', 'approved', '同意', now, null, now);
});

// employee_changes
const ecStmt = db.prepare(`INSERT OR IGNORE INTO employee_changes (id, employeeId, employeeName, changeType, fromDepartment, toDepartment, fromPosition, toPosition, fromRank, toRank, fromSalary, toSalary, effectiveDate, reason, status, approverId, approverName, approveTime, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
employees.slice(0, 5).forEach((emp, i) => {
  ecStmt.run(`ec_${emp.id}`, emp.id, emp.name, 'promotion', emp.department, '管理层', emp.position, '高级经理', null, null, 10000, 15000, today, '表现优秀晋升', 'approved', 'user_admin', '系统管理员', now, now);
});

// employee_subsets
const esStmt = db.prepare(`INSERT OR IGNORE INTO employee_subsets (id, name, code, description, fields, isActive, createdAt) VALUES (?,?,?,?,?,?,?)`);
esStmt.run('es_1', '紧急联系人', 'emergency_contact', '员工紧急联系人信息', JSON.stringify([{ name: '联系人姓名', field: 'contactName' }, { name: '联系电话', field: 'contactPhone' }]), 1, now);

// subset_records
const srecStmt = db.prepare(`INSERT OR IGNORE INTO subset_records (id, subsetId, employeeId, data, createdAt, updatedAt) VALUES (?,?,?,?,?,?)`);
employees.slice(0, 20).forEach(emp => {
  srecStmt.run(`srec_${emp.id}`, 'es_1', emp.id, JSON.stringify({ contactName: '张三', contactPhone: '13900139000' }), now, now);
});

// print_templates
const ptStmt = db.prepare(`INSERT OR IGNORE INTO print_templates (id, name, type, content, paperSize, orientation, isDefault, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
ptStmt.run('pt_1', '员工信息表', 'employee', '<html><body>{{name}}</body></html>', 'A4', 'portrait', 1, now);

// reminder_logs
const rlStmt = db.prepare(`INSERT OR IGNORE INTO reminder_logs (id, reminderId, employeeId, triggeredAt, sentAt, status, error) VALUES (?,?,?,?,?,?,?)`);
const reminders = db.prepare('SELECT id FROM reminders').all();
reminders.forEach(r => {
  rlStmt.run(`rl_${r.id}`, r.id, employees[0]?.id, now, now, 'sent', null);
});

// login_logs
const llStmt = db.prepare(`INSERT OR IGNORE INTO login_logs (id, userId, username, loginAt, ip, userAgent, success, failReason) VALUES (?,?,?,?,?,?,?,?)`);
users.forEach(user => {
  llStmt.run(`ll_${user.id}_${Date.now()}`, user.id, user.username, now, '127.0.0.1', 'Mozilla/5.0', 1, null);
});

// data_backups
const backupStmt = db.prepare(`INSERT OR IGNORE INTO data_backups (id, name, filePath, fileSize, status, createdBy, createdAt) VALUES (?,?,?,?,?,?,?)`);
backupStmt.run('backup_1', '系统自动备份', '/backups/backup_20240420.db', 1024000, 'completed', 'system', now);

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
