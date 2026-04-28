import { DatabaseService } from './modules/database/database.service';
import * as http from 'http';
import express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import multer from 'multer';
import {
  initWorkflowEngine,
  getWorkflowDefinitions,
  startWorkflow,
  processNodeAction,
  getWorkflowInstances,
  getPendingApprovalsForUser,
  getWorkflowHistory,
  getAllUsers,
  getRoles,
  createFormConfig,
  getFormConfigs,
  cancelWorkflow,
  addWorkflowComment,
  getWorkflowComments,
} from './workflow-engine';
import {
  generateDailyAttendanceReport,
  generateHistoricalReports,
} from './attendance-report-engine';
import {
  calculateSalary,
  batchCalculateSalary,
  validateFormula,
  getDefaultSalaryItems,
  calculateTax,
  calculateInsurance,
} from './salary-formula-engine';
import {
  batchGenerateSchedules,
  batchSwapSchedules,
  copySchedules,
  batchUpdateLeaveBalances,
  getEmployeeLeaveInfo,
  getAnnualLeaveRule,
  getShiftTypes,
  createShiftType,
  createDefaultShiftTypes,
} from './schedule-engine';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const app = express();
const db = new DatabaseService();
db.onModuleInit();

// 初始化增强版工作流引擎
initWorkflowEngine(db);

app.use(express.json());

