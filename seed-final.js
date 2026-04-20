/**
 * 修复剩余字段不匹配的表
 */

const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

const now = new Date().toISOString();
const today = new Date().toISOString().slice(0, 10);

const employees = db.prepare('SELECT id, name, department, position, status FROM employees').all();
const candidates = db.prepare('SELECT id, name FROM candidates').all();
const recruitmentPositions = db.prepare('SELECT id, title FROM recruitment_positions').all();

console.log('修复字段不匹配的表...');

// ============ overtime_records ============
console.log('Seeding overtime_records...');
try {
  const otStmt = db.prepare(`INSERT OR IGNORE INTO overtime_records 
    (id, employeeId, employeeName, date, hours, overtimeType, reason, status, approver, approveTime, handlerId, handlerName, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  employees.slice(0, 15).forEach((emp, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 20));
    const hours = [2, 3, 4, 5, 6, 8][Math.floor(Math.random() * 6)];
    const status = ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)];
    
    otStmt.run(
      `or_${emp.id}_${i}`,
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

// ============ salary_items ============
console.log('Seeding salary_items...');
try {
  const siStmt = db.prepare(`INSERT OR IGNORE INTO salary_items (id, name, code, type, dataType, decimalPlaces, defaultValue, isTaxable, sortOrder, isActive, category, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const items = [
    { id: 'si_base', name: '基本工资', code: 'BASE', type: 'earnings', taxable: 1 },
    { id: 'si_position', name: '岗位工资', code: 'POSITION', type: 'earnings', taxable: 1 },
    { id: 'si_performance', name: '绩效工资', code: 'PERFORMANCE', type: 'earnings', taxable: 1 },
    { id: 'si_overtime', name: '加班费', code: 'OVERTIME', type: 'earnings', taxable: 1 },
    { id: 'si_meal', name: '餐补', code: 'MEAL', type: 'allowance', taxable: 0 },
    { id: 'si_transport', name: '交通补贴', code: 'TRANSPORT', type: 'allowance', taxable: 0 },
    { id: 'si_social', name: '养老保险', code: 'SOCIAL', type: 'deductions', taxable: 0 },
    { id: 'si_medical', name: '医疗保险', code: 'MEDICAL', type: 'deductions', taxable: 0 },
    { id: 'si_housing', name: '住房公积金', code: 'HOUSING', type: 'deductions', taxable: 0 }
  ];
  items.forEach((item, i) => {
    siStmt.run(item.id, item.name, item.code, item.type, 'number', 2, 0, item.taxable, i, 1, 'salary', now);
  });
  console.log('  ✓ salary_items');
} catch(e) {
  console.log('  ✗ salary_items:', e.message);
}

// ============ training_plans ============
console.log('Seeding training_plans...');
try {
  const tplStmt = db.prepare(`INSERT OR IGNORE INTO training_plans (id, title, department, trainer, targetEmployees, startDate, endDate, location, status, content, cost, participants, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  [
    { id: 'tpl_1', title: '新员工入职培训', department: '全部', trainer: 'HR部' },
    { id: 'tpl_2', title: '管理技能提升', department: '管理层', trainer: '外聘讲师' },
    { id: 'tpl_3', title: '技术分享会', department: '研发部', trainer: '技术专家' }
  ].forEach(t => {
    tplStmt.run(t.id, t.title, t.department, t.trainer, '[]', today, new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), '培训室', 'ongoing', '培训内容', 5000, 30, now);
  });
  console.log('  ✓ training_plans');
} catch(e) {
  console.log('  ✗ training_plans:', e.message);
}

// ============ training_courses ============
console.log('Seeding training_courses...');
try {
  const tcStmt = db.prepare(`INSERT OR IGNORE INTO training_courses (id, title, category, type, url, duration, description, isRequired, isActive, viewCount, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  [
    { id: 'tc_1', title: '企业规章制度', category: '入职培训', type: 'video', duration: 120 },
    { id: 'tc_2', title: '安全生产培训', category: '安全培训', type: 'video', duration: 60 },
    { id: 'tc_3', title: '沟通技巧', category: '软技能', type: 'video', duration: 90 }
  ].forEach(t => {
    tcStmt.run(t.id, t.title, t.category, t.type, '/videos/' + t.id + '.mp4', t.duration, t.title + '课程描述', 1, 1, Math.floor(Math.random() * 100), now);
  });
  console.log('  ✓ training_courses');
} catch(e) {
  console.log('  ✗ training_courses:', e.message);
}

// ============ interviews ============
console.log('Seeding interviews...');
try {
  const intStmt = db.prepare(`INSERT OR IGNORE INTO interviews (id, candidateId, candidateName, positionId, positionTitle, interviewRound, interviewerId, interviewerName, interviewDate, interviewTime, interviewType, location, status, result, score, feedback, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
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
  console.log('  ✓ interviews');
} catch(e) {
  console.log('  ✗ interviews:', e.message);
}

// ============ offers ============
console.log('Seeding offers...');
try {
  const offerStmt = db.prepare(`INSERT OR IGNORE INTO offers (id, candidateId, candidateName, positionId, positionTitle, salary, startDate, status, sentAt, acceptedAt, rejectedAt, signedContractUrl, remark, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  candidates.slice(0, 5).forEach((cand, i) => {
    offerStmt.run(
      `offer_${cand.id}`,
      cand.id, cand.name,
      recruitmentPositions[i % recruitmentPositions.length]?.id || 'rp_1',
      recruitmentPositions[i % recruitmentPositions.length]?.title || '工程师',
      15000 + Math.floor(Math.random() * 10000), today,
      ['pending', 'accepted', 'rejected'][Math.floor(Math.random() * 3)],
      now, null, null, null, '期待加入', now
    );
  });
  console.log('  ✓ offers');
} catch(e) {
  console.log('  ✗ offers:', e.message);
}

// ============ 继续填充更多表 ============

// shift_change_requests
console.log('Seeding shift_change_requests...');
try {
  const scrStmt = db.prepare(`INSERT OR IGNORE INTO shift_change_requests (id, employeeId, employeeName, department, fromDate, toDate, fromShift, toShift, reason, status, approverId, approverName, approvedAt, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  employees.slice(0, 10).forEach((emp, i) => {
    scrStmt.run(
      `scr_${emp.id}_${i}`,
      emp.id, emp.name, emp.department || '研发部',
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

// daily_attendance_reports
console.log('Seeding daily_attendance_reports...');
try {
  const darStmt = db.prepare(`INSERT OR IGNORE INTO daily_attendance_reports (id, date, department, total, present, late, early, absent, leave, overtime, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
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
  console.log('  ✓ daily_attendance_reports');
} catch(e) {
  console.log('  ✗ daily_attendance_reports:', e.message);
}

// monthly_attendance_summary
console.log('Seeding monthly_attendance_summary...');
try {
  const masStmt = db.prepare(`INSERT OR IGNORE INTO monthly_attendance_summary (id, employeeId, employeeName, department, year, month, workDays, presentDays, lateDays, earlyDays, absentDays, leaveDays, overtimeHours, totalHours, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
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
  console.log('  ✓ monthly_attendance_summary');
} catch(e) {
  console.log('  ✗ monthly_attendance_summary:', e.message);
}

// dormitory_assignments
console.log('Seeding dormitory_assignments...');
try {
  const dorms = db.prepare('SELECT id, room FROM dormitories').all();
  const daStmt = db.prepare(`INSERT OR IGNORE INTO dormitory_assignments (id, dormitoryId, employeeId, bedNo, checkInDate, checkOutDate, status, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
  employees.slice(0, 10).forEach((emp, i) => {
    const dorm = dorms[i % dorms.length];
    if (dorm) {
      daStmt.run(`da_${emp.id}`, dorm.id, emp.id, (i % 4) + 1, today, null, 'active', now);
    }
  });
  console.log('  ✓ dormitory_assignments');
} catch(e) {
  console.log('  ✗ dormitory_assignments:', e.message);
}

// dormitory_bills
console.log('Seeding dormitory_bills...');
try {
  const dorms = db.prepare('SELECT id FROM dormitories').all();
  const dbStmt = db.prepare(`INSERT OR IGNORE INTO dormitory_bills (id, dormitoryId, month, waterUsed, waterFee, electricityUsed, electricityFee, total, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  dorms.forEach((dorm, i) => {
    dbStmt.run(
      `dbill_${dorm.id}_${new Date().getFullYear()}_${String(new Date().getMonth()).padStart(2, '0')}`,
      dorm.id, `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2, '0')}`,
      5 + Math.random() * 10, 20 + Math.random() * 40,
      50 + Math.random() * 100, 30 + Math.random() * 60,
      80 + Math.random() * 100, 'unpaid', now
    );
  });
  console.log('  ✓ dormitory_bills');
} catch(e) {
  console.log('  ✗ dormitory_bills:', e.message);
}

// canteens
console.log('Seeding canteens...');
try {
  const canStmt = db.prepare(`INSERT OR IGNORE INTO canteens (id, name, location, capacity, managerId, isActive, createdAt) VALUES (?,?,?,?,?,?,?)`);
  [
    { id: 'can_1', name: '一号食堂', location: 'A栋一楼' },
    { id: 'can_2', name: '二号食堂', location: 'B栋二楼' }
  ].forEach(c => {
    canStmt.run(c.id, c.name, c.location, 200, 'user_admin', 1, now);
  });
  console.log('  ✓ canteens');
} catch(e) {
  console.log('  ✗ canteens:', e.message);
}

// meal_records
console.log('Seeding meal_records...');
try {
  const mrStmt = db.prepare(`INSERT OR IGNORE INTO meal_records (id, employeeId, employeeName, date, mealType, cost, createdAt) VALUES (?,?,?,?,?,?,?)`);
  employees.slice(0, 30).forEach(emp => {
    ['breakfast', 'lunch', 'dinner'].forEach((meal, i) => {
      mrStmt.run(`mr_${emp.id}_${today}_${i}`, emp.id, emp.name, today, meal, meal === 'lunch' ? 15 : 8, now);
    });
  });
  console.log('  ✓ meal_records');
} catch(e) {
  console.log('  ✗ meal_records:', e.message);
}

// vehicle_usage
console.log('Seeding vehicle_usage...');
try {
  const vehs = db.prepare('SELECT id, plateNumber FROM vehicles').all();
  const vuStmt = db.prepare(`INSERT OR IGNORE INTO vehicle_usage (id, vehicleId, driverId, driverName, userId, userName, purpose, startTime, endTime, mileageStart, mileageEnd, status, remark, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  vehs.forEach((veh, i) => {
    vuStmt.run(
      `vu_${veh.id}`,
      veh.id, 'user_admin', '系统管理员',
      employees[i % employees.length].id, employees[i % employees.length].name,
      '外出办事', `${today} 09:00`, `${today} 17:00`,
      10000, 10200, 'completed', '正常使用', now
    );
  });
  console.log('  ✓ vehicle_usage');
} catch(e) {
  console.log('  ✗ vehicle_usage:', e.message);
}

// announcement_reads
console.log('Seeding announcement_reads...');
try {
  const anns = db.prepare('SELECT id FROM announcements').all();
  const users = db.prepare('SELECT id FROM users').all();
  const arStmt = db.prepare(`INSERT OR IGNORE INTO announcement_reads (id, announcementId, userId, readAt) VALUES (?,?,?,?)`);
  anns.forEach(ann => {
    users.forEach(user => {
      arStmt.run(`ar_${ann.id}_${user.id}`, ann.id, user.id, now);
    });
  });
  console.log('  ✓ announcement_reads');
} catch(e) {
  console.log('  ✗ announcement_reads:', e.message);
}

// surveys
console.log('Seeding surveys...');
try {
  const survStmt = db.prepare(`INSERT OR IGNORE INTO surveys (id, title, description, type, status, startDate, endDate, anonymous, multipleResponses, responseCount, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  survStmt.run('surv_1', '员工满意度调查', '2024年度员工满意度调查', 'survey', 'active', today, new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), 1, 0, 15, now);
  console.log('  ✓ surveys');
} catch(e) {
  console.log('  ✗ surveys:', e.message);
}

// survey_questions
console.log('Seeding survey_questions...');
try {
  const sqStmt = db.prepare(`INSERT OR IGNORE INTO survey_questions (id, surveyId, question, type, options, required, sortOrder, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
  [
    { id: 'sq_1', q: '您对公司的整体满意度？', type: 'radio', opts: ['非常满意', '满意', '一般', '不满意'] },
    { id: 'sq_2', q: '您最看重的福利是？', type: 'checkbox', opts: ['五险一金', '带薪年假', '节日福利', '培训机会'] }
  ].forEach((sq, i) => {
    sqStmt.run(sq.id, 'surv_1', sq.q, sq.type, JSON.stringify(sq.opts), 1, i, now);
  });
  console.log('  ✓ survey_questions');
} catch(e) {
  console.log('  ✗ survey_questions:', e.message);
}

// survey_responses
console.log('Seeding survey_responses...');
try {
  const srStmt = db.prepare(`INSERT OR IGNORE INTO survey_responses (id, surveyId, userId, answers, submittedAt) VALUES (?,?,?,?,?)`);
  employees.slice(0, 15).forEach(emp => {
    srStmt.run(`sr_${emp.id}`, 'surv_1', emp.id, JSON.stringify({ sq_1: '满意', sq_2: ['五险一金', '带薪年假'] }), now);
  });
  console.log('  ✓ survey_responses');
} catch(e) {
  console.log('  ✗ survey_responses:', e.message);
}

// documents
console.log('Seeding documents...');
try {
  const docStmt = db.prepare(`INSERT OR IGNORE INTO documents (id, name, folderId, type, size, mimeType, url, content, accessLevel, uploaderId, uploaderName, isFavorite, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  ['员工手册', '考勤制度', '薪酬制度'].forEach((doc, i) => {
    docStmt.run(`doc_${i}`, doc, null, 'file', 102400, 'application/pdf', `/docs/${i}.pdf`, '', 'public', 'user_admin', '系统管理员', 0, now, now);
  });
  console.log('  ✓ documents');
} catch(e) {
  console.log('  ✗ documents:', e.message);
}

// document_folders
console.log('Seeding document_folders...');
try {
  const dfStmt = db.prepare(`INSERT OR IGNORE INTO document_folders (id, name, parentId, accessLevel, createdAt) VALUES (?,?,?,?,?)`);
  dfStmt.run('df_1', '公司制度', null, 'public', now);
  dfStmt.run('df_2', '部门文档', null, 'department', now);
  console.log('  ✓ document_folders');
} catch(e) {
  console.log('  ✗ document_folders:', e.message);
}

// approval_flows
console.log('Seeding approval_flows...');
try {
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
  console.log('  ✓ approval_flows');
} catch(e) {
  console.log('  ✗ approval_flows:', e.message);
}

// approval_requests
console.log('Seeding approval_requests...');
try {
  const arqStmt = db.prepare(`INSERT OR IGNORE INTO approval_requests (id, flowId, module, title, applicantId, applicantName, status, currentStep, formData, attachmentUrl, submittedAt, completedAt, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  employees.slice(0, 10).forEach((emp, i) => {
    arqStmt.run(
      `arq_${emp.id}`,
      'af_leave', 'leave', `${emp.name}请假申请`,
      emp.id, emp.name,
      ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
      1, JSON.stringify({ days: 2, reason: '个人事务' }), null, now, null, now
    );
  });
  console.log('  ✓ approval_requests');
} catch(e) {
  console.log('  ✗ approval_requests:', e.message);
}

// approval_records
console.log('Seeding approval_records...');
try {
  const aprecStmt = db.prepare(`INSERT OR IGNORE INTO approval_records (id, requestId, stepIndex, approverId, approverName, action, comment, handledAt, nextApprover, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const arqs = db.prepare('SELECT id FROM approval_requests LIMIT 5').all();
  arqs.forEach(arq => {
    aprecStmt.run(`aprec_${arq.id}`, arq.id, 1, 'user_admin', '系统管理员', 'approved', '同意', now, null, now);
  });
  console.log('  ✓ approval_records');
} catch(e) {
  console.log('  ✗ approval_records:', e.message);
}

// employee_changes
console.log('Seeding employee_changes...');
try {
  const ecStmt = db.prepare(`INSERT OR IGNORE INTO employee_changes (id, employeeId, employeeName, changeType, fromDepartment, toDepartment, fromPosition, toPosition, fromRank, toRank, fromSalary, toSalary, effectiveDate, reason, status, approverId, approverName, approveTime, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
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
  console.log('  ✓ employee_changes');
} catch(e) {
  console.log('  ✗ employee_changes:', e.message);
}

// employee_subsets
console.log('Seeding employee_subsets...');
try {
  const esStmt = db.prepare(`INSERT OR IGNORE INTO employee_subsets (id, name, code, description, fields, isActive, createdAt) VALUES (?,?,?,?,?,?,?)`);
  esStmt.run('es_1', '紧急联系人', 'emergency_contact', '员工紧急联系人信息', JSON.stringify([{ name: '联系人姓名', field: 'contactName' }, { name: '联系电话', field: 'contactPhone' }]), 1, now);
  console.log('  ✓ employee_subsets');
} catch(e) {
  console.log('  ✗ employee_subsets:', e.message);
}

// subset_records
console.log('Seeding subset_records...');
try {
  const srecStmt = db.prepare(`INSERT OR IGNORE INTO subset_records (id, subsetId, employeeId, data, createdAt, updatedAt) VALUES (?,?,?,?,?,?)`);
  employees.slice(0, 20).forEach(emp => {
    srecStmt.run(`srec_${emp.id}`, 'es_1', emp.id, JSON.stringify({ contactName: '张三', contactPhone: '13900139000' }), now, now);
  });
  console.log('  ✓ subset_records');
} catch(e) {
  console.log('  ✗ subset_records:', e.message);
}

// print_templates
console.log('Seeding print_templates...');
try {
  const ptStmt = db.prepare(`INSERT OR IGNORE INTO print_templates (id, name, type, content, paperSize, orientation, isDefault, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
  ptStmt.run('pt_1', '员工信息表', 'employee', '<html><body>{{name}}</body></html>', 'A4', 'portrait', 1, now);
  console.log('  ✓ print_templates');
} catch(e) {
  console.log('  ✗ print_templates:', e.message);
}

// reminder_logs
console.log('Seeding reminder_logs...');
try {
  const reminders = db.prepare('SELECT id FROM reminders').all();
  const rlStmt = db.prepare(`INSERT OR IGNORE INTO reminder_logs (id, reminderId, employeeId, triggeredAt, sentAt, status, error) VALUES (?,?,?,?,?,?,?)`);
  reminders.forEach(r => {
    rlStmt.run(`rl_${r.id}`, r.id, employees[0]?.id, now, now, 'sent', null);
  });
  console.log('  ✓ reminder_logs');
} catch(e) {
  console.log('  ✗ reminder_logs:', e.message);
}

// login_logs
console.log('Seeding login_logs...');
try {
  const users = db.prepare('SELECT id, username FROM users').all();
  const llStmt = db.prepare(`INSERT OR IGNORE INTO login_logs (id, userId, username, loginAt, ip, userAgent, success, failReason) VALUES (?,?,?,?,?,?,?,?)`);
  users.forEach(user => {
    llStmt.run(`ll_${user.id}_${Date.now()}`, user.id, user.username, now, '127.0.0.1', 'Mozilla/5.0', 1, null);
  });
  console.log('  ✓ login_logs');
} catch(e) {
  console.log('  ✗ login_logs:', e.message);
}

// data_backups
console.log('Seeding data_backups...');
try {
  const backupStmt = db.prepare(`INSERT OR IGNORE INTO data_backups (id, name, filePath, fileSize, status, createdBy, createdAt) VALUES (?,?,?,?,?,?,?)`);
  backupStmt.run('backup_1', '系统自动备份', '/backups/backup_20240420.db', 1024000, 'completed', 'system', now);
  console.log('  ✓ data_backups');
} catch(e) {
  console.log('  ✗ data_backups:', e.message);
}

// assessment_questions
console.log('Seeding assessment_questions...');
try {
  const tools = db.prepare('SELECT id FROM assessment_tools').all();
  const aqStmt = db.prepare(`INSERT OR IGNORE INTO assessment_questions (id, toolId, question, type, options, dimension, sortOrder, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
  tools.forEach(tool => {
    ['问题1：您通常如何处理压力？', '问题2：您如何与团队协作？'].forEach((q, i) => {
      aqStmt.run(`aq_${tool.id}_${i}`, tool.id, q, 'single', JSON.stringify(['A. 积极面对', 'B. 寻求帮助', 'C. 独立思考']), '性格', i, now);
    });
  });
  console.log('  ✓ assessment_questions');
} catch(e) {
  console.log('  ✗ assessment_questions:', e.message);
}

// assessment_results
console.log('Seeding assessment_results...');
try {
  const tools = db.prepare('SELECT id, name FROM assessment_tools').all();
  const asrStmt = db.prepare(`INSERT OR IGNORE INTO assessment_results (id, employeeId, employeeName, toolId, toolName, score, result, dimensionScores, completedAt, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  employees.slice(0, 10).forEach((emp, i) => {
    const tool = tools[i % tools.length];
    if (tool) {
      asrStmt.run(`asr_${emp.id}`, emp.id, emp.name, tool.id, tool.name || '职业性格测试', 75 + Math.floor(Math.random() * 25), '外向型', JSON.stringify({ 性格: 80, 沟通: 75 }), now, now);
    }
  });
  console.log('  ✓ assessment_results');
} catch(e) {
  console.log('  ✗ assessment_results:', e.message);
}

// competency_levels
console.log('Seeding competency_levels...');
try {
  const compItems = db.prepare('SELECT id FROM competency_items').all();
  const clStmt = db.prepare(`INSERT OR IGNORE INTO competency_levels (id, itemId, level, name, description, behavior, scoreRange, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
  compItems.forEach(item => {
    [1, 2, 3, 4, 5].forEach(level => {
      clStmt.run(`cl_${item.id}_${level}`, item.id, level, `Level ${level}`, `能力等级${level}`, `表现出${level}级行为`, `${level * 20}-${(level + 1) * 20}`, now);
    });
  });
  console.log('  ✓ competency_levels');
} catch(e) {
  console.log('  ✗ competency_levels:', e.message);
}

// competency_models
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

// model_competencies
console.log('Seeding model_competencies...');
try {
  const compModels = db.prepare('SELECT id FROM competency_models').all();
  const compItems = db.prepare('SELECT id FROM competency_items').all();
  const mcStmt = db.prepare(`INSERT OR IGNORE INTO model_competencies (id, modelId, itemId, weight, requiredLevel, sortOrder) VALUES (?,?,?,?,?,?)`);
  compModels.forEach(model => {
    compItems.slice(0, 5).forEach((item, i) => {
      mcStmt.run(`mc_${model.id}_${i}`, model.id, item.id, 20, 3, i);
    });
  });
  console.log('  ✓ model_competencies');
} catch(e) {
  console.log('  ✗ model_competencies:', e.message);
}

// talent_profiles
console.log('Seeding talent_profiles...');
try {
  const tpStmt = db.prepare(`INSERT OR IGNORE INTO talent_profiles (id, employeeId, employeeName, department, position, performanceData, competencyData, overallScore, talentLevel, talentGrid, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  employees.slice(0, 20).forEach(emp => {
    tpStmt.run(`tp_${emp.id}`, emp.id, emp.name, emp.department || '研发部', emp.position || '员工', JSON.stringify({ avgScore: 82 }), JSON.stringify({ leadership: 75 }), 80, 'B', '中坚力量', now);
  });
  console.log('  ✓ talent_profiles');
} catch(e) {
  console.log('  ✗ talent_profiles:', e.message);
}

// talent_reports
console.log('Seeding talent_reports...');
try {
  const trStmt = db.prepare(`INSERT OR IGNORE INTO talent_reports (id, name, cycleId, talentSummary, nineBoxGrid, successionPlans, createdBy, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
  trStmt.run('tr_1', '2024年度人才盘点报告', 'pc_default', JSON.stringify({ highPotentials: 10, coreTalent: 25 }), JSON.stringify({ A1: 5, A2: 10, B1: 15 }), JSON.stringify({ CEO: ['候选人1', '候选人2'] }), 'user_admin', now);
  console.log('  ✓ talent_reports');
} catch(e) {
  console.log('  ✗ talent_reports:', e.message);
}

console.log('\n=== 最终统计 ===');
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
