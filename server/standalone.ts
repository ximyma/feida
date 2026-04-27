import { DatabaseService } from './modules/database/database.service';
import * as http from 'http';
import express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { 
  createApprovalFlow, 
  createApprovalRequest, 
  processApproval, 
  getPendingApprovals, 
  getApprovalHistory 
} from './approval-engine';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const app = express();
const db = new DatabaseService();
db.onModuleInit();

app.use(express.json());

function apiRouter() {
  const router = express.Router();

  router.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.authenticate(username, password);
    if (!user) { res.status(401).json({ success: false, message: '用户名或密码错误' }); return; }
    db.updateLoginTime(user.id, req.ip || '127.0.0.1');
    db.addAuditLog({ userId: user.id, username: user.username, realName: user.realName, action: 'login', module: 'system', detail: `用户 ${user.realName} 登录`, ip: req.ip });
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  });

  router.post('/auth/register', (req, res) => {
    const { phone, realName, password } = req.body;
    const existing = db.findOne('users', { phone });
    if (existing) { res.json({ success: false, message: '该手机号已注册' }); return; }
    const employee = db.findOne('employees', { phone }) as any;
    const user = { id: `user_${Date.now()}`, username: `emp_${phone}`, realName, phone, email: '', password: hashPwd(password), userType: 'employee', roleIds: JSON.stringify(['role_employee']), status: 'active', employeeId: employee?.id || null, createdAt: new Date().toISOString() };
    db.insert('users', user);
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  });

  router.post('/auth/change-password', (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    const user = db.findById('users', userId) as any;
    if (!user) { res.json({ success: false, message: '用户不存在' }); return; }
    if (oldPassword && user.password !== hashPwd(oldPassword)) { res.json({ success: false, message: '原密码错误' }); return; }
    db.update('users', userId, { password: hashPwd(newPassword) });
    res.json({ success: true });
  });

  const ALLOWED = [
    // 基础模块
    'employees','departments','positions','ranks',
    'users','roles','permissions',
    // 考勤模块
    'shift_types','schedules','attendance_records','leave_records','leave_balances',
    'overtime_records','shift_change_requests','attendance_rules','check_locations',
    'daily_attendance_reports','monthly_attendance_summary',
    'report_definitions','data_sources','report_configs',
    // 薪资模块
    'salaries','salary_items','salary_item_templates','salary_adjustments',
    'location_allowances','company_contributions',
    'insurance_schemes','insured_employees','insurance_changes','insurance_ledger',
    // 合同模块
    'contracts','contract_templates',
    // 招聘模块
    'recruitment_positions','candidates','talent_pools','interviews','offers','resumes',
    // 绩效模块
    'kpis','performance_cycles','performance_records','performance_grades',
    // 培训模块
    'training_plans','training_courses','training_records','training_evaluations',
    // 后勤模块
    'dormitories','dormitory_assignments','dormitory_bills','canteens','meal_records',
    'vehicles','vehicle_usage','visitors',
    // 综合事务模块
    'announcements','announcement_reads','surveys','survey_questions','survey_responses',
    'documents','document_folders',
    // 人才发展模块
    'assessment_tools','assessment_questions','assessment_results',
    'competency_items','competency_levels','competency_models','model_competencies',
    'talent_profiles','talent_reports',
    // 流程审批模块
    'approval_flows','approval_requests','approval_records','workflow_templates',
    // 人事管理模块
    'employee_changes','field_definitions','employee_subsets','subset_records',
    'print_templates','reminders','reminder_logs',
    // 办公管理模块
    'meeting_rooms','meetings','office_supplies','supply_requests',
    // 招聘邮件模块
    'talent_tags','email_templates','email_logs',
    // 培训评估模块
    'training_classes','assessment_templates',
    // 系统模块
    'system_config','audit_logs','login_logs','data_backups','scheduled_tasks'
  ];
  
  // ============ 打卡功能 API ============
  router.post('/attendance/clock-in', (req, res) => {
    const { employeeId, employeeName, location, remark } = req.body;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 8);
    
    // 检查是否已打卡
    const existing = db.findWhere('attendance_records', { employeeId, date: today }) as any[];
    if (existing.length > 0 && existing[0].clockIn) {
      res.json({ success: false, message: '今日已打卡' });
      return;
    }
    
    // 获取排班信息
    const schedule = db.findWhere('schedules', { employeeId, date: today }) as any[];
    const shift = schedule[0] || { shiftTypeId: 'st_1', shiftTypeName: '标准班', scheduledStart: '09:00', scheduledEnd: '18:00' };
    
    // 判断是否迟到
    const scheduledStart = shift.scheduledStart || '09:00';
    const [schedHour, schedMin] = scheduledStart.split(':').map(Number);
    const [nowHour, nowMin] = time.split(':').map(Number);
    const lateMinutes = (nowHour * 60 + nowMin) - (schedHour * 60 + schedMin);
    const status = lateMinutes > 0 ? '迟到' : '正常';
    
    const record = {
      id: `ar_${employeeId}_${today.replace(/-/g, '')}`,
      employeeId,
      employeeName,
      date: today,
      shiftTypeId: shift.shiftTypeId,
      shiftTypeName: shift.shiftTypeName,
      scheduledStart: shift.scheduledStart,
      scheduledEnd: shift.scheduledEnd,
      clockIn: time,
      clockOut: null,
      workHours: 0,
      lateMinutes: Math.max(0, lateMinutes),
      earlyLeaveMinutes: 0,
      status,
      lateCount: lateMinutes > 0 ? 1 : 0,
      isRestDay: 0,
      isHoliday: 0,
      remark: remark || '',
      createdAt: now.toISOString()
    };
    
    db.insert('attendance_records', record);
    
    // 更新日考勤汇总
    updateDailyReport(db, today, record);
    
    res.json({ 
      success: true, 
      record,
      message: status === '迟到' ? `打卡成功，迟到${lateMinutes}分钟` : '打卡成功'
    });
  });
  
  router.post('/attendance/clock-out', (req, res) => {
    const { employeeId, remark } = req.body;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 8);
    
    // 查找今日打卡记录
    const existing = db.findWhere('attendance_records', { employeeId, date: today }) as any[];
    if (existing.length === 0) {
      res.json({ success: false, message: '未找到今日打卡记录' });
      return;
    }
    
    const record = existing[0];
    if (record.clockOut) {
      res.json({ success: false, message: '今日已签退' });
      return;
    }
    
    // 计算工作时长
    const [inHour, inMin] = record.clockIn.split(':').map(Number);
    const [outHour, outMin] = time.split(':').map(Number);
    const workMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
    const workHours = Math.round(workMinutes / 60 * 10) / 10;
    
    // 判断是否早退
    const scheduledEnd = record.scheduledEnd || '18:00';
    const [schedHour, schedMin] = scheduledEnd.split(':').map(Number);
    const earlyMinutes = (schedHour * 60 + schedMin) - (outHour * 60 + outMin);
    
    let status = record.status;
    if (earlyMinutes > 0) {
      status = record.status === '迟到' ? '迟到早退' : '早退';
    }
    
    db.update('attendance_records', record.id, {
      clockOut: time,
      workHours,
      earlyLeaveMinutes: Math.max(0, earlyMinutes),
      status,
      remark: remark || record.remark
    });
    
    res.json({ 
      success: true, 
      workHours,
      message: earlyMinutes > 0 ? `签退成功，早退${earlyMinutes}分钟` : '签退成功'
    });
  });
  
  router.get('/attendance/today/:employeeId', (req, res) => {
    const { employeeId } = req.params;
    const today = new Date().toISOString().slice(0, 10);
    const records = db.findWhere('attendance_records', { employeeId, date: today });
    res.json(records[0] || null);
  });
  
  router.get('/attendance/my-records/:employeeId', (req, res) => {
    const { employeeId } = req.params;
    const { month } = req.query;
    let records = db.findWhere('attendance_records', { employeeId });
    if (month) {
      records = records.filter((r: any) => r.date.startsWith(month as string));
    }
    res.json(records.sort((a: any, b: any) => b.date.localeCompare(a.date)));
  });

  // ============ Dashboard 统计 API ============
  router.get('/dashboard/stats', (_req, res) => {
    const employees = db.findAll('employees');
    const salaries = db.findAll('salaries');
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthPayroll = salaries.filter((s: any) => s.month === currentMonth).reduce((sum: number, s: any) => sum + (s.netSalary || 0), 0);
    res.json({
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e: any) => e.status === 'active').length,
      pendingEmployees: employees.filter((e: any) => e.status === 'pending').length,
      monthPayroll,
      departmentStats: db.query('SELECT department, COUNT(*) as count FROM employees GROUP BY department'),
    });
  });

  // ============ 数据统计分析 API ============
  router.get('/statistics', (_req, res) => {
    try {
      const stats = db.getStatistics();
      res.json({ success: true, data: stats });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // ============ 报表定义 CRUD ============
  router.get('/report_definitions', (_req, res) => {
    try {
      const reports = db.getReportDefinitions();
      res.json(reports);
    } catch (e: any) {
      res.json({ error: e.message });
    }
  });

  // ============ 数据源管理 ============
  router.get('/data_sources', (_req, res) => {
    try {
      res.json(db.getDataSources());
    } catch (e: any) {
      res.json({ error: e.message });
    }
  });

  router.post('/data_sources/test', (req, res) => {
    try {
      const result = db.testDataSourceConnection(req.body.id);
      res.json(result);
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // ============ 报表配置管理 ============
  router.get('/report_configs', (_req, res) => {
    try {
      res.json(db.getReportConfigs());
    } catch (e: any) {
      res.json({ error: e.message });
    }
  });

  // ============ 薪资分析 API ============
  router.get('/salary_analysis', (_req, res) => {
    try {
      const salaries = db.findAll('salaries');
      const employees = db.findAll('employees');
      const deptMap: Record<string, any> = {};
      employees.forEach((e: any) => { deptMap[e.id] = e.department; });
      // Group by department
      const grouped: Record<string, { dept: string; total: number; count: number; highest: number; lowest: number }> = {};
      salaries.forEach((s: any) => {
        const dept = deptMap[s.employeeId] || '未知部门';
        const gross = s.grossPay || s.baseSalary || 0;
        if (!grouped[dept]) grouped[dept] = { dept, total: 0, count: 0, highest: 0, lowest: Infinity };
        grouped[dept].total += gross;
        grouped[dept].count++;
        if (gross > grouped[dept].highest) grouped[dept].highest = gross;
        if (gross < grouped[dept].lowest) grouped[dept].lowest = gross;
      });
      const results = Object.values(grouped).map(g => ({
        ...g, avgSalary: g.count > 0 ? Math.round(g.total / g.count) : 0,
        lowest: g.lowest === Infinity ? 0 : g.lowest,
      }));
      res.json({ results });
    } catch (e: any) {
      res.json({ results: [], error: e.message });
    }
  });

  // ============ 原有 CRUD API ============
  
  router.get('/:table', (req, res) => {
    const { table } = req.params;
    if (!ALLOWED.includes(table)) { res.json({ error: 'Invalid table' }); return; }
    const skipKeys = new Set(['_', 'limit', 'offset', 'page', 'pageSize', 'sort', 'order', 'fields']);
    const filters = Object.fromEntries(Object.entries(req.query).filter(([k]) => !skipKeys.has(k)));
    const limitVal = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offsetVal = req.query.offset ? parseInt(req.query.offset as string) : undefined;
    let data;
    if (Object.keys(filters).length > 0) {
      data = limitVal ? db.findWhere(table, filters, limitVal) : db.findWhere(table, filters);
    } else {
      data = db.findAll(table);
      if (limitVal) data = data.slice(offsetVal || 0, (offsetVal || 0) + limitVal);
    }
    res.json(data);
  });

  router.get('/:table/:id', (req, res) => {
    const { table, id } = req.params;
    if (!ALLOWED.includes(table)) { res.json({ error: 'Invalid table' }); return; }
    res.json(db.findById(table, id) || { error: 'Not found' });
  });

  router.post('/:table', (req, res) => {
    const { table } = req.params;
    if (!ALLOWED.includes(table)) { res.json({ error: 'Invalid table' }); return; }
    const rawBody = req.body;
    if (!rawBody.id) rawBody.id = `${table.slice(0,3)}_${Date.now()}`;
    // Only include fields that exist in the target table
    let data: Record<string, any> = { ...rawBody };
    try {
      const tableInfo = db.query(`PRAGMA table_info(${table})`);
      const cols = tableInfo.map((c: any) => c.name);
      // Filter out fields not in table, add timestamps if columns exist
      data = Object.fromEntries(Object.entries(data).filter(([k]) => cols.includes(k)));
      if (cols.includes('createdAt') && !data.createdAt) data.createdAt = new Date().toISOString();
      if (cols.includes('updatedAt')) data.updatedAt = new Date().toISOString();
    } catch {}
    res.json(db.insert(table, data));
  });

  router.put('/:table/:id', (req, res) => {
    const { table, id } = req.params;
    if (!ALLOWED.includes(table)) { res.json({ error: 'Invalid table' }); return; }
    // Only update fields that exist in the target table
    let data: Record<string, any> = { ...req.body };
    try {
      const tableInfo = db.query(`PRAGMA table_info(${table})`);
      const cols = tableInfo.map((c: any) => c.name);
      data = Object.fromEntries(Object.entries(data).filter(([k]) => cols.includes(k)));
      if (cols.includes('updatedAt')) data.updatedAt = new Date().toISOString();
    } catch {}
    res.json(db.update(table, id, data));
  });

  router.delete('/:table/:id', (req, res) => {
    const { table, id } = req.params;
    if (!ALLOWED.includes(table)) { res.json({ error: 'Invalid table' }); return; }
    res.json({ success: db.delete(table, id) });
  });

  router.post('/:table/batch/create', (req, res) => {
    const { table } = req.params;
    if (!ALLOWED.includes(table)) { res.json({ error: 'Invalid table' }); return; }
    const items: any[] = req.body.items || [];
    // Check table columns
    let hasCreatedAt = true, hasTimestamp = false;
    try {
      const tableInfo = db.query(`PRAGMA table_info(${table})`);
      const cols = tableInfo.map((c: any) => c.name);
      hasCreatedAt = cols.includes('createdAt');
      hasTimestamp = cols.includes('timestamp');
    } catch {}
    for (const item of items) {
      if (!item.id) item.id = `${table.slice(0,3)}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      if (hasCreatedAt && !item.createdAt) item.createdAt = new Date().toISOString();
      if (hasTimestamp && !item.timestamp) item.timestamp = new Date().toISOString();
      db.insert(table, item);
    }
    res.json({ success: true, count: items.length });
  });

  // ============ 审批流程 API ============
  router.get('/approval/pending', (req, res) => {
    const { approverId } = req.query;
    try {
      const pending = getPendingApprovals(approverId as string);
      res.json({ success: true, data: pending });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });
  
  router.post('/approval/create', (req, res) => {
    try {
      const request = createApprovalRequest(req.body);
      res.json({ success: true, data: request });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });
  
  router.post('/approval/process', (req, res) => {
    const { requestId, approverId, approverName, action, comment } = req.body;
    try {
      const result = processApproval(requestId, approverId, approverName, action, comment);
      res.json({ success: true, result });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });
  
  router.get('/approval/history/:requestId', (req, res) => {
    const { requestId } = req.params;
    try {
      const history = getApprovalHistory(requestId);
      res.json({ success: true, data: history });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });
  
  router.post('/approval/flow/create', (req, res) => {
    try {
      const flow = createApprovalFlow(req.body);
      res.json({ success: true, data: flow });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  return router;
}

function updateDailyReport(db: any, date: string, record: any) {
  try {
    // 查找该员工所在部门
    const emp = db.findById('employees', record.employeeId) as any;
    const department = emp?.department || '未知部门';
    
    // 查找或创建当日部门汇总记录
    const reportId = `dar_${department}_${date.replace(/-/g, '')}`;
    let report = db.findById('daily_attendance_reports', reportId) as any;
    
    if (!report) {
      report = {
        id: reportId,
        date,
        department,
        totalEmployees: 0,
        normalCount: 0,
        lateCount: 0,
        earlyLeaveCount: 0,
        absentCount: 0,
        leaveCount: 0,
        overtimeCount: 0,
        data: '{}',
        createdAt: new Date().toISOString()
      };
      db.insert('daily_attendance_reports', report);
    }
    
    // 更新统计
    if (record.status === '迟到' || record.status === '迟到早退') {
      db.update('daily_attendance_reports', reportId, {
        lateCount: (report.lateCount || 0) + 1
      });
    }
  } catch (e) {
    console.error('更新日考勤汇总失败:', e);
  }
}

function hashPwd(pwd: string): string {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    hash = ((hash << 5) - hash) + pwd.charCodeAt(i);
    hash = hash & hash;
  }
  return String(hash);
}

app.use('/api', apiRouter());

app.use(express.static(path.join(__dirname, '../dist/client')));

app.get('*', (_req, res) => {
  const indexPath = path.join(__dirname, '../dist/client/index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('<h1>飞达智能HR系统</h1><p>请先运行 npm run build 构建前端</p>');
  }
});

const PORT = Number(process.env.SERVER_PORT) || 3000;
const HOST = process.env.SERVER_HOST || 'localhost';

const server = http.createServer(app);
server.listen(PORT, HOST, () => {
  console.log(`[Bootstrap] Server running on http://${HOST}:${PORT}`);
  console.log(`[Bootstrap] API ready at http://${HOST}:${PORT}/api`);
});