const upload = multer({ dest: uploadDir });

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
    'attendance_devices','leave_rule_configs',
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
    'training_learning_progress','training_notifications',
    // 后勤模块
    'dormitories','dormitory_assignments','dormitory_bills','canteens','meal_records',
    'vehicles','vehicle_usage','visitors',
    // 综合事务模块
    'announcements','announcement_reads','surveys','survey_questions','survey_responses','survey_options',
    'documents','doc_folders','document_permissions','folder_permissions','file_storage',
    // 人才发展模块
    'assessment_tools','assessment_questions','assessment_results',
    'competency_items','competency_levels','competency_models','model_competencies',
    'talent_profiles','talent_reports',
    // 流程审批模块
    'approval_flows','approval_requests','approval_records','workflow_templates',
    'workflow_definitions','workflow_form_configs','workflow_instances',
    'workflow_instance_nodes','workflow_node_assignees','workflow_comments',
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

  // ============ 考勤设备管理 API ============

  // 获取所有设备（确保有默认设备数据）
  router.get('/attendance/devices', (req, res) => {
    try {
      let devices = db.findAll('attendance_devices') as any[];
      if (devices.length === 0) {
        // 初始化默认设备
        const defaultDevices = [
          { id: 'dev_zktime', name: '中控ZKTime考勤机', deviceType: 'zktime', status: 'unconfigured', config: JSON.stringify({ host: '', port: 4370, serialNumber: '' }), lastSyncAt: null, syncCount: 0, remark: '支持中控ZKTime SDK对接，需填写设备IP和端口', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 'dev_dingtalk', name: '钉钉打卡', deviceType: 'dingtalk', status: 'unconfigured', config: JSON.stringify({ appKey: '', appSecret: '', corpId: '' }), lastSyncAt: null, syncCount: 0, remark: '通过钉钉开放平台API获取员工打卡记录', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 'dev_wechat', name: '企业微信打卡', deviceType: 'wechat', status: 'unconfigured', config: JSON.stringify({ corpId: '', secret: '', agentId: '' }), lastSyncAt: null, syncCount: 0, remark: '通过企业微信接口API获取员工打卡记录', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 'dev_feishu', name: '飞书打卡', deviceType: 'feishu', status: 'unconfigured', config: JSON.stringify({ appId: '', appSecret: '' }), lastSyncAt: null, syncCount: 0, remark: '通过飞书开放平台API同步打卡数据', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 'dev_app', name: 'APP打卡（内置）', deviceType: 'app', status: 'active', config: JSON.stringify({ enabled: true, gpsRequired: false, wifiRequired: false, radiusMeters: 500 }), lastSyncAt: null, syncCount: 0, remark: '员工通过本系统APP进行GPS打卡', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ];
        for (const d of defaultDevices) db.insert('attendance_devices', d);
        devices = defaultDevices;
      }
      res.json(devices);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 保存设备配置
  router.put('/attendance/devices/:id', (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updateData: any = { ...body, updatedAt: new Date().toISOString() };
      if (body.config && typeof body.config === 'object') {
        updateData.config = JSON.stringify(body.config);
      }
      db.update('attendance_devices', id, updateData);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 测试设备连接
  router.post('/attendance/devices/:id/test', async (req, res) => {
    try {
      const { id } = req.params;
      const device = db.findById('attendance_devices', id) as any;
      if (!device) { res.json({ success: false, message: '设备不存在' }); return; }
      
      const cfg = typeof device.config === 'string' ? JSON.parse(device.config) : (device.config || {});
      
      if (device.deviceType === 'app') {
        res.json({ success: true, message: 'APP打卡内置已启用，无需额外配置' });
        return;
      }
      if (device.deviceType === 'zktime') {
        if (!cfg.host) { res.json({ success: false, message: '请先填写设备IP地址' }); return; }
        // ZKTime 通过 TCP 连接测试（这里做基础格式校验，实际需要SDK）
        const ipReg = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipReg.test(cfg.host)) { res.json({ success: false, message: 'IP地址格式不正确' }); return; }
        res.json({ success: true, message: `已保存中控设备地址 ${cfg.host}:${cfg.port || 4370}，请确保设备在局域网内可达` });
        return;
      }
      // 平台型设备走 integration_test 逻辑
      const platform = device.deviceType === 'wechat' ? 'wechat' : device.deviceType === 'dingtalk' ? 'dingtalk' : 'feishu';
      const testRes = await fetch(`http://localhost:${process.env.SERVER_PORT || 3000}/api/integration_test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, config: cfg }),
      });
      const result = await testRes.json() as any;
      if (result.success) {
        db.update('attendance_devices', id, { status: 'active', updatedAt: new Date().toISOString() });
      }
      res.json(result);
    } catch (e: any) {
      res.json({ success: false, message: `测试异常: ${e.message}` });
    }
  });

  // 从第三方平台同步打卡记录
  router.post('/attendance/devices/:id/sync', async (req, res) => {
    try {
      const { id } = req.params;
      const device = db.findById('attendance_devices', id) as any;
      if (!device) { res.json({ success: false, message: '设备不存在' }); return; }
      
      const cfg = typeof device.config === 'string' ? JSON.parse(device.config) : (device.config || {});
      const { startDate, endDate } = req.body;
      const syncStart = startDate || new Date().toISOString().slice(0, 10);
      const syncEnd = endDate || syncStart;
      
      let syncedCount = 0;
      let message = '';
      
      if (device.deviceType === 'app') {
        res.json({ success: true, syncedCount: 0, message: 'APP打卡数据实时写入，无需手动同步' });
        return;
      }

      if (device.deviceType === 'dingtalk') {
        if (!cfg.appKey || !cfg.appSecret) {
          res.json({ success: false, message: '请先配置钉钉 AppKey 和 AppSecret' }); return;
        }
        // 获取钉钉access_token
        const tokenResp = await fetch(`https://oapi.dingtalk.com/gettoken?appkey=${cfg.appKey}&appsecret=${cfg.appSecret}`);
        const tokenData = await tokenResp.json() as any;
        if (tokenData.errcode !== 0) {
          res.json({ success: false, message: `获取钉钉token失败: ${tokenData.errmsg}` }); return;
        }
        const accessToken = tokenData.access_token;
        // 获取员工列表
        const employees = db.findAll('employees') as any[];
        for (const emp of employees.slice(0, 50)) {
          if (!emp.dingUserId) continue;
          try {
            const recordResp = await fetch(`https://oapi.dingtalk.com/attendance/list?access_token=${accessToken}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ workDateFrom: syncStart + ' 00:00:00', workDateTo: syncEnd + ' 23:59:59', userIds: [emp.dingUserId], offset: 0, limit: 50 }),
            });
            const records = await recordResp.json() as any;
            if (records.recordresult) {
              for (const r of records.recordresult) {
                importAttendanceRecord(db, emp, r.checkTime?.slice(0, 10), r.checkTime?.slice(11, 19), r.userCheckTime?.slice(11, 19));
                syncedCount++;
              }
            }
          } catch { /* 单员工失败不影响整体 */ }
        }
        message = `钉钉同步完成，共导入 ${syncedCount} 条打卡记录`;
      } else if (device.deviceType === 'wechat') {
        if (!cfg.corpId || !cfg.secret) {
          res.json({ success: false, message: '请先配置企业微信 CorpID 和 Secret' }); return;
        }
        const tokenResp = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${cfg.corpId}&corpsecret=${cfg.secret}`);
        const tokenData = await tokenResp.json() as any;
        if (tokenData.errcode !== 0) {
          res.json({ success: false, message: `获取企业微信token失败: ${tokenData.errmsg}` }); return;
        }
        const accessToken = tokenData.access_token;
        const employees = db.findAll('employees') as any[];
        const userIds = employees.filter((e: any) => e.wxUserId).map((e: any) => e.wxUserId).slice(0, 100);
        if (userIds.length === 0) {
          res.json({ success: false, message: '员工信息中未配置企业微信 wxUserId，无法同步' }); return;
        }
        const startTs = Math.floor(new Date(syncStart + 'T00:00:00').getTime() / 1000);
        const endTs = Math.floor(new Date(syncEnd + 'T23:59:59').getTime() / 1000);
        const clockResp = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/checkin/getcheckindata?access_token=${accessToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opencheckindatatype: 3, starttime: startTs, endtime: endTs, useridlist: userIds }),
        });
        const clockData = await clockResp.json() as any;
        if (clockData.errcode !== 0) {
          res.json({ success: false, message: `企业微信打卡数据获取失败: ${clockData.errmsg}` }); return;
        }
        for (const record of (clockData.checkindata || [])) {
          const emp = employees.find((e: any) => e.wxUserId === record.userid);
          if (!emp) continue;
          const dt = new Date(record.checkin_time * 1000);
          const date = dt.toISOString().slice(0, 10);
          const time = dt.toTimeString().slice(0, 8);
          importAttendanceRecord(db, emp, date, time, null);
          syncedCount++;
        }
        message = `企业微信同步完成，共导入 ${syncedCount} 条打卡记录`;
      } else if (device.deviceType === 'feishu') {
        if (!cfg.appId || !cfg.appSecret) {
          res.json({ success: false, message: '请先配置飞书 App ID 和 App Secret' }); return;
        }
        const tokenResp = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app_id: cfg.appId, app_secret: cfg.appSecret }),
        });
        const tokenData = await tokenResp.json() as any;
        if (tokenData.code !== 0) {
          res.json({ success: false, message: `飞书token获取失败: ${tokenData.msg}` }); return;
        }
        // 飞书暂无公开免申请的打卡接口，需要企业自建应用权限
        res.json({ success: true, syncedCount: 0, message: '飞书打卡同步需要企业自建应用并申请"考勤数据读取"权限，请联系管理员配置' });
        return;
      } else if (device.deviceType === 'zktime') {
        if (!cfg.host) {
          res.json({ success: false, message: '请先配置中控设备IP地址' }); return;
        }
        res.json({ success: true, syncedCount: 0, message: `中控考勤机 ${cfg.host}:${cfg.port || 4370} 需要在服务器端安装 ZKTime SDK 后方可同步，请联系系统管理员` });
        return;
      }
      
      // 更新设备同步时间
      db.update('attendance_devices', id, {
        lastSyncAt: new Date().toISOString(),
        syncCount: (device.syncCount || 0) + syncedCount,
        status: 'active',
        updatedAt: new Date().toISOString(),
      });
      
      res.json({ success: true, syncedCount, message });
    } catch (e: any) {
      res.status(500).json({ success: false, message: `同步异常: ${e.message}` });
    }
  });

  // 批量手动导入打卡记录（CSV/JSON）
  router.post('/attendance/import', (req, res) => {
    try {
      const { records } = req.body; // [{employeeId, date, clockIn, clockOut}]
      if (!Array.isArray(records)) { res.json({ success: false, message: 'records 必须是数组' }); return; }
      let imported = 0;
      let skipped = 0;
      for (const r of records) {
        if (!r.employeeId || !r.date) { skipped++; continue; }
        const existing = db.findWhere('attendance_records', { employeeId: r.employeeId, date: r.date }) as any[];
        if (existing.length > 0) {
          // 更新已有记录
          const rec = existing[0];
          const updates: any = {};
          if (r.clockIn && !rec.clockIn) updates.clockIn = r.clockIn;
          if (r.clockOut && !rec.clockOut) updates.clockOut = r.clockOut;
          if (Object.keys(updates).length > 0) {
            db.update('attendance_records', rec.id, updates);
            imported++;
          } else skipped++;
        } else {
          const emp = db.findById('employees', r.employeeId) as any;
          db.insert('attendance_records', {
            id: `ar_${r.employeeId}_${r.date.replace(/-/g, '')}`,
            employeeId: r.employeeId,
            employeeName: emp?.name || r.employeeName || '',
            date: r.date,
            clockIn: r.clockIn || null,
            clockOut: r.clockOut || null,
            workHours: r.workHours || 0,
            status: r.status || '正常',
            remark: r.remark || '',
            createdAt: new Date().toISOString(),
          });
          imported++;
        }
      }
      res.json({ success: true, imported, skipped, total: records.length });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 年假余额 - JOIN 员工姓名（带部门、员工号）
  router.get('/attendance/leave-balances', (req, res) => {
    try {
      const { year, leaveType } = req.query;
      let sql = `
        SELECT lb.*, e.name as employeeName, e.department, e.employeeId as empNo
        FROM leave_balances lb
        LEFT JOIN employees e ON lb.employeeId = e.id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (year) { sql += ' AND lb.year = ?'; params.push(year); }
      if (leaveType) { sql += ' AND lb.leaveType = ?'; params.push(leaveType); }
      sql += ' ORDER BY lb.leaveType, e.department, e.name';
      const rows = db.query(sql, params) as any[];
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 年假规则 - 获取全局配置
  router.get('/attendance/leave-rules', (req, res) => {
    try {
      const rules = db.findAll('leave_rule_configs') as any[];
      if (rules.length === 0) {
        const defaultRule = { id: 'leave_rule_global', annualDays: 15, carryoverDays: 5, maxDays: 30, accrueMonth: 1, updatedAt: new Date().toISOString() };
        db.insert('leave_rule_configs', defaultRule);
        res.json(defaultRule);
      } else {
        res.json(rules[0]);
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 年假规则 - 保存全局配置
  router.put('/attendance/leave-rules', (req, res) => {
    try {
      const { annualDays, carryoverDays, maxDays, accrueMonth } = req.body;
      const existing = db.findAll('leave_rule_configs') as any[];
      const id = existing.length > 0 ? existing[0].id : 'leave_rule_global';
      const data = { annualDays, carryoverDays, maxDays, accrueMonth, updatedAt: new Date().toISOString() };
      if (existing.length > 0) {
        db.update('leave_rule_configs', id, data);
      } else {
        db.insert('leave_rule_configs', { id, ...data });
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // ============ 考勤日报自动化 API ============
  
  // 生成指定日期的考勤日报
  router.post('/attendance/daily-report', async (req, res) => {
    try {
      const { date, department } = req.body;
      if (!date) {
        res.status(400).json({ success: false, message: '请指定日期 (date)' });
        return;
      }
      const result = await generateDailyAttendanceReport(db, date, department);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 获取考勤日报列表
  router.get('/attendance/daily-reports', (req, res) => {
    try {
      const { startDate, endDate, department } = req.query;
      let sql = `SELECT * FROM daily_attendance_reports WHERE 1=1`;
      const params: any[] = [];
      if (startDate) { sql += ` AND date >= ?`; params.push(startDate); }
      if (endDate) { sql += ` AND date <= ?`; params.push(endDate); }
      if (department) { sql += ` AND department = ?`; params.push(department); }
      sql += ` ORDER BY date DESC, department`;
      const rows = db.query(sql, params) as any[];
      // 解析 data JSON 字段
      const reports = rows.map(r => ({
        ...r,
        details: r.data ? JSON.parse(r.data) : null,
      }));
      res.json(reports);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 获取指定日报详情
  router.get('/attendance/daily-report/:id', (req, res) => {
    try {
      const report = db.findById('daily_attendance_reports', req.params.id);
      if (!report) {
        res.status(404).json({ success: false, message: '日报不存在' });
        return;
      }
      const r = report as any;
      res.json({
        ...r,
        details: r.data ? JSON.parse(r.data) : null,
      });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 批量生成历史日报
  router.post('/attendance/daily-report/batch', async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      if (!startDate || !endDate) {
        res.status(400).json({ success: false, message: '请指定起始和结束日期' });
        return;
      }
      const result = await generateHistoricalReports(db, startDate, endDate);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 今日考勤概况（快速统计）
  router.get('/attendance/today-summary', async (req, res) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      // 先尝试获取已生成的日报
      let report = db.query(
        `SELECT * FROM daily_attendance_reports WHERE date = ? AND department = '全公司' LIMIT 1`,
        [today]
      ) as any[];
      
      if (report.length === 0) {
        // 没有日报，实时生成
        const result = await generateDailyAttendanceReport(db, today);
        res.json({
          date: today,
          generated: false,
          ...result,
        });
      } else {
        const r = report[0];
        res.json({
          date: today,
          generated: true,
          totalEmployees: r.totalEmployees,
          normalCount: r.normalCount,
          lateCount: r.lateCount,
          earlyLeaveCount: r.earlyLeaveCount,
          absentCount: r.absentCount,
          leaveCount: r.leaveCount,
          overtimeCount: r.overtimeCount,
          restDayCount: r.restDayCount,
          holidayCount: r.holidayCount,
        });
      }
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // ============ 薪资公式引擎 API ============

  // 计算单个员工薪资
  router.post('/salary/calculate', async (req, res) => {
    try {
      const { employeeId, month } = req.body;
      if (!employeeId || !month) {
        res.status(400).json({ success: false, message: '缺少员工ID或月份' });
        return;
      }
      const result = await calculateSalary(db, employeeId, month);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 批量计算薪资
  router.post('/salary/batch-calculate', async (req, res) => {
    try {
      const { month, employeeIds } = req.body;
      if (!month) {
        res.status(400).json({ success: false, message: '缺少月份参数' });
        return;
      }
      const result = await batchCalculateSalary(db, month, employeeIds);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 验证公式语法
  router.post('/salary/validate-formula', (req, res) => {
    try {
      const { formula } = req.body;
      const result = validateFormula(formula);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 获取默认薪资项配置
  router.get('/salary/default-items', (_req, res) => {
    res.json(getDefaultSalaryItems());
  });

  // 计算个税
  router.post('/salary/calculate-tax', (req, res) => {
    try {
      const { taxableIncome, socialSecurity, housingFund } = req.body;
      const tax = calculateTax(taxableIncome || 0, socialSecurity || 0, housingFund || 0);
      res.json({ success: true, tax });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 计算社保
  router.post('/salary/calculate-insurance', (req, res) => {
    try {
      const { baseSalary, city } = req.body;
      const result = calculateInsurance({ baseSalary: baseSalary || 0, city: city || '深圳' });
      res.json({ success: true, ...result });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 预览公式计算结果（使用测试数据）
  router.post('/salary/preview-formula', (req, res) => {
    try {
      const { formula, testData } = req.body;
      if (!formula) {
        res.status(400).json({ success: false, message: '缺少公式' });
        return;
      }
      const testContext = {
        employee: { id: 'test', name: '测试员工', department: '技术部' },
        month: testData?.month || '2024-01',
        baseSalary: testData?.baseSalary || 10000,
        positionSalary: testData?.positionSalary || 2000,
        performance: testData?.performance || 0,
        overtimeHours: testData?.overtimeHours || 0,
        lateCount: testData?.lateCount || 0,
        absentCount: testData?.absentCount || 0,
        leaveDays: testData?.leaveDays || 0,
      };
      const result = evaluateFormula(formula, testContext);
      res.json({ success: true, ...result });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 保存薪资项配置（支持公式）
  router.post('/salary/items', (req, res) => {
    try {
      const { id, name, code, type, formula, defaultValue, isTaxable, sortOrder, isActive } = req.body;
      
      // 验证公式
      if (formula) {
        const valid = validateFormula(formula);
        if (!valid.valid) {
          res.status(400).json({ success: false, message: `公式语法错误: ${valid.error}` });
          return;
        }
      }
      
      const item = {
        id: id || `si_${Date.now()}`,
        name,
        code,
        type: type || 'earnings',
        formula: formula || null,
        defaultValue: defaultValue || 0,
        isTaxable: isTaxable !== undefined ? isTaxable : 1,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : 1,
        createdAt: new Date().toISOString(),
      };
      
      db.insert('salary_items', item);
      res.json({ success: true, item });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 更新薪资项配置
  router.put('/salary/items/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // 验证公式
      if (updates.formula) {
        const valid = validateFormula(updates.formula);
        if (!valid.valid) {
          res.status(400).json({ success: false, message: `公式语法错误: ${valid.error}` });
          return;
        }
      }
      
      const existing = db.findById('salary_items', id);
      if (!existing) {
        res.status(404).json({ success: false, message: '薪资项不存在' });
        return;
      }
      
      db.update('salary_items', id, { ...updates, createdAt: undefined });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 生成薪资条记录
  router.post('/salary/generate', async (req, res) => {
    try {
      const { month, employeeId } = req.body;
      if (!month) {
        res.status(400).json({ success: false, message: '缺少月份' });
        return;
      }
      
      // 计算薪资
      let results: any[] = [];
      
      if (employeeId) {
        // 单个员工
        const result = await calculateSalary(db, employeeId, month);
        results.push(result);
      } else {
        // 全员
        const batchResult = await batchCalculateSalary(db, month);
        results = batchResult.results;
      }
      
      // 保存到数据库
      for (const r of results) {
        if (r.success) {
          const record = {
            id: `salary_${r.employeeId}_${month.replace('-', '')}`,
            employeeId: r.employeeId,
            employeeName: r.employeeName,
            month,
            ...r.items,
            grossSalary: r.grossSalary,
            netSalary: r.netSalary,
            tax: r.tax,
            companyTotal: Object.values(r.companyContributions).reduce((a: number, b: number) => a + b, 0) as number,
            status: 'draft',
            createdAt: new Date().toISOString(),
          };
          
          const existing = db.findById('salaries', record.id);
          if (existing) {
            db.update('salaries', record.id, record);
          } else {
            db.insert('salaries', record);
          }
        }
      }
      
      res.json({
        success: true,
        message: `成功生成 ${results.filter(r => r.success).length} 条薪资记录`,
        results,
      });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // ============ 批量排班与年假规则 API ============

  // 批量生成排班
  router.post('/schedule/batch-generate', async (req, res) => {
    try {
      const { employeeIds, startDate, endDate, shiftTypeId, shiftTypeName, pattern, restDays, overwrite } = req.body;
      if (!employeeIds || !startDate || !endDate || !shiftTypeId) {
        res.status(400).json({ success: false, message: '缺少必要参数' });
        return;
      }
      const result = await batchGenerateSchedules(db, {
        employeeIds, startDate, endDate, shiftTypeId,
        shiftTypeName: shiftTypeName || '标准班',
        pattern, restDays, overwrite,
      });
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 批量调班
  router.post('/schedule/batch-swap', async (req, res) => {
    try {
      const { swaps } = req.body;
      if (!swaps || !Array.isArray(swaps)) {
        res.status(400).json({ success: false, message: '缺少调班数据' });
        return;
      }
      const result = await batchSwapSchedules(db, swaps);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 复制排班
  router.post('/schedule/copy', async (req, res) => {
    try {
      const { sourceStartDate, sourceEndDate, targetStartDate, employeeIds } = req.body;
      if (!sourceStartDate || !sourceEndDate || !targetStartDate) {
        res.status(400).json({ success: false, message: '缺少日期参数' });
        return;
      }
      const result = await copySchedules(db, sourceStartDate, sourceEndDate, targetStartDate, employeeIds);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 获取班次列表
  router.get('/shift-types', (_req, res) => {
    try {
      let shifts = getShiftTypes(db);
      if (shifts.length === 0) {
        createDefaultShiftTypes(db);
        shifts = getShiftTypes(db);
      }
      res.json(shifts);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 创建班次
  router.post('/shift-types', (req, res) => {
    try {
      const result = createShiftType(db, req.body);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 获取年假规则配置
  router.get('/leave/annual-rules', (_req, res) => {
    try {
      const rule = getAnnualLeaveRule(db);
      res.json(rule);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 批量更新年假余额
  router.post('/leave/batch-accrual', async (req, res) => {
    try {
      const { year, employeeIds } = req.body;
      const targetYear = year || new Date().getFullYear().toString();
      const result = await batchUpdateLeaveBalances(db, targetYear, employeeIds);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 获取员工年假信息
  router.get('/leave/employee-info/:employeeId', async (req, res) => {
    try {
      const { employeeId } = req.params;
      const year = req.query.year || new Date().getFullYear().toString();
      const info = await getEmployeeLeaveInfo(db, employeeId, year as string);
      res.json(info);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 获取员工年假余额列表
  router.get('/leave/balances', (req, res) => {
    try {
      const { year, employeeId, leaveType } = req.query;
      let sql = `SELECT lb.*, e.name as employeeName, e.department 
                 FROM leave_balances lb
                 LEFT JOIN employees e ON lb.employeeId = e.id
                 WHERE 1=1`;
      const params: any[] = [];
      if (year) { sql += ` AND lb.year = ?`; params.push(year); }
      if (employeeId) { sql += ` AND lb.employeeId = ?`; params.push(employeeId); }
      if (leaveType) { sql += ` AND lb.leaveType = ?`; params.push(leaveType); }
      sql += ` ORDER BY lb.year DESC, lb.leaveType, e.department`;
      const rows = db.query(sql, params);
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
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

  // ============ 第三方平台连接测试 ============
  router.post('/integration_test', async (req, res) => {
    const { platform, config } = req.body || {};
    try {
      if (platform === 'wechat') {
        if (!config.corpId || !config.secret) {
          return res.json({ success: false, message: '缺少 CorpID 或 Secret' });
        }
        // 尝试获取企业微信 access_token
        const tokenUrl = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${encodeURIComponent(config.corpId)}&corpsecret=${encodeURIComponent(config.secret)}`;
        const resp = await fetch(tokenUrl);
        const data = await resp.json() as any;
        if (data.errcode === 0) {
          res.json({ success: true, message: `连接成功，企业名称: ${data.corpname || '未获取'}` });
        } else {
          res.json({ success: false, message: `企业微信返回错误: ${data.errmsg} (errcode: ${data.errcode})` });
        }
      } else if (platform === 'dingtalk') {
        if (!config.appKey || !config.appSecret) {
          return res.json({ success: false, message: '缺少 AppKey 或 AppSecret' });
        }
        // 尝试获取钉钉 access_token
        const tokenUrl = 'https://oapi.dingtalk.com/gettoken';
        const resp = await fetch(`${tokenUrl}?appkey=${encodeURIComponent(config.appKey)}&appsecret=${encodeURIComponent(config.appSecret)}`);
        const data = await resp.json() as any;
        if (data.errcode === 0) {
          res.json({ success: true, message: '连接成功，已获取 access_token' });
        } else {
          res.json({ success: false, message: `钉钉返回错误: ${data.errmsg} (errcode: ${data.errcode})` });
        }
      } else if (platform === 'feishu') {
        if (!config.appId || !config.appSecret) {
          return res.json({ success: false, message: '缺少 App ID 或 App Secret' });
        }
        // 尝试获取飞书 tenant_access_token
        const tokenUrl = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';
        const resp = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app_id: config.appId, app_secret: config.appSecret }),
        });
        const data = await resp.json() as any;
        if (data.code === 0) {
          res.json({ success: true, message: '连接成功，已获取 tenant_access_token' });
        } else {
          res.json({ success: false, message: `飞书返回错误: ${data.msg} (code: ${data.code})` });
        }
      } else {
        res.json({ success: false, message: `不支持的平台: ${platform}` });
      }
    } catch (e: any) {
      res.json({ success: false, message: `连接异常: ${e.message}` });
    }
  });

  // ============ 综合事务特殊路由 ============

  // GET /announcements/mine - my announcements with read status
  router.get('/announcements/mine', (req, res) => {
    try {
      const { employeeId } = req.query as any;
      const raw = (db as any).db.prepare('SELECT * FROM announcements WHERE status = ? ORDER BY isTop DESC, isPinned DESC, createdAt DESC').all('published') as any[];
      const readIds = employeeId
        ? ((db as any).db.prepare('SELECT announcementId FROM announcement_reads WHERE employeeId = ?').all(employeeId) as any[]).map((r: any) => r.announcementId)
        : [];
      res.json(raw.map((a: any) => ({ ...a, isRead: readIds.includes(a.id) })));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // POST /announcements/:id/read - mark as read
  router.post('/announcements/:id/read', (req, res) => {
    try {
      const id = req.params.id;
      const { employeeId, employeeName } = req.body;
      const existing = (db as any).db.prepare('SELECT * FROM announcement_reads WHERE announcementId = ? AND employeeId = ?').get(id, employeeId);
      if (!existing) {
        (db as any).db.prepare('INSERT INTO announcement_reads (id, announcementId, userId, employeeId, employeeName, readAt) VALUES (?, ?, ?, ?, ?, ?)').run('read_' + Date.now(), id, employeeId, employeeId, employeeName || '', new Date().toISOString());
        (db as any).db.prepare('UPDATE announcements SET readCount = readCount + 1 WHERE id = ?').run(id);
      }
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /surveys/:id/stats - survey statistics
  router.get('/surveys/:id/stats', (req, res) => {
    try {
      const id = req.params.id;
      const survey = (db as any).db.prepare('SELECT * FROM surveys WHERE id = ?').get(id) as any;
      if (!survey) { res.status(404).json({ error: 'Survey not found' }); return; }
      const options = (db as any).db.prepare('SELECT * FROM survey_options WHERE surveyId = ? ORDER BY optionOrder').all(id) as any[];
      const responses = (db as any).db.prepare('SELECT * FROM survey_responses WHERE surveyId = ?').all(id) as any[];
      res.json({ survey, options, responseCount: responses.length, responses });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // POST /surveys/:id/vote - submit vote
  router.post('/surveys/:id/vote', (req, res) => {
    try {
      const id = req.params.id;
      const { userId, employeeName, answers } = req.body;
      const survey = (db as any).db.prepare('SELECT * FROM surveys WHERE id = ?').get(id) as any;
      if (!survey) { res.status(404).json({ error: 'Survey not found' }); return; }
      const existing = (db as any).db.prepare('SELECT * FROM survey_responses WHERE surveyId = ? AND userId = ?').get(id, userId);
      if (existing) {
        (db as any).db.prepare('UPDATE survey_responses SET answers = ?, employeeName = ? WHERE surveyId = ? AND userId = ?').run(JSON.stringify(answers || []), employeeName || '', id, userId);
      } else {
        (db as any).db.prepare('INSERT INTO survey_responses (id, surveyId, userId, answers, employeeName) VALUES (?, ?, ?, ?, ?)').run('resp_' + Date.now(), id, userId, JSON.stringify(answers || []), employeeName || '');
        (db as any).db.prepare('UPDATE surveys SET responseCount = responseCount + 1 WHERE id = ?').run(id);
      }
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /surveys/list - list all surveys
  router.get('/surveys/list', (req, res) => {
    try {
      let rows = (db as any).db.prepare('SELECT * FROM surveys ORDER BY createdAt DESC').all();
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /documents/list - list all documents
  router.get('/documents/list', (req, res) => {
    try {
      let rows = (db as any).db.prepare('SELECT * FROM documents ORDER BY createdAt DESC').all();
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============ 文件上传和权限管理 API ============

  // 文件上传
  router.post('/documents/upload', upload.single('file'), (req: any, res: any) => {
    try {
      const file = req.file;
      if (!file) { res.status(400).json({ error: 'No file uploaded' }); return; }
      
      const { folderId, accessLevel, uploaderId, uploaderName } = req.body;
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const ext = path.extname(originalName).toLowerCase();
      
      const docId = 'doc_' + Date.now();
      const doc = {
        id: docId,
        name: originalName.replace(ext, ''),
        folderId: folderId || null,
        type: ext.replace('.', ''),
        size: file.size,
        mimeType: file.mimetype,
        url: `/api/documents/download/${docId}`,
        accessLevel: accessLevel || 'all',
        uploaderId: uploaderId || '',
        uploaderName: uploaderName || '',
        downloads: 0,
        createdAt: new Date().toISOString()
      };
      
      (db as any).db.prepare(`INSERT INTO documents (id, name, folderId, type, size, mimeType, url, accessLevel, uploaderId, uploaderName, downloads, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(doc.id, doc.name, doc.folderId, doc.type, doc.size, doc.mimeType, doc.url, doc.accessLevel, doc.uploaderId, doc.uploaderName, doc.downloads, doc.createdAt);
      
      // 存储文件信息
      const fileRecord = {
        id: 'fs_' + Date.now(),
        documentId: docId,
        originalName,
        storedName: file.filename,
        filePath: file.path,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: uploaderId,
        uploadedAt: new Date().toISOString()
      };
      (db as any).db.prepare(`INSERT INTO file_storage (id, documentId, originalName, storedName, filePath, mimeType, size, uploadedBy, uploadedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(fileRecord.id, fileRecord.documentId, fileRecord.originalName, fileRecord.storedName, fileRecord.filePath, fileRecord.mimeType, fileRecord.size, fileRecord.uploadedBy, fileRecord.uploadedAt);
      
      res.json({ success: true, document: doc });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 文件下载
  router.get('/documents/download/:id', (req: any, res: any) => {
    try {
      const docId = req.params.id;
      const userId = req.query.userId as string;
      
      const fileRecord = (db as any).db.prepare('SELECT * FROM file_storage WHERE documentId = ?').get(docId) as any;
      if (!fileRecord) { res.status(404).json({ error: 'File not found' }); return; }
      
      // 更新下载计数
      (db as any).db.prepare('UPDATE documents SET downloads = downloads + 1 WHERE id = ?').run(docId);
      
      res.download(fileRecord.filePath, fileRecord.originalName);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 获取用户可访问的文档列表
  router.get('/documents/accessible', (req: any, res: any) => {
    try {
      const { folderId } = req.query;
      let docs = (db as any).db.prepare('SELECT * FROM documents WHERE folderId = ? ORDER BY createdAt DESC').all(folderId || null) as any[];
      res.json(docs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 设置文档权限
  router.post('/documents/:id/permissions', (req: any, res: any) => {
    try {
      const docId = req.params.id;
      const { permissions, grantedBy } = req.body;
      
      (db as any).db.prepare('DELETE FROM document_permissions WHERE documentId = ?').run(docId);
      
      const stmt = (db as any).db.prepare('INSERT INTO document_permissions (id, documentId, targetType, targetId, permission, grantedBy, grantedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
      for (const p of permissions) {
        stmt.run('perm_' + Date.now() + '_' + Math.random().toString(36).slice(2), docId, p.targetType, p.targetId || '', p.permission, grantedBy, new Date().toISOString());
      }
      
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 获取文档权限列表
  router.get('/documents/:id/permissions', (req: any, res: any) => {
    try {
      const docId = req.params.id;
      const perms = (db as any).db.prepare('SELECT * FROM document_permissions WHERE documentId = ?').all(docId);
      res.json(perms);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 设置文件夹权限
  router.post('/folders/:id/permissions', (req: any, res: any) => {
    try {
      const folderId = req.params.id;
      const { permissions, grantedBy } = req.body;
      
      (db as any).db.prepare('DELETE FROM folder_permissions WHERE folderId = ?').run(folderId);
      
      const stmt = (db as any).db.prepare('INSERT INTO folder_permissions (id, folderId, targetType, targetId, permission, inherited, grantedBy, grantedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      for (const p of permissions) {
        stmt.run('fperm_' + Date.now() + '_' + Math.random().toString(36).slice(2), folderId, p.targetType, p.targetId || '', p.permission, 0, grantedBy, new Date().toISOString());
      }
      
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 获取所有用户（用于权限设置）
  router.get('/users/all', (req: any, res: any) => {
    try {
      const users = (db as any).db.prepare('SELECT id, username, realName, userType FROM users WHERE status = ?').all('active');
      res.json(users);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 获取所有角色
  router.get('/roles/all', (req: any, res: any) => {
    try {
      const roles = (db as any).db.prepare('SELECT id, name, code FROM roles WHERE isActive = 1').all();
      res.json(roles);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 获取所有部门
  router.get('/departments/all', (req: any, res: any) => {
    try {
      const depts = (db as any).db.prepare('SELECT id, name, parentId FROM departments').all();
      res.json(depts);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ============ 排班查询（带分页，无日期时默认最近30天） ============
  router.get('/schedules', (req, res) => {
    try {
      const { date, employeeId, department, startDate, endDate } = req.query as any;
      const params: any[] = [];
      let whereParts: string[] = [];
      if (date) { whereParts.push('date = ?'); params.push(date); }
      if (employeeId) { whereParts.push('employeeId = ?'); params.push(employeeId); }
      if (department) { whereParts.push('department = ?'); params.push(department); }
      if (startDate) { whereParts.push('date >= ?'); params.push(startDate); }
      if (endDate)   { whereParts.push('date <= ?'); params.push(endDate); }
      // 未指定日期范围时，默认最近30天
      if (!date && !startDate && !endDate) {
        const from = new Date(); from.setDate(from.getDate() - 14);
        const to   = new Date(); to.setDate(to.getDate() + 16);
        whereParts.push('date >= ?'); params.push(from.toISOString().slice(0, 10));
        whereParts.push('date <= ?'); params.push(to.toISOString().slice(0, 10));
      }
      const where = whereParts.length ? 'WHERE ' + whereParts.join(' AND ') : '';
      const rows = db.query(`SELECT * FROM schedules ${where} ORDER BY date DESC, department, employeeName LIMIT 500`, params);
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
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

  // ============ 增强版工作流引擎 API (v2.0) ============

  // 获取工作流定义列表
  router.get('/workflows', (req, res) => {
    try {
      const { status } = req.query as any;
      const defs = getWorkflowDefinitions({ status });
      res.json({ success: true, data: defs });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取单个工作流定义（含节点和连线）
  router.get('/workflows/:id', (req, res) => {
    try {
      const defs = getWorkflowDefinitions();
      const def = defs.find((d: any) => d.id === req.params.id);
      if (!def) { res.json({ success: false, message: '未找到' }); return; }
      res.json({ success: true, data: def });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取工作流实例列表
  router.get('/workflow/instances', (req, res) => {
    try {
      const { applicantId, assigneeId, status, businessType } = req.query as any;
      const instances = getWorkflowInstances({ applicantId, status, businessType });
      res.json({ success: true, data: instances });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 启动工作流
  router.post('/workflow/start', (req, res) => {
    try {
      const instance = startWorkflow(req.body);
      res.json({ success: true, data: instance });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取待审批列表（新版）
  router.get('/workflow/pending', (req, res) => {
    try {
      const { userId } = req.query;
      const rows = getPendingApprovalsForUser(userId as string || '');
      res.json({ success: true, data: rows });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 处理节点审批
  router.post('/workflow/process', (req, res) => {
    try {
      const result = processNodeAction(req.body);
      res.json({ success: true, result });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取流程历史
  router.get('/workflow/history/:instanceId', (req, res) => {
    try {
      const history = getWorkflowHistory(req.params.instanceId);
      res.json({ success: true, data: history });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 撤回流程
  router.post('/workflow/cancel/:instanceId', (req, res) => {
    try {
      const { userId } = req.body;
      const result = cancelWorkflow(req.params.instanceId, userId);
      res.json(result);
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 添加审批意见
  router.post('/workflow/comments', (req, res) => {
    try {
      const { instanceId, userId, userName, content, nodeId } = req.body;
      const result = addWorkflowComment(instanceId, userId, userName, content, nodeId);
      res.json(result);
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取审批意见
  router.get('/workflow/comments/:instanceId', (req, res) => {
    try {
      const comments = getWorkflowComments(req.params.instanceId);
      res.json({ success: true, data: comments });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取所有用户（用于审批人选择）
  router.get('/workflow/users', (req, res) => {
    try {
      res.json({ success: true, data: getAllUsers() });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取角色列表
  router.get('/workflow/roles', (req, res) => {
    try {
      res.json({ success: true, data: getRoles() });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 表单配置 CRUD
  router.get('/workflow/forms', (req, res) => {
    try {
      const { module } = req.query as any;
      res.json({ success: true, data: getFormConfigs(module) });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  router.post('/workflow/forms', (req, res) => {
    try {
      const form = createFormConfig(req.body);
      res.json({ success: true, data: form });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // ============ 培训学习进度 API（视频断点） ============

  // 获取员工学习进度列表
  router.get('/training/progress/:employeeId', (req, res) => {
    try {
      const { employeeId } = req.params;
      const { courseId, status } = req.query as any;
      let progress = (db as any).db.prepare(
        'SELECT * FROM training_learning_progress WHERE employeeId = ? ORDER BY lastAccessAt DESC'
      ).all(employeeId) as any[];
      
      if (courseId) progress = progress.filter(p => p.courseId === courseId);
      if (status) progress = progress.filter(p => p.status === status);
      
      res.json({ success: true, data: progress });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 保存视频播放位置（断点续看）
  router.post('/training/progress/video-position', (req, res) => {
    try {
      const { employeeId, employeeName, courseId, courseName, position, duration } = req.body;
      const now = new Date().toISOString();
      
      // 查找或创建学习记录
      const existing = (db as any).db.prepare(
        'SELECT * FROM training_learning_progress WHERE employeeId = ? AND courseId = ?'
      ).get(employeeId, courseId) as any;
      
      const progressPercent = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;
      const newStatus = progressPercent >= 95 ? 'completed' : progressPercent > 0 ? 'in_progress' : 'not_started';
      
      if (existing) {
        // 更新进度
        (db as any).db.prepare(`
          UPDATE training_learning_progress SET 
            videoPosition = ?, videoDuration = ?, progressPercent = ?,
            lastPosition = ?, status = ?,
            totalWatchTime = totalWatchTime + ?,
            watchCount = watchCount + 1,
            lastAccessAt = ?, updatedAt = ?
          WHERE employeeId = ? AND courseId = ?
        `).run(
          position, duration, progressPercent, position, newStatus,
          existing.lastPosition ? Math.max(0, position - existing.lastPosition) : 0,
          now, now, employeeId, courseId
        );
      } else {
        // 创建新记录
        (db as any).db.prepare(`
          INSERT INTO training_learning_progress (
            id, employeeId, employeeName, courseId, courseName,
            videoPosition, videoDuration, progressPercent, lastPosition,
            status, totalWatchTime, watchCount,
            firstAccessAt, lastAccessAt, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          `lp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          employeeId, employeeName || '', courseId, courseName || '',
          position, duration, progressPercent, position,
          newStatus, 0, 1, now, now, now, now
        );
      }
      
      res.json({ success: true, data: { position, progressPercent, status: newStatus } });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取课程学习进度（员工端使用）
  router.get('/training/progress/video/:courseId', (req, res) => {
    try {
      const { courseId } = req.params;
      const { employeeId } = req.query as any;
      
      if (!employeeId) { res.json({ success: false, message: '缺少员工ID' }); return; }
      
      const progress = (db as any).db.prepare(
        'SELECT * FROM training_learning_progress WHERE employeeId = ? AND courseId = ?'
      ).get(employeeId, courseId);
      
      res.json({ success: true, data: progress || { videoPosition: 0, progressPercent: 0, status: 'not_started' } });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // ============ 培训推送通知 API ============

  // 获取员工的通知列表
  router.get('/training/notifications/:employeeId', (req, res) => {
    try {
      const { employeeId } = req.params;
      const { isRead, type } = req.query as any;
      
      let sql = 'SELECT * FROM training_notifications WHERE employeeId = ?';
      const params: any[] = [employeeId];
      
      if (isRead !== undefined) {
        sql += ' AND isRead = ?';
        params.push(isRead === 'true' || isRead === '1' ? 1 : 0);
      }
      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }
      
      sql += ' ORDER BY createdAt DESC';
      
      const notifications = (db as any).db.prepare(sql).all(...params);
      res.json({ success: true, data: notifications });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 推送培训给员工（管理员操作）
  router.post('/training/push', (req, res) => {
    try {
      const { planId, planTitle, courseId, courseName, employeeIds, deadline, content } = req.body;
      const now = new Date().toISOString();
      const results: string[] = [];
      
      for (const empId of employeeIds) {
        const emp = (db as any).db.prepare('SELECT * FROM employees WHERE id = ?').get(empId) as any;
        if (!emp) continue;
        
        // 检查是否已推送
        const existing = (db as any).db.prepare(
          'SELECT * FROM training_notifications WHERE employeeId = ? AND planId = ? AND type = ?'
        ).get(empId, planId, 'training_assign');
        
        if (existing) {
          // 更新现有通知
          (db as any).db.prepare(`
            UPDATE training_notifications SET 
              title = ?, content = ?, deadline = ?, pushStatus = 'pending',
              isRead = 0, readAt = NULL, updatedAt = ?
            WHERE employeeId = ? AND planId = ? AND type = ?
          `).run(planTitle || content || '培训通知', content || '', deadline || '', now, empId, planId, 'training_assign');
        } else {
          // 创建新通知
          (db as any).db.prepare(`
            INSERT INTO training_notifications (
              id, employeeId, employeeName, planId, planTitle, courseId, courseName,
              type, title, content, priority, isRead, pushChannel, pushStatus, deadline, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            `tn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            empId, emp.name || '', planId, planTitle || '', courseId || '', courseName || '',
            'training_assign', planTitle || content || '培训通知', 
            content || '您有一条新的培训任务，请及时完成学习。',
            deadline ? 'high' : 'normal', 0, 'self_service', 'sent', deadline || '', now
          );
        }
        results.push(emp.name || empId);
      }
      
      res.json({ success: true, message: `已推送培训给 ${results.length} 位员工`, data: results });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 标记通知已读
  router.post('/training/notifications/:id/read', (req, res) => {
    try {
      const { id } = req.params;
      const now = new Date().toISOString();
      
      (db as any).db.prepare(
        'UPDATE training_notifications SET isRead = 1, readAt = ?, pushStatus = "read" WHERE id = ?'
      ).run(now, id);
      
      res.json({ success: true });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 批量推送培训给部门员工
  router.post('/training/push/department', (req, res) => {
    try {
      const { planId, planTitle, courseId, courseName, departmentId, deadline, content } = req.body;
      const now = new Date().toISOString();
      
      // 获取部门下所有员工
      const employees = (db as any).db.prepare(
        'SELECT * FROM employees WHERE department = (SELECT name FROM departments WHERE id = ?) AND status = ?'
      ).all(departmentId, 'active') as any[];
      
      let pushed = 0;
      for (const emp of employees) {
        (db as any).db.prepare(`
          INSERT OR REPLACE INTO training_notifications (
            id, employeeId, employeeName, planId, planTitle, courseId, courseName,
            type, title, content, priority, isRead, pushChannel, pushStatus, deadline, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          `tn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          emp.id, emp.name, planId, planTitle || '', courseId || '', courseName || '',
          'training_assign', planTitle || content || '培训通知',
          content || '您有一条新的培训任务，请及时完成学习。',
          deadline ? 'high' : 'normal', 0, 'self_service', 'sent', deadline || '', now
        );
        pushed++;
      }
      
      res.json({ success: true, message: `已推送培训给部门 ${pushed} 位员工` });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  return router;
}

// 辅助：从外部设备同步打卡记录（上班打卡时调用）
function importAttendanceRecord(db: any, emp: any, date: string, clockInTime: string, clockOutTime: string | null) {
  if (!date || !emp?.id) return;
  const existing = db.findWhere('attendance_records', { employeeId: emp.id, date }) as any[];
  const schedule = db.findWhere('schedules', { employeeId: emp.id, date }) as any[];
  const shift = schedule[0];
  const scheduledStart = shift?.scheduledStart || '09:00';
  const scheduledEnd = shift?.scheduledEnd || '18:00';
  
  if (existing.length > 0) {
    const rec = existing[0];
    const updates: any = {};
    if (clockInTime && !rec.clockIn) updates.clockIn = clockInTime;
    if (clockOutTime && !rec.clockOut) updates.clockOut = clockOutTime;
    if (Object.keys(updates).length > 0) db.update('attendance_records', rec.id, updates);
    return;
  }
  
  let lateMinutes = 0;
  let status = '正常';
  if (clockInTime) {
    const [sh, sm] = scheduledStart.split(':').map(Number);
    const [ch, cm] = clockInTime.slice(0, 5).split(':').map(Number);
    lateMinutes = Math.max(0, (ch * 60 + cm) - (sh * 60 + sm));
    if (lateMinutes > 0) status = '迟到';
  }
  
  db.insert('attendance_records', {
    id: `ar_${emp.id}_${date.replace(/-/g, '')}`,
    employeeId: emp.id,
    employeeName: emp.name || '',
    date,
    shiftTypeId: shift?.shiftTypeId || '',
    shiftTypeName: shift?.shiftTypeName || '标准班',
    scheduledStart,
    scheduledEnd,
    clockIn: clockInTime || null,
    clockOut: clockOutTime || null,
    workHours: 0,
    lateMinutes,
    earlyLeaveMinutes: 0,
    status,
    lateCount: lateMinutes > 0 ? 1 : 0,
    isRestDay: 0,
    isHoliday: 0,
    remark: '设备同步',
    createdAt: new Date().toISOString(),
  });
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
