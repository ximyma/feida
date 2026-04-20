/**
 * 补全剩余空表种子数据
 */

const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

const now = new Date().toISOString();
const today = new Date().toISOString().slice(0, 10);

const employees = db.prepare('SELECT id, name, department, position, status FROM employees').all();
const departments = db.prepare('SELECT id, name FROM departments').all();
const users = db.prepare('SELECT id, username, realName FROM users').all();

console.log('补全剩余数据...');

// ============ 请假记录（修正字段） ============
console.log('Seeding leave_records...');
try {
  const leaveTypes = ['年假', '病假', '事假', '婚假', '产假', '陪产假', '丧假'];
  const lrStmt = db.prepare(`INSERT OR IGNORE INTO leave_records 
    (id, employeeId, employeeName, leaveType, startDate, endDate, totalDays, reason, status, approver, approveTime, rejectReason, handlerId, handlerName, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  employees.slice(0, 20).forEach((emp, i) => {
    const type = leaveTypes[i % leaveTypes.length];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 20));
    const days = Math.floor(Math.random() * 3) + 1;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    const status = ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)];
    
    lrStmt.run(
      `lr_${emp.id}_${i}`,
      emp.id, emp.name, type,
      startDate.toISOString().slice(0, 10),
      endDate.toISOString().slice(0, 10),
      days + 1, '个人事务申请', status,
      status === 'approved' ? 'user_admin' : null,
      status === 'approved' ? now : null,
      status === 'rejected' ? '不符合请假条件' : null,
      'user_admin', '系统管理员', now
    );
  });
  console.log('  ✓ leave_records');
} catch(e) {
  console.log('  ✗ leave_records:', e.message);
}

// ============ 加班记录（修正字段） ============
console.log('Seeding overtime_records...');
try {
  const otInfo = db.prepare('PRAGMA table_info(overtime_records)').all();
  console.log('  overtime_records columns:', otInfo.map(c => c.name).join(', '));
  
  const otStmt = db.prepare(`INSERT OR IGNORE INTO overtime_records 
    (id, employeeId, employeeName, date, startTime, endTime, hours, reason, status, approver, approveTime, rejectReason, handlerId, handlerName, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  employees.slice(0, 15).forEach((emp, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 20));
    const hours = [2, 3, 4, 5, 6, 8][Math.floor(Math.random() * 6)];
    const status = ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)];
    
    otStmt.run(
      `or_${emp.id}_${i}`,
      emp.id, emp.name,
      date.toISOString().slice(0, 10),
      '18:00', `${String(18 + hours).padStart(2, '0')}:00`,
      hours, '项目赶工加班', status,
      status === 'approved' ? 'user_admin' : null,
      status === 'approved' ? now : null,
      status === 'rejected' ? '无加班需求' : null,
      'user_admin', '系统管理员', now
    );
  });
  console.log('  ✓ overtime_records');
} catch(e) {
  console.log('  ✗ overtime_records:', e.message);
}

// ============ 薪资记录（修正字段） ============
console.log('Seeding salaries...');
try {
  const salInfo = db.prepare('PRAGMA table_info(salaries)').all();
  console.log('  salaries columns:', salInfo.map(c => c.name).join(', '));
  
  const salStmt = db.prepare(`INSERT OR IGNORE INTO salaries 
    (id, employeeId, employeeName, month, baseSalary, positionSalary, performance, overtime, mealAllowance, transportAllowance, otherAllowance, socialInsurance, medicalInsurance, housingFund, otherDeduction, tax, grossSalary, netSalary, status, paidAt, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
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
      emp.id, emp.name,
      `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2, '0')}`,
      base, position, performance, overtime, mealAllowance, transportAllowance, 0,
      social, medical, housing, 0, tax, gross, net, 'paid', now, now
    );
  });
  console.log('  ✓ salaries');
} catch(e) {
  console.log('  ✗ salaries:', e.message);
}

// ============ 合同（修正字段） ============
console.log('Seeding contracts...');
try {
  const conInfo = db.prepare('PRAGMA table_info(contracts)').all();
  console.log('  contracts columns:', conInfo.map(c => c.name).join(', '));
  
  const conStmt = db.prepare(`INSERT OR IGNORE INTO contracts 
    (id, employeeId, employeeName, contractType, startDate, endDate, duration, signCount, status, remindDays, attachment, remark, signedAt, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  employees.forEach(emp => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 24));
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 3);
    
    conStmt.run(
      `con_${emp.id}`,
      emp.id, emp.name, 'fixed',
      startDate.toISOString().slice(0, 10),
      endDate.toISOString().slice(0, 10),
      36, 1, 'active', 30, null, '', startDate.toISOString().slice(0, 10), now
    );
  });
  console.log('  ✓ contracts');
} catch(e) {
  console.log('  ✗ contracts:', e.message);
}

// ============ 访客（修正字段） ============
console.log('Seeding visitors...');
try {
  const visInfo = db.prepare('PRAGMA table_info(visitors)').all();
  console.log('  visitors columns:', visInfo.map(c => c.name).join(', '));
  
  const visStmt = db.prepare(`INSERT OR IGNORE INTO visitors 
    (id, name, company, idCard, phone, purpose, contactPerson, contactDept, visitTime, leaveTime, badgeNo, status, createdAt) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  for (let i = 0; i < 10; i++) {
    visStmt.run(
      `vis_${i}`, `访客${i + 1}`, `合作公司${i + 1}`,
      `110101199001010${i + 1}1`, `1380013800${i}`, '商务洽谈',
      'user_admin', '行政部',
      `${today} 10:00`, `${today} 12:00`,
      `V${String(i).padStart(4, '0')}`, 'left', now
    );
  }
  console.log('  ✓ visitors');
} catch(e) {
  console.log('  ✗ visitors:', e.message);
}

// ============ 其他空表批量填充 ============
console.log('\n批量填充其他表...');

// salary_items
try {
  const siStmt = db.prepare(`INSERT OR IGNORE INTO salary_items (id, name, code, type, dataType, decimalPlaces, formula, defaultValue, isTaxable, sortOrder, isActive, category, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
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
    siStmt.run(item.id, item.name, item.code, item.type, 'number', 2, null, 0, item.taxable, i, 1, 'salary', now);
  });
  console.log('  ✓ salary_items');
} catch(e) {
  console.log('  ✗ salary_items:', e.message);
}

