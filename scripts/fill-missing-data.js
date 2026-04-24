const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data/ehr.db');
const db = new Database(dbPath);

console.log('填充缺失数据...\n');

// 获取员工列表
const employees = db.prepare('SELECT * FROM employees WHERE status = ?').all('active');
console.log(`员工数: ${employees.length}`);

// 1. 填充合同数据
const existingContracts = db.prepare('SELECT COUNT(*) as c FROM contracts').get();
if (existingContracts.c === 0) {
  console.log('\n填充合同数据...');
  const insertContract = db.prepare(`
    INSERT INTO contracts (id, employeeId, employeeName, contractType, startDate, endDate, duration, signCount, status, remindDays, signedAt, createdAt)
    VALUES (@id, @employeeId, @employeeName, @contractType, @startDate, @endDate, @duration, @signCount, @status, @remindDays, @signedAt, @createdAt)
  `);
  
  for (const emp of employees) {
    const startDate = emp.hireDate || '2024-01-01';
    const endDate = new Date(new Date(startDate).setFullYear(new Date(startDate).getFullYear() + 3)).toISOString().slice(0, 10);
    insertContract.run({
      id: `con_${emp.id}`,
      employeeId: emp.id,
      employeeName: emp.name,
      contractType: 'fixed',
      startDate,
      endDate,
      duration: 36,
      signCount: 1,
      status: 'active',
      remindDays: 30,
      signedAt: startDate,
      createdAt: new Date().toISOString()
    });
  }
  console.log(`  ✓ 已创建 ${employees.length} 份合同`);
}

// 2. 填充考勤记录
const existingAttendance = db.prepare('SELECT COUNT(*) as c FROM attendance_records').get();
if (existingAttendance.c === 0) {
  console.log('\n填充考勤记录...');
  const insertAttendance = db.prepare(`
    INSERT INTO attendance_records (id, employeeId, employeeName, date, shiftTypeId, shiftTypeName, scheduledStart, scheduledEnd, clockIn, clockOut, workHours, lateMinutes, earlyLeaveMinutes, status, lateCount, isRestDay, isHoliday, remark, createdAt)
    VALUES (@id, @employeeId, @employeeName, @date, @shiftTypeId, @shiftTypeName, @scheduledStart, @scheduledEnd, @clockIn, @clockOut, @workHours, @lateMinutes, @earlyLeaveMinutes, @status, @lateCount, @isRestDay, @isHoliday, @remark, @createdAt)
  `);
  
  const shiftTypes = ['标准班', '早班', '晚班', '弹性班'];
  const today = new Date();
  let count = 0;
  
  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    for (const emp of employees) {
      const shiftType = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];
      const clockInHour = 8 + Math.floor(Math.random() * 2);
      const clockOutHour = 17 + Math.floor(Math.random() * 3);
      const workHours = clockOutHour - clockInHour;
      
      insertAttendance.run({
        id: `ar_${emp.id}_${dateStr.replace(/-/g, '')}`,
        employeeId: emp.id,
        employeeName: emp.name,
        date: dateStr,
        shiftTypeId: `st_${Math.floor(Math.random() * 4) + 1}`,
        shiftTypeName: shiftType,
        scheduledStart: '09:00',
        scheduledEnd: '18:00',
        clockIn: `${String(clockInHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
        clockOut: `${String(clockOutHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
        workHours,
        lateMinutes: clockInHour > 9 ? (clockInHour - 9) * 60 : 0,
        earlyLeaveMinutes: clockOutHour < 18 ? (18 - clockOutHour) * 60 : 0,
        status: isWeekend ? '休息' : (clockInHour > 9 ? '迟到' : '正常'),
        lateCount: clockInHour > 9 ? 1 : 0,
        isRestDay: isWeekend ? 1 : 0,
        isHoliday: 0,
        remark: '',
        createdAt: new Date().toISOString()
      });
      count++;
    }
  }
  console.log(`  ✓ 已创建 ${count} 条考勤记录`);
}

// 3. 填充请假记录
const existingLeave = db.prepare('SELECT COUNT(*) as c FROM leave_records').get();
if (existingLeave.c === 0) {
  console.log('\n填充请假记录...');
  const insertLeave = db.prepare(`
    INSERT INTO leave_records (id, employeeId, employeeName, leaveType, startDate, endDate, totalDays, reason, status, approver, createdAt)
    VALUES (@id, @employeeId, @employeeName, @leaveType, @startDate, @endDate, @totalDays, @reason, @status, @approver, @createdAt)
  `);
  
  const leaveTypes = ['年假', '事假', '病假', '调休'];
  for (let i = 0; i < 20; i++) {
    const emp = employees[Math.floor(Math.random() * employees.length)];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3) + 1);
    
    insertLeave.run({
      id: `lr_${Date.now()}_${i}`,
      employeeId: emp.id,
      employeeName: emp.name,
      leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      totalDays: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
      reason: '个人事务',
      status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
      approver: '张明辉',
      createdAt: new Date().toISOString()
    });
  }
  console.log(`  ✓ 已创建 20 条请假记录`);
}

