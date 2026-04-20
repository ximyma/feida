/**
 * 最终填充剩余12张空表
 */

const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

const now = new Date().toISOString();
const today = new Date().toISOString().slice(0, 10);

const employees = db.prepare('SELECT id, name, department, position, status FROM employees').all();
const departments = db.prepare('SELECT id, name FROM departments').all();
const candidates = db.prepare('SELECT id, name FROM candidates').all();
const recruitmentPositions = db.prepare('SELECT id, title FROM recruitment_positions').all();
const shiftTypes = db.prepare('SELECT id, name FROM shift_types').all();

console.log('填充剩余12张空表...');

// ============ shift_change_requests ============
console.log('1. shift_change_requests...');
try {
  const scrStmt = db.prepare(`INSERT OR IGNORE INTO shift_change_requests 
    (id, employeeId, employeeName, date, originalShiftId, targetShiftId, reason, status, approver, approveTime, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  employees.slice(0, 10).forEach((emp, i) => {
    const status = ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)];
    scrStmt.run(
      `scr_${emp.id}_${i}`,
      emp.id, emp.name, today,
      shiftTypes[0]?.id || 'st_1', shiftTypes[1]?.id || 'st_2',
      '个人原因调整班次', status,
      status === 'approved' ? 'user_admin' : null,
      status === 'approved' ? now : null, now
    );
  });
  console.log('  ✓');
} catch(e) { console.log('  ✗', e.message); }

// ============ daily_attendance_reports ============
console.log('2. daily_attendance_reports...');
try {
  const darStmt = db.prepare(`INSERT OR IGNORE INTO daily_attendance_reports 
    (id, date, department, totalEmployees, normalCount, lateCount, earlyLeaveCount, absentCount, leaveCount, overtimeCount, data, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  departments.forEach(dept => {
    for (let d = 0; d < 30; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().slice(0, 10);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const total = 10 + Math.floor(Math.random() * 10);
      const normal = total - Math.floor(Math.random() * 5);
      const late = Math.floor(Math.random() * 2);
      const early = Math.floor(Math.random() * 2);
      const absent = total - normal - late - early;
      const leave = Math.floor(Math.random() * 2);
      const overtime = Math.floor(Math.random() * 3);
      
      darStmt.run(
        `dar_${dept.id}_${dateStr.replace(/-/g, '')}`,
        dateStr, dept.name, total, normal, late, early, absent, leave, overtime, '{}', now
      );
    }
  });
  console.log('  ✓');
} catch(e) { console.log('  ✗', e.message); }

// ============ monthly_attendance_summary ============
console.log('3. monthly_attendance_summary...');
try {
  const masStmt = db.prepare(`INSERT OR IGNORE INTO monthly_attendance_summary 
    (id, employeeId, employeeName, department, month, totalWorkDays, actualWorkDays, absentDays, lateCount, lateMinutesTotal, earlyLeaveCount, overtimeWorkday, overtimeRestday, overtimeHoliday, leaveTotal, effectiveHours, data, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  employees.forEach(emp => {
    const totalDays = 22;
    const lateCount = Math.floor(Math.random() * 3);
    const earlyCount = Math.floor(Math.random() * 2);
    const leaveTotal = Math.floor(Math.random() * 3);
    const absentDays = Math.floor(Math.random() * 2);
    const actualDays = totalDays - lateCount - earlyCount - leaveTotal - absentDays;
    const overtimeWork = Math.floor(Math.random() * 15);
    const overtimeRest = Math.floor(Math.random() * 10);
    
    masStmt.run(
      `mas_${emp.id}_202604`,
      emp.id, emp.name, emp.department || '研发部', '2026-04',
      totalDays, actualDays, absentDays, lateCount, lateCount * 15, earlyCount,
      overtimeWork, overtimeRest, 0, leaveTotal, actualDays * 8, '{}', now
    );
  });
  console.log('  ✓');
} catch(e) { console.log('  ✗', e.message); }

// ============ interviews ============
console.log('4. interviews...');
try {
  const intStmt = db.prepare(`INSERT OR IGNORE INTO interviews 
    (id, candidateId, candidateName, positionId, positionTitle, interviewRound, interviewerId, interviewerName, interviewDate, interviewTime, interviewType, location, status, result, score, feedback, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  candidates.forEach((cand, i) => {
    intStmt.run(
      `int_${cand.id}`,
      cand.id, cand.name,
      recruitmentPositions[i % recruitmentPositions.length]?.id || 'rp_1',
      recruitmentPositions[i % recruitmentPositions.length]?.title || '工程师',
      1, 'user_admin', '系统管理员',
      today, '14:00', 'onsite', '会议室A',
      ['scheduled', 'completed', 'cancelled'][Math.floor(Math.random() * 3)],
      ['pass', 'fail', 'pending'][Math.floor(Math.random() * 3)],
      Math.floor(Math.random() * 40) + 60,
      '面试表现良好', now
    );
  });
  console.log('  ✓');
} catch(e) { console.log('  ✗', e.message); }

// ============ training_plans ============
console.log('5. training_plans...');
try {
  const tplStmt = db.prepare(`INSERT OR IGNORE INTO training_plans 
    (id, title, department, trainer, targetEmployees, startDate, endDate, location, status, content, cost, participants, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  [
    { id: 'tpl_1', title: '新员工入职培训', department: '全部', trainer: 'HR部' },
    { id: 'tpl_2', title: '管理技能提升', department: '管理层', trainer: '外聘讲师' },
    { id: 'tpl_3', title: '技术分享会', department: '研发部', trainer: '技术专家' }
  ].forEach(t => {
    tplStmt.run(t.id, t.title, t.department, t.trainer, '[]', today, new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), '培训室', 'ongoing', '培训内容', 5000, 30, now);
  });
  console.log('  ✓');
} catch(e) { console.log('  ✗', e.message); }

// ============ training_courses ============
console.log('6. training_courses...');
try {
  const tcStmt = db.prepare(`INSERT OR IGNORE INTO training_courses 
    (id, title, category, type, url, duration, description, isRequired, isActive, viewCount, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  [
    { id: 'tc_1', title: '企业规章制度', category: '入职培训', type: 'video', duration: 120 },
    { id: 'tc_2', title: '安全生产培训', category: '安全培训', type: 'video', duration: 60 },
    { id: 'tc_3', title: '沟通技巧', category: '软技能', type: 'video', duration: 90 }
  ].forEach(t => {
    tcStmt.run(t.id, t.title, t.category, t.type, '/videos/' + t.id + '.mp4', t.duration, t.title + '课程描述', 1, 1, Math.floor(Math.random() * 100), now);
  });
  console.log('  ✓');
} catch(e) { console.log('  ✗', e.message); }

// ============ surveys ============
console.log('7. surveys...');
try {
  const survStmt = db.prepare(`INSERT OR IGNORE INTO surveys 
    (id, title, description, type, status, startDate, endDate, anonymous, multipleResponses, responseCount, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  survStmt.run('surv_1', '员工满意度调查', '2024年度员工满意度调查', 'survey', 'active', today, new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), 1, 0, 15, now);
  console.log('  ✓');
} catch(e) { console.log('  ✗', e.message); }

// ============ documents ============
console.log('8. documents...');
try {
  const docStmt = db.prepare(`INSERT OR IGNORE INTO documents 
    (id, name, folderId, type, size, mimeType, url, content, accessLevel, uploaderId, uploaderName, isFavorite, createdAt, updatedAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  ['员工手册', '考勤制度', '薪酬制度'].forEach((doc, i) => {
    docStmt.run(`doc_${i}`, doc, null, 'file', 102400, 'application/pdf', `/docs/${i}.pdf`, '', 'public', 'user_admin', '系统管理员', 0, now, now);
  });
  console.log('  ✓');
} catch(e) { console.log('  ✗', e.message); }

// ============ model_competencies ============
console.log('9. model_competencies...');
try {
  const compModels = db.prepare('SELECT id FROM competency_models').all();
  const compItems = db.prepare('SELECT id FROM competency_items').all();
  const mcStmt = db.prepare(`INSERT OR IGNORE INTO model_competencies (id, modelId, itemId, weight, requiredLevel, sortOrder) VALUES (?,?,?,?,?,?)`);
  compModels.forEach(model => {
    compItems.slice(0, 5).forEach((item, i) => {
      mcStmt.run(`mc_${model.id}_${i}`, model.id, item.id, 20, 3, i);
    });
  });
  console.log('  ✓');
} catch(e) { console.log('  ✗', e.message); }

// ============ approval_requests ============
console.log('10. approval_requests...');
try {
  const arqStmt = db.prepare(`INSERT OR IGNORE INTO approval_requests 
    (id, flowId, module, title, applicantId, applicantName, status, currentStep, formData, attachmentUrl, submittedAt, completedAt, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  employees.slice(0, 10).forEach((emp, i) => {
    arqStmt.run(
      `arq_${emp.id}`,
      'af_leave', 'leave', `${emp.name}请假申请`,
      emp.id, emp.name,
      ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
      1, JSON.stringify({ days: 2, reason: '个人事务' }), null, now, null, now
    );
  });
  console.log('  ✓');
} catch(e) { console.log('  ✗', e.message); }

// ============ approval_records ============
console.log('11. approval_records...');
try {
  const aprecStmt = db.prepare(`INSERT OR IGNORE INTO approval_records (id, requestId, stepIndex, approverId, approverName, action, comment, handledAt, nextApprover, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const arqs = db.prepare('SELECT id FROM approval_requests LIMIT 5').all();
  arqs.forEach(arq => {
    aprecStmt.run(`aprec_${arq.id}`, arq.id, 1, 'user_admin', '系统管理员', 'approved', '同意', now, null, now);
  });
  console.log('  ✓');
} catch(e) { console.log('  ✗', e.message); }

// ============ employee_changes ============
console.log('12. employee_changes...');
try {
  const ecStmt = db.prepare(`INSERT OR IGNORE INTO employee_changes 
    (id, employeeId, employeeName, changeType, fromDepartment, toDepartment, fromPosition, toPosition, fromRank, toRank, fromSalary, toSalary, effectiveDate, reason, status, approverId, approverName, approveTime, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  employees.slice(0, 5).forEach((emp, i) => {
    ecStmt.run(
      `ec_${emp.id}`,
      emp.id, emp.name, 'promotion',
      emp.department, '管理层', emp.position, '高级经理',
      null, null, 10000, 15000,
      today, '表现优秀晋升', 'approved',
      'user_admin', '系统管理员', now, now
    );
  });
  console.log('  ✓');
} catch(e) { console.log('  ✗', e.message); }

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

console.log(`\n✅ 有数据表: ${hasDataCount}`);
console.log(`❌ 空表: ${emptyCount}`);

db.close();