// salary_item_templates
try {
  const ranks = db.prepare('SELECT id, name FROM ranks').all();
  const sitStmt = db.prepare(`INSERT OR IGNORE INTO salary_item_templates (id, name, rankId, items, isActive, createdAt) VALUES (?,?,?,?,?,?)`);
  ranks.forEach(rank => {
    sitStmt.run(`sit_${rank.id}`, `${rank.name}薪资模板`, rank.id, JSON.stringify(['si_base', 'si_position', 'si_performance']), 1, now);
  });
  console.log('  ✓ salary_item_templates');
} catch(e) {
  console.log('  ✗ salary_item_templates:', e.message);
}

// salary_adjustments
try {
  const sadjStmt = db.prepare(`INSERT OR IGNORE INTO salary_adjustments (id, employeeId, employeeName, month, itemType, itemName, amount, reason, isRecurring, startMonth, endMonth, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  employees.slice(0, 10).forEach((emp, i) => {
    sadjStmt.run(`sadj_${emp.id}_${i}`, emp.id, emp.name, today, 'allowance', '住房补贴', 1000, '新增住房补贴', 1, today, null, now);
  });
  console.log('  ✓ salary_adjustments');
} catch(e) {
  console.log('  ✗ salary_adjustments:', e.message);
}

// company_contributions
try {
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
  console.log('  ✓ company_contributions');
} catch(e) {
  console.log('  ✗ company_contributions:', e.message);
}

// contract_templates
try {
  const ctStmt = db.prepare(`INSERT OR IGNORE INTO contract_templates (id, name, contractType, content, isActive, createdAt) VALUES (?,?,?,?,?,?)`);
  [
    { id: 'ct_fixed', name: '固定期限劳动合同', contractType: 'fixed' },
    { id: 'ct_unfixed', name: '无固定期限劳动合同', contractType: 'unfixed' },
    { id: 'ct_probation', name: '试用期合同', contractType: 'probation' }
  ].forEach(t => {
    ctStmt.run(t.id, t.name, t.contractType, '<p>合同模板内容</p>', 1, now);
  });
  console.log('  ✓ contract_templates');
} catch(e) {
  console.log('  ✗ contract_templates:', e.message);
}

// training_plans
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

// training_courses
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

// training_evaluations
try {
  const teStmt = db.prepare(`INSERT OR IGNORE INTO training_evaluations (id, planId, employeeId, scores, totalScore, feedback, submittedAt, createdAt) VALUES (?,?,?,?,?,?,?,?)`);
  employees.slice(0, 15).forEach((emp, i) => {
    teStmt.run(`te_${emp.id}`, 'tpl_1', emp.id, JSON.stringify({ content: 4.5, trainer: 4.8, material: 4.2 }), 4.5, '培训很有帮助', now, now);
  });
  console.log('  ✓ training_evaluations');
} catch(e) {
  console.log('  ✗ training_evaluations:', e.message);
}

// talent_pools
try {
  const tpStmt = db.prepare(`INSERT OR IGNORE INTO talent_pools (id, name, category, description, candidateCount, createdAt) VALUES (?,?,?,?,?,?)`);
  [
    { id: 'tp_tech', name: '技术人才库', category: '技术' },
    { id: 'tp_mgmt', name: '管理人才库', category: '管理' },
    { id: 'tp_sales', name: '销售人才库', category: '销售' }
  ].forEach(t => {
    tpStmt.run(t.id, t.name, t.category, `${t.name}，储备优秀候选人`, Math.floor(Math.random() * 20), now);
  });
  console.log('  ✓ talent_pools');
} catch(e) {
  console.log('  ✗ talent_pools:', e.message);
}

// interviews
try {
  const candidates = db.prepare('SELECT id, name FROM candidates LIMIT 10').all();
  const recruitmentPositions = db.prepare('SELECT id, title FROM recruitment_positions').all();
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

// offers
try {
  const candidates = db.prepare('SELECT id, name FROM candidates LIMIT 5').all();
  const recruitmentPositions = db.prepare('SELECT id, title FROM recruitment_positions').all();
  const offerStmt = db.prepare(`INSERT OR IGNORE INTO offers (id, candidateId, candidateName, positionId, positionTitle, salary, startDate, status, sentAt, acceptedAt, rejectedAt, signedContractUrl, remark, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  candidates.forEach((cand, i) => {
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

// resumes
try {
  const candidates = db.prepare('SELECT id, name FROM candidates').all();
  const resumeStmt = db.prepare(`INSERT OR IGNORE INTO resumes (id, candidateId, fileName, fileUrl, parseResult, rawText, createdAt) VALUES (?,?,?,?,?,?,?)`);
  candidates.forEach(cand => {
    resumeStmt.run(`res_${cand.id}`, cand.id, `${cand.name}_简历.pdf`, `/uploads/resumes/${cand.id}.pdf`, '{}', '', now);
  });
  console.log('  ✓ resumes');
} catch(e) {
  console.log('  ✗ resumes:', e.message);
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