// 4. 填充薪资数据
const existingSalary = db.prepare('SELECT COUNT(*) as c FROM salaries').get();
if (existingSalary.c === 0) {
  console.log('\n填充薪资数据...');
  const insertSalary = db.prepare(`
    INSERT INTO salaries (id, employeeId, employeeName, month, baseSalary, positionSalary, performance, overtime, mealAllowance, transportAllowance, otherAllowance, socialInsurance, medicalInsurance, housingFund, otherDeduction, tax, grossSalary, netSalary, status, paidAt, createdAt)
    VALUES (@id, @employeeId, @employeeName, @month, @baseSalary, @positionSalary, @performance, @overtime, @mealAllowance, @transportAllowance, @otherAllowance, @socialInsurance, @medicalInsurance, @housingFund, @otherDeduction, @tax, @grossSalary, @netSalary, @status, @paidAt, @createdAt)
  `);
  
  const months = ['2026-01', '2026-02', '2026-03'];
  for (const month of months) {
    for (const emp of employees) {
      const baseSalary = 8000 + Math.floor(Math.random() * 12000);
      const positionSalary = Math.floor(baseSalary * 0.2);
      const performance = Math.floor(Math.random() * 2000);
      const overtime = Math.floor(Math.random() * 500);
      const mealAllowance = 300;
      const transportAllowance = 500;
      const grossSalary = baseSalary + positionSalary + performance + overtime + mealAllowance + transportAllowance;
      const socialInsurance = Math.floor(baseSalary * 0.08);
      const medicalInsurance = Math.floor(baseSalary * 0.02);
      const housingFund = Math.floor(baseSalary * 0.12);
      const tax = Math.floor((grossSalary - socialInsurance - medicalInsurance - housingFund - 5000) * 0.1);
      const netSalary = grossSalary - socialInsurance - medicalInsurance - housingFund - Math.max(tax, 0);
      
      insertSalary.run({
        id: `sal_${emp.id}_${month.replace('-', '_')}`,
        employeeId: emp.id,
        employeeName: emp.name,
        month,
        baseSalary,
        positionSalary,
        performance,
        overtime,
        mealAllowance,
        transportAllowance,
        otherAllowance: 0,
        socialInsurance,
        medicalInsurance,
        housingFund,
        otherDeduction: 0,
        tax: Math.max(tax, 0),
        grossSalary,
        netSalary,
        status: 'paid',
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    }
  }
  console.log(`  ✓ 已创建 ${employees.length * 3} 条薪资记录`);
}

// 5. 填充审批流程
const existingFlows = db.prepare('SELECT COUNT(*) as c FROM approval_flows').get();
if (existingFlows.c === 0) {
  console.log('\n填充审批流程...');
  const insertFlow = db.prepare(`
    INSERT INTO approval_flows (id, name, module, steps, isActive, createdAt)
    VALUES (@id, @name, @module, @steps, @isActive, @createdAt)
  `);
  
  const flows = [
    { id: 'af_leave', name: '请假审批', module: 'leave', steps: JSON.stringify([{stepIndex: 1, stepName: '部门经理审批', approverRole: 'dept_manager'}, {stepIndex: 2, stepName: 'HR审批', approverRole: 'hr_manager'}]) },
    { id: 'af_overtime', name: '加班审批', module: 'overtime', steps: JSON.stringify([{stepIndex: 1, stepName: '部门经理审批', approverRole: 'dept_manager'}]) },
    { id: 'af_resign', name: '离职审批', module: 'resignation', steps: JSON.stringify([{stepIndex: 1, stepName: '部门经理审批', approverRole: 'dept_manager'}, {stepIndex: 2, stepName: 'HR审批', approverRole: 'hr_manager'}, {stepIndex: 3, stepName: '总经理审批', approverRole: 'gm'}]) },
  ];
  
  for (const flow of flows) {
    insertFlow.run({ ...flow, isActive: 1, createdAt: new Date().toISOString() });
  }
  console.log(`  ✓ 已创建 ${flows.length} 个审批流程`);
}

// 6. 填充培训课程
const existingCourses = db.prepare('SELECT COUNT(*) as c FROM training_courses').get();
if (existingCourses.c === 0) {
  console.log('\n填充培训课程...');
  const insertCourse = db.prepare(`
    INSERT INTO training_courses (id, title, category, duration, description, isActive, createdAt)
    VALUES (@id, @title, @category, @duration, @description, @isActive, @createdAt)
  `);
  
  const courses = [
    { id: 'tc_1', title: '新员工入职培训', category: '入职培训', duration: 8, description: '公司文化、制度介绍', isActive: 1 },
    { id: 'tc_2', title: '领导力提升培训', category: '管理培训', duration: 16, description: '团队管理、沟通技巧', isActive: 1 },
    { id: 'tc_3', title: '技术技能培训', category: '技能培训', duration: 24, description: '专业技能提升', isActive: 1 },
  ];
  
  for (const course of courses) {
    insertCourse.run({ ...course, createdAt: new Date().toISOString() });
  }
  console.log(`  ✓ 已创建 ${courses.length} 个培训课程`);
}

console.log('\n数据填充完成！');
