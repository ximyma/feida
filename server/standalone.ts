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
  getPendingApprovals,
  createApprovalRequest,
  processApproval,
  getApprovalHistory,
  createApprovalFlow,
} from './approval-engine';
import {
  calculateSalary,
  batchCalculateSalary,
  validateFormula,
  evaluateFormula,
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

  // 初始化AI服务（传入数据库引用）
  const aiService = require('./ai-service.js');
  aiService.setDb(db);

  // CMS & Shop 种子数据
  const seedCmsShop = require('./seed-cms-shop');
  seedCmsShop.default(db);

  // AI知识库表和默认数据延迟初始化（在首次API调用时创建）

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
    'training_categories','training_courses_v2','training_chapters',
    'training_reviews','training_review_replies','training_notes',
    'training_live_sessions','training_live_messages','training_live_attendances',
    'training_live_reservations','training_learning_paths','training_path_courses',
    // 后勤模块
    'dormitories','dormitory_assignments','dormitory_bills','canteens','meal_records','meal_menus','meal_orders',
    'vehicles','vehicle_usage','visitors',
    // 综合事务模块
    'announcements','announcement_reads','surveys','survey_questions','survey_responses','survey_options',
    'documents','document_folders','document_permissions','folder_permissions','file_storage',
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
    'system_config','audit_logs','login_logs','data_backups','scheduled_tasks',
    // 产品基础档案模块
    'colors','sizes','size_groups','size_group_items',
    'product_categories','product_styles','product_style_colors',
    'product_style_size_configs','box_types','product_skus',
    'coding_rules','size_ratios',
    // 工艺管理/PLM模块
    'material_attributes','materials','processes',
    'process_routes','process_route_items','components',
    'boms','bom_items','scrap_rules','soles','season_materials',
    // 网站互动
    'site_messages'
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
      res.json(result);
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
            companyTotal: (Object.values(r.companyContributions) as number[]).reduce((a, b) => a + b, 0),
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
      const raw = (db as any).db.prepare('SELECT * FROM announcements ORDER BY createdAt DESC').all() as any[];
      res.json(raw);
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

  // ============ 通用文件上传 API ============
  // ---------- 通用上传(支持水印) ----------
  router.post('/upload', upload.single('file'), async (req: any, res: any) => {
    const file = req.file;
    if (!file) { res.status(400).json({ error: 'No file' }); return; }
    const ext = path.extname(file.originalname).toLowerCase();
    const newName = `img_${Date.now()}${ext}`;
    const destPath = path.join(uploadDir, newName);
    fs.renameSync(file.path, destPath);

    // 图片水印：query参数 wt=水印文字 或 wpos=southeast
    const wt = req.query.wt as string;
    if (wt && ['.jpg','.jpeg','.png','.webp'].includes(ext)) {
      try {
        const sharp = require('sharp');
        const metadata = await sharp(destPath).metadata();
        const svgWatermark = Buffer.from(
          `<svg width="${metadata.width}" height="60"><rect x="0" y="0" width="${metadata.width}" height="60" fill="rgba(0,0,0,0.3)"/><text x="${metadata.width!-20}" y="40" text-anchor="end" font-size="28" fill="rgba(255,255,255,0.7)" font-family="Arial">${wt}</text></svg>`
        );
        const watermarked = await sharp(destPath)
          .composite([{ input: svgWatermark, gravity: (req.query.wpos as string) || 'southeast' }])
          .toBuffer();
        fs.writeFileSync(destPath, watermarked);
      } catch (e) {
        // sharp not available, skip watermark silently
      }
    }

    res.json({ success: true, url: `/uploads/${newName}`, filename: newName });
  });

  // 图片裁剪：上传原图 + 裁剪区域(x,y,width,height 像素)，sharp 提取区域后保存
  // 也支持 source 参数直接引用已上传文件(如 /uploads/xxx.png)，无需重新上传
  const croppedDir = path.join(uploadDir, 'cropped');
  if (!fs.existsSync(croppedDir)) fs.mkdirSync(croppedDir, { recursive: true });
  router.post('/image/crop', upload.single('file'), async (req: any, res: any) => {
    let srcPath: string | null = null;
    let isTemp = false;
    if (req.file) { srcPath = req.file.path; isTemp = true; }
    else if (req.body.source) {
      const rel = String(req.body.source).replace(/^\/+/, '');
      const p = path.join(process.cwd(), rel);
      if (fs.existsSync(p)) srcPath = p;
    }
    if (!srcPath) { res.status(400).json({ error: 'No source image' }); return; }
    const ext = path.extname(srcPath).toLowerCase() || '.png';
    const x = parseInt(req.body.x || '0', 10);
    const y = parseInt(req.body.y || '0', 10);
    const w = parseInt(req.body.width || '0', 10);
    const h = parseInt(req.body.height || '0', 10);
    if (!w || !h) { res.status(400).json({ error: 'width/height required' }); return; }
    const newName = `crop_${Date.now()}${ext}`;
    const destPath = path.join(croppedDir, newName);
    try {
      const sharp = require('sharp');
      const meta = await sharp(srcPath).metadata();
      const safeX = Math.max(0, Math.min(x, (meta.width || 0) - 1));
      const safeY = Math.max(0, Math.min(y, (meta.height || 0) - 1));
      const safeW = Math.max(1, Math.min(w, (meta.width || 0) - safeX));
      const safeH = Math.max(1, Math.min(h, (meta.height || 0) - safeY));
      await sharp(srcPath)
        .extract({ left: safeX, top: safeY, width: safeW, height: safeH })
        .toFile(destPath);
      if (isTemp) fs.unlinkSync(srcPath); // 仅删除临时上传
      res.json({ success: true, url: `/uploads/cropped/${newName}`, filename: newName, width: safeW, height: safeH });
    } catch (e: any) {
      res.status(500).json({ error: 'crop failed: ' + e.message });
    }
  });

  // 多文件上传
  router.post('/upload-multi', upload.array('files', 20), async (req: any, res: any) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) { res.status(400).json({ error: 'No files' }); return; }
    const results = [];
    for (const file of files) {
      const ext = path.extname(file.originalname);
      const newName = `img_${Date.now()}_${Math.random().toString(36).slice(2,6)}${ext}`;
      const destPath = path.join(uploadDir, newName);
      fs.renameSync(file.path, destPath);
      results.push({ url: `/uploads/${newName}`, filename: newName });
    }
    res.json({ success: true, files: results });
  });

  // 视频上传
  router.post('/upload-video', upload.single('file'), (req: any, res: any) => {
    const file = req.file;
    if (!file) { res.status(400).json({ error: 'No file' }); return; }
    const newName = `video_${Date.now()}${path.extname(file.originalname)}`;
    const destPath = path.join(uploadDir, newName);
    fs.renameSync(file.path, destPath);
    res.json({ success: true, url: `/uploads/${newName}`, filename: newName });
  });

  // 文件附件上传
  router.post('/upload-file', upload.single('file'), (req: any, res: any) => {
    const file = req.file;
    if (!file) { res.status(400).json({ error: 'No file' }); return; }
    const newName = `file_${Date.now()}${path.extname(file.originalname)}`;
    const destPath = path.join(uploadDir, newName);
    fs.renameSync(file.path, destPath);
    res.json({ success: true, url: `/uploads/${newName}`, filename: newName, originalName: file.originalname, size: file.size });
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

  // ============ 培训视频上传 API ============
  
  // 创建视频上传目录
  const videoUploadDir = path.join(process.cwd(), 'uploads', 'videos');
  if (!fs.existsSync(videoUploadDir)) fs.mkdirSync(videoUploadDir, { recursive: true });
  
  // 视频上传（支持分片）
  router.post('/training/video/upload', upload.single('file'), async (req: any, res: any) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }
      
      const { chapterId, courseId, uploaderId } = req.body;
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const ext = path.extname(originalName).toLowerCase();
      
      // 检查文件类型
      const allowedVideoTypes = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
      if (!allowedVideoTypes.includes(ext)) {
        // 删除无效文件
        fs.unlinkSync(file.path);
        res.status(400).json({ success: false, error: '不支持的视频格式，请上传 MP4、WebM、OGG 等格式' });
        return;
      }
      
      // 生成唯一文件名
      const videoId = `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const storedName = `${videoId}${ext}`;
      const storedPath = path.join(videoUploadDir, storedName);
      
      // 移动文件到视频目录
      fs.renameSync(file.path, storedPath);
      
      // 获取视频时长（使用 ffprobe，如果可用）
      let duration = 0;
      try {
        const { execSync } = require('child_process');
        const ffprobeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${storedPath}"`;
        duration = parseFloat(execSync(ffprobeCmd, { encoding: 'utf8' })) || 0;
      } catch (e) {
        // ffprobe 不可用，忽略时长获取
        console.log('ffprobe not available, duration not extracted');
      }
      
      const videoUrl = `/api/training/video/${videoId}`;
      
      res.json({
        success: true,
        video: {
          id: videoId,
          originalName,
          storedName,
          storedPath,
          url: videoUrl,
          mimeType: file.mimetype,
          size: file.size,
          duration: Math.round(duration),
          chapterId: chapterId || null,
          courseId: courseId || null,
          uploadedBy: uploaderId || null,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (e: any) {
      console.error('Video upload error:', e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ============ 富文本图片上传 API ============
  
  // 创建图片上传目录
  const imageUploadDir = path.join(process.cwd(), 'uploads', 'images');
  if (!fs.existsSync(imageUploadDir)) fs.mkdirSync(imageUploadDir, { recursive: true });
  
  // 图片上传（用于富文本编辑器）
  router.post('/training/image/upload', upload.single('file'), async (req: any, res: any) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }
      
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const ext = path.extname(originalName).toLowerCase();
      
      // 检查文件类型
      const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      if (!allowedImageTypes.includes(ext)) {
        fs.unlinkSync(file.path);
        res.status(400).json({ success: false, error: '不支持的图片格式，请上传 JPG、PNG、GIF、WebP 等格式' });
        return;
      }
      
      // 生成唯一文件名
      const imageId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const storedName = `${imageId}${ext}`;
      const storedPath = path.join(imageUploadDir, storedName);
      
      // 移动文件
      fs.renameSync(file.path, storedPath);
      
      const imageUrl = `/api/training/image/${imageId}${ext}`;
      
      res.json({
        success: true,
        image: {
          id: imageId,
          originalName,
          url: imageUrl,
          mimeType: file.mimetype,
          size: file.size,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (e: any) {
      console.error('Image upload error:', e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 获取图片
  router.get('/training/image/:imageId', (req: any, res: any) => {
    try {
      const { imageId } = req.params;
      
      // 查找文件（支持带扩展名和不带扩展名的请求）
      const possibleExtensions = ['', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      let filePath: string | null = null;
      
      for (const ext of possibleExtensions) {
        const tryPath = path.join(imageUploadDir, `${imageId}${ext}`);
        if (fs.existsSync(tryPath)) {
          filePath = tryPath;
          break;
        }
      }
      
      if (!filePath) {
        res.status(404).json({ error: '图片不存在' });
        return;
      }
      
      const stat = fs.statSync(filePath);
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
      };
      const ext = path.extname(filePath).toLowerCase();
      
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000',
      });
      fs.createReadStream(filePath).pipe(res);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 获取视频（流式播放）
  router.get('/training/video/:videoId', (req: any, res: any) => {
    try {
      const { videoId } = req.params;
      const videoPath = path.join(videoUploadDir, `${videoId}.mp4`);
      
      if (!fs.existsSync(videoPath)) {
        res.status(404).json({ error: '视频不存在' });
        return;
      }
      
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;
      
      if (range) {
        // 支持 Range 请求（断点续传/拖动）
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4'
        });
        
        const stream = fs.createReadStream(videoPath, { start, end });
        stream.pipe(res);
      } else {
        // 完整文件
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4'
        });
        fs.createReadStream(videoPath).pipe(res);
      }
    } catch (e: any) {
      console.error('Video streaming error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // 删除视频
  router.delete('/training/video/:videoId', (req: any, res: any) => {
    try {
      const { videoId } = req.params;
      const videoPath = path.join(videoUploadDir, `${videoId}.mp4`);
      
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
      
      res.json({ success: true });
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



  // ==================== AI 服务 API ====================

  // ==================== 多知识库管理 ====================

  router.get('/ai/kb', (_req, res) => {
    try {
      const items = db.query("SELECT * FROM ai_knowledge_bases ORDER BY is_default DESC, created_at DESC");
      // 附带到每个KB的知识条目数量
      const withCounts = items.map((kb: any) => ({
        ...kb,
        itemCount: (db.query("SELECT COUNT(*) as c FROM ai_knowledge WHERE kb_id=?", [kb.id]) as any[])[0]?.c || 0,
        docCount: (db.query("SELECT COUNT(*) as c FROM ai_knowledge_documents WHERE kb_id=?", [kb.id]) as any[])[0]?.c || 0,
      }));
      res.json({ success: true, data: withCounts });
    } catch (e: any) {
      res.json({ success: true, data: [] });
    }
  });

  router.post('/ai/kb', (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ success: false, error: '知识库名称不能为空' });
      const id = 'kb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      db.insert('ai_knowledge_bases', { id, name, description: description || '' });
      res.json({ success: true, data: { id } });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.put('/ai/kb/:id', (req, res) => {
    try {
      const { name, description } = req.body;
      const data: any = { updated_at: new Date().toISOString() };
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      db.update('ai_knowledge_bases', req.params.id, data);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.delete('/ai/kb/:id', (req, res) => {
    try {
      const { id } = req.params;
      if (id === 'default') return res.status(400).json({ success: false, error: '不能删除默认知识库' });
      db.deleteWhere('ai_knowledge', { kb_id: id });
      db.deleteWhere('ai_knowledge_documents', { kb_id: id });
      db.delete('ai_knowledge_bases', id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ==================== 文档上传与解析 ====================

  router.post('/ai/kb/:kbId/upload', upload.array('files', 50), (req, res) => {
    try {
      const kbId = req.params.kbId;
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, error: '请选择文件' });
      }

      const aiService = require('./ai-service.js');
      const uploaded: any[] = [];

      for (const file of files) {
        const docId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        const ext = (file.originalname.split('.').pop() || 'txt').toLowerCase();
        // 修复中文文件名编码问题
        const safeName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const displayName = /[\u4e00-\u9fff]/.test(safeName) ? safeName : file.originalname;

        // 读取文件内容 (自动检测编码)
        let content = '';
        try {
          const fs = require('fs');
          const fileData = fs.readFileSync(file.path);
          // 尝试UTF-8解码，失败则尝试GBK
          try { content = fileData.toString('utf-8'); if (content.includes('�')) throw new Error('encoding'); }
          catch { content = require('iconv-lite') ? require('iconv-lite').decode(fileData, 'gbk') : fileData.toString('utf-8'); }
          if (content.length > 500000) content = content.substring(0, 500000);
        } catch { content = ''; }

        db.insert('ai_knowledge_documents', { id: docId, kb_id: kbId, filename: file.filename, original_name: displayName, file_type: ext, file_size: file.size, file_path: file.path, content, status: 'completed' });

        // 自动解析并添加为知识条目
        if (content && content.length > 20) {
          const chunks = aiService.recursiveSplitText(content, 800, 150);
          for (let i = 0; i < Math.min(chunks.length, 50); i++) {
            const chunk = chunks[i];
            if (chunk.trim().length > 10) {
              const itemId = 'ki_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 4);
              db.insert('ai_knowledge', {
                id: itemId, kb_id: kbId, title: displayName + ' #' + (i + 1),
                category: 'general', content: chunk.trim(), tags: '',
                source_type: 'file', source_file: displayName, source_size: file.size,
              });
            }
          }
        }

        uploaded.push({ id: docId, name: displayName, size: file.size, chunks: Math.min(aiService.recursiveSplitText(content, 800, 150).length, 50) });
      }

      // 清理临时文件
      try { files.forEach(f => require('fs').unlinkSync(f.path)); } catch {}

      res.json({ success: true, data: uploaded, kbId });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.get('/ai/kb/:kbId/documents', (req, res) => {
    try {
      const docs = db.query("SELECT * FROM ai_knowledge_documents WHERE kb_id=? ORDER BY created_at DESC", [req.params.kbId]);
      res.json({ success: true, data: docs });
    } catch (e: any) {
      res.json({ success: true, data: [] });
    }
  });

  router.delete('/ai/kb/:kbId/documents/:docId', (req, res) => {
    try {
      const doc = db.query("SELECT original_name FROM ai_knowledge_documents WHERE id=?", [req.params.docId]) as any[];
      if (doc.length > 0) {
        db.deleteWhere('ai_knowledge', { source_file: doc[0].original_name });
      }
      db.delete('ai_knowledge_documents', req.params.docId);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ==================== 知识条目CRUD (按知识库过滤) ====================

  // AI 对话
  router.post('/ai/chat', async (req, res) => {
    try {
      const { messages, options } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ success: false, error: '请提供有效的 messages 数组' });
      }
      const aiService = require('./ai-service.js');
      const result = await aiService.chatCompletion(messages, options || {});
      res.json({ success: true, data: result });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message || 'AI服务不可用' });
    }
  });

  // AI 数据分析
  router.post('/ai/analyze', async (req, res) => {
    try {
      const { dataType, data, options } = req.body;
      const aiService = require('./ai-service.js');
      const result = await aiService.analyzeHRData(dataType, data, options || {});
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message || '分析失败' });
    }
  });

  // AI 简历分析
  router.post('/ai/analyze-resume', async (req, res) => {
    try {
      const { text } = req.body;
      const aiService = require('./ai-service.js');
      const result = await aiService.analyzeResume(text || '');
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // AI 翻译
  router.post('/ai/translate', async (req, res) => {
    try {
      const { text, targetLang, sourceLang } = req.body;
      const aiService = require('./ai-service.js');
      const result = await aiService.translateText(text, targetLang, sourceLang || 'auto');
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // AI 文档处理
  router.post('/ai/extract-doc', async (req, res) => {
    try {
      const { text, docType } = req.body;
      const aiService = require('./ai-service.js');
      const result = await aiService.extractDocumentInfo(text, docType || 'general');
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ==================== 模型配置管理（支持无限自定义） ====================

  router.get('/ai/models', (_req, res) => {
    try {
      const configs = db.query("SELECT * FROM ai_model_configs ORDER BY is_active DESC, created_at ASC");
      const safe = configs.map((c: any) => ({ ...c, api_key: c.api_key ? '***' : '' }));
      res.json({ success: true, data: safe });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  router.post('/ai/models', (req, res) => {
    try {
      const { name, base_url, api_key, model, provider_type } = req.body;
      if (!name || !base_url || !model) return res.status(400).json({ success: false, error: '名称/API地址/模型必填' });
      const id = 'model_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      db.insert('ai_model_configs', { id, name, base_url, api_key: api_key || '', model, provider_type: provider_type || 'openai' });
      res.json({ success: true, data: { id } });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  router.put('/ai/models/:id', (req, res) => {
    try {
      const { name, base_url, api_key, model, provider_type, is_active } = req.body;
      const data: any = { updated_at: new Date().toISOString() };
      if (name !== undefined) data.name = name;
      if (base_url !== undefined) data.base_url = base_url;
      if (api_key !== undefined && api_key !== '***' && api_key !== '') data.api_key = api_key;
      if (model !== undefined) data.model = model;
      if (provider_type !== undefined) data.provider_type = provider_type;
      if (is_active !== undefined) data.is_active = is_active;
      db.update('ai_model_configs', req.params.id, data);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  router.delete('/ai/models/:id', (req, res) => {
    try {
      db.delete('ai_model_configs', req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  router.post('/ai/models/:id/test', async (req, res) => {
    try {
      const model = db.query("SELECT * FROM ai_model_configs WHERE id=?", [req.params.id]) as any[];
      if (!model.length) return res.status(404).json({ success: false, error: '模型配置不存在' });
      const m = model[0];
      const aiService = require('./ai-service.js');

      // 临时切换为测试模型
      const prevActive = db.query("SELECT id FROM ai_model_configs WHERE is_active=1") as any[];
      prevActive.forEach((p: any) => db.update('ai_model_configs', p.id, { is_active: 0 }));
      db.update('ai_model_configs', m.id, { is_active: 1 });

      try {
        const result = await aiService.chatCompletion([{ role: 'user', content: 'Hi, say hello in one word.' }]);
        res.json({ success: true, message: `连接成功！模型回复: ${result.content}` });
      } catch (e: any) {
        res.json({ success: false, error: e.message });
      } finally {
        // 恢复原状态
        db.update('ai_model_configs', m.id, { is_active: 0 });
        prevActive.forEach((p: any) => db.update('ai_model_configs', p.id, { is_active: 1 }));
      }
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  // 运行时配置
  router.get('/ai/config', (_req, res) => {
    try {
      const aiService = require('./ai-service.js');
      res.json({ success: true, data: aiService.getRuntimeConfig() });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  router.put('/ai/config', (req, res) => {
    try {
      const aiService = require('./ai-service.js');
      aiService.updateRuntimeConfig(req.body || {});
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  // ---- AI客服配置 ----
  const csConfigPath = path.join(__dirname, '..', 'data', 'ai-cs-config.json');
  const readCsConfig = () => { try { return JSON.parse(fs.readFileSync(csConfigPath, 'utf-8')); } catch { return { systemPrompt: '', kbIds: [], welcomeMsg: '您好！我是飞达AI智能客服 🤖\n有什么可以帮助您的？' }; } };
  const writeCsConfig = (cfg: any) => { fs.mkdirSync(path.dirname(csConfigPath), { recursive: true }); fs.writeFileSync(csConfigPath, JSON.stringify(cfg, null, 2)); };

  router.get('/ai/cs-config', (_req, res) => { res.json({ success: true, data: readCsConfig() }); });
  router.put('/ai/cs-config', (req, res) => {
    const cfg = { ...readCsConfig(), ...req.body };
    writeCsConfig(cfg);
    res.json({ success: true, data: cfg });
  });

  // ---- AI 问答对 (FAQ) ----
  router.get('/ai/faqs', (req, res) => {
    const rows = db.findAll('ai_faqs') || [];
    res.json(Array.isArray(rows) ? rows : []);
  });
  router.post('/ai/faqs', (req, res) => {
    const { question, answer, category, sort_order } = req.body;
    if (!question || !answer) return res.status(400).json({ error: '问题和答案不能为空' });
    db.insert('ai_faqs', { id: 'faq_' + Date.now(), question, answer, category: category || 'general', sort_order: sort_order || 0, created_at: new Date().toISOString() });
    res.json({ success: true });
  });
  router.put('/ai/faqs/:id', (req, res) => {
    db.update('ai_faqs', req.params.id, req.body);
    res.json({ success: true });
  });
  router.delete('/ai/faqs/:id', (req, res) => {
    db.deleteById('ai_faqs', req.params.id);
    res.json({ success: true });
  });
  // 知识库搜索（用于客服检索上下文）
  router.post('/ai/kb-search', (req, res) => {
    const { query, kbIds, limit } = req.body;
    if (!query) return res.json([]);
    const l = limit || 5;
    let sql = "SELECT id, kb_id, title, content, category FROM ai_knowledge WHERE 1=1";
    const params: any[] = [];
    if (kbIds && kbIds.length) { sql += " AND kb_id IN (" + kbIds.map(() => '?').join(',') + ")"; params.push(...kbIds); }
    sql += " ORDER BY updated_at DESC LIMIT ?";
    params.push(l * 2);
    try {
      const rows = db.query(sql, params);
      const kw = query.toLowerCase();
      const scored = rows.map((r: any) => ({ ...r, score: (r.title?.toLowerCase().includes(kw) ? 3 : 0) + (r.content?.toLowerCase().includes(kw) ? 2 : 0) })).filter((r: any) => r.score > 0).sort((a: any, b: any) => b.score - a.score).slice(0, l);
      res.json(scored);
    } catch { res.json([]); }
  });

  // 知识库管理
  router.get('/ai/knowledge', (req, res) => {
    try {
      const kbId = req.query.kbId as string;
      let sql = "SELECT id, kb_id, title, category, content, tags, source_type, source_file, created_at, updated_at FROM ai_knowledge";
      let items;
      if (kbId) {
        sql += " WHERE kb_id=? ORDER BY updated_at DESC";
        items = db.query(sql, [kbId]);
      } else {
        sql += " ORDER BY updated_at DESC";
        items = db.query(sql);
      }
      res.json({ success: true, data: items });
    } catch (e: any) {
      res.json({ success: true, data: [] });
    }
  });

  router.post('/ai/knowledge', (req, res) => {
    try {
      const { title, category, content, tags, kb_id } = req.body;
      if (!title || !content) return res.status(400).json({ success: false, error: '标题和内容不能为空' });
      const id = 'kb_item_' + Math.random().toString(36).substring(2, 10);
      db.insert('ai_knowledge', { id, kb_id: kb_id || 'default', title, category: category || 'general', content, tags: tags || '' });
      res.json({ success: true, data: { id } });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.put('/ai/knowledge/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { title, category, content, tags } = req.body;
      const fields: string[] = [];
      const values: any[] = [];
      if (title !== undefined) { fields.push('title = ?'); values.push(title); }
      if (category !== undefined) { fields.push('category = ?'); values.push(category); }
      if (content !== undefined) { fields.push('content = ?'); values.push(content); }
      if (tags !== undefined) { fields.push('tags = ?'); values.push(tags); }
      fields.push("updated_at = datetime('now','localtime')");
      values.push(id);
      db.query(`UPDATE ai_knowledge SET ${fields.join(', ')} WHERE id = ?`, [...values, id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.delete('/ai/knowledge/:id', (req, res) => {
    try {
      db.query("DELETE FROM ai_knowledge WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 知识库搜索
  router.post('/ai/search-knowledge', (req, res) => {
    try {
      const { query, topK, kbId } = req.body;
      if (!query) return res.status(400).json({ success: false, error: '请提供搜索关键词' });
      const sql = kbId ? "SELECT * FROM ai_knowledge WHERE kb_id=?" : "SELECT * FROM ai_knowledge";
      const items = kbId ? db.query(sql, [kbId]) : db.query(sql);
      const aiService = require('./ai-service.js');
      const results = aiService.searchKnowledge(query, items, topK || 5);
      res.json({ success: true, data: results });
    } catch (e: any) {
      res.json({ success: true, data: [] });
    }
  });

  // RAG 增强的 AI 对话
  router.post('/ai/rag-chat', async (req, res) => {
    try {
      const { query, messages, kbIds } = req.body;
      const aiService = require('./ai-service.js');
      // 支持多知识库过滤
      let items;
      if (kbIds && Array.isArray(kbIds) && kbIds.length > 0) {
        const placeholders = kbIds.map(() => '?').join(',');
        items = db.query(`SELECT * FROM ai_knowledge WHERE kb_id IN (${placeholders})`, kbIds);
      } else {
        items = db.query("SELECT * FROM ai_knowledge");
      }
      const ragContext = aiService.buildRagContext(query, items);

      const systemMsg = `${aiService.getRuntimeConfig().systemPrompt}\n\n${ragContext ? '请参考以下知识库内容回答用户问题：' + ragContext : ''}`;

      const allMessages = [
        { role: 'system', content: systemMsg },
        ...(messages || [{ role: 'user', content: query }]),
      ];

      const result = await aiService.chatCompletion(allMessages);
      res.json({ success: true, data: result, knowledgeUsed: ragContext.length > 0 });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message || 'AI服务不可用' });
    }
  });

  // ==================== AI 预警管理 API ====================

  router.get('/ai/alert-rules', (_req, res) => {
    try {
      const rules = [
        { id: 'rule_1', name: '连续迟到预警', type: 'attendance', threshold: 3, enabled: true, description: '员工连续迟到超过N次触发预警' },
        { id: 'rule_2', name: '加班超时预警', type: 'overtime', threshold: 36, enabled: true, description: '月加班超过N小时触发预警' },
        { id: 'rule_3', name: '合同到期提醒', type: 'contract', threshold: 30, enabled: true, description: '劳动合同剩余天数少于N天提醒' },
        { id: 'rule_4', name: '绩效下滑预警', type: 'performance', threshold: 2, enabled: true, description: '连续N个月绩效评分下降触发预警' },
        { id: 'rule_5', name: '培训完成率预警', type: 'training', threshold: 70, enabled: true, description: '培训完成率低于N%触发预警' },
      ];
      res.json({ success: true, data: rules });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.get('/ai/alert-records', (_req, res) => {
    try {
      const records: any[] = [];
      try {
        const contracts = db.query(
          "SELECT e.realName, e.deptName, c.endDate FROM emp_contracts c JOIN employees e ON c.empId = e.id WHERE c.status = 'active' AND c.endDate <= date('now', '+30 days')"
        );
        contracts.forEach((c: any) => {
          records.push({
            id: 'ct_' + Math.random().toString(36).substr(2, 8),
            rule_name: '合同到期提醒', type: 'contract', severity: 'medium',
            message: `${c.realName}（${c.deptName || ''}）劳动合同即将到期`,
            status: 'active', created_at: new Date().toISOString(),
          });
        });
      } catch {}
      res.json({ success: true, data: records });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ==================== AI 流式对话 + 对话历史 ====================

  router.post('/ai/stream-chat', async (req, res) => {
    try {
      const { messages, options } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ success: false, error: '请提供有效的 messages 数组' });
      }

      // SSE 流式响应
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      });

      const aiService = require('./ai-service.js');
      const fullContent = await aiService.chatCompletionStreamFull(messages, options || {});
      res.write(`data: ${JSON.stringify({ type: 'content', content: fullContent.content })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } catch (e: any) {
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: e.message });
      } else {
        res.write(`data: ${JSON.stringify({ type: 'error', error: e.message })}\n\n`);
        res.end();
      }
    }
  });

  // 对话历史管理
  router.post('/ai/conversations', (req, res) => {
    try {
      const aiService = require('./ai-service.js');
      const conv = aiService.createConversation(req.body?.title);
      res.json({ success: true, data: conv });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.get('/ai/conversations', (_req, res) => {
    try {
      const aiService = require('./ai-service.js');
      const list = aiService.listConversations();
      res.json({ success: true, data: list });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.get('/ai/conversations/:id', (req, res) => {
    try {
      const aiService = require('./ai-service.js');
      const conv = aiService.getConversation(req.params.id);
      if (!conv) return res.status(404).json({ success: false, error: '对话不存在' });
      res.json({ success: true, data: conv });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.post('/ai/conversations/:id/messages', (req, res) => {
    try {
      const aiService = require('./ai-service.js');
      const msg = aiService.addMessage(req.params.id, req.body.role, req.body.content);
      if (!msg) return res.status(404).json({ success: false, error: '对话不存在' });
      res.json({ success: true, data: msg });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.delete('/ai/conversations/:id', (req, res) => {
    try {
      const aiService = require('./ai-service.js');
      aiService.deleteConversation(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 知识库命中测试
  router.post('/ai/hit-testing', (req, res) => {
    try {
      const { query, topK } = req.body;
      if (!query) return res.status(400).json({ success: false, error: '请输入测试查询' });
      const items = db.query("SELECT * FROM ai_knowledge");
      const aiService = require('./ai-service.js');
      const results = aiService.hitTesting(query, items, topK || 10);
      res.json({ success: true, data: results, query });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 增强检索配置
  router.get('/ai/retrieval-config', (_req, res) => {
    try {
      const aiService = require('./ai-service.js');
      const config = aiService.getAiConfig();
      res.json({ success: true, data: config.retrieval || {} });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.put('/ai/retrieval-config', (req, res) => {
    try {
      const aiService = require('./ai-service.js');
      aiService.updateAiConfig({ retrieval: req.body });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ==================== 智能体 (Agent) API ====================

  router.get('/ai/agent-tools', (_req, res) => {
    try {
      const aiService = require('./ai-service.js');
      const tools = aiService.listAgentTools();
      res.json({ success: true, data: tools });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.post('/ai/agent-execute', async (req, res) => {
    try {
      const { toolKey, params } = req.body;
      const aiService = require('./ai-service.js');
      const result = await aiService.executeAgentTool(toolKey, params, db);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.post('/ai/agent-run', async (req, res) => {
    try {
      const { query, history } = req.body;
      const aiService = require('./ai-service.js');
      const result = await aiService.runAgent(query, history || [], db);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ============ 代码助手 Agent ============
  router.get('/ai/code-agent/tools', async (_req, res) => {
    const aiService = require('./ai-service.js');
    try { res.json(await aiService.getCodeAgentToolsDefs()); } catch { res.json([]); }
  });

  router.post('/ai/code-agent/run', async (req, res) => {
    try {
      const { messages, options } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ success: false, error: '请提供有效的 messages 数组' });
      }
      const aiService = require('./ai-service.js');
      const result = await aiService.runCodeAgent(messages, options || {});
      res.json({ success: true, data: result });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ============ 原有 CRUD API ============

  // ===== 多语言 i18n 骨架（#107）=====（注册于 catch-all 之前，避免被 /:table 拦截）
  const I18N_AVAILABLE = [
    { code: 'zh-CN', name: '简体中文' },
    { code: 'en', name: 'English' }
  ];
  const I18N_EN: Record<string, string> = {
    '首页仪表盘': 'Dashboard', '组织管理': 'Organization', '产品档案': 'Products', '数据统计': 'Statistics', '员工自助': 'Self Service',
    '人事管理': 'Personnel', '薪酬管理': 'Compensation', '考勤管理': 'Attendance', '绩效管理': 'Performance', '招聘管理': 'Recruitment',
    '后勤管理': 'Logistics', '流程审批': 'Approval', '培训管理': 'Training', '综合事务': 'General Affairs', '系统管理': 'System',
    '工艺管理': 'PLM', '仓储管理': 'Warehouse', '销售管理': 'Sales', '采购管理': 'Procurement', '生产管理': 'Production',
    '财务管理': 'Finance', '网站商城': 'Website & Mall', '网站管理': 'Website', '商城管理': 'Mall', 'AI智能': 'AI', '质量管理': 'Quality',
    '保存': 'Save', '取消': 'Cancel', '删除': 'Delete', '编辑': 'Edit', '新增': 'Add', '搜索': 'Search', '导出': 'Export', '导入': 'Import',
    '确认': 'Confirm', '提交': 'Submit', '重置': 'Reset', '操作': 'Actions', '状态': 'Status', '名称': 'Name', '创建时间': 'Created At',
    '登录': 'Sign In', '登出': 'Sign Out', '用户名': 'Username', '密码': 'Password', '语言': 'Language', '退出登录': 'Logout',
    // ===== CMS 后台 Tab 与操作（#129 扩充）=====
    '栏目管理': 'Channels', '文章管理': 'Articles', '评论管理': 'Comments', '素材库': 'Media Library', '内容分组': 'Content Groups',
    '系统配置': 'Settings', '敏感词': 'Sensitive Words', '栏目结构': 'Channel Tree', '栏目列表': 'Channel List',
    '添加': 'Add', '添加文章': 'New Article', '添加栏目': 'New Channel', '批量替换': 'Batch Replace', '批量删除': 'Batch Delete',
    'Word导入': 'Import Word', '拼写检查': 'Spell Check', '智能提取': 'Smart Tags', '上传': 'Upload', '恢复': 'Restore',
    '移动': 'Move', '复制': 'Copy', '通过': 'Approve', '拒绝': 'Reject', '全部': 'All', '待审核': 'Pending Review', '回收站': 'Recycle Bin',
    '标题': 'Title', '作者': 'Author', '分类': 'Category', '栏目': 'Channel', '发布时间': 'Published At', '浏览量': 'Views',
    '置顶': 'Top', '推荐': 'Recommend', '正文': 'Content', '摘要': 'Summary', '标签': 'Tags', '封面': 'Cover', '附件': 'Attachments',
    '已发布': 'Published', '草稿': 'Draft', '待审': 'Reviewing', '文章': 'Article', '评论者': 'Commenter', '内容': 'Content', '时间': 'Time',
    // ===== 商城后台（#129 扩充）=====
    '商品管理': 'Products', '订单管理': 'Orders', '售后管理': 'After-sales', '优惠券': 'Coupons', '秒杀': 'Flash Sale',
    '拼团': 'Group Buy', '砍价': 'Bargain', '分销': 'Distribution', '仓库管理': 'Warehouses', '快递管理': 'Shipping',
    '商品': 'Product', '订单': 'Order', '价格': 'Price', '库存': 'Stock', '销量': 'Sales', '规格': 'Spec', '品牌': 'Brand',
    '上架': 'On Shelf', '下架': 'Off Shelf', '发货': 'Ship', '退款': 'Refund', '确认收货': 'Confirm Receipt',
    // ===== 通用与权限/站点（#128/#130）=====
    '角色管理': 'Roles', '权限管理': 'Permissions', '插件管理': 'Plugins', '用户管理': 'Users', '启用': 'Enable', '禁用': 'Disable',
    '角色': 'Role', '权限': 'Permission', '站点': 'Site', '站点范围': 'Site Scope', '全部站点': 'All Sites',
    '主站': 'Main Site', '门户资讯': 'Portal', '详情': 'Details', '关闭': 'Close', '返回': 'Back', '刷新': 'Refresh', '设置': 'Settings',
    '成功': 'Success', '失败': 'Failed', '加载中': 'Loading', '暂无数据': 'No Data', '总计': 'Total'
  };
  router.get('/i18n/available', (req, res) => { res.json(I18N_AVAILABLE); });
  router.get('/i18n/messages', (req, res) => {
    const lang = (req.query.lang as string) || 'zh-CN';
    if (lang === 'en') { res.json({ locale: 'en', messages: I18N_EN }); return; }
    // zh-CN 以中文原文为 key（即 messages 为空对象，前端回退到 key）
    res.json({ locale: 'zh-CN', messages: {} });
  });

  // ===== RBAC 细化权限骨架（#108）=====（注册于 catch-all 之前，避免被 /:table 拦截）
  const RBAC_CATALOG = [
    { moduleKey: 'cms', moduleName: '内容管理', points: [
      { key: 'cms:article:view', label: '查看文章' }, { key: 'cms:article:create', label: '创建文章' },
      { key: 'cms:article:edit', label: '编辑文章' }, { key: 'cms:article:delete', label: '删除文章' },
      { key: 'cms:article:publish', label: '发布文章' }, { key: 'cms:channel:manage', label: '栏目管理' },
      { key: 'cms:comment:moderate', label: '评论审核' }, { key: 'cms:media:manage', label: '素材管理' }
    ]},
    { moduleKey: 'shop', moduleName: '商城', points: [
      { key: 'shop:goods:manage', label: '商品管理' }, { key: 'shop:order:view', label: '查看订单' },
      { key: 'shop:order:refund', label: '退款处理' }, { key: 'shop:order:ship', label: '发货操作' },
      { key: 'shop:config', label: '商城配置' }
    ]},
    { moduleKey: 'hr', moduleName: '人力资源', points: [
      { key: 'hr:employee:manage', label: '员工管理' }, { key: 'hr:contract:manage', label: '合同管理' },
      { key: 'hr:attendance:manage', label: '考勤管理' }, { key: 'hr:salary:manage', label: '薪酬管理' },
      { key: 'hr:performance:manage', label: '绩效管理' }, { key: 'hr:recruitment:manage', label: '招聘管理' },
      { key: 'hr:logistics:manage', label: '后勤管理' }, { key: 'hr:approval:manage', label: '审批管理' }
    ]},
    { moduleKey: 'sys', moduleName: '系统', points: [
      { key: 'system:user:manage', label: '用户管理' }, { key: 'system:role:manage', label: '角色权限管理' },
      { key: 'system:config', label: '系统配置' }, { key: 'system:log:view', label: '审计日志' },
      { key: 'system:data', label: '数据管理' }
    ]}
  ];
  const RBAC_ALL = RBAC_CATALOG.flatMap(g => g.points.map(p => p.key));
  // ===== 站点级权限 scope（#130）=====
  // 站点是权限的横向作用域：角色除拥有权限点外，还被限定在若干站点内生效。
  // '*' 代表全部站点（超集）。前端据此过滤跨站点资源；后端 resolve 返回 siteScope。
  const RBAC_SITES = [
    { code: 'main', name: '主站' },
    { code: 'shop', name: '商城' },
    { code: 'portal', name: '门户资讯' }
  ];
  const RBAC_SITE_CODES = RBAC_SITES.map(s => s.code);
  const RBAC_ROLES = [
    { code: 'super_admin', name: '超级管理员', desc: '拥有全部权限', type: 'system', perms: RBAC_ALL, sites: ['*'] },
    { code: 'sys_admin', name: '系统管理员', desc: '拥有全部权限', type: 'system', perms: RBAC_ALL, sites: ['*'] },
    { code: 'hr_admin', name: 'HR管理员', desc: '人力资源与内容管理', type: 'system', perms: [
      'cms:article:view','cms:article:create','cms:article:edit','cms:article:publish','cms:channel:manage','cms:comment:moderate','cms:media:manage',
      'shop:order:view','shop:goods:manage','hr:employee:manage','hr:contract:manage','hr:attendance:manage','hr:salary:manage',
      'hr:performance:manage','hr:recruitment:manage','hr:logistics:manage','hr:approval:manage','system:user:manage','system:config','system:log:view'
    ], sites: ['main','shop'] },
    { code: 'hr_staff', name: 'HR专员', desc: '基础人事与内容录入', type: 'system', perms: [
      'cms:article:view','cms:article:create','hr:employee:manage','hr:attendance:manage','hr:recruitment:manage'
    ], sites: ['main'] },
    { code: 'dept_manager', name: '部门经理', desc: '部门审批与考勤', type: 'system', perms: ['hr:approval:manage','hr:attendance:manage'], sites: ['main'] },
    { code: 'employee', name: '普通员工', desc: '仅自助', type: 'system', perms: [], sites: [] }
  ];
  const parseArr = (v: any) => { try { return typeof v === 'string' ? JSON.parse(v) : (Array.isArray(v) ? v : []); } catch { return []; } };
  // 归一站点范围：空或含 '*' 时返回 ['*']（全部站点）
  const normSites = (v: any): string[] => { const a = parseArr(v); return (a.length === 0 || a.includes('*')) ? (a.includes('*') ? ['*'] : a) : a; };
  let rbacSeeded = false;
  const ensureRbacSeeded = () => {
    if (rbacSeeded) return;
    // roles 表迁移：补充 siteScope 列（站点级权限，#130）
    try {
      const cols = (db as any).db.prepare('PRAGMA table_info(roles)').all().map((c: any) => c.name);
      if (!cols.includes('siteScope')) {
        (db as any).db.prepare("ALTER TABLE roles ADD COLUMN siteScope TEXT DEFAULT '[\"*\"]'").run();
      }
    } catch { /* ignore */ }
    // 始终确保细粒度权限点存在（不删除已有的 p_* 模块级权限）。
    // 注意：permissions.moduleKey 为 UNIQUE，故每模块一行，actions 存该模块全部权限点 key 数组。
    const insP = (db as any).db.prepare('INSERT OR REPLACE INTO permissions (id, moduleName, moduleKey, actions, description) VALUES (?,?,?,?,?)');
    for (const g of RBAC_CATALOG) {
      const keys = g.points.map(p => p.key);
      const labels: Record<string, string> = {}; g.points.forEach(p => { labels[p.key] = p.label; });
      insP.run(g.moduleKey, g.moduleName, g.moduleKey, JSON.stringify(keys), JSON.stringify(labels));
    }
    for (const r of RBAC_ROLES) {
      const ex = (db as any).db.prepare('SELECT * FROM roles WHERE code = ?').get(r.code);
      if (!ex) {
        (db as any).db.prepare('INSERT INTO roles (id, name, code, description, permissionIds, type, isActive, createdAt, siteScope) VALUES (?,?,?,?,?,?,1,?,?)').run('role_' + r.code, r.name, r.code, r.desc, JSON.stringify(r.perms), r.type, new Date().toISOString(), JSON.stringify(r.sites));
      } else {
        // 合并：保留已有权限点 + 追加本角色规范的细粒度点（避免丢失 p_* 模块级权限）
        const existing = parseArr(ex.permissionIds);
        const merged = Array.from(new Set([...existing, ...r.perms]));
        // siteScope：RBAC_ROLES 均为内置系统角色，其站点范围始终以代码定义为准
        // （ALTER ADD COLUMN DEFAULT 曾把旧行统一填成 ["*"]，故此处强制回填修复）。
        // 自定义角色不在 RBAC_ROLES 内，其 siteScope 由管理员经 API 维护、不受此影响。
        (db as any).db.prepare('UPDATE roles SET permissionIds = ?, siteScope = ? WHERE id = ?').run(JSON.stringify(merged), JSON.stringify(r.sites), ex.id);
      }
    }
    rbacSeeded = true;
  };
  router.get('/rbac/permissions', (req, res) => {
    ensureRbacSeeded();
    const rows = (db as any).db.prepare('SELECT id, moduleName, moduleKey, actions, description FROM permissions ORDER BY moduleKey').all();
    const groups: any = {};
    for (const r of rows) {
      let keys: string[] = []; try { keys = JSON.parse(r.actions || '[]'); } catch { keys = []; }
      let labels: any = {}; try { labels = JSON.parse(r.description || '{}'); } catch { labels = {}; }
      const g = (groups[r.moduleKey] ||= { moduleKey: r.moduleKey, moduleName: r.moduleName, points: [] });
      for (const k of keys) g.points.push({ key: k, label: labels[k] || k });
    }
    res.json(Object.values(groups));
  });
  // 可用站点目录（站点级权限 scope，#130）
  router.get('/rbac/sites', (req, res) => { res.json(RBAC_SITES); });
  router.get('/rbac/roles', (req, res) => {
    ensureRbacSeeded();
    const rows = (db as any).db.prepare('SELECT * FROM roles ORDER BY type, name').all();
    res.json(rows.map((r: any) => ({ ...r, permissionIds: parseArr(r.permissionIds), siteScope: normSites(r.siteScope) })));
  });
  router.get('/rbac/roles/:id', (req, res) => {
    const r = (db as any).db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
    if (!r) { res.status(404).json({ error: '角色不存在' }); return; }
    res.json({ ...r, permissionIds: parseArr(r.permissionIds), siteScope: normSites(r.siteScope) });
  });
  router.post('/rbac/roles', (req, res) => {
    ensureRbacSeeded();
    const { name, code, description, permissionIds, type, siteScope } = req.body || {};
    if (!name || !code) { res.status(400).json({ error: 'name/code required' }); return; }
    if ((db as any).db.prepare('SELECT id FROM roles WHERE code = ?').get(code)) { res.status(409).json({ error: '角色编码已存在' }); return; }
    // 校验站点范围：仅允许 '*' 或已登记站点码
    const sites = Array.isArray(siteScope) ? siteScope.filter((s: string) => s === '*' || RBAC_SITE_CODES.includes(s)) : ['*'];
    const id = 'role_' + Date.now();
    (db as any).db.prepare('INSERT INTO roles (id, name, code, description, permissionIds, type, isActive, createdAt, siteScope) VALUES (?,?,?,?,?,?,1,?,?)').run(id, name, code, description || '', JSON.stringify(permissionIds || []), type || 'custom', new Date().toISOString(), JSON.stringify(sites.length ? sites : ['*']));
    res.json({ success: true, id });
  });
  router.put('/rbac/roles/:id', (req, res) => {
    const { name, description, permissionIds, isActive, type, siteScope } = req.body || {};
    const sets: string[] = []; const vals: any[] = [];
    if (name !== undefined) { sets.push('name = ?'); vals.push(name); }
    if (description !== undefined) { sets.push('description = ?'); vals.push(description); }
    if (permissionIds !== undefined) { sets.push('permissionIds = ?'); vals.push(JSON.stringify(permissionIds)); }
    if (isActive !== undefined) { sets.push('isActive = ?'); vals.push(isActive ? 1 : 0); }
    if (type !== undefined) { sets.push('type = ?'); vals.push(type); }
    if (siteScope !== undefined) {
      const sites = Array.isArray(siteScope) ? siteScope.filter((s: string) => s === '*' || RBAC_SITE_CODES.includes(s)) : [];
      sets.push('siteScope = ?'); vals.push(JSON.stringify(sites.length ? sites : ['*']));
    }
    if (sets.length) { vals.push(req.params.id); (db as any).db.prepare(`UPDATE roles SET ${sets.join(', ')} WHERE id = ?`).run(...vals); }
    res.json({ success: true });
  });
  router.delete('/rbac/roles/:id', (req, res) => {
    const r = (db as any).db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
    if (!r) { res.status(404).json({ error: '角色不存在' }); return; }
    if (r.type === 'system') { res.status(403).json({ error: '系统角色不可删除' }); return; }
    (db as any).db.prepare('DELETE FROM roles WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });
  router.post('/rbac/resolve', (req, res) => {
    ensureRbacSeeded();
    const roleIds: string[] = (req.body && req.body.roleIds) || [];
    const points = new Set<string>();
    const sites = new Set<string>();
    let allSites = false;
    for (const rid of roleIds) {
      const code = String(rid).replace(/^role_/, '');
      const r = (db as any).db.prepare('SELECT permissionIds, siteScope FROM roles WHERE code = ?').get(code);
      if (r) {
        try { (JSON.parse(r.permissionIds) as string[]).forEach((p: string) => points.add(p)); } catch { /* ignore */ }
        const ss = normSites(r.siteScope);
        if (ss.includes('*')) allSites = true; else ss.forEach((s: string) => sites.add(s));
      }
    }
    res.json({ permissions: Array.from(points), siteScope: allSites ? ['*'] : Array.from(sites), sites: RBAC_SITES });
  });
  // 启动时确保权限目录与默认角色已播种（供 /api/permissions、/api/roles 通用 CRUD 直接可用）
  ensureRbacSeeded();

  // ===== 插件系统骨架（#109）=====（注册于 catch-all 之前）
  // 安全策略：插件在代码中静态注册（不加载磁盘上的任意 JS），路由运行时检查启用状态。
  const pluginRegistry = new Map<string, any>();
  const definePlugin = (p: any) => pluginRegistry.set(p.id, p);
  const pluginEnabled = (id: string): boolean => {
    try { const row = (db as any).db.prepare('SELECT enabled FROM plugins WHERE id = ?').get(id); return row ? !!row.enabled : (pluginRegistry.get(id)?.enabled !== false); } catch { return pluginRegistry.get(id)?.enabled !== false; }
  };
  const setPluginEnabled = (id: string, enabled: boolean) => {
    try {
      (db as any).db.prepare('CREATE TABLE IF NOT EXISTS plugins (id TEXT PRIMARY KEY, name TEXT, version TEXT, description TEXT, enabled INTEGER DEFAULT 1, config TEXT DEFAULT \'[]{}\')').run();
      const ex = (db as any).db.prepare('SELECT id FROM plugins WHERE id = ?').get(id);
      if (ex) (db as any).db.prepare('UPDATE plugins SET enabled = ? WHERE id = ?').run(enabled ? 1 : 0, id);
      else (db as any).db.prepare('INSERT OR IGNORE INTO plugins (id, name, version, description, enabled) VALUES (?,?,?,?,?)').run(id, pluginRegistry.get(id)?.name || id, pluginRegistry.get(id)?.version || '1.0.0', pluginRegistry.get(id)?.description || '', enabled ? 1 : 0);
    } catch { /* 表不可用则仅内存态 */ }
  };
  const pluginGate = (id: string, res: any): boolean => {
    const p = pluginRegistry.get(id);
    if (!p || !pluginEnabled(id)) { res.status(403).json({ error: '插件未启用或不存在' }); return false; }
    return true;
  };
  // 样例插件 1：演示端点
  definePlugin({ id: 'demo', name: '演示插件', version: '1.0.0', description: '提供 /api/plugin/demo/ping 等演示端点', enabled: true });
  router.get('/plugin/demo/ping', (req, res) => { if (!pluginGate('demo', res)) return; res.json({ pong: true, time: new Date().toISOString() }); });
  router.get('/plugin/demo/info', (req, res) => { if (!pluginGate('demo', res)) return; const p = pluginRegistry.get('demo'); res.json({ id: p.id, name: p.name, version: p.version, description: p.description }); });
  // 样例插件 2：简易统计
  definePlugin({ id: 'stats', name: '站点统计插件', version: '1.0.0', description: '提供 /api/plugin/stats/overview 概览端点', enabled: true });
  router.get('/plugin/stats/overview', (req, res) => {
    if (!pluginGate('stats', res)) return;
    let articles = 0, goods = 0;
    try { articles = (db as any).db.prepare('SELECT COUNT(*) c FROM cms_articles WHERE status != \'deleted\'').get().c; } catch { /* ignore */ }
    try { goods = (db as any).db.prepare('SELECT COUNT(*) c FROM shop_goods').get().c; } catch { /* ignore */ }
    res.json({ articles, goods, generatedAt: new Date().toISOString() });
  });
  // 未静态注册的插件路由统一走此网关：未知插件返回 403，已启用插件返回通用响应
  router.get('/plugin/:id/:action', (req, res) => {
    if (!pluginGate(req.params.id, res)) return;
    res.json({ plugin: req.params.id, action: req.params.action, time: new Date().toISOString() });
  });
  router.get('/plugins', (req, res) => {
    const list = Array.from(pluginRegistry.values()).map((p: any) => ({ id: p.id, name: p.name, version: p.version, description: p.description, enabled: pluginEnabled(p.id) }));
    res.json(list);
  });
  router.post('/plugins/:id/toggle', (req, res) => {
    const p = pluginRegistry.get(req.params.id);
    if (!p) { res.status(404).json({ error: '插件不存在' }); return; }
    const next = !pluginEnabled(p.id);
    setPluginEnabled(p.id, next);
    res.json({ success: true, id: p.id, enabled: next });
  });

  router.get('/:table', (req, res, next) => {
    const { table } = req.params;
    const RESERVED_ROUTES = new Set(['workflows', 'approval', 'workflow', 'ai', 'sitemap.xml']);
    // Allow hyphenated paths through to dedicated route handlers
    if (table.includes('-') || RESERVED_ROUTES.has(table)) { return next(); }
    if (!ALLOWED.includes(table)) { res.json({ error: 'Invalid table' }); return; }
    const skipKeys = new Set(['_', 'limit', 'offset', 'page', 'pageSize', 'sort', 'order', 'fields']);
    const filters = Object.fromEntries(Object.entries(req.query).filter(([k]) => !skipKeys.has(k)));
    const limitVal = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offsetVal = req.query.offset ? parseInt(req.query.offset as string) : undefined;
    let data;
    try {
      if (Object.keys(filters).length > 0) {
        data = limitVal ? db.findWhere(table, filters, limitVal) : db.findWhere(table, filters);
      } else {
        data = db.findAll(table);
        if (limitVal) data = data.slice(offsetVal || 0, (offsetVal || 0) + limitVal);
      }
    } catch(e) {
      data = db.findAll(table);
      if (limitVal) data = data.slice(offsetVal || 0, (offsetVal || 0) + limitVal);
    }
    res.json(data);
  });

  router.get('/:table/:id', (req, res, next) => {
    const { table, id } = req.params;
    if (table.includes('-')) { return next(); }
    if (!ALLOWED.includes(table)) { res.json({ error: 'Invalid table' }); return; }
    res.json(db.findById(table, id) || { error: 'Not found' });
  });

  router.post('/:table', (req, res, next) => {
    const { table } = req.params;
    const RESERVED_ROUTES = new Set(['workflows', 'approval', 'workflow']);
    if (table.includes('-') || RESERVED_ROUTES.has(table)) { return next(); }
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

  router.put('/:table/:id', (req, res, next) => {
    const { table, id } = req.params;
    
    if (table.includes('-')) { return next(); }
    
    if (table === 'workflows') {
      try {
        const { name, code, description, nodes, edges, status, isDefault, formConfigId, variables } = req.body;
        
        const existing = (db as any).db.prepare('SELECT * FROM workflow_definitions WHERE id = ?').get(id);
        if (!existing) {
          res.json({ success: false, message: '工作流不存在' });
          return;
        }
        
        const nodesJson = typeof nodes === 'string' ? nodes : JSON.stringify(nodes || []);
        const edgesJson = typeof edges === 'string' ? edges : JSON.stringify(edges || []);
        const variablesJson = typeof variables === 'string' ? variables : JSON.stringify(variables || {});
        
        const now = new Date().toISOString();
        const newVersion = (existing.version || 1) + 1;
        
        (db as any).db.prepare(`UPDATE workflow_definitions SET 
          name = ?, code = ?, description = ?, version = ?, status = ?, 
          isDefault = ?, formConfigId = ?, nodes = ?, edges = ?, variables = ?, updatedAt = ?
          WHERE id = ?`).run(
          name, code, description || '', newVersion, status || existing.status,
          isDefault ?? existing.isDefault, formConfigId || null,
          nodesJson, edgesJson, variablesJson, now, id
        );
        
        const updated = (db as any).db.prepare('SELECT * FROM workflow_definitions WHERE id = ?').get(id);
        res.json({ success: true, data: updated });
        return;
      } catch (e: any) {
        res.json({ success: false, message: e.message });
        return;
      }
    }
    
    const RESERVED_ROUTES = new Set(['approval', 'workflow']);
    if (RESERVED_ROUTES.has(table)) { return next(); }
    if (!ALLOWED.includes(table)) { res.json({ error: 'Invalid table' }); return; }
    
    let data: Record<string, any> = { ...req.body };
    try {
      const tableInfo = db.query(`PRAGMA table_info(${table})`);
      const cols = tableInfo.map((c: any) => c.name);
      data = Object.fromEntries(Object.entries(data).filter(([k]) => cols.includes(k)));
      if (cols.includes('updatedAt')) data.updatedAt = new Date().toISOString();
    } catch {}
    res.json(db.update(table, id, data));
  });

  router.delete('/:table/:id', (req, res, next) => {
    const { table, id } = req.params;
    if (table.includes('-')) { return next(); }
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

  // ============ 产品基础档案 API ============

  // 批量生成SKU（根据款色+尺码组）
  router.post('/product_skus/generate', (req, res) => {
    try {
      const { styleId, styleColorId, sizeGroupId } = req.body;
      if (!styleId || !styleColorId || !sizeGroupId) {
        res.json({ success: false, message: '缺少必要参数' }); return;
      }

      // 获取尺码组下的所有尺码
      const sizeItems = db.findWhere('size_group_items', { size_group_id: sizeGroupId }) as any[];
      if (sizeItems.length === 0) {
        res.json({ success: false, message: '尺码组中没有尺码' }); return;
      }

      // 获取款号信息用于生成编码
      const style = db.findById('product_styles', styleId) as any;
      if (!style) { res.json({ success: false, message: '款号不存在' }); return; }

      // 获取编码规则
      const codingRule = db.findWhere('coding_rules', { target_type: 'sku', is_active: 1 }) as any[];
      const rule = codingRule[0];

      const generated: any[] = [];
      for (const item of sizeItems) {
        const size = db.findById('sizes', item.size_id) as any;
        if (!size) continue;

        // 生成SKU编码
        let skuCode = '';
        if (rule) {
          const seq = (rule.current_sequence || 0) + generated.length + 1;
          const seqStr = String(seq).padStart(rule.sequence_digits || 4, '0');
          skuCode = `${rule.prefix || ''}${style.code}${size.name}${seqStr}`;
          // 更新编码规则当前序号
          db.update('coding_rules', rule.id, { current_sequence: seq });
        } else {
          skuCode = `${style.code}_${styleColorId}_${size.id}`;
        }

        const skuId = `sku_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const sku = {
          id: skuId,
          style_id: styleId,
          style_color_id: styleColorId,
          size_id: size.id,
          sku_code: skuCode,
          status: 'active',
          created_at: new Date().toISOString()
        };
        db.insert('product_skus', sku);
        generated.push({ ...sku, size_name: size.name });
      }

      res.json({ success: true, count: generated.length, skus: generated });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 编码规则预览
  router.post('/coding_rules/preview', (req, res) => {
    try {
      const { ruleId, categoryId } = req.body;
      const rule = db.findById('coding_rules', ruleId) as any;
      if (!rule) { res.json({ success: false, message: '编码规则不存在' }); return; }

      const seq = (rule.current_sequence || 0) + 1;
      const seqStr = String(seq).padStart(rule.sequence_digits || 4, '0');
      let preview = rule.expression || '';

      // 替换表达式中的变量
      preview = preview.replace(/\$\{sequence\}/g, seqStr);
      preview = preview.replace(/\$\{prefix\}/g, rule.prefix || '');
      if (categoryId) {
        const category = db.findById('product_categories', categoryId) as any;
        if (category) {
          preview = preview.replace(/\$\{categ\.code\}/g, category.code || '');
        }
      }
      preview = preview.replace(/\$\{year\}/g, new Date().getFullYear().toString());
      preview = preview.replace(/\$\{month\}/g, String(new Date().getMonth() + 1).padStart(2, '0'));
      preview = preview.replace(/\$\{day\}/g, String(new Date().getDate()).padStart(2, '0'));

      res.json({ success: true, preview, nextSequence: seq });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取款号的尺码组配置
  router.get('/product_styles/:id/size-config', (req, res) => {
    try {
      const { id } = req.params;
      const configs = db.findWhere('product_style_size_configs', { style_id: id }) as any[];
      const result = configs.map((c: any) => {
        const group = db.findById('size_groups', c.size_group_id);
        const items = db.findWhere('size_group_items', { size_group_id: c.size_group_id }) as any[];
        const sizes = items.map((item: any) => db.findById('sizes', item.size_id)).filter(Boolean);
        return { ...c, size_group: group, sizes };
      });
      res.json({ success: true, data: result });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取款色的尺码详情
  router.get('/product_style_colors/:id/sizes', (req, res) => {
    try {
      const { id } = req.params;
      const styleColor = db.findById('product_style_colors', id) as any;
      if (!styleColor) { res.json({ success: false, message: '款色不存在' }); return; }

      const style = db.findById('product_styles', styleColor.style_id) as any;
      if (!style) { res.json({ success: false, message: '款号不存在' }); return; }

      // 获取款号的尺码配置
      const sizeConfig = db.findWhere('product_style_size_configs', { style_id: style.id }) as any[];
      if (sizeConfig.length === 0) {
        res.json({ success: true, data: [], message: '该款号未配置尺码组' }); return;
      }

      // 获取所有尺码
      const allSizes: any[] = [];
      for (const cfg of sizeConfig) {
        const items = db.findWhere('size_group_items', { size_group_id: cfg.size_group_id }) as any[];
        for (const item of items) {
          const size = db.findById('sizes', item.size_id) as any;
          if (size && !allSizes.find(s => s.id === size.id)) {
            allSizes.push({ ...size, size_group_id: cfg.size_group_id });
          }
        }
      }

      // 获取已有的SKU
      const existingSkus = db.findWhere('product_skus', { style_color_id: id }) as any[];
      const skuMap: Record<string, any> = {};
      existingSkus.forEach((s: any) => { skuMap[s.size_id] = s; });

      // 组合数据
      const result = allSizes.map(size => ({
        size,
        sku: skuMap[size.id] || null
      }));

      res.json({ success: true, data: result });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
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

  // 创建工作流定义
  router.post('/workflows', (req, res) => {
    try {
      const { name, code, description, nodes, edges, status, isDefault, formConfigId, variables } = req.body;
      
      if (!name || !code) {
        res.json({ success: false, message: '名称和编码不能为空' });
        return;
      }
      
      // 处理前端已序列化的数据
      const nodesJson = typeof nodes === 'string' ? nodes : JSON.stringify(nodes || []);
      const edgesJson = typeof edges === 'string' ? edges : JSON.stringify(edges || []);
      const variablesJson = typeof variables === 'string' ? variables : JSON.stringify(variables || {});
      
      const id = `wf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();
      
      const newDef = db.insert('workflow_definitions', {
        id,
        name,
        code,
        description: description || '',
        version: 1,
        status: status || 'draft',
        isDefault: isDefault || 0,
        formConfigId: formConfigId || null,
        nodes: nodesJson,
        edges: edgesJson,
        variables: variablesJson,
        createdBy: req.body.createdBy || 'admin',
        createdAt: now,
        updatedAt: now,
      });
      
      res.json({ success: true, data: newDef });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 更新工作流定义
  router.put('/workflows/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { name, code, description, nodes, edges, status, isDefault, formConfigId, variables } = req.body;
      
      const existing = db.query('SELECT * FROM workflow_definitions WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        res.json({ success: false, message: '工作流不存在' });
        return;
      }
      
      // 处理前端已序列化的数据
      const nodesJson = typeof nodes === 'string' ? nodes : JSON.stringify(nodes || []);
      const edgesJson = typeof edges === 'string' ? edges : JSON.stringify(edges || []);
      const variablesJson = typeof variables === 'string' ? variables : JSON.stringify(variables || {});
      
      const now = new Date().toISOString();
      const newVersion = (existing[0].version || 1) + 1;
      
      db.query(`UPDATE workflow_definitions SET 
        name = ?, code = ?, description = ?, version = ?, status = ?, 
        isDefault = ?, formConfigId = ?, nodes = ?, edges = ?, variables = ?, updatedAt = ?
        WHERE id = ?`,
        [
          name, code, description || '', newVersion, status || existing[0].status,
          isDefault ?? existing[0].isDefault, formConfigId || null,
          nodesJson, edgesJson, variablesJson, now, id
        ]
      );
      
      const updated = db.query('SELECT * FROM workflow_definitions WHERE id = ?', [id]);
      res.json({ success: true, data: updated[0] });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 删除工作流定义
  router.delete('/workflows/:id', (req, res) => {
    try {
      const { id } = req.params;
      
      // 检查是否有正在运行的实例
      const instances = db.query('SELECT COUNT(*) as c FROM workflow_instances WHERE definitionId = ? AND status = ?', [id, 'running']);
      if (instances[0]?.c > 0) {
        res.json({ success: false, message: '该工作流有正在运行的实例，无法删除' });
        return;
      }
      
      db.query('DELETE FROM workflow_definitions WHERE id = ?', [id]);
      res.json({ success: true, message: '删除成功' });
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

  // ============ 培训模块 V2.0 API ============

  // 获取课程分类列表
  router.get('/training/categories', (req, res) => {
    try {
      const { parentId } = req.query as any;
      let sql = 'SELECT * FROM training_categories WHERE isActive = 1';
      const params: any[] = [];
      
      if (parentId !== undefined) {
        if (parentId === 'root' || parentId === 'null' || parentId === '') {
          sql += ' AND (parentId IS NULL OR parentId = "")';
        } else {
          sql += ' AND parentId = ?';
          params.push(parentId);
        }
      }
      
      sql += ' ORDER BY sortOrder ASC';
      const categories = (db as any).db.prepare(sql).all(...params);
      
      res.json({ success: true, data: categories });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取课程列表（V2）
  router.get('/training/v2/courses', (req, res) => {
    try {
      const { categoryId, courseType, status, keyword, targetType, page = 1, pageSize = 10 } = req.query as any;
      const offset = (Number(page) - 1) * Number(pageSize);
      
      let sql = 'SELECT * FROM training_courses_v2 WHERE 1=1';
      let countSql = 'SELECT COUNT(*) as total FROM training_courses_v2 WHERE 1=1';
      const params: any[] = [];
      
      if (categoryId) {
        sql += ' AND categoryId = ?';
        countSql += ' AND categoryId = ?';
        params.push(categoryId);
      }
      if (courseType) {
        sql += ' AND courseType = ?';
        countSql += ' AND courseType = ?';
        params.push(courseType);
      }
      if (status) {
        sql += ' AND status = ?';
        countSql += ' AND status = ?';
        params.push(status);
      } else {
        sql += " AND status = 'published'";
        countSql += " AND status = 'published'";
      }
      if (keyword) {
        sql += ' AND (title LIKE ? OR subtitle LIKE ? OR description LIKE ?)';
        countSql += ' AND (title LIKE ? OR subtitle LIKE ? OR description LIKE ?)';
        const kw = `%${keyword}%`;
        params.push(kw, kw, kw);
      }
      if (targetType) {
        sql += ' AND targetType = ?';
        countSql += ' AND targetType = ?';
        params.push(targetType);
      }
      
      const total = ((db as any).db.prepare(countSql).get(...params) as any).total;
      
      sql += ' ORDER BY isMandatory DESC, enrollmentCount DESC, publishedAt DESC LIMIT ? OFFSET ?';
      const courses = (db as any).db.prepare(sql).all(...params, Number(pageSize), offset);
      
      res.json({ success: true, data: courses, total, page: Number(page), pageSize: Number(pageSize) });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取课程详情（V2）
  router.get('/training/v2/courses/:id', (req, res) => {
    try {
      const { id } = req.params;
      const course = (db as any).db.prepare('SELECT * FROM training_courses_v2 WHERE id = ?').get(id);
      
      if (!course) {
        res.json({ success: false, message: '课程不存在' });
        return;
      }
      
      // 获取章节列表
      const chapters = (db as any).db.prepare(
        'SELECT * FROM training_chapters WHERE courseId = ? ORDER BY sortOrder ASC'
      ).all(id);
      
      // 获取评价统计
      const reviewStats = (db as any).db.prepare(`
        SELECT 
          COUNT(*) as total,
          AVG(rating) as avgRating,
          SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as fiveStar,
          SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as fourStar,
          SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as threeStar,
          SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as twoStar,
          SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as oneStar
        FROM training_reviews WHERE courseId = ? AND status = 'published'
      `).get(id) as any;
      
      res.json({ 
        success: true, 
        data: { ...course, chapters, reviewStats } 
      });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取章节内容
  router.get('/training/v2/chapters/:id', (req, res) => {
    try {
      const { id } = req.params;
      const chapter = (db as any).db.prepare('SELECT * FROM training_chapters WHERE id = ?').get(id);
      
      if (!chapter) {
        res.json({ success: false, message: '章节不存在' });
        return;
      }
      
      res.json({ success: true, data: chapter });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取课程评价列表
  router.get('/training/v2/reviews', (req, res) => {
    try {
      const { courseId, page = 1, pageSize = 10 } = req.query as any;
      const offset = (Number(page) - 1) * Number(pageSize);
      
      if (!courseId) {
        res.json({ success: false, message: '缺少课程ID' });
        return;
      }
      
      const total = ((db as any).db.prepare(
        "SELECT COUNT(*) as total FROM training_reviews WHERE courseId = ? AND status = 'published'"
      ).get(courseId) as any).total;
      
      const reviews = (db as any).db.prepare(`
        SELECT * FROM training_reviews 
        WHERE courseId = ? AND status = 'published'
        ORDER BY createdAt DESC 
        LIMIT ? OFFSET ?
      `).all(courseId, Number(pageSize), offset);
      
      res.json({ success: true, data: reviews, total, page: Number(page), pageSize: Number(pageSize) });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 创建课程（管理员）
  router.post('/training/v2/courses', (req, res) => {
    try {
      const {
        title, subtitle, coverUrl, categoryId, categoryName, courseType,
        teacherId, teacherName, description, targetType, targetValues,
        completionType, completionValue, credit, durationMinutes,
        isMandatory, isPublic, tags
      } = req.body;
      
      const id = `course_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();
      
      (db as any).db.prepare(`
        INSERT INTO training_courses_v2 (
          id, title, subtitle, coverUrl, categoryId, categoryName, courseType,
          teacherId, teacherName, description, targetType, targetValues,
          completionType, completionValue, credit, durationMinutes,
          isMandatory, isPublic, status, tags, createdAt, updatedAt
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(
        id, title, subtitle || '', coverUrl || '', categoryId || '', categoryName || '', courseType || 'video',
        teacherId || '', teacherName || '', description || '', targetType || 'all', JSON.stringify(targetValues || []),
        completionType || 'duration', completionValue || 100, credit || 0, durationMinutes || 0,
        isMandatory ? 1 : 0, isPublic !== false ? 1 : 0, 'draft', JSON.stringify(tags || []), now, now
      );
      
      const course = (db as any).db.prepare('SELECT * FROM training_courses_v2 WHERE id = ?').get(id);
      res.json({ success: true, data: course });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 更新课程
  router.put('/training/v2/courses/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      delete updates.id;
      delete updates.createdAt;
      updates.updatedAt = new Date().toISOString();
      
      if (updates.targetValues && Array.isArray(updates.targetValues)) {
        updates.targetValues = JSON.stringify(updates.targetValues);
      }
      if (updates.tags && Array.isArray(updates.tags)) {
        updates.tags = JSON.stringify(updates.tags);
      }
      
      const keys = Object.keys(updates);
      if (keys.length > 0) {
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => updates[k]);
        (db as any).db.prepare(`UPDATE training_courses_v2 SET ${setClause} WHERE id = ?`).run(...values, id);
      }
      
      const course = (db as any).db.prepare('SELECT * FROM training_courses_v2 WHERE id = ?').get(id);
      res.json({ success: true, data: course });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 发布课程
  router.post('/training/v2/courses/:id/publish', (req, res) => {
    try {
      const { id } = req.params;
      const now = new Date().toISOString();
      
      (db as any).db.prepare(
        "UPDATE training_courses_v2 SET status = 'published', publishedAt = ?, updatedAt = ? WHERE id = ?"
      ).run(now, now, id);
      
      res.json({ success: true, message: '课程发布成功' });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 添加章节
  router.post('/training/v2/chapters', (req, res) => {
    try {
      const {
        courseId, title, description, chapterType, sortOrder, required,
        content, contentLength, videoUrl, videoDuration,
        examDuration, passingScore, attachments
      } = req.body;
      
      const id = `ch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();
      
      (db as any).db.prepare(`
        INSERT INTO training_chapters (
          id, courseId, title, description, chapterType, sortOrder, required,
          content, contentLength, videoUrl, videoDuration,
          examDuration, passingScore, attachments, createdAt, updatedAt
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(
        id, courseId, title, description || '', chapterType, sortOrder || 0, required !== false ? 1 : 0,
        content || null, contentLength || 0, videoUrl || '', videoDuration || 0,
        examDuration || null, passingScore || null, JSON.stringify(attachments || []), now, now
      );
      
      // 更新课程章节数
      const chapterCount = ((db as any).db.prepare(
        'SELECT COUNT(*) as c FROM training_chapters WHERE courseId = ?'
      ).get(courseId) as any).c;
      (db as any).db.prepare(
        'UPDATE training_courses_v2 SET chapterCount = ?, updatedAt = ? WHERE id = ?'
      ).run(chapterCount, now, courseId);
      
      const chapter = (db as any).db.prepare('SELECT * FROM training_chapters WHERE id = ?').get(id);
      res.json({ success: true, data: chapter });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 更新章节
  router.put('/training/v2/chapters/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      delete updates.id;
      delete updates.createdAt;
      updates.updatedAt = new Date().toISOString();
      
      if (updates.attachments && Array.isArray(updates.attachments)) {
        updates.attachments = JSON.stringify(updates.attachments);
      }
      
      const keys = Object.keys(updates);
      if (keys.length > 0) {
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => updates[k]);
        (db as any).db.prepare(`UPDATE training_chapters SET ${setClause} WHERE id = ?`).run(...values, id);
      }
      
      const chapter = (db as any).db.prepare('SELECT * FROM training_chapters WHERE id = ?').get(id);
      res.json({ success: true, data: chapter });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取我的学习记录（V2增强版）
  router.get('/training/v2/my/learning', (req, res) => {
    try {
      const { employeeId, status } = req.query as any;
      
      if (!employeeId) {
        res.json({ success: false, message: '缺少员工ID' });
        return;
      }
      
      let sql = `
        SELECT 
          lp.*,
          c.title as courseName,
          c.coverUrl,
          c.categoryName,
          c.courseType,
          c.teacherName,
          c.credit,
          c.durationMinutes,
          c.chapterCount
        FROM training_learning_progress lp
        LEFT JOIN training_courses_v2 c ON lp.courseId = c.id
        WHERE lp.employeeId = ?
      `;
      const params: any[] = [employeeId];
      
      if (status) {
        sql += ' AND lp.status = ?';
        params.push(status);
      }
      
      sql += ' ORDER BY lp.lastAccessAt DESC';
      
      const records = (db as any).db.prepare(sql).all(...params);
      
      // 格式化数据
      const data = records.map((r: any) => ({
        ...r,
        coverUrl: r.coverUrl || `https://picsum.photos/seed/${r.courseId}/400/225`,
        progressPercent: r.progressPercent || 0,
        totalWatchTime: r.totalWatchTime || 0,
        lastAccessAt: r.lastAccessAt || r.createdAt,
      }));
      
      res.json({ success: true, data });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 保存章节学习进度（文字/视频通用）
  router.post('/training/v2/progress', (req, res) => {
    try {
      const { employeeId, employeeName, courseId, courseName, chapterId, chapterType, position, duration, totalLength } = req.body;
      const now = new Date().toISOString();
      
      // 计算进度
      let progressPercent = 0;
      if (chapterType === 'video' && duration > 0) {
        progressPercent = Math.min(100, (position / duration) * 100);
      } else if (chapterType === 'text' && totalLength > 0) {
        progressPercent = Math.min(100, (position / totalLength) * 100);
      } else {
        progressPercent = 100; // 其他类型直接标记完成
      }
      
      // 查找或创建学习记录
      const existing = (db as any).db.prepare(
        'SELECT * FROM training_learning_progress WHERE employeeId = ? AND courseId = ?'
      ).get(employeeId, courseId) as any;
      
      if (existing) {
        // 更新进度
        let totalWatchTime = existing.totalWatchTime || 0;
        if (chapterType === 'video') {
          totalWatchTime += Math.abs(position - (existing.videoPosition || 0));
        }
        
        const newStatus = progressPercent >= 100 ? 'completed' : 
                          progressPercent > 0 ? 'in_progress' : existing.status;
        
        (db as any).db.prepare(`
          UPDATE training_learning_progress SET 
            chapterId = ?,
            videoPosition = ?,
            videoDuration = ?,
            progressPercent = ?,
            lastPosition = ?,
            status = ?,
            totalWatchTime = ?,
            watchCount = watchCount + 1,
            lastAccessAt = ?,
            completedAt = ?
          WHERE employeeId = ? AND courseId = ?
        `).run(
          chapterId || existing.chapterId,
          chapterType === 'video' ? position : existing.videoPosition,
          duration || existing.videoDuration,
          Math.max(existing.progressPercent || 0, progressPercent),
          position,
          newStatus,
          totalWatchTime,
          now,
          newStatus === 'completed' ? now : null,
          employeeId,
          courseId
        );
      } else {
        // 创建新记录
        const id = `lp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const newStatus = progressPercent >= 100 ? 'completed' : progressPercent > 0 ? 'in_progress' : 'not_started';
        
        (db as any).db.prepare(`
          INSERT INTO training_learning_progress (
            id, employeeId, employeeName, courseId, courseName, chapterId,
            videoPosition, videoDuration, progressPercent, lastPosition,
            status, totalWatchTime, watchCount, firstAccessAt, lastAccessAt, completedAt
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).run(
          id, employeeId, employeeName || '', courseId, courseName || '',
          chapterId || null,
          chapterType === 'video' ? position : 0,
          duration || 0,
          progressPercent,
          position,
          newStatus,
          chapterType === 'video' ? position : 0,
          1,
          now, now,
          newStatus === 'completed' ? now : null
        );
      }
      
      // 更新课程完成人数统计
      const completedCount = ((db as any).db.prepare(
        "SELECT COUNT(*) as c FROM training_learning_progress WHERE courseId = ? AND status = 'completed'"
      ).get(courseId) as any).c;
      (db as any).db.prepare(
        'UPDATE training_courses_v2 SET completionCount = ? WHERE id = ?'
      ).run(completedCount, courseId);
      
      res.json({ success: true, progressPercent });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取员工课程学习进度（单个课程）
  router.get('/training/v2/progress/:courseId', (req, res) => {
    try {
      const { courseId } = req.params;
      const { employeeId } = req.query as any;
      
      if (!employeeId) {
        res.json({ success: false, message: '缺少员工ID' });
        return;
      }
      
      const progress = (db as any).db.prepare(
        'SELECT * FROM training_learning_progress WHERE employeeId = ? AND courseId = ?'
      ).get(employeeId, courseId);
      
      // 获取课程章节完成情况
      const chapters = (db as any).db.prepare(
        'SELECT id, title, chapterType, sortOrder FROM training_chapters WHERE courseId = ? ORDER BY sortOrder'
      ).all(courseId) as any[];
      
      res.json({ 
        success: true, 
        data: {
          progress: progress || { videoPosition: 0, progressPercent: 0, status: 'not_started' },
          chapters: chapters.map(ch => ({ ...ch, completed: false }))
        }
      });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 添加学习笔记
  router.post('/training/v2/notes', (req, res) => {
    try {
      const { employeeId, employeeName, courseId, chapterId, noteType, content, highlightText, position } = req.body;
      
      const id = `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();
      
      (db as any).db.prepare(`
        INSERT INTO training_notes (
          id, employeeId, employeeName, courseId, chapterId, noteType,
          content, highlightText, position, createdAt, updatedAt
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `).run(
        id, employeeId, employeeName || '', courseId || '', chapterId || '',
        noteType || 'note', content, highlightText || null, position ? JSON.stringify(position) : null, now, now
      );
      
      const note = (db as any).db.prepare('SELECT * FROM training_notes WHERE id = ?').get(id);
      res.json({ success: true, data: note });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取我的笔记
  router.get('/training/v2/notes', (req, res) => {
    try {
      const { employeeId, courseId, chapterId } = req.query as any;
      
      if (!employeeId) {
        res.json({ success: false, message: '缺少员工ID' });
        return;
      }
      
      let sql = 'SELECT * FROM training_notes WHERE employeeId = ?';
      const params: any[] = [employeeId];
      
      if (courseId) {
        sql += ' AND courseId = ?';
        params.push(courseId);
      }
      if (chapterId) {
        sql += ' AND chapterId = ?';
        params.push(chapterId);
      }
      
      sql += ' ORDER BY createdAt DESC';
      
      const notes = (db as any).db.prepare(sql).all(...params);
      res.json({ success: true, data: notes });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 删除笔记
  router.delete('/training/v2/notes/:id', (req, res) => {
    try {
      const { id } = req.params;
      (db as any).db.prepare('DELETE FROM training_notes WHERE id = ?').run(id);
      res.json({ success: true, message: '笔记已删除' });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 添加课程评价
  router.post('/training/v2/reviews', (req, res) => {
    try {
      const { courseId, employeeId, employeeName, rating, content, pros, cons, isAnonymous } = req.body;
      
      const id = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();
      
      (db as any).db.prepare(`
        INSERT INTO training_reviews (
          id, courseId, employeeId, employeeName, rating, content,
          pros, cons, isAnonymous, status, createdAt, updatedAt
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(
        id, courseId, employeeId, employeeName || '', rating, content || '',
        pros || '', cons || '', isAnonymous ? 1 : 0, 'published', now, now
      );
      
      // 更新课程评分
      const stats = (db as any).db.prepare(`
        SELECT COUNT(*) as total, AVG(rating) as avgRating
        FROM training_reviews WHERE courseId = ? AND status = 'published'
      `).get(courseId) as any;
      
      (db as any).db.prepare(
        'UPDATE training_courses_v2 SET rating = ?, reviewCount = ? WHERE id = ?'
      ).run(Math.round((stats.avgRating || 0) * 10) / 10, stats.total, courseId);
      
      const review = (db as any).db.prepare('SELECT * FROM training_reviews WHERE id = ?').get(id);
      res.json({ success: true, data: review });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取培训统计
  router.get('/training/v2/stats', (req, res) => {
    try {
      const { employeeId } = req.query as any;
      
      const stats: Record<string, any> = {
        totalCourses: ((db as any).db.prepare(
          "SELECT COUNT(*) as c FROM training_courses_v2 WHERE status = 'published'"
        ).get() as any).c,
        totalEnrollments: ((db as any).db.prepare(
          'SELECT COUNT(*) as c FROM training_learning_progress'
        ).get() as any).c,
        totalCompletions: ((db as any).db.prepare(
          "SELECT COUNT(*) as c FROM training_learning_progress WHERE status = 'completed'"
        ).get() as any).c,
        totalReviews: ((db as any).db.prepare(
          'SELECT COUNT(*) as c FROM training_reviews WHERE status = "published"'
        ).get() as any).c,
      };
      
      // 如果有员工ID，获取个人统计
      if (employeeId) {
        const myStats = {
          enrolledCourses: ((db as any).db.prepare(
            'SELECT COUNT(*) as c FROM training_learning_progress WHERE employeeId = ?'
          ).get(employeeId) as any).c,
          completedCourses: ((db as any).db.prepare(
            "SELECT COUNT(*) as c FROM training_learning_progress WHERE employeeId = ? AND status = 'completed'"
          ).get(employeeId) as any).c,
          totalLearningTime: ((db as any).db.prepare(
            'SELECT COALESCE(SUM(totalWatchTime), 0) as t FROM training_learning_progress WHERE employeeId = ?'
          ).get(employeeId) as any).t,
          pendingCourses: ((db as any).db.prepare(
            "SELECT COUNT(*) as c FROM training_courses_v2 WHERE status = 'published' AND isMandatory = 1 AND id NOT IN (SELECT courseId FROM training_learning_progress WHERE employeeId = ? AND status = 'completed')"
          ).get(employeeId) as any).c,
          totalCredits: ((db as any).db.prepare(`
            SELECT COALESCE(SUM(c.credit), 0) as t 
            FROM training_learning_progress lp
            JOIN training_courses_v2 c ON lp.courseId = c.id
            WHERE lp.employeeId = ? AND lp.status = 'completed'
          `).get(employeeId) as any).t,
        };
        stats['myStats'] = myStats;
      }
      
      res.json({ success: true, data: stats });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // ============ 直播系统 API ============

  // 获取直播列表
  router.get('/training/live', (req, res) => {
    try {
      const { status, page = 1, pageSize = 20 } = req.query as any;
      
      let query = 'SELECT * FROM training_live_sessions WHERE 1=1';
      const params: any[] = [];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY createdAt DESC';
      
      // 分页
      const offset = (page - 1) * pageSize;
      query += ` LIMIT ${pageSize} OFFSET ${offset}`;
      
      const sessions = ((db as any).db.prepare(query).all(...params) as any[]).map((s: any) => ({
        ...s,
        viewerCount: s.viewerCount || 0,
        maxViewerCount: s.maxViewerCount || 0,
        totalDuration: s.totalDuration || 0,
      }));
      
      // 获取总数
      let countQuery = 'SELECT COUNT(*) as total FROM training_live_sessions WHERE 1=1';
      if (status) countQuery += ' AND status = ?';
      const total = ((db as any).db.prepare(countQuery).get(...params) as any).total;
      
      res.json({ success: true, data: sessions, total, page, pageSize });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取直播详情
  router.get('/training/live/:id', (req, res) => {
    try {
      const { id } = req.params;
      const session = (db as any).db.prepare(
        'SELECT * FROM training_live_sessions WHERE id = ?'
      ).get(id);
      
      if (!session) {
        res.json({ success: false, message: '直播不存在' });
        return;
      }
      
      // 获取关联的章节信息
      if (session.chapterId) {
        const chapter = ((db as any).db.prepare(
          'SELECT * FROM training_chapters WHERE id = ?'
        ).get(session.chapterId) as any);
        if (chapter) {
          session.chapter = chapter;
          // 获取课程信息
          const course = ((db as any).db.prepare(
            'SELECT * FROM training_courses_v2 WHERE id = ?'
          ).get(chapter.courseId) as any);
          session.course = course;
        }
      }
      
      res.json({ success: true, data: session });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 创建直播
  router.post('/training/live', (req, res) => {
    try {
      const { chapterId, title, description, streamKey } = req.body;
      
      const id = `live_${Date.now()}`;
      const key = streamKey || `live_${Date.now()}`;
      
      const session = {
        id,
        chapterId: chapterId || null,
        title: title || '未命名直播',
        description: description || '',
        streamKey: key,
        streamUrl: `rtmp://your-stream-server.com/live/${key}`,
        pullUrl: `http://your-cdn.com/live/${key}.m3u8`,
        status: 'pending',
        viewerCount: 0,
        maxViewerCount: 0,
        totalDuration: 0,
        recordUrl: null,
        startedAt: null,
        endedAt: null,
        createdAt: new Date().toISOString(),
      };
      
      ((db as any).db.prepare(`
        INSERT INTO training_live_sessions 
        (id, chapterId, title, description, streamKey, streamUrl, pullUrl, status, viewerCount, maxViewerCount, totalDuration, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        session.id, session.chapterId, session.title, session.description,
        session.streamKey, session.streamUrl, session.pullUrl, session.status,
        session.viewerCount, session.maxViewerCount, session.totalDuration, session.createdAt
      ));
      
      res.json({ success: true, data: session });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 开始直播
  router.put('/training/live/:id/start', (req, res) => {
    try {
      const { id } = req.params;
      
      ((db as any).db.prepare(`
        UPDATE training_live_sessions 
        SET status = 'live', startedAt = ?, viewerCount = 0, maxViewerCount = 0, totalDuration = 0
        WHERE id = ?
      `).run(new Date().toISOString(), id));
      
      const session = ((db as any).db.prepare(
        'SELECT * FROM training_live_sessions WHERE id = ?'
      ).get(id));
      
      res.json({ success: true, data: session });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 结束直播
  router.put('/training/live/:id/stop', (req, res) => {
    try {
      const { id } = req.params;
      
      const session = ((db as any).db.prepare(
        'SELECT * FROM training_live_sessions WHERE id = ?'
      ).get(id) as any);
      
      if (!session) {
        res.json({ success: false, message: '直播不存在' });
        return;
      }
      
      // 计算直播时长
      let duration = 0;
      if (session.startedAt) {
        duration = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
      }
      
      ((db as any).db.prepare(`
        UPDATE training_live_sessions 
        SET status = 'ended', endedAt = ?, totalDuration = ?
        WHERE id = ?
      `).run(new Date().toISOString(), duration, id));
      
      const updated = ((db as any).db.prepare(
        'SELECT * FROM training_live_sessions WHERE id = ?'
      ).get(id));
      
      res.json({ success: true, data: updated });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 删除直播
  router.delete('/training/live/:id', (req, res) => {
    try {
      const { id } = req.params;
      
      ((db as any).db.prepare('DELETE FROM training_live_messages WHERE sessionId = ?').run(id));
      ((db as any).db.prepare('DELETE FROM training_live_attendances WHERE sessionId = ?').run(id));
      ((db as any).db.prepare('DELETE FROM training_live_sessions WHERE id = ?').run(id));
      
      res.json({ success: true });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 进入直播间
  router.post('/training/live/:id/enter', (req, res) => {
    try {
      const { id } = req.params;
      const { employeeId, employeeName } = req.body;
      
      const session = ((db as any).db.prepare(
        'SELECT * FROM training_live_sessions WHERE id = ?'
      ).get(id) as any);
      
      if (!session) {
        res.json({ success: false, message: '直播不存在' });
        return;
      }
      
      // 更新观看人数
      const newCount = (session.viewerCount || 0) + 1;
      const maxCount = Math.max(session.maxViewerCount || 0, newCount);
      
      ((db as any).db.prepare(`
        UPDATE training_live_sessions 
        SET viewerCount = ?, maxViewerCount = ?
        WHERE id = ?
      `).run(newCount, maxCount, id));
      
      // 记录观看历史
      const existing = ((db as any).db.prepare(
        'SELECT * FROM training_live_attendances WHERE sessionId = ? AND userId = ?'
      ).get(id, employeeId));
      
      if (!existing) {
        ((db as any).db.prepare(`
          INSERT INTO training_live_attendances (id, sessionId, userId, userName, createdAt)
          VALUES (?, ?, ?, ?, ?)
        `).run(`att_${Date.now()}`, id, employeeId, employeeName || '匿名用户', new Date().toISOString()));
      }
      
      res.json({ success: true, viewerCount: newCount });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取直播消息/弹幕
  router.get('/training/live/:id/messages', (req, res) => {
    try {
      const { id } = req.params;
      const { type, page = 1, pageSize = 50 } = req.query as any;
      
      let query = 'SELECT * FROM training_live_messages WHERE sessionId = ?';
      const params: any[] = [id];
      
      if (type) {
        query += ' AND messageType = ?';
        params.push(type);
      }
      
      query += ' ORDER BY createdAt DESC';
      
      const offset = (page - 1) * pageSize;
      query += ` LIMIT ${pageSize} OFFSET ${offset}`;
      
      const messages = ((db as any).db.prepare(query).all(...params) as any[]).map((m: any) => ({
        ...m,
        isHidden: m.isHidden === 1,
      }));
      
      res.json({ success: true, data: messages.reverse() });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 发送消息/弹幕
  router.post('/training/live/:id/messages', (req, res) => {
    try {
      const { id } = req.params;
      const { userId, userName, type = 'chat', content } = req.body;
      
      if (!content) {
        res.json({ success: false, message: '消息内容不能为空' });
        return;
      }
      
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      ((db as any).db.prepare(`
        INSERT INTO training_live_messages (id, sessionId, userId, userName, messageType, content, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(messageId, id, userId, userName || '匿名用户', type, content, new Date().toISOString()));
      
      const message = ((db as any).db.prepare(
        'SELECT * FROM training_live_messages WHERE id = ?'
      ).get(messageId));
      
      res.json({ success: true, data: message });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 隐藏消息（管理员）
  router.put('/training/live/:id/messages/:msgId/hide', (req, res) => {
    try {
      const { msgId } = req.params;
      
      ((db as any).db.prepare(
        'UPDATE training_live_messages SET isHidden = 1 WHERE id = ?'
      ).run(msgId));
      
      res.json({ success: true });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 取消隐藏消息（管理员）
  router.put('/training/live/:id/messages/:msgId/unhide', (req, res) => {
    try {
      const { msgId } = req.params;
      
      ((db as any).db.prepare(
        'UPDATE training_live_messages SET isHidden = 0 WHERE id = ?'
      ).run(msgId));
      
      res.json({ success: true });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 直播签到
  router.post('/training/live/:id/signin', (req, res) => {
    try {
      const { id } = req.params;
      const { employeeId, employeeName, duration = 0 } = req.body;
      
      const existing = ((db as any).db.prepare(
        'SELECT * FROM training_live_attendances WHERE sessionId = ? AND userId = ?'
      ).get(id, employeeId) as any);
      
      if (existing) {
        // 更新观看时长
        ((db as any).db.prepare(`
          UPDATE training_live_attendances 
          SET checkinTime = ?, durationWatched = ?
          WHERE id = ?
        `).run(new Date().toISOString(), duration, existing.id));
      } else {
        // 新增签到记录
        ((db as any).db.prepare(`
          INSERT INTO training_live_attendances (id, sessionId, userId, userName, checkinTime, durationWatched, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          `att_${Date.now()}`, id, employeeId, employeeName || '匿名用户',
          new Date().toISOString(), duration, new Date().toISOString()
        ));
      }
      
      res.json({ success: true });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取直播统计
  router.get('/training/live/:id/stats', (req, res) => {
    try {
      const { id } = req.params;
      
      const session = ((db as any).db.prepare(
        'SELECT * FROM training_live_sessions WHERE id = ?'
      ).get(id) as any);
      
      if (!session) {
        res.json({ success: false, message: '直播不存在' });
        return;
      }
      
      // 获取观看人数统计
      const attendance = ((db as any).db.prepare(`
        SELECT 
          COUNT(*) as totalAttendees,
          SUM(durationWatched) as totalDuration
        FROM training_live_attendances WHERE sessionId = ?
      `).get(id) as any);
      
      // 获取消息统计
      const messageStats = ((db as any).db.prepare(`
        SELECT messageType, COUNT(*) as count 
        FROM training_live_messages 
        WHERE sessionId = ? AND isHidden = 0
        GROUP BY messageType
      `).all(id) as any[]);
      
      res.json({ 
        success: true, 
        data: {
          ...session,
          totalAttendees: attendance?.totalAttendees || 0,
          totalDuration: attendance?.totalDuration || 0,
          messageStats: messageStats.reduce((acc: any, m: any) => {
            acc[m.messageType] = m.count;
            return acc;
          }, {}),
        }
      });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取直播回放列表
  router.get('/training/live/:id/recordings', (req, res) => {
    try {
      const { id } = req.params;
      
      const session = ((db as any).db.prepare(
        'SELECT * FROM training_live_sessions WHERE id = ? AND status = ?'
      ).get(id, 'ended') as any);
      
      if (!session) {
        res.json({ success: false, message: '直播回放不存在' });
        return;
      }
      
      res.json({ 
        success: true, 
        data: {
          id: session.id,
          title: session.title,
          recordUrl: session.recordUrl,
          duration: session.totalDuration,
          viewCount: session.viewerCount,
          createdAt: session.startedAt,
          endedAt: session.endedAt,
        }
      });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // ============ 课程评价 API ============

  // 获取课程评价列表
  router.get('/training/reviews', (req, res) => {
    try {
      const { courseId, page = 1, pageSize = 20, status = 'published' } = req.query as any;
      
      let query = 'SELECT * FROM training_reviews WHERE 1=1';
      const params: any[] = [];
      
      if (courseId) {
        query += ' AND courseId = ?';
        params.push(courseId);
      }
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY createdAt DESC';
      
      const offset = (page - 1) * pageSize;
      query += ` LIMIT ${pageSize} OFFSET ${offset}`;
      
      const reviews = ((db as any).db.prepare(query).all(...params) as any[]);
      
      // 获取统计信息
      const stats = ((db as any).db.prepare(`
        SELECT 
          COUNT(*) as total,
          AVG(rating) as avgRating,
          SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as fiveStar,
          SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as fourStar,
          SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as threeStar,
          SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as twoStar,
          SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as oneStar
        FROM training_reviews 
        WHERE courseId = ? AND status = 'published'
      `).get(courseId) as any);
      
      res.json({ 
        success: true, 
        data: reviews,
        stats: stats || { total: 0, avgRating: 0 }
      });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 提交课程评价
  router.post('/training/reviews', (req, res) => {
    try {
      const { courseId, employeeId, employeeName, rating, content } = req.body;
      
      if (!content) {
        res.json({ success: false, message: '评价内容不能为空' });
        return;
      }
      
      // 检查是否已评价
      const existing = ((db as any).db.prepare(
        'SELECT * FROM training_reviews WHERE courseId = ? AND userId = ?'
      ).get(courseId, employeeId));
      
      if (existing) {
        res.json({ success: false, message: '您已评价过该课程' });
        return;
      }
      
      const id = `review_${Date.now()}`;
      
      ((db as any).db.prepare(`
        INSERT INTO training_reviews (id, courseId, userId, userName, rating, content, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, 'published', ?)
      `).run(id, courseId, employeeId, employeeName, rating || 5, content, new Date().toISOString()));
      
      const review = ((db as any).db.prepare(
        'SELECT * FROM training_reviews WHERE id = ?'
      ).get(id));
      
      res.json({ success: true, data: review });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 删除评价（管理员）
  router.delete('/training/reviews/:id', (req, res) => {
    try {
      const { id } = req.params;
      
      ((db as any).db.prepare('DELETE FROM training_reviews WHERE id = ?').run(id));
      
      res.json({ success: true });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // ============ 证书 API ============

  // 获取证书列表
  router.get('/training/certificates', (req, res) => {
    try {
      const { employeeId, courseId, status, page = 1, pageSize = 20 } = req.query as any;
      
      let query = 'SELECT * FROM training_certificates WHERE 1=1';
      const params: any[] = [];
      
      if (employeeId) {
        query += ' AND employeeId = ?';
        params.push(employeeId);
      }
      
      if (courseId) {
        query += ' AND courseId = ?';
        params.push(courseId);
      }
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY issueDate DESC';
      
      const offset = (page - 1) * pageSize;
      query += ` LIMIT ${pageSize} OFFSET ${offset}`;
      
      const certificates = ((db as any).db.prepare(query).all(...params) as any[]);
      
      res.json({ success: true, data: certificates });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取证书详情
  router.get('/training/certificates/:id', (req, res) => {
    try {
      const { id } = req.params;
      
      const certificate = ((db as any).db.prepare(
        'SELECT * FROM training_certificates WHERE id = ?'
      ).get(id));
      
      if (!certificate) {
        res.json({ success: false, message: '证书不存在' });
        return;
      }
      
      res.json({ success: true, data: certificate });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 颁发证书（管理员）
  router.post('/training/certificates', (req, res) => {
    try {
      const { employeeId, employeeName, employeeDept, courseId, courseName, credit, template, expiryYears = 2 } = req.body;
      
      const id = `cert_${Date.now()}`;
      const issueDate = new Date().toISOString();
      const expiryDate = new Date(Date.now() + expiryYears * 365 * 24 * 60 * 60 * 1000).toISOString();
      const certificateNo = `FEIDA-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Date.now()).slice(-6)}`;
      
      ((db as any).db.prepare(`
        INSERT INTO training_certificates 
        (id, employeeId, employeeName, employeeDept, courseId, courseName, credit, template, issueDate, expiryDate, certificateNo, status, issuedBy, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', '培训管理员', ?)
      `).run(
        id, employeeId, employeeName, employeeDept, courseId, courseName,
        credit || 0, template || 'standard', issueDate, expiryDate, certificateNo, issueDate
      ));
      
      const certificate = ((db as any).db.prepare(
        'SELECT * FROM training_certificates WHERE id = ?'
      ).get(id));
      
      res.json({ success: true, data: certificate });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 验证证书
  router.get('/training/certificates/verify/:certificateNo', (req, res) => {
    try {
      const { certificateNo } = req.params;
      
      const certificate = ((db as any).db.prepare(
        'SELECT * FROM training_certificates WHERE certificateNo = ?'
      ).get(certificateNo) as any);
      
      if (!certificate) {
        res.json({ success: false, message: '证书不存在或已撤销' });
        return;
      }
      
      // 检查是否过期
      if (certificate.expiryDate && new Date(certificate.expiryDate) < new Date()) {
        ((db as any).db.prepare(
          "UPDATE training_certificates SET status = 'expired' WHERE id = ?"
        ).run(certificate.id));
        certificate.status = 'expired';
      }
      
      res.json({ 
        success: true, 
        data: {
          employeeName: certificate.employeeName,
          courseName: certificate.courseName,
          issueDate: certificate.issueDate,
          expiryDate: certificate.expiryDate,
          status: certificate.status,
          isValid: certificate.status === 'active'
        }
      });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 撤销证书（管理员）
  router.put('/training/certificates/:id/revoke', (req, res) => {
    try {
      const { id } = req.params;
      
      ((db as any).db.prepare(
        "UPDATE training_certificates SET status = 'revoked' WHERE id = ?"
      ).run(id));
      
      res.json({ success: true });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // ============ 学习报表 API ============

  // 获取个人学习报表
  router.get('/training/reports/personal', (req, res) => {
    try {
      const { employeeId } = req.query as any;
      
      if (!employeeId) {
        res.json({ success: false, message: '请提供员工ID' });
        return;
      }
      
      // 学习进度统计
      const progressStats = ((db as any).db.prepare(`
        SELECT 
          COUNT(*) as totalCourses,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedCourses,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgressCourses,
          COALESCE(SUM(totalWatchTime), 0) as totalLearningTime
        FROM training_learning_progress 
        WHERE employeeId = ?
      `).get(employeeId) as any);
      
      // 获得学分
      const creditStats = ((db as any).db.prepare(`
        SELECT COALESCE(SUM(c.credit), 0) as totalCredits
        FROM training_learning_progress lp
        JOIN training_courses_v2 c ON lp.courseId = c.id
        WHERE lp.employeeId = ? AND lp.status = 'completed'
      `).get(employeeId) as any);
      
      // 评分统计
      const ratingStats = ((db as any).db.prepare(`
        SELECT AVG(rating) as avgRating, COUNT(*) as reviewCount
        FROM training_reviews
        WHERE userId = ?
      `).get(employeeId) as any);
      
      // 学习日历（最近30天）
      const calendarData: Record<string, number> = {};
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        calendarData[dateStr] = Math.floor(Math.random() * 120) + 10; // 模拟数据
      }
      
      res.json({ 
        success: true, 
        data: {
          personalStats: {
            ...progressStats,
            totalCredits: creditStats?.totalCredits || 0,
            avgRating: ratingStats?.avgRating || 0,
            reviewCount: ratingStats?.reviewCount || 0
          },
          learningCalendar: calendarData,
          currentStreak: 5,
          longestStreak: 12
        }
      });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取部门学习报表
  router.get('/training/reports/department', (req, res) => {
    try {
      const { deptId } = req.query as any;
      
      // 模拟部门数据
      const deptStats = [
        {
          deptId: 'd1',
          deptName: '技术研发部',
          totalEmployees: 45,
          avgCompletionRate: 72,
          activeLearners: 38,
          topLearners: [
            { name: '李明', courses: 12, time: 480 },
            { name: '王芳', courses: 10, time: 420 }
          ]
        },
        {
          deptId: 'd2',
          deptName: '市场营销部',
          totalEmployees: 30,
          avgCompletionRate: 65,
          activeLearners: 25,
          topLearners: [
            { name: '刘洋', courses: 8, time: 320 },
            { name: '陈静', courses: 7, time: 280 }
          ]
        }
      ];
      
      res.json({ success: true, data: deptStats });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // 获取课程完成率报表
  router.get('/training/reports/courses', (req, res) => {
    try {
      const courseStats = ((db as any).db.prepare(`
        SELECT 
          c.id,
          c.title as courseName,
          COUNT(lp.id) as totalEnrolled,
          SUM(CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END) as completed,
          AVG(CASE WHEN lp.status = 'completed' THEN 100.0 ELSE 0 END) as completionRate
        FROM training_courses_v2 c
        LEFT JOIN training_learning_progress lp ON c.id = lp.courseId
        WHERE c.status = 'published'
        GROUP BY c.id, c.title
        ORDER BY completionRate DESC
      `).all() as any[]);
      
      res.json({ success: true, data: courseStats });
    } catch (e: any) {
      res.json({ success: false, message: e.message });
    }
  });

  // ============ 数据库管理 API ============

// 数据库初始化（保留核心数据，清空业务数据）
router.post('/db/initialize', (req, res) => {
  try {
    const now = new Date().toISOString();
    
    const safeTables = [
      'permissions', 'roles', 'users', 'system_config',
      'departments', 'positions', 'ranks', 'shift_types',
      'check_locations', 'attendance_rules', 'leave_rule_configs',
      'training_categories', 'workflow_templates',
      'attendance_devices', 'field_definitions', 'reminders',
      'salary_items', 'location_allowances', 'insurance_schemes',
      'assessment_tools', 'competency_items', 'competency_levels',
      'competency_models', 'model_competencies', 'kpis', 'performance_grades'
    ];

    const allTables = db.query("SELECT name FROM sqlite_master WHERE type='table'") as any[];
    const tablesToClear = allTables
      .filter(t => !safeTables.includes(t.name))
      .filter(t => !t.name.startsWith('sqlite_'))
      .map(t => t.name);

    // 清空所有非核心表
    for (const table of tablesToClear) {
      try {
        (db as any).db.prepare(`DELETE FROM ${table}`).run();
      } catch { /* 忽略可能的外键约束错误 */ }
    }

    // 重置自增计数器
    for (const table of allTables.map(t => t.name)) {
      try {
        (db as any).db.prepare(`DELETE FROM sqlite_sequence WHERE name = ?`).run(table);
      } catch {}
    }

    // 更新管理员用户的登录时间
    (db as any).db.prepare('UPDATE users SET lastLoginAt = NULL, lastLoginIp = NULL').run();

    // 记录操作日志
    (db as any).db.prepare(`INSERT INTO audit_logs (id, userId, username, action, module, detail, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      `audit_${Date.now()}`, 'system', 'system', 'db_initialize', 'system', '数据库初始化完成，保留核心数据', now
    );

    res.json({ success: true, message: '数据库初始化完成', clearedTables: tablesToClear.length });
  } catch (e: any) {
    res.json({ success: false, message: e.message });
  }
});

// 数据库压缩（VACUUM）
router.post('/db/compress', (req, res) => {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'ehr.db');
    const beforeSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;
    
    // 执行 VACUUM 操作
    (db as any).db.prepare('VACUUM').run();
    
    const afterSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;
    const savedBytes = beforeSize - afterSize;
    
    res.json({ 
      success: true, 
      message: '数据库压缩完成',
      beforeSize: formatSize(beforeSize),
      afterSize: formatSize(afterSize),
      savedSpace: formatSize(savedBytes)
    });
  } catch (e: any) {
    res.json({ success: false, message: e.message });
  }
});

// 数据库迁移到 PostgreSQL
router.post('/db/migrate/postgres', async (req, res) => {
  try {
    const { host, port, database, username, password } = req.body;
    
    if (!host || !database || !username) {
      res.json({ success: false, message: '请提供完整的数据库连接信息' });
      return;
    }

    // 检查 pg 模块是否可用
    let pg;
    try {
      pg = require('pg');
    } catch {
      res.json({ success: false, message: '未安装 PostgreSQL 驱动，请先安装: npm install pg' });
      return;
    }

    const client = new pg.Client({
      host,
      port: port || 5432,
      database,
      user: username,
      password: password || ''
    });

    try {
      await client.connect();
    } catch (e: any) {
      res.json({ success: false, message: `连接失败: ${e.message}` });
      return;
    }

    try {
      await migrateToPostgres(db, client);
      await client.end();
      
      res.json({ 
        success: true, 
        message: '数据迁移完成' 
      });
    } catch (e: any) {
      await client.end();
      res.json({ success: false, message: `迁移失败: ${e.message}` });
    }
  } catch (e: any) {
    res.json({ success: false, message: e.message });
  }
});

// 数据库迁移到 MySQL
router.post('/db/migrate/mysql', async (req, res) => {
  try {
    const { host, port, database, username, password } = req.body;
    
    if (!host || !database || !username) {
      res.json({ success: false, message: '请提供完整的数据库连接信息' });
      return;
    }

    let mysql;
    try {
      mysql = require('mysql2/promise');
    } catch {
      res.json({ success: false, message: '未安装 MySQL 驱动，请先安装: npm install mysql2' });
      return;
    }

    let connection;
    try {
      connection = await mysql.createConnection({
        host,
        port: port || 3306,
        database,
        user: username,
        password: password || '',
        multipleStatements: true
      });
    } catch (e: any) {
      res.json({ success: false, message: `连接失败: ${e.message}` });
      return;
    }

    try {
      await migrateToMySQL(db, connection);
      await connection.end();
      
      res.json({ 
        success: true, 
        message: '数据迁移完成' 
      });
    } catch (e: any) {
      await connection.end();
      res.json({ success: false, message: `迁移失败: ${e.message}` });
    }
  } catch (e: any) {
    res.json({ success: false, message: e.message });
  }
});

// 迁移到 PostgreSQL 的核心逻辑
async function migrateToPostgres(sqliteDb: any, pgClient: any) {
  const tables = sqliteDb.query("SELECT name FROM sqlite_master WHERE type='table'") as any[];
  
  for (const tableInfo of tables) {
    const tableName = tableInfo.name;
    if (tableName.startsWith('sqlite_')) continue;
    
    // 获取表结构
    const columns = sqliteDb.query(`PRAGMA table_info(${tableName})`) as any[];
    
    // 创建 PostgreSQL 表
    const pgColumns = columns.map(col => {
      let type = mapSqliteTypeToPostgres(col.type);
      const constraints: string[] = [];
      if (col.pk === 1) constraints.push('PRIMARY KEY');
      if (col.notnull === 1) constraints.push('NOT NULL');
      if (col.dflt_value !== null) constraints.push(`DEFAULT ${col.dflt_value}`);
      return `"${col.name}" ${type} ${constraints.join(' ')}`;
    });
    
    await pgClient.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
    await pgClient.query(`CREATE TABLE "${tableName}" (${pgColumns.join(', ')})`);
    
    // 获取数据并插入
    const rows = sqliteDb.findAll(tableName);
    if (rows.length > 0) {
      const colNames = columns.map(c => `"${c.name}"`).join(', ');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      for (const row of rows as any[]) {
        const values = columns.map(col => {
          const val = row[col.name];
          if (val === null || val === undefined) return null;
          if (typeof val === 'object') return JSON.stringify(val);
          return val;
        });
        await pgClient.query(`INSERT INTO "${tableName}" (${colNames}) VALUES (${placeholders})`, values);
      }
    }
  }
}

// 迁移到 MySQL 的核心逻辑
async function migrateToMySQL(sqliteDb: any, connection: any) {
  const tables = sqliteDb.query("SELECT name FROM sqlite_master WHERE type='table'") as any[];
  
  for (const tableInfo of tables) {
    const tableName = tableInfo.name;
    if (tableName.startsWith('sqlite_')) continue;
    
    const columns = sqliteDb.query(`PRAGMA table_info(${tableName})`) as any[];
    
    const mysqlColumns = columns.map(col => {
      let type = mapSqliteTypeToMySQL(col.type);
      let constraints = '';
      if (col.pk === 1) constraints += ' PRIMARY KEY';
      if (col.notnull === 1) constraints += ' NOT NULL';
      return `\`${col.name}\` ${type}${constraints}`;
    });
    
    await connection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
    await connection.execute(`CREATE TABLE \`${tableName}\` (${mysqlColumns.join(', ')})`);
    
    const rows = sqliteDb.findAll(tableName);
    if (rows.length > 0) {
      const colNames = columns.map(c => `\`${c.name}\``).join(', ');
      const placeholders = columns.map(() => '?').join(', ');
      
      for (const row of rows as any[]) {
        const values = columns.map(col => {
          const val = row[col.name];
          if (val === null || val === undefined) return null;
          if (typeof val === 'object') return JSON.stringify(val);
          return val;
        });
        await connection.execute(`INSERT INTO \`${tableName}\` (${colNames}) VALUES (${placeholders})`, values);
      }
    }
  }
}

function mapSqliteTypeToPostgres(type: string): string {
  const upperType = type.toUpperCase();
  if (upperType.includes('INT')) return 'INTEGER';
  if (upperType.includes('TEXT')) return 'TEXT';
  if (upperType.includes('VARCHAR')) return 'TEXT';
  if (upperType.includes('REAL')) return 'DOUBLE PRECISION';
  if (upperType.includes('FLOAT')) return 'DOUBLE PRECISION';
  if (upperType.includes('BOOL')) return 'BOOLEAN';
  if (upperType.includes('DATE')) return 'DATE';
  if (upperType.includes('TIME')) return 'TIME';
  return 'TEXT';
}

function mapSqliteTypeToMySQL(type: string): string {
  const upperType = type.toUpperCase();
  if (upperType.includes('INT')) return 'INT';
  if (upperType.includes('TEXT')) return 'TEXT';
  if (upperType.includes('VARCHAR')) {
    const match = type.match(/VARCHAR\((\d+)\)/);
    return match ? `VARCHAR(${match[1]})` : 'TEXT';
  }
  if (upperType.includes('REAL')) return 'FLOAT';
  if (upperType.includes('FLOAT')) return 'FLOAT';
  if (upperType.includes('BOOL')) return 'TINYINT(1)';
  if (upperType.includes('DATE')) return 'DATE';
  if (upperType.includes('TIME')) return 'TIME';
  return 'TEXT';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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

// ============ 工艺管理/PLM API ============

  // 物料属性类型 CRUD
  router.get('/material-attributes', (req, res) => {
    const list = db.findWhere('material_attributes', { is_active: 1 });
    res.json(list);
  });
  router.post('/material-attributes', (req, res) => {
    const id = `ma_${Date.now()}`;
    db.insert('material_attributes', { id, ...req.body, is_active: 1, created_at: new Date().toISOString() });
    res.json({ success: true, id });
  });
  router.put('/material-attributes/:id', (req, res) => {
    db.update('material_attributes', req.params.id, req.body);
    res.json({ success: true });
  });
  router.delete('/material-attributes/:id', (req, res) => {
    db.update('material_attributes', req.params.id, { is_active: 0 });
    res.json({ success: true });
  });

  // 物料主数据 CRUD
  router.get('/materials', (req, res) => {
    const { category_id, attribute_id, status, keyword } = req.query;
    let list = db.findWhere('materials', {});
    if (category_id) list = list.filter((l: any) => l.category_id === category_id);
    if (attribute_id) list = list.filter((l: any) => l.attribute_id === attribute_id);
    if (status) list = list.filter((l: any) => l.status === status);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      list = (list as any[]).filter((l: any) =>
        l.code?.toLowerCase().includes(kw) || l.name?.toLowerCase().includes(kw)
      );
    }
    res.json(list);
  });
  router.get('/materials/:id', (req, res) => {
    const item = db.findById('materials', req.params.id);
    res.json(item);
  });
  router.post('/materials', (req, res) => {
    const id = `mat_${Date.now()}`;
    const code = req.body.code || `MAT${String(Date.now()).slice(-8)}`;
    db.insert('materials', { id, code, ...req.body, status: 'active', created_at: new Date().toISOString() });
    res.json({ success: true, id });
  });
  router.put('/materials/:id', (req, res) => {
    db.update('materials', req.params.id, req.body);
    res.json({ success: true });
  });
  router.delete('/materials/:id', (req, res) => {
    db.update('materials', req.params.id, { status: 'inactive' });
    res.json({ success: true });
  });

  // 工序库 CRUD
  router.get('/processes', (req, res) => {
    const { department, process_type } = req.query;
    let list = db.findWhere('processes', { is_active: 1 });
    if (department) list = list.filter((l: any) => l.department === department);
    if (process_type) list = list.filter((l: any) => l.process_type === process_type);
    res.json(list);
  });
  router.post('/processes', (req, res) => {
    const id = `proc_${Date.now()}`;
    db.insert('processes', { id, ...req.body, is_active: 1, created_at: new Date().toISOString() });
    res.json({ success: true, id });
  });
  router.put('/processes/:id', (req, res) => {
    db.update('processes', req.params.id, req.body);
    res.json({ success: true });
  });
  router.delete('/processes/:id', (req, res) => {
    db.update('processes', req.params.id, { is_active: 0 });
    res.json({ success: true });
  });

  // 工艺路线 CRUD
  router.get('/process-routes', (req, res) => {
    const list = db.findWhere('process_routes', { status: 'active' });
    res.json(list);
  });
  router.get('/process-routes/:id', (req, res) => {
    const route = db.findById('process_routes', req.params.id);
    const items = db.findWhere('process_route_items', { route_id: req.params.id });
    res.json({ ...route, items });
  });
  router.post('/process-routes', (req, res) => {
    const id = `pr_${Date.now()}`;
    const { items, ...routeData } = req.body;
    db.insert('process_routes', { id, ...routeData, status: 'active', created_at: new Date().toISOString() });
    // 插入工序关联
    if (items && Array.isArray(items)) {
      items.forEach((item: any, index: number) => {
        const itemId = `pri_${Date.now()}_${index}`;
        db.insert('process_route_items', {
          id: itemId,
          route_id: id,
          process_id: item.process_id,
          sort_order: item.sort_order || index,
          standard_time: item.standard_time,
          piece_rate: item.piece_rate,
          description: item.description
        });
      });
    }
    res.json({ success: true, id });
  });
  router.put('/process-routes/:id', (req, res) => {
    const { items, ...routeData } = req.body;
    db.update('process_routes', req.params.id, routeData);
    // 更新工序关联
    if (items !== undefined) {
      db.db!.prepare('DELETE FROM process_route_items WHERE route_id = ?').run(req.params.id);
      if (Array.isArray(items)) {
        items.forEach((item: any, index: number) => {
          const itemId = `pri_${Date.now()}_${index}`;
          db.insert('process_route_items', {
            id: itemId,
            route_id: req.params.id,
            process_id: item.process_id,
            sort_order: item.sort_order || index,
            standard_time: item.standard_time,
            piece_rate: item.piece_rate,
            description: item.description
          });
        });
      }
    }
    res.json({ success: true });
  });
  router.delete('/process-routes/:id', (req, res) => {
    db.update('process_routes', req.params.id, { status: 'inactive' });
    res.json({ success: true });
  });

  // 部件库 CRUD
  router.get('/components', (req, res) => {
    const list = db.findWhere('components', { is_active: 1 });
    res.json(list);
  });
  router.post('/components', (req, res) => {
    const id = `comp_${Date.now()}`;
    db.insert('components', { id, ...req.body, is_active: 1, created_at: new Date().toISOString() });
    res.json({ success: true, id });
  });
  router.put('/components/:id', (req, res) => {
    db.update('components', req.params.id, req.body);
    res.json({ success: true });
  });
  router.delete('/components/:id', (req, res) => {
    db.update('components', req.params.id, { is_active: 0 });
    res.json({ success: true });
  });

  // BOM管理 CRUD
  router.get('/boms', (req, res) => {
    const { product_style_id, bom_type, status } = req.query;
    let list = db.findWhere('boms', {});
    if (product_style_id) list = list.filter((l: any) => l.product_style_id === product_style_id);
    if (bom_type) list = list.filter((l: any) => l.bom_type === bom_type);
    if (status) list = list.filter((l: any) => l.status === status);
    res.json(list);
  });
  router.get('/boms/:id', (req, res) => {
    const bom = db.findById('boms', req.params.id);
    const items = db.findWhere('bom_items', { bom_id: req.params.id });
    res.json({ ...bom, items });
  });
  router.post('/boms', (req, res) => {
    const id = `bom_${Date.now()}`;
    const { items, ...bomData } = req.body;
    db.insert('boms', { id, ...bomData, created_at: new Date().toISOString() });
    // 插入BOM明细
    if (items && Array.isArray(items)) {
      items.forEach((item: any, index: number) => {
        const itemId = `bomi_${Date.now()}_${index}`;
        db.insert('bom_items', {
          id: itemId,
          bom_id: id,
          material_id: item.material_id,
          component_id: item.component_id,
          qty: item.qty || 1,
          unit: item.unit || '双',
          scrap_rate: item.scrap_rate || 0,
          loss_rate: item.loss_rate || 0,
          supply_type: item.supply_type || 'purchase',
          size_id: item.size_id,
          color_id: item.color_id,
          remark: item.remark
        });
      });
    }
    res.json({ success: true, id });
  });
  router.put('/boms/:id', (req, res) => {
    const { items, ...bomData } = req.body;
    db.update('boms', req.params.id, bomData);
    // 更新BOM明细
    if (items !== undefined) {
      db.db!.prepare('DELETE FROM bom_items WHERE bom_id = ?').run(req.params.id);
      if (Array.isArray(items)) {
        items.forEach((item: any, index: number) => {
          const itemId = `bomi_${Date.now()}_${index}`;
          db.insert('bom_items', {
            id: itemId,
            bom_id: req.params.id,
            material_id: item.material_id,
            component_id: item.component_id,
            qty: item.qty || 1,
            unit: item.unit || '双',
            scrap_rate: item.scrap_rate || 0,
            loss_rate: item.loss_rate || 0,
            supply_type: item.supply_type || 'purchase',
            size_id: item.size_id,
            color_id: item.color_id,
            remark: item.remark
          });
        });
      }
    }
    res.json({ success: true });
  });
  router.delete('/boms/:id', (req, res) => {
    db.update('boms', req.params.id, { status: 'obsolete' });
    res.json({ success: true });
  });
  router.post('/boms/:id/approve', (req, res) => {
    const { approved_by } = req.body;
    db.update('boms', req.params.id, {
      status: 'approved',
      approved_by,
      approved_at: new Date().toISOString()
    });
    res.json({ success: true });
  });

  // 损耗规则 CRUD
  router.get('/scrap-rules', (req, res) => {
    const { rule_type } = req.query;
    let list = db.findWhere('scrap_rules', { is_active: 1 });
    if (rule_type) list = list.filter((l: any) => l.rule_type === rule_type);
    res.json(list);
  });
  router.post('/scrap-rules', (req, res) => {
    const id = `sr_${Date.now()}`;
    db.insert('scrap_rules', { id, ...req.body, is_active: 1, created_at: new Date().toISOString() });
    res.json({ success: true, id });
  });
  router.put('/scrap-rules/:id', (req, res) => {
    db.update('scrap_rules', req.params.id, req.body);
    res.json({ success: true });
  });
  router.delete('/scrap-rules/:id', (req, res) => {
    db.update('scrap_rules', req.params.id, { is_active: 0 });
    res.json({ success: true });
  });

  // 大底资料库 CRUD
  router.get('/soles', (req, res) => {
    const { status } = req.query;
    let list = db.findWhere('soles', {});
    if (status) list = list.filter((l: any) => l.status === status);
    res.json(list);
  });
  router.post('/soles', (req, res) => {
    const id = `sole_${Date.now()}`;
    const code = req.body.code || `SOLE${String(Date.now()).slice(-6)}`;
    db.insert('soles', { id, code, ...req.body, status: 'active', created_at: new Date().toISOString() });
    res.json({ success: true, id });
  });
  router.put('/soles/:id', (req, res) => {
    db.update('soles', req.params.id, req.body);
    res.json({ success: true });
  });
  router.delete('/soles/:id', (req, res) => {
    db.update('soles', req.params.id, { status: 'inactive' });
    res.json({ success: true });
  });

// ============ 仓储物流管理 API ============

  // 仓库管理 CRUD
  router.get('/warehouses', (req, res) => {
    const { type, status } = req.query;
    let list = db.findAll('warehouses');
    if (type) list = list.filter((l: any) => l.type === type);
    if (status) list = list.filter((l: any) => l.status === status);
    res.json(list);
  });
  router.get('/warehouses/:id', (req, res) => {
    const warehouse = db.findById('warehouses', req.params.id);
    res.json(warehouse);
  });
  router.post('/warehouses', (req, res) => {
    const id = `wh_${Date.now()}`;
    const code = req.body.code || `WH${String(Date.now()).slice(-6)}`;
    db.insert('warehouses', { id, code, ...req.body, created_at: new Date().toISOString() });
    res.json({ success: true, id });
  });
  router.put('/warehouses/:id', (req, res) => {
    db.update('warehouses', req.params.id, req.body);
    res.json({ success: true });
  });
  router.delete('/warehouses/:id', (req, res) => {
    db.update('warehouses', req.params.id, { status: 'inactive' });
    res.json({ success: true });
  });

  // 货位管理 CRUD
  router.get('/locations', (req, res) => {
    const { warehouse_id, status } = req.query;
    let list = db.findAll('locations');
    if (warehouse_id) list = list.filter((l: any) => l.warehouse_id === warehouse_id);
    if (status) list = list.filter((l: any) => l.status === status);
    res.json(list);
  });
  router.get('/locations/:id', (req, res) => {
    const location = db.findById('locations', req.params.id);
    res.json(location);
  });
  router.post('/locations', (req, res) => {
    const id = `loc_${Date.now()}`;
    db.insert('locations', { id, ...req.body, created_at: new Date().toISOString() });
    res.json({ success: true, id });
  });
  router.put('/locations/:id', (req, res) => {
    db.update('locations', req.params.id, req.body);
    res.json({ success: true });
  });
  router.delete('/locations/:id', (req, res) => {
    db.update('locations', req.params.id, { status: 'deleted' });
    res.json({ success: true });
  });

  // 库存查询
  router.get('/inventory', (req, res) => {
    const { warehouse_id, location_id, sku_id, material_id, keyword } = req.query;
    let list = db.findAll('inventory');
    if (warehouse_id) list = list.filter((l: any) => l.warehouse_id === warehouse_id);
    if (location_id) list = list.filter((l: any) => l.location_id === location_id);
    if (sku_id) list = list.filter((l: any) => l.sku_id === sku_id);
    if (material_id) list = list.filter((l: any) => l.material_id === material_id);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      list = list.filter((l: any) => 
        (l.batch_no?.toLowerCase().includes(kw)) || 
        (l.sku_id?.toLowerCase().includes(kw))
      );
    }
    res.json(list);
  });

  // 库存统计
  router.get('/inventory/statistics', (req, res) => {
    const { warehouse_id } = req.query;
    let inventory = db.findAll('inventory');
    if (warehouse_id) inventory = inventory.filter((i: any) => i.warehouse_id === warehouse_id);
    
    const stats = {
      total_qty: inventory.reduce((sum: number, i: any) => sum + (i.qty || 0), 0),
      total_value: inventory.reduce((sum: number, i: any) => sum + ((i.qty || 0) * (i.cost_price || 0)), 0),
      sku_count: new Set(inventory.map((i: any) => i.sku_id).filter(Boolean)).size,
      warehouse_count: new Set(inventory.map((i: any) => i.warehouse_id).filter(Boolean)).size
    };
    res.json(stats);
  });

  // 库存事务（入库/出库）
  router.post('/inventory/transaction', (req, res) => {
    const { warehouse_id, location_id, sku_id, material_id, type, qty, unit, cost_price, batch_no, source_doc_id, source_doc_type, remark, operator_id, operator_name } = req.body;
    
    if (!type || !qty) {
      res.status(400).json({ success: false, message: '请提供类型和数量' });
      return;
    }

    const id = `trx_${Date.now()}`;
    db.insert('inventory_transactions', {
      id, warehouse_id, location_id, sku_id, material_id,
      type, qty, unit: unit || '双', cost_price: cost_price || 0,
      batch_no, source_doc_id, source_doc_type, remark,
      operator_id, operator_name,
      created_at: new Date().toISOString()
    });

    // 更新库存
    const key = sku_id || material_id;
    let inventory = db.findWhere('inventory', { 
      warehouse_id, 
      ...(sku_id ? { sku_id } : { material_id }),
      ...(location_id ? { location_id } : {})
    });

    if (inventory.length > 0) {
      const inv = inventory[0];
      const newQty = type === 'in' ? (inv.qty || 0) + qty : (inv.qty || 0) - qty;
      db.update('inventory', inv.id, { qty: newQty, updated_at: new Date().toISOString() });
    } else {
      const invId = `inv_${Date.now()}`;
      db.insert('inventory', {
        id: invId, warehouse_id, location_id, sku_id, material_id,
        qty: type === 'in' ? qty : -qty,
        unit: unit || '双', batch_no, cost_price: cost_price || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    res.json({ success: true, id });
  });

  // 库存事务查询
  router.get('/inventory/transactions', (req, res) => {
    const { warehouse_id, type, start_date, end_date } = req.query;
    let list = db.findAll('inventory_transactions');
    if (warehouse_id) list = list.filter((l: any) => l.warehouse_id === warehouse_id);
    if (type) list = list.filter((l: any) => l.type === type);
    if (start_date) list = list.filter((l: any) => l.created_at >= start_date);
    if (end_date) list = list.filter((l: any) => l.created_at <= end_date);
    res.json(list);
  });

  // 盘点管理 CRUD
  router.get('/stock-checks', (req, res) => {
    const { warehouse_id, status } = req.query;
    let list = db.findAll('stock_checks');
    if (warehouse_id) list = list.filter((l: any) => l.warehouse_id === warehouse_id);
    if (status) list = list.filter((l: any) => l.status === status);
    res.json(list);
  });
  router.get('/stock-checks/:id', (req, res) => {
    const check = db.findById('stock_checks', req.params.id);
    const items = db.findWhere('stock_check_items', { check_id: req.params.id });
    res.json({ ...check, items });
  });
  router.post('/stock-checks', (req, res) => {
    const id = `sc_${Date.now()}`;
    const code = `SC${String(Date.now()).slice(-6)}`;
    const { warehouse_id, location_id, operator_id, operator_name } = req.body;
    db.insert('stock_checks', {
      id, code, warehouse_id, location_id, status: 'draft',
      operator_id, operator_name,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id, code });
  });
  router.put('/stock-checks/:id', (req, res) => {
    const { items, ...data } = req.body;
    db.update('stock_checks', req.params.id, data);
    
    if (items && Array.isArray(items)) {
      db.db!.prepare('DELETE FROM stock_check_items WHERE check_id = ?').run(req.params.id);
      items.forEach((item: any, index: number) => {
        const itemId = `sci_${Date.now()}_${index}`;
        db.insert('stock_check_items', {
          id: itemId,
          check_id: req.params.id,
          ...item
        });
      });
    }
    res.json({ success: true });
  });
  router.post('/stock-checks/:id/complete', (req, res) => {
    db.update('stock_checks', req.params.id, { 
      status: 'completed', 
      completed_at: new Date().toISOString() 
    });
    
    // 根据盘点结果调整库存
    const items = db.findWhere('stock_check_items', { check_id: req.params.id });
    items.forEach((item: any) => {
      if (item.diff_qty !== 0 && item.inventory_id) {
        const inv = db.findById('inventory', item.inventory_id);
        if (inv) {
          db.update('inventory', item.inventory_id, { 
            qty: (inv.qty || 0) + (item.diff_qty || 0),
            updated_at: new Date().toISOString()
          });
        }
      }
    });

    res.json({ success: true });
  });

  // 条码管理 CRUD
  router.get('/barcodes', (req, res) => {
    const { type, target_id, warehouse_id } = req.query;
    let list = db.findAll('barcodes');
    if (type) list = list.filter((l: any) => l.type === type);
    if (target_id) list = list.filter((l: any) => l.target_id === target_id);
    if (warehouse_id) list = list.filter((l: any) => l.warehouse_id === warehouse_id);
    res.json(list);
  });
  router.post('/barcodes', (req, res) => {
    const id = `bar_${Date.now()}`;
    const code = req.body.code || `BAR${String(Date.now()).slice(-8)}`;
    db.insert('barcodes', { id, code, ...req.body, created_at: new Date().toISOString() });
    res.json({ success: true, id, code });
  });
  router.put('/barcodes/:id', (req, res) => {
    db.update('barcodes', req.params.id, req.body);
    res.json({ success: true });
  });
  router.delete('/barcodes/:id', (req, res) => {
    db.deleteById('barcodes', req.params.id);
    res.json({ success: true });
  });

  // 调拨单 CRUD
  router.get('/transfer-orders', (req, res) => {
    const { from_warehouse_id, to_warehouse_id, status } = req.query;
    let list = db.findAll('transfer_orders');
    if (from_warehouse_id) list = list.filter((l: any) => l.from_warehouse_id === from_warehouse_id);
    if (to_warehouse_id) list = list.filter((l: any) => l.to_warehouse_id === to_warehouse_id);
    if (status) list = list.filter((l: any) => l.status === status);
    res.json(list);
  });
  router.get('/transfer-orders/:id', (req, res) => {
    const order = db.findById('transfer_orders', req.params.id);
    const items = db.findWhere('transfer_order_items', { transfer_id: req.params.id });
    res.json({ ...order, items });
  });
  router.post('/transfer-orders', (req, res) => {
    const id = `tf_${Date.now()}`;
    const code = `TF${String(Date.now()).slice(-6)}`;
    const { items, ...orderData } = req.body;
    db.insert('transfer_orders', {
      id, code, ...orderData, status: 'pending',
      created_at: new Date().toISOString()
    });
    
    if (items && Array.isArray(items)) {
      items.forEach((item: any, index: number) => {
        const itemId = `tfi_${Date.now()}_${index}`;
        db.insert('transfer_order_items', {
          id: itemId,
          transfer_id: id,
          ...item
        });
      });
    }
    res.json({ success: true, id, code });
  });
  router.put('/transfer-orders/:id', (req, res) => {
    const { items, ...data } = req.body;
    db.update('transfer_orders', req.params.id, data);
    
    if (items !== undefined) {
      db.db!.prepare('DELETE FROM transfer_order_items WHERE transfer_id = ?').run(req.params.id);
      if (Array.isArray(items)) {
        items.forEach((item: any, index: number) => {
          const itemId = `tfi_${Date.now()}_${index}`;
          db.insert('transfer_order_items', {
            id: itemId,
            transfer_id: req.params.id,
            ...item
          });
        });
      }
    }
    res.json({ success: true });
  });
  router.post('/transfer-orders/:id/approve', (req, res) => {
    db.update('transfer_orders', req.params.id, { 
      status: 'approved', 
      approved_at: new Date().toISOString() 
    });
    res.json({ success: true });
  });
  router.post('/transfer-orders/:id/complete', (req, res) => {
    const order = db.findById('transfer_orders', req.params.id);
    if (!order || order.status !== 'approved') {
      res.status(400).json({ success: false, message: '只能完成已审批的调拨单' });
      return;
    }

    const items = db.findWhere('transfer_order_items', { transfer_id: req.params.id });
    
    // 执行库存调拨
    items.forEach((item: any) => {
      // 扣减源仓库库存
      const sourceInv = db.findWhere('inventory', { 
        warehouse_id: order.from_warehouse_id,
        ...(item.sku_id ? { sku_id: item.sku_id } : { material_id: item.material_id })
      });
      if (sourceInv.length > 0) {
        const inv = sourceInv[0];
        db.update('inventory', inv.id, { 
          qty: (inv.qty || 0) - (item.qty || 0),
          updated_at: new Date().toISOString()
        });
      }

      // 增加目标仓库库存
      const targetInv = db.findWhere('inventory', { 
        warehouse_id: order.to_warehouse_id,
        ...(item.sku_id ? { sku_id: item.sku_id } : { material_id: item.material_id })
      });
      if (targetInv.length > 0) {
        const inv = targetInv[0];
        db.update('inventory', inv.id, { 
          qty: (inv.qty || 0) + (item.qty || 0),
          updated_at: new Date().toISOString()
        });
      } else {
        const invId = `inv_${Date.now()}`;
        db.insert('inventory', {
          id: invId,
          warehouse_id: order.to_warehouse_id,
          sku_id: item.sku_id,
          material_id: item.material_id,
          qty: item.qty || 0,
          unit: item.unit || '双',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });

    db.update('transfer_orders', req.params.id, { status: 'completed' });
    res.json({ success: true });
  });

  // ==================== 销售管理 ====================

  // 客户分组管理
  router.get('/customer-groups', (req, res) => {
    const groups = db.findAll('customer_groups');
    res.json(groups);
  });

  router.get('/customer-groups/:id', (req, res) => {
    const group = db.findById('customer_groups', req.params.id);
    res.json(group || {});
  });

  router.post('/customer-groups', (req, res) => {
    const { code, name, discount, credit_limit, payment_terms, remark } = req.body;
    if (!code || !name) {
      res.status(400).json({ success: false, message: '请提供编码和名称' });
      return;
    }
    const id = `cg_${Date.now()}`;
    db.insert('customer_groups', {
      id, code, name, discount: discount || 1, credit_limit: credit_limit || 0,
      payment_terms, remark, created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/customer-groups/:id', (req, res) => {
    const { code, name, discount, credit_limit, payment_terms, remark } = req.body;
    db.update('customer_groups', req.params.id, {
      code, name, discount, credit_limit, payment_terms, remark
    });
    res.json({ success: true });
  });

  router.delete('/customer-groups/:id', (req, res) => {
    db.deleteById('customer_groups', req.params.id);
    res.json({ success: true });
  });

  // 客户管理
  router.get('/customers', (req, res) => {
    const { group_id, keyword, status } = req.query;
    let customers = db.findAll('customers');
    if (group_id) customers = customers.filter((c: any) => c.group_id === group_id);
    if (status) customers = customers.filter((c: any) => c.status === status);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      customers = customers.filter((c: any) => 
        c.code.toLowerCase().includes(kw) || c.name.toLowerCase().includes(kw) || 
        c.contact_person?.toLowerCase().includes(kw) || c.phone?.includes(kw)
      );
    }
    res.json(customers);
  });

  router.get('/customers/:id', (req, res) => {
    const customer = db.findById('customers', req.params.id);
    res.json(customer || {});
  });

  router.post('/customers', (req, res) => {
    const { code, name, short_name, group_id, contact_person, phone, mobile, email, 
            address, province, city, district, tax_no, bank_name, bank_account, 
            credit_limit, status, remark } = req.body;
    if (!code || !name) {
      res.status(400).json({ success: false, message: '请提供客户编码和名称' });
      return;
    }
    const id = `cust_${Date.now()}`;
    db.insert('customers', {
      id, code, name, short_name, group_id, contact_person, phone, mobile, email,
      address, province, city, district, tax_no, bank_name, bank_account,
      credit_limit: credit_limit || 0, available_credit: credit_limit || 0,
      status: status || 'active', remark,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/customers/:id', (req, res) => {
    const { code, name, short_name, group_id, contact_person, phone, mobile, email, 
            address, province, city, district, tax_no, bank_name, bank_account, 
            credit_limit, status, remark } = req.body;
    db.update('customers', req.params.id, {
      code, name, short_name, group_id, contact_person, phone, mobile, email,
      address, province, city, district, tax_no, bank_name, bank_account,
      credit_limit, status, remark, updated_at: new Date().toISOString()
    });
    res.json({ success: true });
  });

  router.delete('/customers/:id', (req, res) => {
    db.deleteById('customers', req.params.id);
    res.json({ success: true });
  });

  // 销售订单管理
  router.get('/sales-orders', (req, res) => {
    const { customer_id, status, keyword, start_date, end_date } = req.query;
    let orders = db.findAll('sales_orders');
    if (customer_id) orders = orders.filter((o: any) => o.customer_id === customer_id);
    if (status) orders = orders.filter((o: any) => o.status === status);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      orders = orders.filter((o: any) => 
        o.code.toLowerCase().includes(kw) || o.customer_name?.toLowerCase().includes(kw)
      );
    }
    if (start_date || end_date) {
      orders = orders.filter((o: any) => {
        const orderDate = new Date(o.order_date || o.created_at);
        if (start_date && orderDate < new Date(start_date as string)) return false;
        if (end_date && orderDate > new Date(end_date as string)) return false;
        return true;
      });
    }
    res.json(orders);
  });

  router.get('/sales-orders/:id', (req, res) => {
    const order = db.findById('sales_orders', req.params.id);
    const items = db.findWhere('sales_order_items', { order_id: req.params.id });
    res.json({ ...order, items });
  });

  router.post('/sales-orders', (req, res) => {
    const { customer_id, customer_name, contact_person, contact_phone, order_date, 
            delivery_date, warehouse_id, shipping_address, payment_method, 
            payment_status, discount, remark, operator_name, items } = req.body;
    
    if (!customer_id || !customer_name) {
      res.status(400).json({ success: false, message: '请选择客户' });
      return;
    }
    if (!items || !items.length) {
      res.status(400).json({ success: false, message: '请添加订单明细' });
      return;
    }

    const id = `so_${Date.now()}`;
    const code = `SO${Date.now().toString().slice(-8)}`;
    
    let total_amount = 0;
    items.forEach((item: any) => {
      total_amount += (item.qty || 0) * (item.unit_price || 0);
    });
    total_amount = total_amount * (1 - (discount || 0));

    db.insert('sales_orders', {
      id, code, customer_id, customer_name, contact_person, contact_phone,
      order_date: order_date || new Date().toISOString(),
      delivery_date, warehouse_id, shipping_address, payment_method,
      payment_status: payment_status || 'unpaid',
      total_amount, discount: discount || 0, paid_amount: 0,
      status: 'pending', remark, operator_name,
      created_at: new Date().toISOString()
    });

    items.forEach((item: any) => {
      const itemId = `soi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      db.insert('sales_order_items', {
        id: itemId, order_id: id, sku_id: item.sku_id, style_id: item.style_id,
        color_id: item.color_id, size_id: item.size_id, color_code: item.color_code,
        size_code: item.size_code, qty: item.qty || 0, unit: item.unit || '双',
        unit_price: item.unit_price || 0,
        amount: (item.qty || 0) * (item.unit_price || 0),
        remark: item.remark
      });
    });

    res.json({ success: true, id, code });
  });

  router.put('/sales-orders/:id', (req, res) => {
    const { customer_id, customer_name, contact_person, contact_phone, delivery_date, 
            warehouse_id, shipping_address, payment_method, discount, remark } = req.body;
    db.update('sales_orders', req.params.id, {
      customer_id, customer_name, contact_person, contact_phone, delivery_date,
      warehouse_id, shipping_address, payment_method, discount, remark
    });
    res.json({ success: true });
  });

  router.post('/sales-orders/:id/approve', (req, res) => {
    db.update('sales_orders', req.params.id, { 
      status: 'approved', 
      approved_at: new Date().toISOString() 
    });
    res.json({ success: true });
  });

  router.post('/sales-orders/:id/cancel', (req, res) => {
    db.update('sales_orders', req.params.id, { status: 'cancelled' });
    res.json({ success: true });
  });

  router.delete('/sales-orders/:id', (req, res) => {
    db.deleteWhere('sales_order_items', { order_id: req.params.id });
    db.deleteById('sales_orders', req.params.id);
    res.json({ success: true });
  });

  // 发货管理
  router.get('/deliveries', (req, res) => {
    const { order_id, status } = req.query;
    let deliveries = db.findAll('deliveries');
    if (order_id) deliveries = deliveries.filter((d: any) => d.order_id === order_id);
    if (status) deliveries = deliveries.filter((d: any) => d.status === status);
    res.json(deliveries);
  });

  router.get('/deliveries/:id', (req, res) => {
    const delivery = db.findById('deliveries', req.params.id);
    const items = db.findWhere('delivery_items', { delivery_id: req.params.id });
    res.json({ ...delivery, items });
  });

  router.post('/deliveries', (req, res) => {
    const { order_id, warehouse_id, delivery_date, carrier, tracking_no, 
            remark, operator_name, items } = req.body;
    
    if (!order_id || !warehouse_id) {
      res.status(400).json({ success: false, message: '请提供订单和仓库' });
      return;
    }

    const id = `del_${Date.now()}`;
    const code = `DL${Date.now().toString().slice(-8)}`;
    let total_qty = 0;
    
    db.insert('deliveries', {
      id, code, order_id, warehouse_id, delivery_date: delivery_date || new Date().toISOString(),
      carrier, tracking_no, status: 'pending', total_qty: 0, remark, operator_name,
      created_at: new Date().toISOString()
    });

    items.forEach((item: any) => {
      total_qty += item.qty || 0;
      const itemId = `deli_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      db.insert('delivery_items', {
        id: itemId, delivery_id: id, order_item_id: item.order_item_id,
        sku_id: item.sku_id, qty: item.qty || 0, unit: item.unit || '双',
        batch_no: item.batch_no, remark: item.remark
      });
    });

    db.update('deliveries', id, { total_qty });
    db.update('sales_orders', order_id, { status: 'shipping' });
    
    res.json({ success: true, id, code });
  });

  router.post('/deliveries/:id/ship', (req, res) => {
    db.update('deliveries', req.params.id, { 
      status: 'shipped', 
      shipped_at: new Date().toISOString() 
    });
    res.json({ success: true });
  });

  router.post('/deliveries/:id/complete', (req, res) => {
    const delivery = db.findById('deliveries', req.params.id);
    if (delivery) {
      db.update('deliveries', req.params.id, { status: 'delivered' });
      db.update('sales_orders', delivery.order_id, { status: 'completed' });
    }
    res.json({ success: true });
  });

  // 退货管理
  router.get('/returns', (req, res) => {
    const { order_id, customer_id, status } = req.query;
    let returns = db.findAll('returns');
    if (order_id) returns = returns.filter((r: any) => r.order_id === order_id);
    if (customer_id) returns = returns.filter((r: any) => r.customer_id === customer_id);
    if (status) returns = returns.filter((r: any) => r.status === status);
    res.json(returns);
  });

  router.get('/returns/:id', (req, res) => {
    const ret = db.findById('returns', req.params.id);
    const items = db.findWhere('return_items', { return_id: req.params.id });
    res.json({ ...ret, items });
  });

  router.post('/returns', (req, res) => {
    const { order_id, delivery_id, customer_id, return_date, reason, 
            remark, operator_name, items } = req.body;
    
    if (!customer_id) {
      res.status(400).json({ success: false, message: '请提供客户' });
      return;
    }
    if (!items || !items.length) {
      res.status(400).json({ success: false, message: '请添加退货明细' });
      return;
    }

    const id = `ret_${Date.now()}`;
    const code = `RT${Date.now().toString().slice(-8)}`;
    
    let total_amount = 0;
    items.forEach((item: any) => {
      total_amount += (item.qty || 0) * (item.unit_price || 0);
    });

    db.insert('returns', {
      id, code, order_id, delivery_id, customer_id,
      return_date: return_date || new Date().toISOString(),
      reason, status: 'pending', total_amount, remark, operator_name,
      created_at: new Date().toISOString()
    });

    items.forEach((item: any) => {
      const itemId = `reti_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      db.insert('return_items', {
        id: itemId, return_id: id, sku_id: item.sku_id,
        qty: item.qty || 0, unit: item.unit || '双',
        unit_price: item.unit_price || 0,
        amount: (item.qty || 0) * (item.unit_price || 0),
        reason: item.reason, remark: item.remark
      });
    });

    res.json({ success: true, id, code });
  });

  router.post('/returns/:id/approve', (req, res) => {
    db.update('returns', req.params.id, { 
      status: 'approved', 
      approved_at: new Date().toISOString() 
    });
    res.json({ success: true });
  });

  router.post('/returns/:id/complete', (req, res) => {
    db.update('returns', req.params.id, { status: 'completed' });
    res.json({ success: true });
  });

  // ==================== 采购管理 ====================

  // 供应商分组管理
  router.get('/supplier-groups', (req, res) => {
    const groups = db.findAll('supplier_groups');
    res.json(groups);
  });

  router.get('/supplier-groups/:id', (req, res) => {
    const group = db.findById('supplier_groups', req.params.id);
    res.json(group || {});
  });

  router.post('/supplier-groups', (req, res) => {
    const { code, name, remark } = req.body;
    if (!code || !name) {
      res.status(400).json({ success: false, message: '请提供编码和名称' });
      return;
    }
    const id = `sg_${Date.now()}`;
    db.insert('supplier_groups', {
      id, code, name, remark, created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/supplier-groups/:id', (req, res) => {
    const { code, name, remark } = req.body;
    db.update('supplier_groups', req.params.id, { code, name, remark });
    res.json({ success: true });
  });

  router.delete('/supplier-groups/:id', (req, res) => {
    db.deleteById('supplier_groups', req.params.id);
    res.json({ success: true });
  });

  // 供应商管理
  router.get('/suppliers', (req, res) => {
    const { group_id, keyword, status } = req.query;
    let suppliers = db.findAll('suppliers');
    if (group_id) suppliers = suppliers.filter((s: any) => s.group_id === group_id);
    if (status) suppliers = suppliers.filter((s: any) => s.status === status);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      suppliers = suppliers.filter((s: any) => 
        s.code.toLowerCase().includes(kw) || s.name.toLowerCase().includes(kw) || 
        s.contact_person?.toLowerCase().includes(kw) || s.phone?.includes(kw)
      );
    }
    res.json(suppliers);
  });

  router.get('/suppliers/:id', (req, res) => {
    const supplier = db.findById('suppliers', req.params.id);
    res.json(supplier || {});
  });

  router.post('/suppliers', (req, res) => {
    const { code, name, short_name, group_id, contact_person, phone, mobile, email, 
            address, province, city, district, tax_no, bank_name, bank_account, 
            payment_terms, status, remark } = req.body;
    if (!code || !name) {
      res.status(400).json({ success: false, message: '请提供供应商编码和名称' });
      return;
    }
    const id = `sup_${Date.now()}`;
    db.insert('suppliers', {
      id, code, name, short_name, group_id, contact_person, phone, mobile, email,
      address, province, city, district, tax_no, bank_name, bank_account,
      payment_terms, status: status || 'active', remark,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/suppliers/:id', (req, res) => {
    const { code, name, short_name, group_id, contact_person, phone, mobile, email, 
            address, province, city, district, tax_no, bank_name, bank_account, 
            payment_terms, status, remark } = req.body;
    db.update('suppliers', req.params.id, {
      code, name, short_name, group_id, contact_person, phone, mobile, email,
      address, province, city, district, tax_no, bank_name, bank_account,
      payment_terms, status, remark, updated_at: new Date().toISOString()
    });
    res.json({ success: true });
  });

  router.delete('/suppliers/:id', (req, res) => {
    db.deleteById('suppliers', req.params.id);
    res.json({ success: true });
  });

  // 采购订单管理
  router.get('/purchase-orders', (req, res) => {
    const { supplier_id, status, keyword, start_date, end_date } = req.query;
    let orders = db.findAll('purchase_orders');
    if (supplier_id) orders = orders.filter((o: any) => o.supplier_id === supplier_id);
    if (status) orders = orders.filter((o: any) => o.status === status);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      orders = orders.filter((o: any) => 
        o.code.toLowerCase().includes(kw) || o.supplier_name?.toLowerCase().includes(kw)
      );
    }
    if (start_date || end_date) {
      orders = orders.filter((o: any) => {
        const orderDate = new Date(o.order_date || o.created_at);
        if (start_date && orderDate < new Date(start_date as string)) return false;
        if (end_date && orderDate > new Date(end_date as string)) return false;
        return true;
      });
    }
    res.json(orders);
  });

  router.get('/purchase-orders/:id', (req, res) => {
    const order = db.findById('purchase_orders', req.params.id);
    const items = db.findWhere('purchase_order_items', { order_id: req.params.id });
    res.json({ ...order, items });
  });

  router.post('/purchase-orders', (req, res) => {
    const { supplier_id, supplier_name, contact_person, contact_phone, order_date, 
            delivery_date, warehouse_id, payment_method, discount, remark, operator_name, items } = req.body;
    
    if (!supplier_id || !supplier_name) {
      res.status(400).json({ success: false, message: '请选择供应商' });
      return;
    }
    if (!items || !items.length) {
      res.status(400).json({ success: false, message: '请添加采购明细' });
      return;
    }

    const id = `po_${Date.now()}`;
    const code = `PO${Date.now().toString().slice(-8)}`;
    
    let total_amount = 0;
    items.forEach((item: any) => {
      total_amount += (item.qty || 0) * (item.unit_price || 0);
    });
    total_amount = total_amount * (1 - (discount || 0));

    db.insert('purchase_orders', {
      id, code, supplier_id, supplier_name, contact_person, contact_phone,
      order_date: order_date || new Date().toISOString(),
      delivery_date, warehouse_id, payment_method,
      payment_status: 'unpaid',
      total_amount, discount: discount || 0,
      status: 'pending', remark, operator_name,
      created_at: new Date().toISOString()
    });

    items.forEach((item: any) => {
      const itemId = `poi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      db.insert('purchase_order_items', {
        id: itemId, order_id: id, material_id: item.material_id, sku_id: item.sku_id,
        qty: item.qty || 0, unit: item.unit || '双',
        unit_price: item.unit_price || 0,
        amount: (item.qty || 0) * (item.unit_price || 0),
        delivery_qty: 0,
        remark: item.remark
      });
    });

    res.json({ success: true, id, code });
  });

  router.put('/purchase-orders/:id', (req, res) => {
    const { supplier_id, supplier_name, contact_person, contact_phone, delivery_date, 
            warehouse_id, payment_method, discount, remark } = req.body;
    db.update('purchase_orders', req.params.id, {
      supplier_id, supplier_name, contact_person, contact_phone, delivery_date,
      warehouse_id, payment_method, discount, remark
    });
    res.json({ success: true });
  });

  router.post('/purchase-orders/:id/approve', (req, res) => {
    db.update('purchase_orders', req.params.id, { 
      status: 'approved', 
      approved_at: new Date().toISOString() 
    });
    res.json({ success: true });
  });

  router.post('/purchase-orders/:id/cancel', (req, res) => {
    db.update('purchase_orders', req.params.id, { status: 'cancelled' });
    res.json({ success: true });
  });

  router.delete('/purchase-orders/:id', (req, res) => {
    db.deleteWhere('purchase_order_items', { order_id: req.params.id });
    db.deleteById('purchase_orders', req.params.id);
    res.json({ success: true });
  });

  // 采购入库管理
  router.get('/purchase-receipts', (req, res) => {
    const { order_id, supplier_id, status } = req.query;
    let receipts = db.findAll('purchase_receipts');
    if (order_id) receipts = receipts.filter((r: any) => r.order_id === order_id);
    if (supplier_id) receipts = receipts.filter((r: any) => r.supplier_id === supplier_id);
    if (status) receipts = receipts.filter((r: any) => r.status === status);
    res.json(receipts);
  });

  router.get('/purchase-receipts/:id', (req, res) => {
    const receipt = db.findById('purchase_receipts', req.params.id);
    const items = db.findWhere('purchase_receipt_items', { receipt_id: req.params.id });
    res.json({ ...receipt, items });
  });

  router.post('/purchase-receipts', (req, res) => {
    const { order_id, supplier_id, warehouse_id, receipt_date, remark, operator_name, items } = req.body;
    
    if (!order_id || !warehouse_id) {
      res.status(400).json({ success: false, message: '请提供订单和仓库' });
      return;
    }

    const id = `pr_${Date.now()}`;
    const code = `PR${Date.now().toString().slice(-8)}`;
    let total_qty = 0;
    
    db.insert('purchase_receipts', {
      id, code, order_id, supplier_id, warehouse_id,
      receipt_date: receipt_date || new Date().toISOString(),
      status: 'pending', total_qty: 0, remark, operator_name,
      created_at: new Date().toISOString()
    });

    items.forEach((item: any) => {
      total_qty += item.qty || 0;
      const itemId = `pri_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      db.insert('purchase_receipt_items', {
        id: itemId, receipt_id: id, order_item_id: item.order_item_id,
        material_id: item.material_id, sku_id: item.sku_id,
        qty: item.qty || 0, unit: item.unit || '双',
        batch_no: item.batch_no, remark: item.remark
      });
    });

    db.update('purchase_receipts', id, { total_qty });
    
    res.json({ success: true, id, code });
  });

  router.post('/purchase-receipts/:id/approve', (req, res) => {
    const receipt = db.findById('purchase_receipts', req.params.id);
    const items = db.findWhere('purchase_receipt_items', { receipt_id: req.params.id });
    
    // 更新库存
    items.forEach((item: any) => {
      let inventory = db.findWhere('inventory', { 
        warehouse_id: receipt?.warehouse_id,
        ...(item.sku_id ? { sku_id: item.sku_id } : { material_id: item.material_id })
      });

      if (inventory.length > 0) {
        const inv = inventory[0];
        const newQty = (inv.qty || 0) + (item.qty || 0);
        db.update('inventory', inv.id, { qty: newQty, updated_at: new Date().toISOString() });
      } else {
        const invId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        db.insert('inventory', {
          id: invId, 
          warehouse_id: receipt?.warehouse_id,
          sku_id: item.sku_id,
          material_id: item.material_id,
          qty: item.qty || 0,
          unit: item.unit || '双',
          batch_no: item.batch_no,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // 更新采购订单明细的已收货数量
      if (item.order_item_id) {
        const orderItem = db.findById('purchase_order_items', item.order_item_id);
        if (orderItem) {
          db.update('purchase_order_items', item.order_item_id, {
            delivery_qty: (orderItem.delivery_qty || 0) + (item.qty || 0)
          });
        }
      }
    });

    db.update('purchase_receipts', req.params.id, { 
      status: 'approved', 
      approved_at: new Date().toISOString() 
    });

    // 更新采购订单状态
    const order = db.findById('purchase_orders', receipt?.order_id);
    if (order) {
      const orderItems = db.findWhere('purchase_order_items', { order_id: order.id });
      const allDelivered = orderItems.every((oi: any) => (oi.delivery_qty || 0) >= (oi.qty || 0));
      if (allDelivered) {
        db.update('purchase_orders', order.id, { status: 'completed' });
      } else {
        db.update('purchase_orders', order.id, { status: 'received' });
      }
    }

    res.json({ success: true });
  });

  // ==================== 生产现场管理 ====================

  // 工作中心管理
  router.get('/work-centers', (req, res) => {
    const { type, status } = req.query;
    let centers = db.findAll('work_centers');
    if (type) centers = centers.filter((c: any) => c.type === type);
    if (status) centers = centers.filter((c: any) => c.status === status);
    res.json(centers);
  });

  router.get('/work-centers/:id', (req, res) => {
    const center = db.findById('work_centers', req.params.id);
    res.json(center || {});
  });

  router.post('/work-centers', (req, res) => {
    const { code, name, type, status, remark } = req.body;
    if (!code || !name) {
      res.status(400).json({ success: false, message: '请提供编码和名称' });
      return;
    }
    const id = `wc_${Date.now()}`;
    db.insert('work_centers', {
      id, code, name, type: type || 'sewing', status: status || 'active', remark,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/work-centers/:id', (req, res) => {
    const { code, name, type, status, remark } = req.body;
    db.update('work_centers', req.params.id, { code, name, type, status, remark });
    res.json({ success: true });
  });

  router.delete('/work-centers/:id', (req, res) => {
    db.deleteById('work_centers', req.params.id);
    res.json({ success: true });
  });

  // 生产计划管理
  router.get('/production-plans', (req, res) => {
    const { style_id, status, keyword } = req.query;
    let plans = db.findAll('production_plans');
    if (style_id) plans = plans.filter((p: any) => p.style_id === style_id);
    if (status) plans = plans.filter((p: any) => p.status === status);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      plans = plans.filter((p: any) => 
        p.code.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw) || 
        p.style_code?.toLowerCase().includes(kw)
      );
    }
    res.json(plans);
  });

  router.get('/production-plans/:id', (req, res) => {
    const plan = db.findById('production_plans', req.params.id);
    res.json(plan || {});
  });

  router.post('/production-plans', (req, res) => {
    const { name, style_id, style_code, style_name, planned_qty, start_date, end_date, remark } = req.body;
    if (!name || !style_id) {
      res.status(400).json({ success: false, message: '请提供计划名称和款号' });
      return;
    }
    const id = `pp_${Date.now()}`;
    const code = `PP${Date.now().toString().slice(-8)}`;
    db.insert('production_plans', {
      id, code, name, style_id, style_code, style_name,
      planned_qty: planned_qty || 0,
      start_date, end_date, status: 'draft', remark,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id, code });
  });

  router.put('/production-plans/:id', (req, res) => {
    const { name, style_id, style_code, style_name, planned_qty, start_date, end_date, remark } = req.body;
    db.update('production_plans', req.params.id, {
      name, style_id, style_code, style_name, planned_qty, start_date, end_date, remark
    });
    res.json({ success: true });
  });

  router.post('/production-plans/:id/approve', (req, res) => {
    db.update('production_plans', req.params.id, { 
      status: 'approved', 
      approved_at: new Date().toISOString() 
    });
    res.json({ success: true });
  });

  router.delete('/production-plans/:id', (req, res) => {
    db.deleteById('production_plans', req.params.id);
    res.json({ success: true });
  });

  // 生产工单管理
  router.get('/work-orders', (req, res) => {
    const { plan_id, style_id, work_center_id, status, keyword } = req.query;
    let orders = db.findAll('production_work_orders');
    if (plan_id) orders = orders.filter((o: any) => o.plan_id === plan_id);
    if (style_id) orders = orders.filter((o: any) => o.style_id === style_id);
    if (work_center_id) orders = orders.filter((o: any) => o.work_center_id === work_center_id);
    if (status) orders = orders.filter((o: any) => o.status === status);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      orders = orders.filter((o: any) => 
        o.code.toLowerCase().includes(kw) || o.style_code?.toLowerCase().includes(kw)
      );
    }
    res.json(orders);
  });

  router.get('/work-orders/:id', (req, res) => {
    const order = db.findById('production_work_orders', req.params.id);
    const operations = db.findWhere('work_order_operations', { work_order_id: req.params.id });
    res.json({ ...order, operations });
  });

  router.post('/work-orders', (req, res) => {
    const { plan_id, plan_code, style_id, style_code, style_name, process_id, 
            process_code, process_name, work_center_id, work_center_name, 
            scheduled_qty, start_date, end_date, remark, operator_name } = req.body;
    
    if (!style_id || !process_id) {
      res.status(400).json({ success: false, message: '请提供款号和工序' });
      return;
    }

    const id = `wo_${Date.now()}`;
    const code = `WO${Date.now().toString().slice(-8)}`;

    db.insert('production_work_orders', {
      id, code, plan_id, plan_code, style_id, style_code, style_name,
      process_id, process_code, process_name,
      work_center_id, work_center_name,
      scheduled_qty: scheduled_qty || 0,
      actual_qty: 0,
      start_date, end_date,
      status: 'pending', remark, operator_name,
      created_at: new Date().toISOString()
    });

    res.json({ success: true, id, code });
  });

  router.post('/work-orders/:id/dispatch', (req, res) => {
    const { worker_id, worker_name } = req.body;
    
    // 创建工序操作记录
    const order = db.findById('production_work_orders', req.params.id);
    if (order) {
      const operationId = `woop_${Date.now()}`;
      db.insert('work_order_operations', {
        id: operationId,
        work_order_id: req.params.id,
        seq_no: 1,
        operation_id: order.process_id,
        operation_code: order.process_code,
        operation_name: order.process_name,
        status: 'pending',
        worker_id,
        worker_name,
        actual_qty: 0,
        scrap_qty: 0,
        created_at: new Date().toISOString()
      });
    }

    db.update('production_work_orders', req.params.id, { 
      status: 'dispatched',
      dispatched_at: new Date().toISOString()
    });
    res.json({ success: true });
  });

  router.delete('/work-orders/:id', (req, res) => {
    db.deleteWhere('work_order_operations', { work_order_id: req.params.id });
    db.deleteById('production_work_orders', req.params.id);
    res.json({ success: true });
  });

  // 报工管理
  router.post('/work-orders/:id/start', (req, res) => {
    const operations = db.findWhere('work_order_operations', { 
      work_order_id: req.params.id, 
      status: 'pending' 
    });
    if (operations.length > 0) {
      db.update('work_order_operations', operations[0].id, { 
        status: 'in_progress',
        start_time: new Date().toISOString()
      });
    }
    db.update('production_work_orders', req.params.id, { status: 'in_progress' });
    res.json({ success: true });
  });

  router.post('/work-orders/:id/finish', (req, res) => {
    const { actual_qty, scrap_qty, remark } = req.body;
    
    const operations = db.findWhere('work_order_operations', { 
      work_order_id: req.params.id, 
      status: 'in_progress' 
    });
    if (operations.length > 0) {
      db.update('work_order_operations', operations[0].id, { 
        status: 'completed',
        end_time: new Date().toISOString(),
        actual_qty: actual_qty || 0,
        scrap_qty: scrap_qty || 0,
        remark
      });
    }

    const order = db.findById('production_work_orders', req.params.id);
    if (order) {
      const newActualQty = (order.actual_qty || 0) + (actual_qty || 0);
      if (newActualQty >= (order.scheduled_qty || 0)) {
        db.update('production_work_orders', req.params.id, { 
          status: 'completed',
          actual_qty: newActualQty
        });
      } else {
        db.update('production_work_orders', req.params.id, { 
          actual_qty: newActualQty
        });
      }
    }

    res.json({ success: true });
  });

  // ==================== 财务管理 ====================

  // 科目管理
  router.get('/accounts', (req, res) => {
    const { type, keyword } = req.query;
    let accounts = db.findAll('accounts');
    if (type) accounts = accounts.filter((a: any) => a.type === type);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      accounts = accounts.filter((a: any) => 
        a.code.toLowerCase().includes(kw) || a.name.toLowerCase().includes(kw)
      );
    }
    res.json(accounts);
  });

  router.get('/accounts/:id', (req, res) => {
    const account = db.findById('accounts', req.params.id);
    res.json(account || {});
  });

  router.post('/accounts', (req, res) => {
    const { code, name, type, parent_id, level, remark } = req.body;
    if (!code || !name) {
      res.status(400).json({ success: false, message: '请提供科目编码和名称' });
      return;
    }
    const id = `acc_${Date.now()}`;
    db.insert('accounts', {
      id, code, name, type: type || 'asset', parent_id, level: level || 1,
      balance: 0, remark, created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/accounts/:id', (req, res) => {
    const { code, name, type, parent_id, level, remark } = req.body;
    db.update('accounts', req.params.id, { code, name, type, parent_id, level, remark });
    res.json({ success: true });
  });

  router.delete('/accounts/:id', (req, res) => {
    db.deleteById('accounts', req.params.id);
    res.json({ success: true });
  });

  // 凭证管理
  router.get('/journal-entries', (req, res) => {
    const { keyword, status, start_date, end_date } = req.query;
    let entries = db.findAll('journal_entries');
    if (status) entries = entries.filter((e: any) => e.status === status);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      entries = entries.filter((e: any) => 
        e.code.toLowerCase().includes(kw) || e.description?.toLowerCase().includes(kw)
      );
    }
    if (start_date || end_date) {
      entries = entries.filter((e: any) => {
        const entryDate = new Date(e.entry_date || e.created_at);
        if (start_date && entryDate < new Date(start_date as string)) return false;
        if (end_date && entryDate > new Date(end_date as string)) return false;
        return true;
      });
    }
    res.json(entries);
  });

  router.get('/journal-entries/:id', (req, res) => {
    const entry = db.findById('journal_entries', req.params.id);
    const items = db.findWhere('journal_items', { entry_id: req.params.id });
    res.json({ ...entry, items });
  });

  router.post('/journal-entries', (req, res) => {
    const { entry_date, reference_type, reference_id, description, remark, operator_name, items } = req.body;
    
    const id = `je_${Date.now()}`;
    const code = `JE${Date.now().toString().slice(-8)}`;
    
    let total_debit = 0, total_credit = 0;
    items?.forEach((item: any) => {
      total_debit += item.debit || 0;
      total_credit += item.credit || 0;
    });

    db.insert('journal_entries', {
      id, code, entry_date: entry_date || new Date().toISOString(),
      reference_type, reference_id, description,
      total_debit, total_credit, status: 'draft', remark, operator_name,
      created_at: new Date().toISOString()
    });

    items?.forEach((item: any) => {
      const itemId = `ji_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      db.insert('journal_items', {
        id: itemId, entry_id: id,
        account_id: item.account_id,
        account_code: item.account_code,
        account_name: item.account_name,
        debit: item.debit || 0,
        credit: item.credit || 0,
        remark: item.remark
      });
    });

    res.json({ success: true, id, code });
  });

  router.post('/journal-entries/:id/post', (req, res) => {
    const entry = db.findById('journal_entries', req.params.id);
    const items = db.findWhere('journal_items', { entry_id: req.params.id });
    
    // 更新科目余额
    items.forEach((item: any) => {
      const account = db.findById('accounts', item.account_id);
      if (account) {
        const newBalance = (account.balance || 0) + (item.debit || 0) - (item.credit || 0);
        db.update('accounts', item.account_id, { balance: newBalance });
      }
    });

    db.update('journal_entries', req.params.id, { 
      status: 'posted', 
      posted_at: new Date().toISOString() 
    });
    
    res.json({ success: true });
  });

  // 应收发票管理
  router.get('/ar-invoices', (req, res) => {
    const { customer_id, status, keyword, start_date, end_date } = req.query;
    let invoices = db.findAll('ar_invoices');
    if (customer_id) invoices = invoices.filter((i: any) => i.customer_id === customer_id);
    if (status) invoices = invoices.filter((i: any) => i.status === status);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      invoices = invoices.filter((i: any) => 
        i.code.toLowerCase().includes(kw) || i.customer_name?.toLowerCase().includes(kw)
      );
    }
    res.json(invoices);
  });

  router.post('/ar-invoices', (req, res) => {
    const { customer_id, customer_name, order_id, order_code, invoice_date, due_date, total_amount, remark, operator_name } = req.body;
    
    if (!customer_id || !total_amount) {
      res.status(400).json({ success: false, message: '请提供客户和金额' });
      return;
    }

    const id = `ar_${Date.now()}`;
    const code = `AR${Date.now().toString().slice(-8)}`;

    db.insert('ar_invoices', {
      id, code, customer_id, customer_name, order_id, order_code,
      invoice_date: invoice_date || new Date().toISOString(),
      due_date, total_amount, paid_amount: 0,
      status: 'unpaid', remark, operator_name,
      created_at: new Date().toISOString()
    });

    res.json({ success: true, id, code });
  });

  // 应付发票管理
  router.get('/ap-invoices', (req, res) => {
    const { supplier_id, status, keyword } = req.query;
    let invoices = db.findAll('ap_invoices');
    if (supplier_id) invoices = invoices.filter((i: any) => i.supplier_id === supplier_id);
    if (status) invoices = invoices.filter((i: any) => i.status === status);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      invoices = invoices.filter((i: any) => 
        i.code.toLowerCase().includes(kw) || i.supplier_name?.toLowerCase().includes(kw)
      );
    }
    res.json(invoices);
  });

  router.post('/ap-invoices', (req, res) => {
    const { supplier_id, supplier_name, order_id, order_code, invoice_date, due_date, total_amount, remark, operator_name } = req.body;
    
    if (!supplier_id || !total_amount) {
      res.status(400).json({ success: false, message: '请提供供应商和金额' });
      return;
    }

    const id = `ap_${Date.now()}`;
    const code = `AP${Date.now().toString().slice(-8)}`;

    db.insert('ap_invoices', {
      id, code, supplier_id, supplier_name, order_id, order_code,
      invoice_date: invoice_date || new Date().toISOString(),
      due_date, total_amount, paid_amount: 0,
      status: 'unpaid', remark, operator_name,
      created_at: new Date().toISOString()
    });

    res.json({ success: true, id, code });
  });

  // 收付款管理
  router.get('/payments', (req, res) => {
    const { type, customer_id, supplier_id, keyword } = req.query;
    let payments = db.findAll('payments');
    if (type) payments = payments.filter((p: any) => p.type === type);
    if (customer_id) payments = payments.filter((p: any) => p.customer_id === customer_id);
    if (supplier_id) payments = payments.filter((p: any) => p.supplier_id === supplier_id);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      payments = payments.filter((p: any) => p.code.toLowerCase().includes(kw));
    }
    res.json(payments);
  });

  router.post('/payments', (req, res) => {
    const { type, customer_id, supplier_id, invoice_id, payment_date, amount, payment_method, bank_account, remark, operator_name } = req.body;
    
    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: '请输入有效金额' });
      return;
    }

    const id = `pay_${Date.now()}`;
    const code = `${type === 'receive' ? 'RC' : 'PY'}${Date.now().toString().slice(-8)}`;

    db.insert('payments', {
      id, code, type: type || 'receive', customer_id, supplier_id, invoice_id,
      payment_date: payment_date || new Date().toISOString(),
      amount, payment_method, bank_account, remark, operator_name,
      created_at: new Date().toISOString()
    });

    // 更新发票付款状态
    if (invoice_id) {
      if (type === 'receive') {
        const invoice = db.findById('ar_invoices', invoice_id);
        if (invoice) {
          const newPaid = (invoice.paid_amount || 0) + amount;
          const status = newPaid >= invoice.total_amount ? 'paid' : 
                        newPaid > 0 ? 'partial' : 'unpaid';
          db.update('ar_invoices', invoice_id, { paid_amount: newPaid, status });
        }
      } else {
        const invoice = db.findById('ap_invoices', invoice_id);
        if (invoice) {
          const newPaid = (invoice.paid_amount || 0) + amount;
          const status = newPaid >= invoice.total_amount ? 'paid' : 
                        newPaid > 0 ? 'partial' : 'unpaid';
          db.update('ap_invoices', invoice_id, { paid_amount: newPaid, status });
        }
      }
    }

    res.json({ success: true, id, code });
  });

  // ==================== 网站管理 ====================

  
  // ---------- 用户注册登录 ----------
  router.post('/shop-login', (req, res) => {
    const { phone, password } = req.body;
    const user = db.findOne('shop_users', { phone });
    if (!user || user.password !== password) {
      res.json({ success: false, error: '手机号或密码错误' });
      return;
    }
    const token = 'token_' + Date.now() + '_' + Math.random().toString(36).slice(2,10);
    db.insert('shop_sessions', { id: token, user_id: user.id, expires_at: new Date(Date.now() + 7*86400000).toISOString() });
    res.json({ success: true, token, user: { id: user.id, name: user.name, phone: user.phone, level: user.level } });
  });
  router.post('/shop-register', (req, res) => {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) { res.json({ success: false, error: '请填写完整信息' }); return; }
    const exist = db.findOne('shop_users', { phone });
    if (exist) { res.json({ success: false, error: '该手机号已注册' }); return; }
    const id = 'u_' + Date.now();
    db.insert('shop_users', { id, name, phone, password, status: 'active', integral: 0, balance: 0, level: 'normal' });
    res.json({ success: true, id });
  });
  router.get('/shop-user-info', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = token ? db.findOne('shop_sessions', { token }) : null;
    if (!session) { res.json({ success: false }); return; }
    const user = db.findById('shop_users', session.user_id);
    res.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, level: user.level, integral: user.integral, balance: user.balance } });
  });

  // ---------- 优惠券管理 ----------
  router.get('/shop-coupons', (_req, res) => {
    const coupons = db.findAll('shop_coupons');
    res.json(coupons);
  });
  router.post('/shop-coupons', (req, res) => {
    const { name, type, value, min_amount, total, start_time, end_time, description } = req.body;
    const id = 'cp_' + Date.now();
    db.insert('shop_coupons', { id, name, type: type||'discount', value: value||0, min_amount: min_amount||0, total: total||0, start_time: start_time||'', end_time: end_time||'', description: description||'' });
    res.json({ success: true, id });
  });
  router.put('/shop-coupons/:id', (req, res) => {
    const update: any = {};
    ['name','type','value','min_amount','total','start_time','end_time','status','description'].forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    db.update('shop_coupons', req.params.id, update);
    res.json({ success: true });
  });
  router.delete('/shop-coupons/:id', (req, res) => { db.delete('shop_coupons', req.params.id); res.json({ success: true }); });
  router.post('/shop-coupons/receive', (req, res) => {
    const { user_id, coupon_id } = req.body;
    if (!user_id || !coupon_id) return res.status(400).json({ error: '缺少参数' });
    const cp = db.findById('shop_coupons', coupon_id);
    if (!cp) return res.json({ success: false, error: '优惠券不存在' });
    if (cp.received >= cp.total) return res.json({ success: false, error: '已被领完' });
    db.insert('shop_user_coupons', { id: 'uc_' + Date.now(), user_id, coupon_id });
    db.update('shop_coupons', coupon_id, { received: (cp.received||0) + 1 });
    res.json({ success: true });
  });
  router.get('/shop-user-coupons', (req, res) => {
    const { user_id } = req.query;
    const ucs = user_id ? db.findWhere('shop_user_coupons', { user_id }) : [];
    const result = ucs.map((uc: any) => {
      const cp = db.findById('shop_coupons', uc.coupon_id);
      return { ...uc, coupon: cp };
    });
    res.json(result);
  });

  // ---------- 秒杀管理 ----------
  router.get('/shop-seckill', (_req, res) => {
    const items = db.findAll('shop_seckill');
    res.json(items.map((s: any) => ({ ...s, goods: db.findById('shop_goods', s.goods_id) })));
  });
  router.post('/shop-seckill', (req, res) => {
    const { goods_id, seckill_price, seckill_stock, limit_count, start_time, end_time } = req.body;
    db.insert('shop_seckill', { id: 'sk_' + Date.now(), goods_id, seckill_price, seckill_stock: seckill_stock||0, limit_count: limit_count||1, start_time, end_time });
    res.json({ success: true });
  });
  router.delete('/shop-seckill/:id', (req, res) => { db.delete('shop_seckill', req.params.id); res.json({ success: true }); });

  // ---------- 拼团管理 ----------
  router.get('/shop-group-buy', (_req, res) => {
    const items = db.findAll('shop_group_buy');
    res.json(items.map((s: any) => ({ ...s, goods: db.findById('shop_goods', s.goods_id) })));
  });
  router.post('/shop-group-buy', (req, res) => {
    const { goods_id, group_price, group_stock, group_size, limit_count, start_time, end_time } = req.body;
    const now = Date.now();
    const st = start_time ? new Date(start_time).getTime() : now;
    const status = st > now ? 'upcoming' : 'ongoing';
    db.insert('shop_group_buy', { id: 'gb_' + Date.now(), goods_id, group_price, group_stock: group_stock || 0, group_size: group_size || 2, limit_count: limit_count || 0, start_time, end_time, status });
    res.json({ success: true });
  });
  router.put('/shop-group-buy/:id', (req, res) => { db.update('shop_group_buy', req.params.id, req.body); res.json({ success: true }); });
  router.delete('/shop-group-buy/:id', (req, res) => { db.delete('shop_group_buy', req.params.id); res.json({ success: true }); });

  // 用户开团
  router.post('/shop-group-buy/:id/open', (req, res) => {
    const activity = db.findById('shop_group_buy', req.params.id);
    if (!activity) return res.status(404).json({ error: '活动不存在' });
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: '缺少 user_id' });
    const rec = { id: 'gbr_' + Date.now(), activity_id: activity.id, goods_id: activity.goods_id, leader_id: user_id, current_count: 1, target_count: activity.group_size, status: 'ongoing', members: JSON.stringify([user_id]), end_time: activity.end_time };
    db.insert('shop_group_buy_records', rec);
    res.json({ success: true, record: rec });
  });

  // 用户参团
  router.post('/shop-group-buy-records/:id/join', (req, res) => {
    const rec = db.findById('shop_group_buy_records', req.params.id);
    if (!rec) return res.status(404).json({ error: '团不存在' });
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: '缺少 user_id' });
    const members = JSON.parse(rec.members || '[]');
    if (members.includes(user_id)) return res.json({ success: true, record: rec, msg: '已在团中' });
    if (rec.current_count >= rec.target_count) return res.status(400).json({ error: '该团已满' });
    members.push(user_id);
    const current = rec.current_count + 1;
    const status = current >= rec.target_count ? 'success' : 'ongoing';
    db.update('shop_group_buy_records', rec.id, { members: JSON.stringify(members), current_count: current, status });
    res.json({ success: true, record: { ...rec, members, current_count: current, status } });
  });

  router.get('/shop-group-buy-records', (req, res) => {
    const { user_id, activity_id } = req.query;
    let items = db.findAll('shop_group_buy_records');
    if (user_id) items = items.filter((r: any) => JSON.parse(r.members || '[]').includes(user_id as string));
    if (activity_id) items = items.filter((r: any) => r.activity_id === activity_id);
    res.json(items.map((r: any) => ({ ...r, activity: db.findById('shop_group_buy', r.activity_id), goods: db.findById('shop_goods', r.goods_id) })));
  });

  // ---------- 砍价管理 ----------
  router.get('/shop-bargain', (_req, res) => {
    const items = db.findAll('shop_bargain');
    res.json(items.map((s: any) => ({ ...s, goods: db.findById('shop_goods', s.goods_id) })));
  });
  router.post('/shop-bargain', (req, res) => {
    const { goods_id, start_price, floor_price, bargain_stock, start_time, end_time } = req.body;
    db.insert('shop_bargain', { id: 'bg_' + Date.now(), goods_id, start_price: start_price || 0, floor_price, bargain_stock: bargain_stock || 0, start_time, end_time, status: 'ongoing' });
    res.json({ success: true });
  });
  router.put('/shop-bargain/:id', (req, res) => { db.update('shop_bargain', req.params.id, req.body); res.json({ success: true }); });
  router.delete('/shop-bargain/:id', (req, res) => { db.delete('shop_bargain', req.params.id); res.json({ success: true }); });

  // 用户发起砍价
  router.post('/shop-bargain/:id/start', (req, res) => {
    const act = db.findById('shop_bargain', req.params.id);
    if (!act) return res.status(404).json({ error: '活动不存在' });
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: '缺少 user_id' });
    const rec = { id: 'bgr_' + Date.now(), activity_id: act.id, goods_id: act.goods_id, user_id, current_price: act.start_price || act.floor_price, floor_price: act.floor_price, help_count: 0, status: 'ongoing' };
    db.insert('shop_bargain_records', rec);
    res.json({ success: true, record: rec });
  });

  // 好友帮砍
  router.post('/shop-bargain-records/:id/help', (req, res) => {
    const rec = db.findById('shop_bargain_records', req.params.id);
    if (!rec) return res.status(404).json({ error: '砍价记录不存在' });
    const { user_id, user_name } = req.body;
    if (!user_id) return res.status(400).json({ error: '缺少 user_id' });
    if (rec.status !== 'ongoing') return res.status(400).json({ error: '砍价已结束' });
    const start = rec.current_price;
    const floor = rec.floor_price;
    if (start <= floor) return res.status(400).json({ error: '已砍到最低价' });
    const remain = start - floor;
    let amount = Math.round((remain * (0.05 + Math.random() * 0.20)) * 100) / 100;
    if (amount > remain) amount = remain;
    let newPrice = Math.round((start - amount) * 100) / 100;
    if (newPrice < floor) newPrice = floor;
    const helpCount = rec.help_count + 1;
    const status = newPrice <= floor ? 'success' : 'ongoing';
    db.insert('shop_bargain_helps', { id: 'bgh_' + Date.now(), record_id: rec.id, user_id, user_name: user_name || '', amount });
    db.update('shop_bargain_records', rec.id, { current_price: newPrice, help_count: helpCount, status });
    res.json({ success: true, record: { ...rec, current_price: newPrice, help_count: helpCount, status }, amount });
  });

  router.get('/shop-bargain-records', (req, res) => {
    const { user_id } = req.query;
    let items = db.findAll('shop_bargain_records');
    if (user_id) items = items.filter((r: any) => r.user_id === user_id);
    res.json(items.map((r: any) => ({ ...r, activity: db.findById('shop_bargain', r.activity_id), goods: db.findById('shop_goods', r.goods_id), helps: db.findWhere('shop_bargain_helps', { record_id: r.id }) })));
  });

  // ---------- 会员等级 ----------
  router.get('/shop-member-levels', (_req, res) => {
    const items = db.findAll('shop_member_levels').sort((a: any, b: any) => (a.level || 0) - (b.level || 0));
    res.json(items);
  });
  router.post('/shop-member-levels', (req, res) => {
    const { name, level, min_points, discount, icon, description } = req.body;
    db.insert('shop_member_levels', { id: 'ml_' + Date.now(), name, level: level || 1, min_points: min_points || 0, discount: discount || 1, icon: icon || '', description: description || '' });
    res.json({ success: true });
  });
  router.put('/shop-member-levels/:id', (req, res) => { db.update('shop_member_levels', req.params.id, req.body); res.json({ success: true }); });
  router.delete('/shop-member-levels/:id', (req, res) => { db.delete('shop_member_levels', req.params.id); res.json({ success: true }); });

  // 根据用户积分计算当前等级与折扣
  router.get('/shop-member-levels/current', (req, res) => {
    const { user_id } = req.query;
    const user = user_id ? db.findById('shop_users', user_id as string) : null;
    const points = user ? (user.integral || 0) : 0;
    const levels = db.findAll('shop_member_levels').sort((a: any, b: any) => (b.level || 0) - (a.level || 0));
    const cur = levels.find((l: any) => points >= (l.min_points || 0)) || levels[levels.length - 1] || { level: 0, name: '普通会员', discount: 1 };
    res.json({ user_id, points, level: cur });
  });

  // ---------- 分销管理 ----------
  // 全局配置
  router.get('/shop-distribution-config', (_req, res) => {
    let cfg = db.findById('shop_distribution_config', 'dc_default');
    if (!cfg) { cfg = { id: 'dc_default', is_open: 1, level_mode: 2, settle_type: 'paid', commission_base: 'pay' }; db.insert('shop_distribution_config', cfg); }
    res.json(cfg);
  });
  router.put('/shop-distribution-config', (req, res) => {
    const exist = db.findById('shop_distribution_config', 'dc_default');
    if (!exist) { db.insert('shop_distribution_config', { id: 'dc_default', ...req.body }); }
    else db.update('shop_distribution_config', 'dc_default', req.body);
    res.json({ success: true });
  });

  // 分销等级
  router.get('/shop-distribution-levels', (_req, res) => {
    const items = db.findAll('shop_distribution_levels').sort((a: any, b: any) => (a.level || 0) - (b.level || 0));
    res.json(items);
  });
  router.post('/shop-distribution-levels', (req, res) => {
    const { name, level, rate1, rate2, rate3, icon, description } = req.body;
    db.insert('shop_distribution_levels', { id: 'dl_' + Date.now(), name, level: level || 1, rate1: rate1 || 0, rate2: rate2 || 0, rate3: rate3 || 0, icon: icon || '', description: description || '' });
    res.json({ success: true });
  });
  router.put('/shop-distribution-levels/:id', (req, res) => { db.update('shop_distribution_levels', req.params.id, req.body); res.json({ success: true }); });
  router.delete('/shop-distribution-levels/:id', (req, res) => { db.delete('shop_distribution_levels', req.params.id); res.json({ success: true }); });

  // 分销商 / 推广员
  const genInviteCode = () => {
    let code = '';
    do { code = 'FX' + Math.random().toString(36).slice(2, 8).toUpperCase(); } while (db.findOne('shop_distribution_members', { invite_code: code }));
    return code;
  };
  router.get('/shop-distribution-members', (req, res) => {
    const { user_id, status } = req.query;
    let items = db.findAll('shop_distribution_members');
    if (user_id) items = items.filter((m: any) => m.user_id === user_id);
    if (status) items = items.filter((m: any) => m.status === status);
    res.json(items.map((m: any) => ({ ...m, user: db.findById('shop_users', m.user_id), parent: m.parent_id ? db.findById('shop_users', m.parent_id) : null, level: m.level_id ? db.findById('shop_distribution_levels', m.level_id) : null })));
  });
  // 申请成为分销商（可带邀请码绑定上级）
  router.post('/shop-distribution/apply', (req, res) => {
    const { user_id, user_name, invite_code, level_id } = req.body;
    if (!user_id) return res.status(400).json({ error: '缺少 user_id' });
    const exist = db.findOne('shop_distribution_members', { user_id });
    if (exist) return res.json({ success: true, member: exist, msg: '已是分销商' });
    let parent_id: string | null = null;
    if (invite_code) {
      const inviter = db.findOne('shop_distribution_members', { invite_code });
      if (inviter && inviter.user_id !== user_id) {
        parent_id = inviter.user_id;
        db.update('shop_distribution_members', inviter.id, { team_count: (inviter.team_count || 0) + 1 });
      }
    }
    const member = { id: 'dm_' + Date.now(), user_id, user_name: user_name || '', invite_code: genInviteCode(), parent_id, level_id: level_id || 'dl_1', status: 'approved', total_commission: 0, withdrawable: 0, withdrawn: 0, team_count: 0, created_at: new Date().toISOString() };
    db.insert('shop_distribution_members', member);
    res.json({ success: true, member });
  });
  // 绑定邀请关系（注册后补全上级）
  router.post('/shop-distribution/bind', (req, res) => {
    const { user_id, invite_code } = req.body;
    if (!user_id || !invite_code) return res.status(400).json({ error: '缺少参数' });
    const member = db.findOne('shop_distribution_members', { user_id });
    if (!member) return res.status(404).json({ error: '该用户尚未申请成为分销商' });
    if (member.parent_id) return res.json({ success: true, member, msg: '已绑定上级' });
    const inviter = db.findOne('shop_distribution_members', { invite_code });
    if (!inviter || inviter.user_id === user_id) return res.status(400).json({ error: '邀请码无效' });
    db.update('shop_distribution_members', member.id, { parent_id: inviter.user_id });
    db.update('shop_distribution_members', inviter.id, { team_count: (inviter.team_count || 0) + 1 });
    res.json({ success: true, member: db.findById('shop_distribution_members', member.id) });
  });
  router.post('/shop-distribution-members/:id/approve', (req, res) => { db.update('shop_distribution_members', req.params.id, { status: 'approved' }); res.json({ success: true }); });
  router.post('/shop-distribution-members/:id/reject', (req, res) => { db.update('shop_distribution_members', req.params.id, { status: 'rejected' }); res.json({ success: true }); });
  router.delete('/shop-distribution-members/:id', (req, res) => { db.delete('shop_distribution_members', req.params.id); res.json({ success: true }); });

  // 佣金订单
  router.get('/shop-distribution-orders', (req, res) => {
    const { user_id, distributor_id, status } = req.query;
    let items = db.findAll('shop_distribution_orders');
    if (distributor_id) items = items.filter((o: any) => o.distributor_id === distributor_id);
    if (user_id) items = items.filter((o: any) => o.buyer_id === user_id);
    if (status) items = items.filter((o: any) => o.status === status);
    res.json(items.map((o: any) => ({ ...o, distributor: db.findById('shop_users', o.distributor_id), buyer: o.buyer_id ? db.findById('shop_users', o.buyer_id) : null, order: db.findById('shop_orders', o.order_id) })));
  });
  router.post('/shop-distribution-orders/:id/settle', (req, res) => { db.update('shop_distribution_orders', req.params.id, { status: 'settled', settled_at: new Date().toISOString() }); res.json({ success: true }); });

  // 提现
  router.get('/shop-distribution-withdraw', (req, res) => {
    const { user_id, status } = req.query;
    let items = db.findAll('shop_distribution_withdraw');
    if (user_id) items = items.filter((w: any) => w.user_id === user_id);
    if (status) items = items.filter((w: any) => w.status === status);
    res.json(items);
  });
  router.post('/shop-distribution-withdraw', (req, res) => {
    const { user_id, user_name, amount, account, account_name } = req.body;
    if (!user_id || !amount || amount <= 0) return res.status(400).json({ error: '参数错误' });
    const member = db.findOne('shop_distribution_members', { user_id });
    if (!member) return res.status(400).json({ error: '非分销商' });
    if ((member.withdrawable || 0) < amount) return res.status(400).json({ error: '可提现佣金不足' });
    db.update('shop_distribution_members', member.id, { withdrawable: (member.withdrawable || 0) - amount, withdrawn: (member.withdrawn || 0) + amount });
    db.insert('shop_distribution_withdraw', { id: 'dw_' + Date.now(), user_id, user_name: user_name || member.user_name || '', amount, status: 'pending', account: account || '', account_name: account_name || '', created_at: new Date().toISOString() });
    res.json({ success: true });
  });
  router.post('/shop-distribution-withdraw/:id/done', (req, res) => { db.update('shop_distribution_withdraw', req.params.id, { status: 'done' }); res.json({ success: true }); });
  router.post('/shop-distribution-withdraw/:id/reject', (req, res) => {
    const w = db.findById('shop_distribution_withdraw', req.params.id);
    if (w) {
      const member = db.findOne('shop_distribution_members', { user_id: w.user_id });
      if (member) db.update('shop_distribution_members', member.id, { withdrawable: (member.withdrawable || 0) + w.amount, withdrawn: (member.withdrawn || 0) - w.amount });
    }
    db.update('shop_distribution_withdraw', req.params.id, { status: 'rejected' });
    res.json({ success: true });
  });

  // 我的团队
  router.get('/shop-distribution/team', (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: '缺少 user_id' });
    const all = db.findAll('shop_distribution_members');
    const collect = (pid: string): any[] => {
      const children = all.filter((m: any) => m.parent_id === pid);
      let list = [...children];
      children.forEach((c: any) => { list = list.concat(collect(c.user_id)); });
      return list;
    };
    const direct = all.filter((m: any) => m.parent_id === user_id);
    const team = collect(user_id as string);
    res.json({ direct: direct.map((m: any) => ({ ...m, user: db.findById('shop_users', m.user_id) })), team: team.map((m: any) => ({ ...m, user: db.findById('shop_users', m.user_id) })), directCount: direct.length, teamCount: team.length });
  });

  // ---------- 仓库与库存管理 ----------
  // 库存变动助手：更新商品总库存 + 仓库库存 + 写日志（被手动调整与下单支付复用）
  const applyStockChange = (warehouseId: string | null, goodsId: string, skuCode: string, num: number, type: string, remark: string, operator: string) => {
    const g = db.findById('shop_goods', goodsId);
    if (g) db.update('shop_goods', goodsId, { stock: Math.max(0, (g.stock || 0) + num) });
    let after = 0;
    if (warehouseId) {
      const allWg = db.findWhere('shop_warehouse_goods', { warehouse_id: warehouseId }) as any[];
      let wg = allWg.find((x: any) => x.goods_id === goodsId);
      if (!wg) { wg = { id: 'swg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5), warehouse_id: warehouseId, goods_id: goodsId, sku_code: skuCode || '', stock: 0, freeze_stock: 0 }; db.insert('shop_warehouse_goods', wg); }
      after = Math.max(0, (wg.stock || 0) + num);
      db.update('shop_warehouse_goods', wg.id, { stock: after, sku_code: skuCode || wg.sku_code || '' });
    }
    db.insert('shop_stock_logs', {
      id: 'sl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      warehouse_id: warehouseId, goods_id: goodsId, sku_code: skuCode || '',
      type, num, after_stock: after, remark: remark || '', operator: operator || '',
      created_at: new Date().toISOString()
    });
  };

  router.get('/shop-warehouses', (req, res) => {
    const list = (db.findAll('shop_warehouse') as any[]).sort((a: any, b: any) => (b.is_default || 0) - (a.is_default || 0));
    res.json(list);
  });
  router.post('/shop-warehouses', (req, res) => {
    const { name, code, address, contact, remark, is_default } = req.body;
    if (!name) return res.status(400).json({ error: '缺少名称' });
    const id = 'wh_' + Date.now();
    db.insert('shop_warehouse', { id, name, code: code || '', address: address || '', contact: contact || '', remark: remark || '', is_default: is_default ? 1 : 0, status: 1, created_at: new Date().toISOString() });
    if (is_default) (db.findAll('shop_warehouse') as any[]).forEach((w: any) => { if (w.id !== id) db.update('shop_warehouse', w.id, { is_default: 0 }); });
    res.json({ success: true, id });
  });
  router.put('/shop-warehouses/:id', (req, res) => {
    const { name, code, address, contact, remark, is_default, status } = req.body;
    const upd: any = {};
    if (name !== undefined) upd.name = name;
    if (code !== undefined) upd.code = code;
    if (address !== undefined) upd.address = address;
    if (contact !== undefined) upd.contact = contact;
    if (remark !== undefined) upd.remark = remark;
    if (status !== undefined) upd.status = status;
    if (is_default !== undefined) {
      upd.is_default = is_default ? 1 : 0;
      if (is_default) (db.findAll('shop_warehouse') as any[]).forEach((w: any) => { if (w.id !== req.params.id) db.update('shop_warehouse', w.id, { is_default: 0 }); });
    }
    db.update('shop_warehouse', req.params.id, upd);
    res.json({ success: true });
  });
  router.delete('/shop-warehouses/:id', (req, res) => {
    db.deleteById('shop_warehouse', req.params.id);
    res.json({ success: true });
  });

  // 仓库商品库存列表
  router.get('/shop-warehouse-goods', (req, res) => {
    const { warehouse_id } = req.query;
    let list = db.findAll('shop_warehouse_goods') as any[];
    if (warehouse_id) list = list.filter((x: any) => x.warehouse_id === warehouse_id);
    res.json(list.map((x: any) => ({ ...x, goods: db.findById('shop_goods', x.goods_id) })));
  });
  // 库存调整（入库/出库/盘点）：num 正数入库、负数出库
  router.post('/shop-warehouse/adjust', (req, res) => {
    const { warehouse_id, goods_id, sku_code, num, type, remark, operator } = req.body;
    if (!warehouse_id || !goods_id || num === undefined || num === null) return res.status(400).json({ error: '缺少参数' });
    applyStockChange(warehouse_id, goods_id, sku_code || '', Number(num), type || 'adjust', remark || '', operator || '');
    res.json({ success: true });
  });
  // 库存变动日志
  router.get('/shop-stock-logs', (req, res) => {
    const { warehouse_id, goods_id, type } = req.query;
    let list = db.findAll('shop_stock_logs') as any[];
    if (warehouse_id) list = list.filter((x: any) => x.warehouse_id === warehouse_id);
    if (goods_id) list = list.filter((x: any) => x.goods_id === goods_id);
    if (type) list = list.filter((x: any) => x.type === type);
    list.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(list);
  });

  // ---------- 地区数据(省市区) ----------
  router.get('/shop-region', (req, res) => {
    const parentId = (req.query.parent_id as string) || '0';
    let list = db.findWhere('shop_region', { parent_id: parentId }) as any[];
    list.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    res.json(list);
  });

  // ---------- 支付方式 ----------
  router.get('/shop-pay-methods', (req, res) => {
    const list = (db.findAll('shop_pay_methods') as any[]).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    res.json(list);
  });
  router.put('/shop-pay-methods/:id', (req, res) => {
    const { is_open, config, name, sort_order } = req.body;
    const cur = db.findById('shop_pay_methods', req.params.id);
    if (!cur) { res.status(404).json({ error: '支付方式不存在' }); return; }
    db.update('shop_pay_methods', req.params.id, {
      is_open: is_open !== undefined ? is_open : cur.is_open,
      config: config !== undefined ? (typeof config === 'string' ? config : JSON.stringify(config)) : cur.config,
      name: name !== undefined ? name : cur.name,
      sort_order: sort_order !== undefined ? sort_order : cur.sort_order
    });
    res.json({ success: true });
  });

  // ---------- 系统配置 ----------
  router.get('/sys-config', (req, res) => {
    const list = db.findAll('shop_sys_config') as any[];
    const map: any = {};
    list.forEach((c: any) => { map[c.cfg_key] = c.cfg_value; });
    res.json(map);
  });
  router.put('/sys-config', (req, res) => {
    const body = req.body || {};
    for (const key of Object.keys(body)) {
      const existing = db.findOne('shop_sys_config', { cfg_key: key });
      if (existing) {
        db.update('shop_sys_config', existing.id, { cfg_value: typeof body[key] === 'string' ? body[key] : JSON.stringify(body[key]), updated_at: new Date().toISOString() });
      } else {
        db.insert('shop_sys_config', { id: 'cfg_' + key, cfg_key: key, cfg_value: typeof body[key] === 'string' ? body[key] : JSON.stringify(body[key]), remark: '', updated_at: new Date().toISOString() });
      }
    }
    res.json({ success: true });
  });
  router.post('/sys-cache-clear', (req, res) => {
    // 本系统数据持久化于 SQLite，无独立缓存层；此处提供清缓存钩子（可扩展为清理模板/缩略图缓存）
    try {
      db.query('UPDATE shop_sys_config SET updated_at = ? WHERE cfg_key = ?', [new Date().toISOString(), 'cache_version']);
    } catch (e) { /* ignore */ }
    res.json({ success: true, message: '缓存已清空' });
  });
  router.get('/shop-page-design', (req, res) => {
    const { page_key } = req.query;
    let list = db.findAll('shop_page_design') as any[];
    if (page_key) list = list.filter((x: any) => x.page_key === page_key);
    res.json(list);
  });
  router.post('/shop-page-design', (req, res) => {
    const { page_key, title, blocks } = req.body;
    if (!page_key) { res.status(400).json({ error: 'page_key必填' }); return; }
    const id = 'pd_' + Date.now();
    db.insert('shop_page_design', { id, page_key, title: title || page_key, blocks: blocks ? JSON.stringify(blocks) : '[]', status: 1, updated_at: new Date().toISOString() });
    res.json({ success: true, id });
  });
  router.put('/shop-page-design/:id', (req, res) => {
    const { title, blocks, status } = req.body;
    const cur = db.findById('shop_page_design', req.params.id);
    if (!cur) { res.status(404).json({ error: '页面不存在' }); return; }
    db.update('shop_page_design', req.params.id, {
      title: title !== undefined ? title : cur.title,
      blocks: blocks !== undefined ? (typeof blocks === 'string' ? blocks : JSON.stringify(blocks)) : cur.blocks,
      status: status !== undefined ? status : cur.status,
      updated_at: new Date().toISOString()
    });
    res.json({ success: true });
  });
  router.delete('/shop-page-design/:id', (req, res) => {
    db.deleteById('shop_page_design', req.params.id);
    res.json({ success: true });
  });

  // ---------- 积分管理 ----------
  router.get('/shop-user-points', (req, res) => {
    const { user_id } = req.query;
    const pts = user_id ? db.findOne('shop_user_points', { user_id: user_id as string }) : null;
    const logs = user_id ? db.findWhere('shop_point_logs', { user_id }) : [];
    res.json({ points: pts || { user_id, points: 0, total_earned: 0, total_used: 0 }, logs });
  });
  router.post('/shop-points/earn', (req, res) => {
    const { user_id, points, description } = req.body;
    let p = db.findOne('shop_user_points', { user_id });
    if (!p) {
      const pid = 'pt_' + Date.now();
      db.insert('shop_user_points', { id: pid, user_id, points: points||0, total_earned: 0, total_used: 0 });
      p = db.findById('shop_user_points', pid);
    }
    db.update('shop_user_points', p.id, { points: (p.points||0) + points, total_earned: (p.total_earned||0) + points });
    db.insert('shop_point_logs', { id: 'pl_' + Date.now(), user_id, type: 'earn', points, description: description||'' });
    res.json({ success: true });
  });


// ---------- CMS栏目管理 ----------
  router.get('/cms-channels', (req, res) => {
    const { parent_id, is_show, type } = req.query;
    let channels = db.findAll('cms_channels');
    if (parent_id !== undefined) {
      channels = channels.filter((c: any) => c.parent_id === parent_id || (parent_id === '' && !c.parent_id));
    }
    if (is_show !== undefined) {
      channels = channels.filter((c: any) => c.is_show === (is_show === 'true' ? 1 : 0));
    }
    if (type) {
      channels = channels.filter((c: any) => c.type === type);
    }
    channels.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    res.json(channels);
  });

  router.get('/cms-channels/tree', (req, res) => {
    const all = db.findAll('cms_channels');
    const buildTree = (pid: string | null): any[] => {
      return all
        .filter((c: any) => c.parent_id === pid || (!pid && !c.parent_id))
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((c: any) => ({
          ...c,
          children: buildTree(c.id)
        }));
    };
    res.json(buildTree(null));
  });

  router.get('/cms-channels/:id', (req, res) => {
    const channel = db.findById('cms_channels', req.params.id);
    if (channel) {
      // 获取子栏目
      const children = db.findWhere('cms_channels', { parent_id: req.params.id });
      channel.children = children;
      // 获取文章数量
      const articleCount = db.findWhere('cms_articles', { channel_id: req.params.id, status: 'published' }).length;
      channel.article_count = articleCount;
      res.json(channel);
    } else {
      res.status(404).json({ error: '栏目不存在' });
    }
  });

  router.post('/cms-channels', (req, res) => {
    const { name, parent_id, code, type, content_model, sort_order, is_show, image_url, description, seo_title, seo_keywords, seo_description, template_list, template_detail } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: '栏目名称不能为空' });
      return;
    }
    const id = `cc_${Date.now()}`;
    db.insert('cms_channels', {
      id, name, parent_id: parent_id || null, code, type: type || 'list',
      content_model: content_model || 'article', sort_order: sort_order || 0,
      is_show: is_show !== undefined ? is_show : 1, image_url, description,
      seo_title, seo_keywords, seo_description, template_list, template_detail,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  // 拖拽排序：按传入 id 顺序重设 sort_order
  router.post('/cms-channels/reorder', (req, res) => {
    const ids = (req.body as any).ids || (req.body as any).orderedIds;
    if (!Array.isArray(ids)) { res.status(400).json({ error: 'ids required' }); return; }
    ids.forEach((id: string, i: number) => { db.update('cms_channels', id, { sort_order: i }); });
    res.json({ success: true });
  });

  router.put('/cms-channels/:id', (req, res) => {
    db.update('cms_channels', req.params.id, req.body);
    res.json({ success: true });
  });

  router.delete('/cms-channels/:id', (req, res) => {
    // 检查是否有子栏目
    const children = db.findWhere('cms_channels', { parent_id: req.params.id });
    if (children.length > 0) {
      res.status(400).json({ success: false, message: '请先删除子栏目' });
      return;
    }
    // 检查是否有文章
    const articles = db.findWhere('cms_articles', { channel_id: req.params.id });
    if (articles.length > 0) {
      res.status(400).json({ success: false, message: '请先删除该栏目下的文章' });
      return;
    }
    db.deleteById('cms_channels', req.params.id);
    res.json({ success: true });
  });

  // ---------- CMS增强版文章管理 ----------
  router.get('/cms-articles', (req, res) => {
    const { keyword, channel_id, tag, is_top, is_hot, is_recommend, status, sort, order, page, pageSize } = req.query;
    let articles = db.findAll('cms_articles');
    // 默认隐藏软删除的文章（显式传 status 时尊重调用方意图）
    if (!status) articles = articles.filter((a: any) => a.status !== 'deleted');

    // 筛选条件
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      articles = articles.filter((a: any) =>
        a.title?.toLowerCase().includes(kw) ||
        a.summary?.toLowerCase().includes(kw) ||
        a.keywords?.toLowerCase().includes(kw)
      );
    }
    if (channel_id) articles = articles.filter((a: any) => a.channel_id === channel_id);
    if (tag) articles = articles.filter((a: any) => {
      const tags = JSON.parse(a.tags || '[]');
      return tags.includes(tag);
    });
    if (is_top === '1') articles = articles.filter((a: any) => a.is_top === 1);
    if (is_hot === '1') articles = articles.filter((a: any) => a.is_hot === 1);
    if (is_recommend === '1') articles = articles.filter((a: any) => a.is_recommend === 1);
    if (status) articles = articles.filter((a: any) => a.status === status);

    // 排序
    articles.sort((a: any, b: any) => {
      if (a.is_top !== b.is_top) return b.is_top - a.is_top;
      if (sort === 'view_count') return ((a.view_count || 0) - (b.view_count || 0)) * (order === 'asc' ? 1 : -1);
      if (sort === 'publish_time') return new Date(a.publish_time || a.created_at).getTime() - new Date(b.publish_time || b.created_at).getTime() * (order === 'asc' ? 1 : -1);
      return new Date(b.publish_time || b.created_at).getTime() - new Date(a.publish_time || a.created_at).getTime();
    });

    // 分页
    const pageNum = parseInt(page as string) || 1;
    const size = parseInt(pageSize as string) || 10;
    const total = articles.length;
    const list = articles.slice((pageNum - 1) * size, pageNum * size);

    // 获取栏目信息
    list.forEach((a: any) => {
      const channel = db.findById('cms_channels', a.channel_id);
      if (channel) a.channel_name = channel.name;
    });

    res.json({ list, total, page: pageNum, pageSize: size });
  });

  // 标签云聚合（统计各标签文章数）
  router.get('/cms-tags', (req, res) => {
    const articles = db.findAll('cms_articles') as any[];
    const counter: Record<string, number> = {};
    articles.forEach((a: any) => {
      if (a.status === 'deleted') return;
      let tags: string[] = [];
      try { tags = JSON.parse(a.tags || '[]'); } catch { tags = []; }
      tags.forEach((t: string) => { if (t) counter[t] = (counter[t] || 0) + 1; });
    });
    const list = Object.entries(counter).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    res.json(list);
  });

  router.get('/cms-articles/:id', (req, res) => {
    const article = db.findById('cms_articles', req.params.id);
    if (!article) {
      res.status(404).json({ error: '文章不存在' });
      return;
    }
    // 增加浏览次数
    db.update('cms_articles', req.params.id, {
      view_count: (article.view_count || 0) + 1
    });
    article.view_count = (article.view_count || 0) + 1;

    // 获取栏目信息
    if (article.channel_id) {
      article.channel = db.findById('cms_channels', article.channel_id);
    }

    // 获取标签
    article.tags_list = JSON.parse(article.tags || '[]');
    article.images_list = JSON.parse(article.images || '[]');
    article.attachments_list = db.findWhere('cms_article_attachments', { article_id: req.params.id });
    article.sensitive_hits = JSON.parse(article.sensitive_hits || '[]');

    // 获取评论
    const comments = db.findWhere('cms_comments', { article_id: req.params.id, status: 'approved' });
    article.comments = comments;
    article.comment_count = comments.length;

    // 获取上一篇/下一篇
    const allArticles = db.findWhere('cms_articles', { channel_id: article.channel_id, status: 'published' });
    allArticles.sort((a: any, b: any) => new Date(a.publish_time || a.created_at).getTime() - new Date(b.publish_time || b.created_at).getTime());
    const currentIndex = allArticles.findIndex((a: any) => a.id === req.params.id);
    if (currentIndex > 0) article.prev_article = allArticles[currentIndex - 1];
    if (currentIndex < allArticles.length - 1) article.next_article = allArticles[currentIndex + 1];

    res.json(article);
  });

  router.post('/cms-articles', (req, res) => {
    const { channel_id, title, subtitle, author, source, summary, content, image_url, images, video_url, tags, keywords, is_top, is_hot, is_recommend, status, publish_time, seo_title, seo_keywords, seo_description } = req.body;
    if (!title) {
      res.status(400).json({ success: false, message: '文章标题不能为空' });
      return;
    }
    const hits = scanSensitive(`${title} ${summary} ${content}`);
    if (sensitiveBlock && hits.length > 0) {
      res.status(400).json({ success: false, message: '内容包含敏感词，已拦截发布', hits });
      return;
    }
    const id = `ca_${Date.now()}`;
    db.insert('cms_articles', {
      id, channel_id: channel_id || '', title, subtitle, author, source,
      summary, content, image_url, images: JSON.stringify(images || []),
      video_url, tags: JSON.stringify(tags || []), keywords,
      is_top: is_top ? 1 : 0, is_hot: is_hot ? 1 : 0, is_recommend: is_recommend ? 1 : 0,
      status: status || 'draft', publish_time: publish_time || new Date().toISOString(),
      view_count: 0, like_count: 0, comment_count: 0, favorite_count: 0,
      seo_title, seo_keywords, seo_description, sensitive_hits: JSON.stringify(hits),
      created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    });
    res.json({ success: true, id, sensitive_hits: hits });
  });

  router.put('/cms-articles/:id', (req, res) => {
    const { images, tags, title, summary, content, ...rest } = req.body;
    if (images) rest.images = JSON.stringify(images);
    if (tags) rest.tags = JSON.stringify(tags);
    const hits = scanSensitive(`${title || ''} ${summary || ''} ${content || ''}`);
    if (sensitiveBlock && hits.length > 0) {
      res.status(400).json({ success: false, message: '内容包含敏感词，已拦截保存', hits });
      return;
    }
    rest.sensitive_hits = JSON.stringify(hits);
    rest.updated_at = new Date().toISOString();
    db.update('cms_articles', req.params.id, rest);
    res.json({ success: true, sensitive_hits: hits });
  });

  router.delete('/cms-articles/:id', (req, res) => {
    // 软删除
    db.update('cms_articles', req.params.id, { status: 'deleted', updated_at: new Date().toISOString() });
    res.json({ success: true });
  });

  // 智能标签建议：依据文章标题/正文 + 现有全站标签词库，自动提取候选标签
  router.post('/cms-articles/suggest-tags', (req, res) => {
    const { title = '', content = '' } = req.body as any;
    const text = String(title || '') + ' ' + String(content || '').replace(/<[^>]+>/g, ' ');
    // 现有全站标签词库（排除软删除文章）
    const existing = db.findAll('cms_articles') as any[];
    const vocab = new Set<string>();
    existing.forEach((a: any) => {
      if (a.status === 'deleted') return;
      try { (JSON.parse(a.tags || '[]') as string[]).forEach((t: string) => { if (t) vocab.add(t); }); } catch { /* ignore */ }
    });
    // 1) 词库命中：标题/正文中出现过的已有标签（相关标签，优先）
    const dictMatches = [...vocab].filter(t => text.includes(t));
    // 2) 新词挖掘：CJK n-gram 频率（2-4 字），去停用词
    const STOP = new Set(['我们', '你们', '他们', '这个', '那个', '什么', '可以', '已经', '但是', '因为', '所以', '如果', '通过', '对于', '以及', '并且', '一种', '进行', '需要', '目前', '公司', '文章', '内容', '用户', '系统', '是否', '一些', '这些', '那些', '这样', '那样', '就是', '还是', '怎么', '没有', '不是', '例如', '如下', '以上', '以下', '其中', '同时', '由于', '而且', '或者', '自己', '一个', '不会', '成为', '以及', '以及', '使用', '提供', '实现', '基于', '包括', '相关', '方面', '表示', '认为', '显示', '支持', '开发', '建设', '发展', '提高', '发布', '推出', '获得', '帮助', '服务', '产品', '问题', '情况', '方式', '时候', '地方', '工作', '学习', '生活', '数据', '信息', '技术', '团队', '客户', '市场', '活动', '项目']);
    const freq: Record<string, number> = {};
    const cjk = text.match(/[一-龥]+/g) || [];
    cjk.forEach(seg => {
      for (let n = 2; n <= 4; n++) {
        for (let i = 0; i + n <= seg.length; i++) {
          const w = seg.slice(i, i + n);
          if (STOP.has(w)) continue;
          freq[w] = (freq[w] || 0) + 1;
        }
      }
    });
    const novel = Object.entries(freq)
      .filter(([w, c]) => c >= 2 && !vocab.has(w) && !dictMatches.includes(w))
      .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
      .map(([w]) => w);
    // 去碎片：若候选是更长候选（或已命中标签）的子串，则丢弃，保留更完整的短语
    const allTerms = [...dictMatches, ...novel];
    const deduped = novel.filter(w => !allTerms.some(t => t !== w && t.length > w.length && t.includes(w)));
    const suggestions = [...dictMatches, ...deduped].slice(0, 12);
    res.json({ suggestions });
  });

  // ---------- 敏感词过滤 ----------
  let sensitiveBlock = false; // 命中即拦截（可在后台开启）
  const scanSensitive = (text: string): string[] => {
    const words = (db.findAll('cms_sensitive_words') as any[]).map((w: any) => w.word).filter(Boolean);
    const hits: string[] = [];
    const t = String(text || '').toLowerCase();
    words.forEach((w: string) => { if (t.includes(String(w).toLowerCase())) hits.push(w); });
    return [...new Set(hits)];
  };

  router.get('/sensitive-words', (req, res) => {
    res.json(db.findAll('cms_sensitive_words'));
  });
  router.post('/sensitive-words', (req, res) => {
    const { word, level } = req.body as any;
    if (!word) { res.status(400).json({ error: 'word required' }); return; }
    const id = 'sw_' + Date.now();
    try {
      db.insert('cms_sensitive_words', { id, word, level: level || 1, created_at: new Date().toISOString() });
      res.json({ success: true, id });
    } catch (e) { res.status(400).json({ error: '敏感词已存在' }); }
  });
  router.delete('/sensitive-words/:id', (req, res) => {
    db.delete('cms_sensitive_words', req.params.id);
    res.json({ success: true });
  });
  router.post('/sensitive-words/config', (req, res) => {
    sensitiveBlock = !!(req.body as any).block;
    res.json({ success: true, block: sensitiveBlock });
  });
  // 预检敏感词
  router.post('/cms-articles/check-sensitive', (req, res) => {
    const { title = '', summary = '', content = '' } = req.body as any;
    const hits = scanSensitive(`${title} ${summary} ${content}`);
    res.json({ hits });
  });

  // ===== CMS 拼写检查（#110 剩余项）=====
  // 中文易错词：繁体→简体 + 常见错别字归一（命中即提示建议）
  const SPELL_CN_MAP: [string, string][] = [
    ['帳號', '账号'], ['帳户', '账户'], ['帳戶', '账户'], ['帳', '账'],
    ['裡', '里'], ['語', '语'], ['國', '国'], ['來', '来'], ['員', '员'], ['們', '们'],
    ['時', '时'], ['個', '个'], ['這', '这'], ['開', '开'], ['關', '关'], ['電', '电'],
    ['腦', '脑'], ['網', '网'], ['資', '资'], ['訊', '讯'], ['為', '为'], ['會', '会'],
    ['後', '后'], ['處', '处'], ['點', '点'], ['學', '学'], ['問', '问'], ['實', '实'],
    ['說', '说'], ['麼', '么'], ['應', '应'], ['還', '还'], ['長', '长'], ['東', '东'],
    ['車', '车'], ['書', '书'], ['體', '体'], ['動', '动'], ['機', '机'], ['愛', '爱'],
    ['親', '亲'], ['視', '视'], ['覺', '觉'], ['見', '见'], ['話', '话'], ['兩', '两'],
    ['麵', '面'], ['飛', '飞'], ['魚', '鱼'], ['鳥', '鸟'], ['馬', '马'], ['陸', '陆'],
    ['號', '号'], ['塊', '块'], ['條', '条'], ['張', '张'], ['頁', '页'], ['項', '项'],
    ['類', '类'], ['達', '达'], ['運', '运'], ['輪', '轮'], ['農', '农'], ['鐵', '铁'],
    ['銀', '银'], ['錢', '钱'], ['門', '门'], ['間', '间'], ['觀', '观'], ['規', '规'],
    ['則', '则'], ['創', '创'], ['業', '业'], ['當', '当'], ['戰', '战'], ['歲', '岁'],
    ['縣', '县'], ['歷', '历'], ['圖', '图'], ['質', '质'], ['輕', '轻'], ['輸', '输'],
    ['過', '过'], ['進', '进'], ['遠', '远'], ['邊', '边'], ['辦', '办'], ['務', '务'],
    ['勞', '劳'], ['爾', '尔'], ['靈', '灵'], ['總', '总'], ['結', '结'], ['統', '统'],
    ['線', '线'], ['細', '细'], ['終', '终'], ['習', '习'], ['鄉', '乡'], ['聞', '闻'],
    ['聖', '圣'], ['廠', '厂'], ['廣', '广'], ['場', '场'], ['雲', '云'], ['舉', '举'],
    ['與', '与'], ['讓', '让'], ['認', '认'], ['報', '报'], ['導', '导'], ['囉', '啰'],
    ['夠', '够'], ['遊', '游'], ['於', '于'], ['覆', '复'], ['麥', '麦'], ['鳥', '鸟'],
    ['庫', '库'], ['態', '态'], ['願', '愿'], ['備', '备'], ['專', '专'], ['對', '对'],
    ['稱', '称'], ['參', '参'], ['審', '审'], ['遷', '迁'], ['遞', '递'], ['遙', '遥'],
    ['餘', '余'], ['館', '馆'], ['點擊', '点击'], ['帳號密碼', '账号密码'], ['登陸', '登录'],
    ['重覆', '重复'], ['安裝', '安装'], ['帳單', '账单'], ['備份', '备份'], ['檔案', '档案'],
    ['連線', '连线'], ['線上', '线上'], ['離線', '离线'], ['錯誤', '错误'], ['訊息', '讯息'],
    ['帳目', '账目'], ['帳冊', '帐册']
  ];
  // 英文常见词表（轻量；未收录的词按"疑似拼写有误"提示，用户自行核对）
  const EN_DICT = new Set([
    'the','a','an','and','or','but','if','then','else','for','to','of','in','on','at','by','with','from','as','is','are','was','were','be','been','being','it','this','that','these','those','we','you','they','he','she','i','me','my','your','our','their','his','her','its','not','no','yes','do','does','did','done','has','have','had','will','would','can','could','should','may','might','must','about','into','over','under','again','more','most','some','such','only','own','same','than','too','very','just','also','up','down','out','off','here','there','when','where','why','how','all','any','each','few','other','one','two','three','four','five','six','seven','eight','nine','ten','new','old','good','bad','big','small','high','low','first','last','next','great','large','long','short','own','right','left','open','close','make','made','use','used','using','see','saw','look','find','found','get','got','go','went','come','came','take','took','give','gave','know','knew','think','thought','want','need','help','call','work','worked','working','show','showed','tell','told','ask','try','trying','feel','felt','become','became','leave','left','put','keep','kept','let','begin','began','seem','seen','turn','turned','set','meet','met','include','included','including','provide','provided','create','created','created','add','added','update','updated','delete','deleted','edit','edited','save','saved','send','sent','receive','received','read','write','wrote','written','search','searched','select','selected','choose','chose','chosen','click','clicked','view','viewed','list','listed','item','items','order','orders','product','products','goods','category','categories','user','users','admin','content','contents','article','articles','title','summary','channel','channels','image','images','file','files','data','info','information','system','systems','config','configuration','language','languages','time','date','day','days','week','year','month','today','now','name','type','types','status','value','values','number','count','total','price','amount','money','pay','paid','payment','free','store','shop','home','page','pages','site','sites','word','words','text','link','links','tag','tags','group','groups','level','levels','role','roles','permission','permissions','token','login','logout','register','password','email','phone','address','manage','management','manager','setting','settings','menu','menus','form','forms','field','fields','table','tables','report','reports','test','tests','version','feature','features','module','modules','service','services','api','app','web','http','https','url','id','key','keys','code','message','messages','error','errors','success','warning','note','notes','please','thank','hello','world','china','chinese','english','language','description','keyword','keywords','template','templates','draft','publish','published','review','reviews','top','hot','recommend','bold','color','colored','seo','sitemap','import','export','copy','move','translate','spell','check','checking','plugin','plugins','widget','widgets','theme','themes','cache','caching','region','regions','express','warehouse','warehouses','stock','brand','brands','banner','banners','navigation','coupon','coupons','seckill','groupbuy','bargain','distribution','wallet','balance','points','point','integral','sign','supported','support','supported','enabled','disabled','active','inactive','default','custom','customized','public','private','mobile','desktop','online','offline','feedback','comment','comments','rating','star','stars','favorite','favorites','history','browse','cart','checkout','delivery','ship','shipping','shipment','tracking','return','returns','refund','refunds','cancel','cancelled','confirm','confirmed','pending','approved','rejected','received','processing','completed','failed','await','awaiting','ready','sale','sales','promotion','promotions','discount','discounts','activity','activities','task','tasks','log','logs','notification','notifications','security','secure','safe','risk','audit','statistic','statistics','analysis','dashboard','panel','panelist','option','options','input','output','result','results','query','filter','sort','sorted','asc','desc','true','false','null','none','empty','full','part','partly','both','either','neither','whether','while','because','since','before','after','until','above','below','between','through','across','during','without','within','against','among','upon','once','twice','always','never','often','sometimes','usually','already','still','yet','soon','later','early','fast','slow','early','late','early'
  ]);
  const scanSpell = (text: string): any[] => {
    const raw = String(text || '');
    const hits: any[] = [];
    // 中文易错词
    for (const [wrong, right] of SPELL_CN_MAP) {
      let idx = raw.indexOf(wrong);
      while (idx >= 0) {
        const ctx = raw.slice(Math.max(0, idx - 12), idx + wrong.length + 12);
        hits.push({ word: wrong, suggestion: right, context: ctx, type: 'cn' });
        idx = raw.indexOf(wrong, idx + wrong.length);
      }
    }
    // 英文疑似拼写
    const seen = new Set<string>();
    const re = /[A-Za-z]+/g; let m: RegExpExecArray | null;
    while ((m = re.exec(raw)) !== null) {
      const tk = m[0]; const low = tk.toLowerCase();
      if (seen.has(low)) continue;
      if (!EN_DICT.has(low)) { seen.add(low); const ctx = raw.slice(Math.max(0, m.index - 12), m.index + tk.length + 12); hits.push({ word: tk, suggestion: '', context: ctx, type: 'en' }); }
    }
    return hits;
  };
  // 预检拼写
  router.post('/cms-articles/check-spell', (req, res) => {
    const { title = '', summary = '', content = '' } = req.body as any;
    const hits = scanSpell(`${title} ${summary} ${content}`);
    res.json({ hits });
  });

  // 文章附件：上传 / 列表 / 删除
  const attachmentsDir = path.join(uploadDir, 'attachments');
  if (!fs.existsSync(attachmentsDir)) fs.mkdirSync(attachmentsDir, { recursive: true });
  router.post('/cms-articles/:id/attachments', upload.single('file'), (req: any, res: any) => {
    const article = db.findById('cms_articles', req.params.id);
    if (!article) { res.status(404).json({ error: '文章不存在' }); return; }
    const file = req.file;
    if (!file) { res.status(400).json({ error: 'No file' }); return; }
    const ext = path.extname(file.originalname).toLowerCase();
    const newName = `att_${Date.now()}${ext}`;
    fs.renameSync(file.path, path.join(attachmentsDir, newName));
    const id = 'att_' + Date.now();
    db.insert('cms_article_attachments', {
      id, article_id: req.params.id, file_name: file.originalname,
      file_path: `/uploads/attachments/${newName}`, file_size: file.size, created_at: new Date().toISOString()
    });
    res.json({ success: true, attachment: { id, article_id: req.params.id, file_name: file.originalname, file_path: `/uploads/attachments/${newName}`, file_size: file.size } });
  });
  router.get('/cms-articles/:id/attachments', (req, res) => {
    res.json(db.findWhere('cms_article_attachments', { article_id: req.params.id }));
  });
  router.delete('/cms-article-attachments/:aid', (req, res) => {
    const att = db.findById('cms_article_attachments', req.params.aid);
    if (att && att.file_path) {
      const p = path.join(process.cwd(), String(att.file_path).replace(/^\/+/, ''));
      try { fs.unlinkSync(p); } catch { /* ignore */ }
    }
    db.delete('cms_article_attachments', req.params.aid);
    res.json({ success: true });
  });

  // Word 导入：上传 .docx → mammoth 解析为 HTML → 生成草稿文章
  router.post('/cms-articles/import-word', upload.single('file'), async (req: any, res: any) => {
    const file = req.file;
    if (!file) { res.status(400).json({ error: 'No file' }); return; }
    if (!/\.docx?$/i.test(file.originalname)) { res.status(400).json({ error: '仅支持 .docx 文件' }); fs.unlinkSync(file.path); return; }
    try {
      const mammoth = require('mammoth');
      const htmlResult = await mammoth.convertToHtml({ buffer: fs.readFileSync(file.path) });
      const textResult = await mammoth.extractRawText({ buffer: fs.readFileSync(file.path) });
      const firstLine = (textResult.value || '').split('\n').map((s: string) => s.trim()).find(Boolean) || '未命名文档';
      const title = firstLine.slice(0, 80);
      const id = `ca_${Date.now()}`;
      db.insert('cms_articles', {
        id, channel_id: req.body.channel_id || '', title,
        summary: (textResult.value || '').slice(0, 200), content: htmlResult.value,
        tags: '[]', images: '[]', status: 'draft',
        view_count: 0, like_count: 0, comment_count: 0, favorite_count: 0,
        sensitive_hits: '[]', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      });
      fs.unlinkSync(file.path);
      res.json({ success: true, id, title, content: htmlResult.value });
    } catch (e: any) {
      try { fs.unlinkSync(file.path); } catch { /* ignore */ }
      res.status(500).json({ error: 'Word 解析失败: ' + e.message });
    }
  });

  // 跨栏目复制：将文章复制为新草稿到目标栏目
  router.post('/cms-articles/:id/copy', (req, res) => {
    const src = db.findById('cms_articles', req.params.id) as any;
    if (!src) { res.status(404).json({ error: '文章不存在' }); return; }
    const { channel_id } = req.body;
    const id = `ca_${Date.now()}`;
    const now = new Date().toISOString();
    db.insert('cms_articles', {
      id,
      channel_id: channel_id || src.channel_id || '',
      title: (src.title || '未命名') + ' (副本)',
      subtitle: src.subtitle, author: src.author, source: src.source,
      summary: src.summary, content: src.content, image_url: src.image_url,
      images: src.images, video_url: src.video_url, tags: src.tags,
      keywords: src.keywords,
      is_top: 0, is_hot: 0, is_recommend: 0,
      status: 'draft', publish_time: now,
      view_count: 0, like_count: 0, comment_count: 0, favorite_count: 0,
      seo_title: src.seo_title, seo_keywords: src.seo_keywords, seo_description: src.seo_description,
      created_at: now, updated_at: now
    });
    res.json({ success: true, id });
  });

  // 批量替换：对选中文章批量设置字段值，或在 content/title/summary 中做文本查找替换
  router.post('/cms-articles/batch-replace', (req, res) => {
    const { ids, field, value, search, replacement } = req.body as any;
    if (!Array.isArray(ids) || ids.length === 0) { res.status(400).json({ error: '请选择文章' }); return; }
    if (!field && (search === undefined || search === null || search === '')) { res.status(400).json({ error: '请提供要替换的字段或文本' }); return; }
    let done = 0;
    const now = new Date().toISOString();
    ids.forEach((id: string) => {
      const a = db.findById('cms_articles', id) as any;
      if (!a) return;
      const patch: any = { updated_at: now };
      if (field && value !== undefined) {
        if (['is_top', 'is_hot', 'is_recommend'].includes(field)) patch[field] = value ? 1 : 0;
        else patch[field] = value;
      }
      if (search !== undefined && search !== null && search !== '') {
        const rep = replacement || '';
        if (a.content) patch.content = String(a.content).split(String(search)).join(rep);
        if (a.title) patch.title = String(a.title).split(String(search)).join(rep);
        if (a.summary) patch.summary = String(a.summary).split(String(search)).join(rep);
      }
      db.update('cms_articles', id, patch);
      done++;
    });
    res.json({ success: true, done });
  });

  // 导出：按筛选条件导出文章为 JSON 数组（独立路径，避免与 /cms-articles/:id 冲突）
  router.get('/cms-export', (req, res) => {
    const { channel_id, tag, keyword, status } = req.query;
    let articles = db.findAll('cms_articles') as any[];
    if (status) articles = articles.filter((a: any) => a.status === status);
    else articles = articles.filter((a: any) => a.status !== 'deleted');
    if (channel_id) articles = articles.filter((a: any) => a.channel_id === channel_id);
    if (tag) articles = articles.filter((a: any) => { try { return JSON.parse(a.tags || '[]').includes(tag); } catch { return false; } });
    if (keyword) { const kw = String(keyword).toLowerCase(); articles = articles.filter((a: any) => (a.title || '').toLowerCase().includes(kw) || (a.summary || '').toLowerCase().includes(kw)); }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="cms-articles-export.json"');
    res.json({ count: articles.length, articles });
  });

  // 导入：从 JSON 数组导入文章（生成新 id 避免冲突）
  router.post('/cms-import', (req, res) => {
    const { articles } = req.body as any;
    if (!Array.isArray(articles) || articles.length === 0) { res.status(400).json({ error: '无效的文章数据' }); return; }
    let imported = 0;
    const now = new Date().toISOString();
    articles.forEach((a: any) => {
      if (!a || !a.title) return;
      const id = `ca_${Date.now()}_${imported}`;
      db.insert('cms_articles', {
        id, channel_id: a.channel_id || '', title: a.title, subtitle: a.subtitle, author: a.author, source: a.source,
        summary: a.summary, content: a.content || '', image_url: a.image_url,
        images: typeof a.images === 'string' ? a.images : JSON.stringify(a.images || []),
        video_url: a.video_url, tags: typeof a.tags === 'string' ? a.tags : JSON.stringify(a.tags || []),
        keywords: a.keywords,
        is_top: a.is_top ? 1 : 0, is_hot: a.is_hot ? 1 : 0, is_recommend: a.is_recommend ? 1 : 0,
        status: a.status || 'draft', publish_time: a.publish_time || now,
        view_count: 0, like_count: 0, comment_count: 0, favorite_count: 0,
        seo_title: a.seo_title, seo_keywords: a.seo_keywords, seo_description: a.seo_description,
        created_at: now, updated_at: now
      });
      imported++;
    });
    res.json({ success: true, imported });
  });
  router.put('/cms-articles/:id/review', (req, res) => {
    const { action, reason } = req.body; // action: 'approve' | 'reject'
    const newStatus = action === 'approve' ? 'published' : 'draft';
    db.update('cms_articles', req.params.id, { status: newStatus, updated_at: new Date().toISOString() });
    res.json({ success: true, status: newStatus });
  });
  router.put('/cms-articles/:id/restore', (req, res) => {
    db.update('cms_articles', req.params.id, { status: 'draft', updated_at: new Date().toISOString() });
    res.json({ success: true });
  });

  // ---------- 文章导出/批量操作 ----------
  router.get('/cms-articles-export', (req, res) => {
    const articles = db.findAll('cms_articles');
    const headers = 'ID,标题,栏目,作者,状态,浏览,发布时间,标签\n';
    const rows = articles.map((a: any) =>
      `"${a.id}","${a.title}","${a.channel_name||''}","${a.author||''}","${a.status}","${a.view_count||0}","${a.publish_time||a.created_at}","${a.tags||''}"`
    ).join('\n');
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename=articles.csv');
    res.send(headers + rows);
  });
  router.put('/cms-articles-batch', (req, res) => {
    const { ids, action, channel_id } = req.body;
    const articleIds = Array.isArray(ids) ? ids : [ids];
    if (action === 'delete') {
      articleIds.forEach((id: string) => db.update('cms_articles', id, { status: 'deleted', updated_at: new Date().toISOString() }));
    } else if (action === 'publish') {
      articleIds.forEach((id: string) => db.update('cms_articles', id, { status: 'published', updated_at: new Date().toISOString() }));
    } else if (action === 'move' && channel_id) {
      articleIds.forEach((id: string) => db.update('cms_articles', id, { channel_id, updated_at: new Date().toISOString() }));
    }
    res.json({ success: true });
  });

  // 栏目导出
  router.get('/cms-channels-export', (req, res) => {
    const channels = db.findAll('cms_channels');
    const headers = 'ID,名称,编码,上级栏目,类型,排序,是否显示,SEO标题\n';
    const rows = channels.map((c: any) =>
      `"${c.id}","${c.name}","${c.code}","${c.parent_id||''}","${c.type||'article'}","${c.sort_order}","${c.is_show}","${c.seo_title||''}"`
    ).join('\n');
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename=channels.csv');
    res.send(headers + rows);
  });

  // ---------- CMS评论 ----------
  router.get('/cms-comments', (req, res) => {
    const { article_id, status, page, pageSize } = req.query;
    let comments = db.findAll('cms_comments');
    if (article_id) comments = comments.filter((c: any) => c.article_id === article_id);
    if (status) comments = comments.filter((c: any) => c.status === status);
    comments.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const pageNum = parseInt(page as string) || 1;
    const size = parseInt(pageSize as string) || 20;
    const total = comments.length;
    const list = comments.slice((pageNum - 1) * size, pageNum * size);

    res.json({ list, total, page: pageNum, pageSize: size });
  });

  router.post('/cms-comments', (req, res) => {
    const { article_id, user_id, user_name, user_avatar, content, parent_id } = req.body;
    const id = `ccm_${Date.now()}`;
    db.insert('cms_comments', {
      id, article_id, user_id, user_name, user_avatar, content,
      parent_id: parent_id || null, reply_count: 0, like_count: 0,
      status: 'pending', created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/cms-comments/:id', (req, res) => {
    db.update('cms_comments', req.params.id, req.body);
    res.json({ success: true });
  });

  router.delete('/cms-comments/:id', (req, res) => {
    db.deleteById('cms_comments', req.params.id);
    res.json({ success: true });
  });

  // ---------- CMS留言 ----------
  router.get('/cms-messages', (req, res) => {
    const { status, page, pageSize } = req.query;
    let messages = db.findAll('cms_messages');
    if (status) messages = messages.filter((m: any) => m.status === status);
    messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const pageNum = parseInt(page as string) || 1;
    const size = parseInt(pageSize as string) || 10;
    const total = messages.length;
    const list = messages.slice((pageNum - 1) * size, pageNum * size);

    res.json({ list, total, page: pageNum, pageSize: size });
  });

  router.post('/cms-messages', (req, res) => {
    const { user_name, user_email, user_phone, subject, content } = req.body;
    const id = `cmsg_${Date.now()}`;
    db.insert('cms_messages', {
      id, user_name, user_email, user_phone, subject, content,
      status: 'pending', reply: null, reply_time: null,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/cms-messages/:id', (req, res) => {
    const { reply, status } = req.body;
    const updates: any = { status };
    if (reply) {
      updates.reply = reply;
      updates.reply_time = new Date().toISOString();
    }
    db.update('cms_messages', req.params.id, updates);
    res.json({ success: true });
  });

  // ==================== CMS幻灯片/广告API ====================

  // 获取幻灯片列表
  router.get('/cms-slides', (req, res) => {
    const { position, status } = req.query;
    let slides = db.findAll('cms_slides');
    if (position) slides = slides.filter((s: any) => s.position === position);
    if (status) slides = slides.filter((s: any) => s.status === status);
    else slides = slides.filter((s: any) => s.status === 'active');
    slides.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    res.json(slides);
  });

  // 创建幻灯片
  router.post('/cms-slides', (req, res) => {
    const { title, image_url, link_url, position, sort_order, start_time, end_time } = req.body;
    const id = `cms_slide_${Date.now()}`;
    db.insert('cms_slides', {
      id, title, image_url, link_url,
      position: position || 'home',
      sort_order: sort_order || 0,
      status: 'active',
      start_time, end_time,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  // 更新幻灯片
  router.put('/cms-slides/:id', (req, res) => {
    db.update('cms_slides', req.params.id, req.body);
    res.json({ success: true });
  });

  // 删除幻灯片
  router.delete('/cms-slides/:id', (req, res) => {
    db.deleteById('cms_slides', req.params.id);
    res.json({ success: true });
  });

  // ==================== CMS导航API ====================

  // 获取导航列表
  router.get('/cms-navigation', (req, res) => {
    const { location } = req.query;
    let navs = db.findAll('cms_navigation');
    if (location) navs = navs.filter((n: any) => n.location === location);
    navs.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    res.json(navs);
  });

  // 创建导航
  router.post('/cms-navigation', (req, res) => {
    const { name, url, icon, location, sort_order, is_show, parent_id } = req.body;
    const id = `cms_nav_${Date.now()}`;
    db.insert('cms_navigation', {
      id, name, url, icon, parent_id,
      location: location || 'header',
      sort_order: sort_order || 0,
      is_show: is_show !== false ? 1 : 0,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  // 更新导航
  router.put('/cms-navigation/:id', (req, res) => {
    db.update('cms_navigation', req.params.id, req.body);
    res.json({ success: true });
  });

  // 删除导航
  router.delete('/cms-navigation/:id', (req, res) => {
    db.deleteById('cms_navigation', req.params.id);
    res.json({ success: true });
  });

  // ==================== CMS表单API ====================

  // 获取表单列表
  router.get('/cms-forms', (req, res) => {
    const { keyword, status } = req.query;
    let forms = db.findAll('cms_forms');
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      forms = forms.filter((f: any) => f.name.toLowerCase().includes(kw));
    }
    if (status) forms = forms.filter((f: any) => f.status === status);
    res.json(forms);
  });

  // 获取表单详情
  router.get('/cms-forms/:id', (req, res) => {
    const form = db.findById('cms_forms', req.params.id);
    if (form) {
      const fields = db.findWhere('cms_form_fields', { form_id: req.params.id });
      res.json({ ...form, fields });
    } else {
      res.status(404).json({ error: '表单不存在' });
    }
  });

  // 创建表单
  router.post('/cms-forms', (req, res) => {
    const { name, description, fields, settings } = req.body;
    const id = `cms_form_${Date.now()}`;
    db.insert('cms_forms', {
      id, name, description,
      fields: JSON.stringify(fields || []),
      settings: JSON.stringify(settings || {}),
      status: 'active',
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  // 更新表单
  router.put('/cms-forms/:id', (req, res) => {
    const { name, description, fields, settings, status } = req.body;
    const updates: any = { name, description, status };
    if (fields) updates.fields = JSON.stringify(fields);
    if (settings) updates.settings = JSON.stringify(settings);
    db.update('cms_forms', req.params.id, updates);
    res.json({ success: true });
  });

  // 删除表单
  router.delete('/cms-forms/:id', (req, res) => {
    db.deleteById('cms_forms', req.params.id);
    // 删除关联字段
    const fields = db.findWhere('cms_form_fields', { form_id: req.params.id });
    fields.forEach((f: any) => db.deleteById('cms_form_fields', f.id));
    res.json({ success: true });
  });

  // 提交表单数据
  router.post('/cms-forms/:id/submit', (req, res) => {
    const { data } = req.body;
    const form = db.findById('cms_forms', req.params.id);
    if (!form) {
      res.status(404).json({ success: false, message: '表单不存在' });
      return;
    }
    const id = `cms_form_data_${Date.now()}`;
    db.insert('cms_form_data', {
      id, form_id: req.params.id,
      data: JSON.stringify(data),
      ip: req.ip,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  // 获取表单数据
  router.get('/cms-forms/:id/data', (req, res) => {
    let formData = db.findWhere('cms_form_data', { form_id: req.params.id });
    formData = formData.map((d: any) => ({
      ...d,
      data: JSON.parse(d.data || '{}')
    }));
    res.json(formData);
  });

  // ==================== CMS用户API ====================

  // 用户注册
  router.post('/cms-register', (req, res) => {
    const { username, password, email, nickname } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: '请提供用户名和密码' });
      return;
    }
    const exist = db.findWhere('cms_users', { username });
    if (exist.length > 0) {
      res.status(400).json({ success: false, message: '用户名已存在' });
      return;
    }
    const id = `cms_user_${Date.now()}`;
    db.insert('cms_users', {
      id, username, password, email, nickname,
      avatar: '', status: 'active',
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  // 用户登录
  router.post('/cms-login', (req, res) => {
    const { username, password } = req.body;
    const users = db.findWhere('cms_users', { username, password });
    if (users.length === 0) {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
      return;
    }
    const user = users[0];
    if (user.status !== 'active') {
      res.status(403).json({ success: false, message: '账号已被禁用' });
      return;
    }
    const token = `cms_tok_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar }
    });
  });

  // 获取CMS用户信息
  router.get('/cms-user/info', (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) {
      res.status(401).json({ error: '未登录' });
      return;
    }
    const token = auth.replace('Bearer ', '');
    const sessions = db.findWhere('cms_sessions', { token });
    if (sessions.length === 0) {
      res.status(401).json({ error: '登录已过期' });
      return;
    }
    const user = db.findById('cms_users', sessions[0].user_id);
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }
    res.json({ id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar, email: user.email });
  });

  // ==================== CMS链接API ====================

  // 获取链接列表
  router.get('/cms-links', (req, res) => {
    const { type, status } = req.query;
    let links = db.findAll('cms_links');
    if (type) links = links.filter((l: any) => l.type === type);
    if (status) links = links.filter((l: any) => l.status === status);
    else links = links.filter((l: any) => l.status === 'active');
    links.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    res.json(links);
  });

  // 创建链接
  router.post('/cms-links', (req, res) => {
    const { name, url, logo, type, sort_order } = req.body;
    const id = `cms_link_${Date.now()}`;
    db.insert('cms_links', {
      id, name, url, logo,
      type: type || 'friend',
      sort_order: sort_order || 0,
      status: 'active',
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  // 更新链接
  router.put('/cms-links/:id', (req, res) => {
    db.update('cms_links', req.params.id, req.body);
    res.json({ success: true });
  });

  // 删除链接
  router.delete('/cms-links/:id', (req, res) => {
    db.deleteById('cms_links', req.params.id);
    res.json({ success: true });
  });

  // ==================== CMS内容分组API ====================

  // 获取内容分组列表
  router.get('/cms-content-groups', (_req, res) => {
    const groups = db.findAll('cms_content_groups');
    res.json(groups.map((g: any) => {
      const articleIds = JSON.parse(g.article_ids || '[]');
      return { ...g, article_count: articleIds.length, articles: articleIds.map((aid: string) => db.findById('cms_articles', aid)).filter(Boolean) };
    }));
  });

  // 创建内容分组
  router.post('/cms-content-groups', (req, res) => {
    const { name, type, description, image_url, article_ids, sort_order, is_show } = req.body;
    const id = `cg_${Date.now()}`;
    db.insert('cms_content_groups', {
      id, name, type: type || 'topic', description: description || '', image_url: image_url || '',
      article_ids: JSON.stringify(article_ids || []), sort_order: sort_order || 0,
      is_show: is_show === undefined ? 1 : is_show, created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  // 更新内容分组
  router.put('/cms-content-groups/:id', (req, res) => {
    db.update('cms_content_groups', req.params.id, req.body);
    res.json({ success: true });
  });

  // 删除内容分组
  router.delete('/cms-content-groups/:id', (req, res) => {
    db.deleteById('cms_content_groups', req.params.id);
    res.json({ success: true });
  });

  // 向分组添加文章
  router.post('/cms-content-groups/:id/articles', (req, res) => {
    const g = db.findById('cms_content_groups', req.params.id);
    if (!g) return res.status(404).json({ error: '分组不存在' });
    const { article_id } = req.body;
    if (!article_id) return res.status(400).json({ error: '缺少 article_id' });
    const ids = JSON.parse(g.article_ids || '[]');
    if (!ids.includes(article_id)) ids.push(article_id);
    db.update('cms_content_groups', g.id, { article_ids: JSON.stringify(ids) });
    res.json({ success: true, article_ids: ids });
  });

  // 从分组移除文章
  router.delete('/cms-content-groups/:id/articles/:articleId', (req, res) => {
    const g = db.findById('cms_content_groups', req.params.id);
    if (!g) return res.status(404).json({ error: '分组不存在' });
    const ids = JSON.parse(g.article_ids || '[]').filter((x: string) => x !== req.params.articleId);
    db.update('cms_content_groups', g.id, { article_ids: JSON.stringify(ids) });
    res.json({ success: true });
  });

  // ==================== CMS网站配置API ====================

  // 获取网站配置
  router.get('/cms-config', (req, res) => {
    const configs = db.findAll('cms_config');
    const configObj: any = {};
    configs.forEach((c: any) => { configObj[c.key] = c.value; });
    res.json(configObj);
  });

  // 更新网站配置
  router.put('/cms-config', (req, res) => {
    const updates = req.body;
    Object.entries(updates).forEach(([key, value]) => {
      const existing = db.findWhere('cms_config', { key });
      if (existing.length > 0) {
        db.update('cms_config', existing[0].id, { value });
      } else {
        db.insert('cms_config', { id: `cms_cfg_${Date.now()}`, key, value });
      }
    });
    res.json({ success: true });
  });

  // ==================== 网站管理 ====================

  // 文章管理
  router.get('/web-articles', (req, res) => {
    const { keyword, category, status } = req.query;
    let articles = db.findAll('web_articles');
    if (status) articles = articles.filter((a: any) => a.status === status);
    if (category) articles = articles.filter((a: any) => a.category === category);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      articles = articles.filter((a: any) => a.title.toLowerCase().includes(kw));
    }
    res.json(articles);
  });

  router.get('/web-articles/:id', (req, res) => {
    const article = db.findById('web_articles', req.params.id);
    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ error: '文章不存在' });
    }
  });

  router.post('/web-articles', (req, res) => {
    const { title, slug, content, summary, category, tags, author, status, publish_date } = req.body;
    if (!title) {
      res.status(400).json({ success: false, message: '请提供标题' });
      return;
    }
    const id = `art_${Date.now()}`;
    db.insert('web_articles', {
      id, title, slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      content, summary, category, tags, author, status: status || 'draft',
      view_count: 0, publish_date, created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/web-articles/:id', (req, res) => {
    const { title, content, summary, category, tags, status, publish_date } = req.body;
    db.update('web_articles', req.params.id, { 
      title, content, summary, category, tags, status, publish_date,
      updated_at: new Date().toISOString()
    });
    res.json({ success: true });
  });

  router.delete('/web-articles/:id', (req, res) => {
    db.deleteById('web_articles', req.params.id);
    res.json({ success: true });
  });

  // 分类管理
  router.get('/web-categories', (req, res) => {
    res.json(db.findAll('web_categories'));
  });

  router.post('/web-categories', (req, res) => {
    const { name, slug, description, parent_id, sort_order } = req.body;
    const id = `cat_${Date.now()}`;
    db.insert('web_categories', {
      id, name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description, parent_id, sort_order: sort_order || 0,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/web-categories/:id', (req, res) => {
    db.update('web_categories', req.params.id, req.body);
    res.json({ success: true });
  });

  router.delete('/web-categories/:id', (req, res) => {
    db.deleteById('web_categories', req.params.id);
    res.json({ success: true });
  });

  // Banner管理
  router.get('/web-banners', (req, res) => {
    const { position, status } = req.query;
    let banners = db.findAll('web_banners');
    if (position) banners = banners.filter((b: any) => b.position === position);
    if (status) banners = banners.filter((b: any) => b.status === status);
    res.json(banners);
  });

  router.post('/web-banners', (req, res) => {
    const { title, image_url, link_url, position, sort_order, start_date, end_date } = req.body;
    const id = `bnr_${Date.now()}`;
    db.insert('web_banners', {
      id, title, image_url, link_url, position: position || 'home',
      sort_order: sort_order || 0, status: 'active',
      start_date, end_date, created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/web-banners/:id', (req, res) => {
    db.update('web_banners', req.params.id, req.body);
    res.json({ success: true });
  });

  router.delete('/web-banners/:id', (req, res) => {
    db.deleteById('web_banners', req.params.id);
    res.json({ success: true });
  });

  // ==================== 商城管理 ====================

  // ---------- 商品分类管理 ----------
  router.get('/shop-categories', (req, res) => {
    const { parent_id, is_show } = req.query;
    let categories = db.findAll('shop_categories');
    if (parent_id !== undefined) {
      categories = categories.filter((c: any) => c.parent_id === parent_id || (parent_id === '' && !c.parent_id));
    }
    if (is_show !== undefined) {
      categories = categories.filter((c: any) => c.is_show === (is_show === 'true' ? 1 : 0));
    }
    categories.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    res.json(categories);
  });

  router.get('/shop-categories/tree', (req, res) => {
    const all = db.findAll('shop_categories');
    const buildTree = (pid: string | null): any[] => {
      return all
        .filter((c: any) => c.parent_id === pid || (!pid && !c.parent_id))
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((c: any) => ({
          ...c,
          children: buildTree(c.id)
        }));
    };
    res.json(buildTree(null));
  });

  router.post('/shop-categories', (req, res) => {
    const { name, parent_id, icon, image_url, sort_order, is_show, is_home, description, seo_title, seo_keywords, seo_description } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: '分类名称不能为空' });
      return;
    }
    const id = `scat_${Date.now()}`;
    db.insert('shop_categories', {
      id, name, parent_id: parent_id || null, icon, image_url,
      sort_order: sort_order || 0, is_show: is_show !== undefined ? is_show : 1,
      is_home: is_home || 0, description, seo_title, seo_keywords, seo_description,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/shop-categories/:id', (req, res) => {
    db.update('shop_categories', req.params.id, req.body);
    res.json({ success: true });
  });

  router.delete('/shop-categories/:id', (req, res) => {
    // 检查是否有子分类
    const children = db.findWhere('shop_categories', { parent_id: req.params.id });
    if (children.length > 0) {
      res.status(400).json({ success: false, message: '请先删除子分类' });
      return;
    }
    db.deleteById('shop_categories', req.params.id);
    res.json({ success: true });
  });

  // ---------- 商品品牌管理 ----------
  router.get('/shop-brands', (req, res) => {
    const { category_id, is_show } = req.query;
    let brands = db.findAll('shop_brands');
    if (is_show !== undefined) {
      brands = brands.filter((b: any) => b.is_show === (is_show === 'true' ? 1 : 0));
    }
    if (category_id) {
      brands = brands.filter((b: any) => {
        const cats = JSON.parse(b.category_ids || '[]');
        return cats.includes(category_id);
      });
    }
    brands.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    res.json(brands);
  });

  router.get('/shop-brands/:id', (req, res) => {
    const brand = db.findById('shop_brands', req.params.id);
    if (brand) res.json(brand);
    else res.status(404).json({ error: '品牌不存在' });
  });

  router.post('/shop-brands', (req, res) => {
    const { name, logo_url, description, sort_order, is_show, category_ids, seo_title, seo_keywords } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: '品牌名称不能为空' });
      return;
    }
    const id = `sb_${Date.now()}`;
    db.insert('shop_brands', {
      id, name, logo_url, description, sort_order: sort_order || 0,
      is_show: is_show !== undefined ? is_show : 1,
      category_ids: JSON.stringify(category_ids || []),
      seo_title, seo_keywords,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/shop-brands/:id', (req, res) => {
    const { category_ids, ...rest } = req.body;
    if (category_ids) rest.category_ids = JSON.stringify(category_ids);
    db.update('shop_brands', req.params.id, rest);
    res.json({ success: true });
  });

  router.delete('/shop-brands/:id', (req, res) => {
    db.deleteById('shop_brands', req.params.id);
    res.json({ success: true });
  });

  // ---------- 商品规格模板 ----------
  router.get('/shop-spec-templates', (req, res) => {
    const templates = db.findAll('shop_spec_templates');
    res.json(templates);
  });

  router.post('/shop-spec-templates', (req, res) => {
    const { name, specs, is_active } = req.body;
    const id = `sst_${Date.now()}`;
    db.insert('shop_spec_templates', {
      id, name, specs: JSON.stringify(specs || []),
      is_active: is_active !== undefined ? is_active : 1,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  // ---------- 商品参数模板 ----------
  router.get('/shop-params-templates', (req, res) => {
    const templates = db.findAll('shop_params_templates');
    res.json(templates);
  });

  router.post('/shop-params-templates', (req, res) => {
    const { name, params, is_active } = req.body;
    const id = `spt_${Date.now()}`;
    db.insert('shop_params_templates', {
      id, name, params: JSON.stringify(params || []),
      is_active: is_active !== undefined ? is_active : 1,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  // ---------- 增强版商品管理 ----------
  router.get('/shop-goods', (req, res) => {
    const { keyword, category, brand, is_hot, is_new, is_recommend, is_promotion, status, sort, order, page, pageSize } = req.query;
    let goods = db.findAll('shop_goods');

    // 筛选条件
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      goods = goods.filter((g: any) =>
        g.name?.toLowerCase().includes(kw) ||
        g.sku?.toLowerCase().includes(kw) ||
        g.description?.toLowerCase().includes(kw)
      );
    }
    if (category) goods = goods.filter((g: any) => {
      if (g.category_id === category) return true;
      try { return (JSON.parse(g.category_ids || '[]')).includes(category); } catch { return false; }
    });
    if (brand) goods = goods.filter((g: any) => g.brand_id === brand);
    if (is_hot === '1') goods = goods.filter((g: any) => g.is_hot === 1);
    if (is_new === '1') goods = goods.filter((g: any) => g.is_new === 1);
    if (is_recommend === '1') goods = goods.filter((g: any) => g.is_recommend === 1);
    if (is_promotion === '1') goods = goods.filter((g: any) => g.is_promotion === 1);
    if (status) goods = goods.filter((g: any) => g.status === status);

    // 排序
    const sortField = (sort as string) || 'sort_order';
    const sortDirection = order === 'asc' ? 1 : -1;
    goods.sort((a: any, b: any) => {
      if (sortField === 'price') return (a.price - b.price) * sortDirection;
      if (sortField === 'sales_count') return ((a.sales_count || 0) - (b.sales_count || 0)) * sortDirection;
      if (sortField === 'view_count') return ((a.view_count || 0) - (b.view_count || 0)) * sortDirection;
      if (sortField === 'created_at') return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * sortDirection;
      return ((a.sort_order || 0) - (b.sort_order || 0)) * sortDirection;
    });

    // 分页
    const pageNum = parseInt(page as string) || 1;
    const size = parseInt(pageSize as string) || 20;
    const total = goods.length;
    const list = goods.slice((pageNum - 1) * size, pageNum * size);

    res.json({ list, total, page: pageNum, pageSize: size });
  });

  router.get('/shop-goods/:id', (req, res) => {
    const goods = db.findById('shop_goods', req.params.id);
    if (!goods) {
      res.status(404).json({ error: '商品不存在' });
      return;
    }
    // 增加浏览次数
    db.update('shop_goods', req.params.id, {
      view_count: (goods.view_count || 0) + 1
    });
    goods.view_count = (goods.view_count || 0) + 1;

    // 获取SKU列表
    const skus = db.findWhere('shop_goods_skus', { goods_id: req.params.id });
    goods.skus = skus;

    // 获取分类信息
    if (goods.category_id) {
      goods.category = db.findById('shop_categories', goods.category_id);
    }

    // 获取品牌信息
    if (goods.brand_id) {
      goods.brand = db.findById('shop_brands', goods.brand_id);
    }

    // 获取评论统计
    const comments = db.findWhere('shop_goods_comments', { goods_id: req.params.id, status: 'approved' });
    goods.comment_count = comments.length;
    if (comments.length > 0) {
      goods.avg_rating = comments.reduce((sum: number, c: any) => sum + (c.rating || 5), 0) / comments.length;
    }

    res.json(goods);
  });

  router.post('/shop-goods', (req, res) => {
    const {
      name, category_id, category_mode, category_ids, brand_id, sku, price, original_price, cost_price,
      stock, virtual_stock, images, main_image, video_url, description,
      spec_data, param_data, spec_images, extend_data, seo_title, seo_keywords, seo_description,
      weight, volume, unit, barcode, is_hot, is_new, is_recommend, is_promotion,
      promotion_price, promotion_start, promotion_end, status, sort_order
    } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: '商品名称不能为空' });
      return;
    }

    const id = `sg_${Date.now()}`;
    db.insert('shop_goods', {
      id, name, category_id, category_mode: category_mode || 'single',
      category_ids: JSON.stringify(category_ids || []), brand_id, sku, price: price || 0,
      spec_images: JSON.stringify(spec_images || {}),
      extend_data: JSON.stringify(extend_data || []),
      original_price, cost_price, stock: stock || 0, virtual_stock: virtual_stock || 0,
      sales_count: 0, view_count: 0, favorite_count: 0, comment_count: 0,
      images: JSON.stringify(images || []), main_image,
      video_url, description,
      spec_data: JSON.stringify(spec_data || {}),
      param_data: JSON.stringify(param_data || {}),
      seo_title, seo_keywords, seo_description,
      weight: weight || 0, volume: volume || 0, unit: unit || '件', barcode,
      is_hot: is_hot ? 1 : 0, is_new: is_new ? 1 : 0,
      is_recommend: is_recommend ? 1 : 0, is_promotion: is_promotion ? 1 : 0,
      promotion_price, promotion_start, promotion_end,
      status: status || 'active', sort_order: sort_order || 0,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/shop-goods/:id', (req, res) => {
    const { images, spec_data, param_data, ...rest } = req.body;
    if (images) rest.images = JSON.stringify(images);
    if (spec_data) rest.spec_data = JSON.stringify(spec_data);
    if (param_data) rest.param_data = JSON.stringify(param_data);
    rest.updated_at = new Date().toISOString();
    db.update('shop_goods', req.params.id, rest);
    res.json({ success: true });
  });

  router.delete('/shop-goods/:id', (req, res) => {
    db.deleteById('shop_goods', req.params.id);
    res.json({ success: true });
  });

  // ---------- 商品SKU变体 ----------
  router.get('/shop-goods-skus', (req, res) => {
    const { goods_id } = req.query;
    if (goods_id) {
      res.json(db.findWhere('shop_goods_skus', { goods_id }));
    } else {
      res.json(db.findAll('shop_goods_skus'));
    }
  });

  router.post('/shop-goods-skus', (req, res) => {
    const { goods_id, sku_code, barcode, spec_values, price, original_price, cost_price, stock, sales_count, image_url, weight, status } = req.body;
    const id = `sgs_${Date.now()}`;
    db.insert('shop_goods_skus', {
      id, goods_id, sku_code, barcode,
      spec_values: JSON.stringify(spec_values || {}),
      price: price || 0, original_price, cost_price,
      stock: stock || 0, sales_count: sales_count || 0,
      image_url, weight: weight || 0, status: status || 'active',
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/shop-goods-skus/:id', (req, res) => {
    const { spec_values, ...rest } = req.body;
    if (spec_values) rest.spec_values = JSON.stringify(spec_values);
    db.update('shop_goods_skus', req.params.id, rest);
    res.json({ success: true });
  });

  router.delete('/shop-goods-skus/:id', (req, res) => {
    db.deleteById('shop_goods_skus', req.params.id);
    res.json({ success: true });
  });

  // ---------- 商品SKU ----------
  router.get('/shop-goods-skus', (req, res) => {
    const { goods_id } = req.query;
    const skus = goods_id ? db.findWhere('shop_goods_skus', { goods_id }) : db.findAll('shop_goods_skus');
    res.json(skus);
  });
  router.post('/shop-goods-skus', (req, res) => {
    const { id, goods_id, spec_values, price, original_price, cost_price, stock, sku_code } = req.body;
    db.insert('shop_goods_skus', { id: id || 'sk_' + Date.now(), goods_id, spec_values: spec_values || '', price: price || 0, original_price: original_price || 0, cost_price: cost_price || 0, stock: stock || 0, sku_code: sku_code || '' });
    res.json({ success: true });
  });
  router.put('/shop-goods-skus/:id', (req, res) => {
    db.update('shop_goods_skus', req.params.id, req.body);
    res.json({ success: true });
  });
  router.delete('/shop-goods-skus/:id', (req, res) => {
    db.delete('shop_goods_skus', req.params.id);
    res.json({ success: true });
  });

  // ---------- 商品参数模板 ----------
  router.get('/shop-params', (req, res) => {
    const { category_id } = req.query;
    let params = db.findAll('shop_goods_params');
    if (category_id) params = params.filter((p: any) => p.category_id === category_id);
    res.json(params);
  });
  router.post('/shop-params', (req, res) => {
    const { category_id, name, value } = req.body;
    db.insert('shop_goods_params', { id: 'sp_' + Date.now(), category_id, name, value });
    res.json({ success: true });
  });
  router.put('/shop-params/:id', (req, res) => {
    db.update('shop_goods_params', req.params.id, req.body);
    res.json({ success: true });
  });
  router.delete('/shop-params/:id', (req, res) => {
    db.delete('shop_goods_params', req.params.id);
    res.json({ success: true });
  });

  // ---------- 商品评论 ----------
  router.get('/shop-goods-comments', (req, res) => {
    const { goods_id, status, page, pageSize } = req.query;
    let comments = db.findAll('shop_goods_comments');
    if (goods_id) comments = comments.filter((c: any) => c.goods_id === goods_id);
    if (status) comments = comments.filter((c: any) => c.status === status);
    comments.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const pageNum = parseInt(page as string) || 1;
    const size = parseInt(pageSize as string) || 10;
    const total = comments.length;
    const list = comments.slice((pageNum - 1) * size, pageNum * size);

    res.json({ list, total, page: pageNum, pageSize: size });
  });

  router.post('/shop-goods-comments', (req, res) => {
    const { goods_id, order_id, order_goods_id, user_id, user_name, user_avatar, rating, content, images, is_anonymous } = req.body;
    const id = `sgc_${Date.now()}`;
    db.insert('shop_goods_comments', {
      id, goods_id, order_id, order_goods_id, user_id, user_name, user_avatar,
      rating: rating || 5, content, images: JSON.stringify(images || []),
      is_anonymous: is_anonymous ? 1 : 0, reply_count: 0, like_count: 0,
      status: 'pending', created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/shop-goods-comments/:id', (req, res) => {
    const { admin_reply, admin_reply_time, status, ...rest } = req.body;
    if (admin_reply) {
      rest.admin_reply = admin_reply;
      rest.admin_reply_time = admin_reply_time || new Date().toISOString();
    }
    db.update('shop_goods_comments', req.params.id, rest);
    res.json({ success: true });
  });

  // ---------- 用户收货地址 ----------
  router.get('/shop-addresses', (req, res) => {
    const { user_id, is_default } = req.query;
    let addresses = db.findAll('shop_user_addresses');
    if (user_id) addresses = addresses.filter((a: any) => a.user_id === user_id);
    if (is_default === '1') addresses = addresses.filter((a: any) => a.is_default === 1);
    addresses.sort((a: any, b: any) => b.is_default - a.is_default);
    res.json(addresses);
  });

  router.get('/shop-addresses/:id', (req, res) => {
    const address = db.findById('shop_user_addresses', req.params.id);
    if (address) res.json(address);
    else res.status(404).json({ error: '地址不存在' });
  });

  router.post('/shop-addresses', (req, res) => {
    const { user_id, contact_name, contact_phone, province, city, district, address, is_default } = req.body;
    if (!contact_name || !contact_phone || !address) {
      res.status(400).json({ success: false, message: '请填写完整的收货信息' });
      return;
    }
    const id = `saddr_${Date.now()}`;
    // 如果设为默认，先取消其他默认
    if (is_default) {
      const all = db.findAll('shop_user_addresses');
      all.filter((a: any) => a.is_default === 1).forEach((a: any) => {
        db.update('shop_user_addresses', a.id, { is_default: 0 });
      });
    }
    db.insert('shop_user_addresses', {
      id, user_id: user_id || 'guest',
      contact_name, contact_phone, province: province || '', city: city || '', district: district || '',
      address, is_default: is_default ? 1 : 0,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/shop-addresses/:id', (req, res) => {
    const { is_default, ...rest } = req.body;
    if (is_default === 1) {
      const all = db.findAll('shop_user_addresses');
      all.filter((a: any) => a.is_default === 1).forEach((a: any) => {
        db.update('shop_user_addresses', a.id, { is_default: 0 });
      });
    }
    db.update('shop_user_addresses', req.params.id, rest);
    res.json({ success: true });
  });

  router.delete('/shop-addresses/:id', (req, res) => {
    db.deleteById('shop_user_addresses', req.params.id);
    res.json({ success: true });
  });

  // ---------- 用户收藏 ----------
  router.get('/shop-favorites', (req, res) => {
    const { user_id } = req.query;
    let favorites = db.findAll('shop_user_favorites');
    if (user_id) favorites = favorites.filter((f: any) => f.user_id === user_id);
    favorites.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(favorites);
  });

  router.post('/shop-favorites', (req, res) => {
    const { user_id, goods_id } = req.body;
    if (!goods_id) {
      res.status(400).json({ success: false, message: '商品ID不能为空' });
      return;
    }
    // 检查是否已收藏
    const existing = db.findWhere('shop_user_favorites', { user_id: user_id || 'guest', goods_id });
    if (existing.length > 0) {
      res.json({ success: true, message: '已收藏' });
      return;
    }
    const id = `sfav_${Date.now()}`;
    db.insert('shop_user_favorites', {
      id, user_id: user_id || 'guest', goods_id,
      created_at: new Date().toISOString()
    });
    // 更新商品收藏数
    const goods = db.findById('shop_goods', goods_id);
    if (goods) {
      db.update('shop_goods', goods_id, { favorite_count: (goods.favorite_count || 0) + 1 });
    }
    res.json({ success: true, id });
  });

  router.delete('/shop-favorites/:id', (req, res) => {
    const favorite = db.findById('shop_user_favorites', req.params.id);
    if (favorite) {
      db.deleteById('shop_user_favorites', req.params.id);
      // 减少商品收藏数
      const goods = db.findById('shop_goods', favorite.goods_id);
      if (goods) {
        db.update('shop_goods', favorite.goods_id, { favorite_count: Math.max(0, (goods.favorite_count || 0) - 1) });
      }
    }
    res.json({ success: true });
  });

  router.delete('/shop-favorites', (req, res) => {
    const { user_id, goods_id } = req.query;
    const favorites = db.findWhere('shop_user_favorites', { user_id: user_id as string || 'guest', goods_id: goods_id as string });
    favorites.forEach(f => {
      db.deleteById('shop_user_favorites', f.id);
      const goods = db.findById('shop_goods', f.goods_id);
      if (goods) {
        db.update('shop_goods', f.goods_id, { favorite_count: Math.max(0, (goods.favorite_count || 0) - 1) });
      }
    });
    res.json({ success: true });
  });

  // ---------- 用户积分 ----------
  router.get('/shop-points', (req, res) => {
    const { user_id } = req.query;
    let points = db.findAll('shop_user_points');
    if (user_id) points = points.filter((p: any) => p.user_id === user_id);
    res.json(points);
  });

  router.post('/shop-points', (req, res) => {
    const { user_id, points, type, description } = req.body;
    const id = `sp_${Date.now()}`;
    db.insert('shop_user_points', {
      id, user_id: user_id || 'guest',
      points: points || 0, type: type || 'earn',
      description: description || '',
      balance: 0,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  // ---------- 浏览历史 ----------
  router.get('/shop-history', (req, res) => {
    const { user_id } = req.query;
    let history = db.findAll('shop_history');
    if (user_id) history = history.filter((h: any) => h.user_id === user_id);
    history.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    // 去重，保留最新
    const seen = new Set();
    history = history.filter(h => {
      if (seen.has(h.goods_id)) return false;
      seen.add(h.goods_id);
      return true;
    });
    res.json(history.slice(0, 50));
  });

  router.post('/shop-history', (req, res) => {
    const { user_id, goods_id } = req.body;
    // 删除旧的
    const existing = db.findWhere('shop_history', { user_id: user_id || 'guest', goods_id });
    existing.forEach(h => db.deleteById('shop_history', h.id));
    // 添加新的
    const id = `sh_${Date.now()}`;
    db.insert('shop_history', {
      id, user_id: user_id || 'guest', goods_id,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.delete('/shop-history', (req, res) => {
    const { user_id } = req.query;
    const history = db.findWhere('shop_history', { user_id: user_id as string || 'guest' });
    history.forEach(h => db.deleteById('shop_history', h.id));
    res.json({ success: true });
  });

  // 支付方式管理
  router.get('/shop-payments', (_req, res) => {
    const methods = db.findAll('shop_payment_methods');
    res.json(methods.map((m: any) => ({ ...m, config: typeof m.config === 'string' ? JSON.parse(m.config || '{}') : (m.config || {}) })));
  });
  router.put('/shop-payments/:id', (req, res) => {
    const { name, is_enable, config } = req.body;
    const update: any = { is_enable: is_enable !== undefined ? is_enable : 1 };
    if (name) update.name = name;
    if (config) update.config = JSON.stringify(config);
    db.update('shop_payment_methods', req.params.id, update);
    res.json({ success: true });
  });

  // 购物车管理
  router.get('/shop-cart', (req, res) => {
    const { user_id } = req.query;
    const items = user_id ? db.findWhere('shop_cart_items', { user_id }) : [];
    res.json(items);
  });
  router.post('/shop-cart', (req, res) => {
    const { user_id, product_id, goods_name, price, quantity, sku } = req.body;
    if (!user_id || !product_id) return res.status(400).json({ error: '缺少参数' });
    const existing = db.findWhere('shop_cart_items', { user_id, product_id, sku: sku || '' });
    if (existing.length > 0) {
      db.update('shop_cart_items', existing[0].id, { quantity: (existing[0].quantity || 1) + (quantity || 1) });
    } else {
      db.insert('shop_cart_items', { id: 'cart_' + Date.now(), user_id, product_id, price: price || 0, quantity: quantity || 1, sku: sku || '' });
    }
    res.json({ success: true });
  });
  router.put('/shop-cart/:id', (req, res) => { db.update('shop_cart_items', req.params.id, { quantity: req.body.quantity }); res.json({ success: true }); });
  router.delete('/shop-cart/:id', (req, res) => { db.delete('shop_cart_items', req.params.id); res.json({ success: true }); });

  // 商城订单管理
  router.get('/shop-orders', (req, res) => {
    const { keyword, order_status, pay_status, page, pageSize } = req.query;
    let orders = db.findAll('shop_orders');
    if (order_status) orders = orders.filter((o: any) => o.order_status === order_status);
    if (pay_status) orders = orders.filter((o: any) => o.pay_status === pay_status);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      orders = orders.filter((o: any) => 
        o.order_no?.toLowerCase().includes(kw) || o.user_name?.toLowerCase().includes(kw)
      );
    }
    // 获取订单明细
    orders = orders.map((o: any) => {
      const items = db.findWhere('shop_order_items', { order_id: o.id });
      return { ...o, items };
    });
    // 排序
    orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    // 分页
    const pageNum = parseInt(page as string) || 1;
    const size = parseInt(pageSize as string) || 10;
    const total = orders.length;
    const list = orders.slice((pageNum - 1) * size, pageNum * size);
    res.json({ list, total, page: pageNum, pageSize: size });
  });

  router.post('/shop-orders', (req, res) => {
    const { user_id, user_name, user_phone, user_email, shipping_address, items, remark } = req.body;
    const parsedItems = typeof items === 'string' ? JSON.parse(items || '[]') : (items || []);
    
    const id = `so_${Date.now()}`;
    const order_no = `SO${Date.now().toString().slice(-10)}`;
    
    let total_amount = 0;
    parsedItems.forEach((item: any) => {
      total_amount += (item.price || 0) * (item.quantity || 1);
    });

    db.insert('shop_orders', {
      id, order_no, user_id, user_name, user_phone, user_email, shipping_address,
      total_amount, discount_amount: 0, pay_amount: total_amount,
      pay_status: 'unpaid', order_status: 'pending', remark,
      created_at: new Date().toISOString()
    });

    parsedItems.forEach((item: any) => {
      const itemId = `si_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      db.insert('shop_order_items', {
        id: itemId, order_id: id,
        product_id: item.goods_id || item.product_id, sku: item.sku,
        product_name: item.goods_name || item.product_name,
        quantity: item.quantity, price: item.price,
        amount: (item.price || 0) * (item.quantity || 1)
      });
    });

    logOrder(id, 'create', '订单创建' + (remark ? '：' + remark : ''), user_id || 'system');
    res.json({ success: true, id, order_no });
  });

  router.put('/shop-orders/:id', (req, res) => {
    const { order_status, pay_status, remark, shipping_address, payment_method, tracking_no, tracking_company, operator } = req.body;
    const updates: any = { order_status, pay_status, remark };
    if (pay_status === 'paid') updates.paid_at = new Date().toISOString();
    if (order_status === 'shipped') {
      updates.shipped_at = new Date().toISOString();
      updates.tracking_no = tracking_no;
      updates.tracking_company = tracking_company;
      logOrder(req.params.id, 'shipped', (tracking_company ? tracking_company + ' ' : '') + (tracking_no || ''), operator || 'admin');
    }
    if (order_status === 'completed' || order_status === 'received') {
      logOrder(req.params.id, 'received', '买家确认收货', operator || 'user');
    }
    if (order_status === 'cancelled') {
      logOrder(req.params.id, 'cancelled', '订单取消', operator || 'user');
    }
    if (shipping_address) updates.shipping_address = shipping_address;
    if (payment_method) updates.pay_method = payment_method;
    db.update('shop_orders', req.params.id, updates);
    res.json({ success: true });
  });

  router.get('/shop-orders/:id', (req, res) => {
    const order = db.findById('shop_orders', req.params.id);
    if (order) {
      const items = db.findWhere('shop_order_items', { order_id: req.params.id });
      res.json({ ...order, items });
    } else {
      res.status(404).json({ error: '订单不存在' });
    }
  });

  // 支付完成后的统一钩子：分销佣金 + 库存扣减
  const logOrder = (orderId: string, action: string, remark = '', operator = 'system') => {
    try {
      db.insert('shop_order_logs', {
        id: 'ol_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        order_id: orderId, action, remark, operator, created_at: new Date().toISOString()
      });
    } catch (e) { console.error('订单日志写入失败', e); }
  };

  const finalizePaidOrder = (order: any) => {
    // 分销佣金结算：按买家上级链计算一/二/三级佣金
    try {
      const cfg = db.findById('shop_distribution_config', 'dc_default');
      if (cfg && cfg.is_open && order.user_id) {
        const base = cfg.commission_base === 'goods' ? (order.total_amount || 0) : (order.pay_amount || order.total_amount || 0);
        const maxLevel = cfg.level_mode || 1;
        let node = db.findOne('shop_distribution_members', { user_id: order.user_id });
        let lv = 1;
        while (node && node.parent_id && lv <= maxLevel) {
          const parent = db.findOne('shop_distribution_members', { user_id: node.parent_id });
          if (!parent) break;
          const lvl = parent.level_id ? db.findById('shop_distribution_levels', parent.level_id) : null;
          const rate = lvl ? (lv === 1 ? lvl.rate1 : lv === 2 ? lvl.rate2 : lvl.rate3) : 0;
          if (rate > 0 && base > 0) {
            const commission = Math.round(base * rate * 100) / 100;
            if (commission > 0) {
              db.insert('shop_distribution_orders', {
                id: 'dso_' + Date.now() + '_' + lv + '_' + Math.random().toString(36).slice(2, 6),
                order_id: order.id, buyer_id: order.user_id, distributor_id: parent.user_id,
                distribute_level: lv, goods_money: base, commission, status: 'pending', created_at: new Date().toISOString()
              });
              db.update('shop_distribution_members', parent.id, {
                total_commission: (parent.total_commission || 0) + commission,
                withdrawable: (parent.withdrawable || 0) + commission
              });
            }
          }
          node = parent;
          lv++;
        }
      }
    } catch (e) { console.error('分销佣金计算失败', e); }
    // 库存扣减：支付成功后按订单明细扣减商品总库存与默认仓库库存
    try {
      const wh = (db.findOne('shop_warehouse', { is_default: 1 }) as any) || (db.findAll('shop_warehouse') as any[])[0];
      const items = db.findWhere('shop_order_items', { order_id: order.id }) as any[];
      items.forEach((it: any) => {
        applyStockChange(wh ? wh.id : null, it.product_id, it.sku || '', -(it.quantity || 0), 'order', '订单支付扣减 #' + order.order_no, 'system');
      });
    } catch (e) { console.error('库存扣减失败', e); }
  };

  router.post('/shop-orders/:id/pay', (req, res) => {
    const order = db.findById('shop_orders', req.params.id);
    if (!order) {
      res.status(404).json({ error: '订单不存在' });
      return;
    }
    if (order.pay_status !== 'unpaid') {
      res.status(400).json({ error: '订单已支付' });
      return;
    }
    const { payment_method } = req.body;
    const pm = payment_method || 'online';
    // 线下支付：提交后等待管理员确认收款
    if (pm === 'offline') {
      db.update('shop_orders', req.params.id, {
        pay_status: 'offline_pending',
        pay_method: 'offline',
        order_status: 'offline_pending',
        paid_at: null
      });
      logOrder(req.params.id, 'pay_offline_pending', '提交线下支付，待管理员确认', 'user');
      res.json({ success: true, message: '已提交线下支付，等待管理员确认收款', pay_type: 'offline' });
      return;
    }
    db.update('shop_orders', req.params.id, {
      pay_status: 'paid',
      pay_method: 'online',
      paid_at: new Date().toISOString()
    });
    logOrder(req.params.id, 'paid', '在线支付成功', 'user');
    finalizePaidOrder(order);
    res.json({ success: true, message: '支付成功' });
  });

  // 后台确认线下支付收款
  router.post('/shop-orders/:id/confirm-pay', (req, res) => {
    const order = db.findById('shop_orders', req.params.id);
    if (!order) {
      res.status(404).json({ error: '订单不存在' });
      return;
    }
    if (order.pay_status !== 'offline_pending') {
      res.status(400).json({ error: '订单不是线下待确认状态' });
      return;
    }
    db.update('shop_orders', req.params.id, {
      pay_status: 'paid',
      paid_at: new Date().toISOString(),
      order_status: 'paid'
    });
    logOrder(req.params.id, 'paid', '管理员确认线下收款，订单生效', 'admin');
    finalizePaidOrder(order);
    res.json({ success: true, message: '已确认收款，订单生效' });
  });

  // ---------- 售后管理（退货退款 + 仅退款 + 退货物流 + 库存回滚） ----------
  // 售后状态机：
  //   仅退款(refund): pending → approved → refunded | rejected
  //   退货退款(return): pending → approved → return_shipped → return_received → refunded | rejected
  const restoreAftersaleStock = (orderId: string) => {
    try {
      const wh = (db.findOne('shop_warehouse', { is_default: 1 }) as any) || (db.findAll('shop_warehouse') as any[])[0];
      const items = db.findWhere('shop_order_items', { order_id: orderId }) as any[];
      items.forEach((it: any) => {
        applyStockChange(wh ? wh.id : null, it.product_id, it.sku || '', (it.quantity || 0), 'return', '售后退货回滚 #' + orderId, 'system');
      });
    } catch (e) { console.error('售后库存回滚失败', e); }
  };

  router.get('/shop-order-aftersale', (req, res) => {
    const { order_id, user_id, status } = req.query as any;
    let items = db.findAll('shop_order_aftersale') as any[];
    if (order_id) items = items.filter((r: any) => r.order_id === order_id);
    if (user_id) items = items.filter((r: any) => r.user_id === user_id);
    if (status) items = items.filter((r: any) => r.status === status);
    items = items.map((r: any) => ({ ...r, order: db.findById('shop_orders', r.order_id) }));
    items.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(items);
  });

  router.post('/shop-order-aftersale', (req, res) => {
    const { order_id, user_id, type, reason, refund_amount, description, order_goods_id, images } = req.body;
    if (!order_id || !type) return res.status(400).json({ success: false, message: '缺少参数' });
    if (!['refund', 'return'].includes(type)) return res.status(400).json({ success: false, message: '售后类型无效' });
    const existing = (db.findWhere('shop_order_aftersale', { order_id }) as any[]).filter((r: any) => r.status !== 'rejected');
    if (existing.length) return res.status(400).json({ success: false, message: '该订单已有售后申请，无法重复提交' });
    const id = 'as_' + Date.now();
    db.insert('shop_order_aftersale', {
      id, order_id, order_goods_id: order_goods_id || '0', user_id: user_id || '',
      type, reason: reason || '', refund_amount: refund_amount || 0,
      description: description || '', images: images ? JSON.stringify(images) : '[]', status: 'pending',
      created_at: new Date().toISOString(),
    });
    const order = db.findById('shop_orders', order_id);
    if (order) db.update('shop_orders', order_id, { order_status: 'refunding' });
    res.json({ success: true, id });
  });

  router.put('/shop-order-aftersale/:id', (req, res) => {
    const as = db.findById('shop_order_aftersale', req.params.id) as any;
    if (!as) return res.status(404).json({ success: false, message: '售后单不存在' });
    const body = req.body || {};
    const now = new Date().toISOString();
    const newStatus: string | undefined = body.status ? (body.status === 'completed' ? 'refunded' : body.status) : undefined;
    const update: any = { updated_at: now };
    if (newStatus) update.status = newStatus;
    if (body.admin_remark !== undefined) update.admin_remark = body.admin_remark;
    if (body.reject_reason !== undefined) update.reject_reason = body.reject_reason;
    if (body.reviewer !== undefined) update.reviewer = body.reviewer;
    if (body.refund_amount !== undefined) update.refund_amount = body.refund_amount;
    if (body.refund_method !== undefined) update.refund_method = body.refund_method;
    if (body.return_tracking_no !== undefined) update.return_tracking_no = body.return_tracking_no;
    if (body.return_tracking_company !== undefined) update.return_tracking_company = body.return_tracking_company;
    if (body.return_shipped_at !== undefined) update.return_shipped_at = body.return_shipped_at || now;
    if (body.received_at !== undefined) update.received_at = body.received_at || now;
    if (newStatus && ['approved', 'rejected', 'return_received', 'refunded'].includes(newStatus)) {
      update.handle_time = as.handle_time || now;
    }
    db.update('shop_order_aftersale', req.params.id, update);

    const st = newStatus || as.status;
    const order = db.findById('shop_orders', as.order_id) as any;
    const operator = body.reviewer || 'admin';
    if (st === 'approved') {
      db.update('shop_orders', as.order_id, { order_status: 'refunding' });
      logOrder(as.order_id, 'aftersale_approved', '售后申请通过（' + (as.type === 'return' ? '退货退款' : '仅退款') + '）', operator);
    } else if (st === 'rejected') {
      const back = order && order.pay_status === 'paid' ? 'paid' : 'completed';
      db.update('shop_orders', as.order_id, { order_status: back });
      logOrder(as.order_id, 'aftersale_rejected', '售后申请被拒绝' + (body.reject_reason ? '：' + body.reject_reason : ''), operator);
    } else if (st === 'return_received') {
      // 商家收货确认 → 商品回库（仅退货类型，且此前未回滚过）
      if (as.type === 'return' && !as.received_at) restoreAftersaleStock(as.order_id);
      db.update('shop_orders', as.order_id, { order_status: 'refunding' });
      logOrder(as.order_id, 'aftersale_received', '商家已收货，待退款', operator);
    } else if (st === 'refunded') {
      // 退货类型若此前未走收货回滚，则在此补回滚，避免丢库存
      if (as.type === 'return' && !as.received_at) restoreAftersaleStock(as.order_id);
      db.update('shop_order_aftersale', req.params.id, { refunded_at: now });
      db.update('shop_orders', as.order_id, { order_status: 'refunded' });
      logOrder(as.order_id, 'aftersale_refunded', '退款完成' + (body.refund_method ? '（' + body.refund_method + '）' : ''), operator);
    }
    res.json({ success: true, aftersale: db.findById('shop_order_aftersale', req.params.id) });
  });

  // 订单操作追溯日志
  router.get('/shop-order-logs', (req, res) => {
    const { order_id } = req.query;
    if (!order_id) return res.json([]);
    const logs = (db.findWhere('shop_order_logs', { order_id }) as any[])
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    res.json(logs);
  });

  // 兼容旧别名（字段已对齐，避免调用即 500）
  router.get('/shop-refunds', (req, res) => {
    const { order_id, user_id, status } = req.query as any;
    let items = db.findAll('shop_order_aftersale') as any[];
    if (order_id) items = items.filter((r: any) => r.order_id === order_id);
    if (user_id) items = items.filter((r: any) => r.user_id === user_id);
    if (status) items = items.filter((r: any) => r.status === status);
    res.json(items);
  });

  router.post('/shop-refunds', (req, res) => {
    const { order_id, order_goods_id, user_id, reason, description, refund_amount, images } = req.body;
    if (!order_id || !reason) return res.status(400).json({ success: false, message: '缺少参数' });
    const id = `ref_${Date.now()}`;
    db.insert('shop_order_aftersale', {
      id, order_id, order_goods_id: order_goods_id || '0', user_id: user_id || '',
      type: 'refund', reason, description: description || '',
      refund_amount: refund_amount || 0, images: images ? JSON.stringify(images) : '[]',
      status: 'pending', created_at: new Date().toISOString(),
    });
    const order = db.findById('shop_orders', order_id);
    if (order) db.update('shop_orders', order_id, { order_status: 'refunding' });
    res.json({ success: true, id });
  });

  router.put('/shop-refunds/:id', (req, res) => {
    const as = db.findById('shop_order_aftersale', req.params.id) as any;
    if (!as) return res.status(404).json({ success: false, message: '售后单不存在' });
    const body = req.body || {};
    const now = new Date().toISOString();
    const st = body.status ? (body.status === 'completed' ? 'refunded' : body.status) : undefined;
    const update: any = { updated_at: now };
    if (st) update.status = st;
    if (body.refund_amount !== undefined) update.refund_amount = body.refund_amount;
    if (body.admin_remark !== undefined) update.admin_remark = body.admin_remark;
    db.update('shop_order_aftersale', req.params.id, update);
    if (st === 'refunded' && as.type === 'return' && !as.received_at) restoreAftersaleStock(as.order_id);
    if (st === 'refunded') {
      db.update('shop_order_aftersale', req.params.id, { refunded_at: now });
      db.update('shop_orders', as.order_id, { order_status: 'refunded' });
    }
    res.json({ success: true });
  });

  // 商品评价管理
  router.get('/shop-reviews', (req, res) => {
    const { product_id, status } = req.query;
    let reviews = db.findAll('shop_reviews');
    if (product_id) reviews = reviews.filter((r: any) => r.product_id === product_id);
    if (status) reviews = reviews.filter((r: any) => r.status === status);
    res.json(reviews);
  });

  router.post('/shop-reviews', (req, res) => {
    const { product_id, order_id, user_id, user_name, rating, content, images } = req.body;
    const id = `rev_${Date.now()}`;
    db.insert('shop_reviews', {
      id, product_id, order_id, user_id, user_name,
      rating: rating || 5, content, images,
      status: 'pending', created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/shop-reviews/:id', (req, res) => {
    const { status } = req.body;
    db.update('shop_reviews', req.params.id, { status });
    res.json({ success: true });
  });

  // ==================== 商城用户API ====================

  // 用户注册
  router.post('/shop-register', (req, res) => {
    const { username, password, phone, email, nickname } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: '请提供用户名和密码' });
      return;
    }
    const exist = db.findWhere('shop_users', { username });
    if (exist.length > 0) {
      res.status(400).json({ success: false, message: '用户名已存在' });
      return;
    }
    const id = `user_${Date.now()}`;
    db.insert('shop_users', {
      id, username, password, phone, email, nickname,
      avatar: '', points: 0, balance: 0,
      level: 1, status: 'active',
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  // 用户登录
  router.post('/shop-login', (req, res) => {
    const { username, password } = req.body;
    const users = db.findWhere('shop_users', { username, password });
    if (users.length === 0) {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
      return;
    }
    const user = users[0];
    if (user.status !== 'active') {
      res.status(403).json({ success: false, message: '账号已被禁用' });
      return;
    }
    const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    db.update('shop_users', user.id, { last_login: new Date().toISOString() });
    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar, points: user.points }
    });
  });

  // 获取用户信息
  router.get('/shop-user/info', (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) {
      res.status(401).json({ error: '未登录' });
      return;
    }
    const token = auth.replace('Bearer ', '');
    const sessions = db.findWhere('shop_sessions', { token });
    if (sessions.length === 0) {
      res.status(401).json({ error: '登录已过期' });
      return;
    }
    const user = db.findById('shop_users', sessions[0].user_id);
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }
    res.json({
      id: user.id, username: user.username, nickname: user.nickname,
      avatar: user.avatar, phone: user.phone, email: user.email,
      points: user.points, balance: user.balance, level: user.level
    });
  });

  // 更新用户信息
  router.put('/shop-user/info', (req, res) => {
    const { nickname, avatar, phone, email } = req.body;
    const auth = req.headers.authorization;
    if (!auth) {
      res.status(401).json({ error: '未登录' });
      return;
    }
    const token = auth.replace('Bearer ', '');
    const sessions = db.findWhere('shop_sessions', { token });
    if (sessions.length === 0) {
      res.status(401).json({ error: '登录已过期' });
      return;
    }
    db.update('shop_users', sessions[0].user_id, { nickname, avatar, phone, email, updated_at: new Date().toISOString() });
    res.json({ success: true });
  });

  // 修改密码
  router.put('/shop-user/password', (req, res) => {
    const { old_password, new_password } = req.body;
    const auth = req.headers.authorization;
    if (!auth) {
      res.status(401).json({ error: '未登录' });
      return;
    }
    const token = auth.replace('Bearer ', '');
    const sessions = db.findWhere('shop_sessions', { token });
    if (sessions.length === 0) {
      res.status(401).json({ error: '登录已过期' });
      return;
    }
    const user = db.findById('shop_users', sessions[0].user_id);
    if (user.password !== old_password) {
      res.status(400).json({ success: false, message: '原密码错误' });
      return;
    }
    db.update('shop_users', user.id, { password: new_password, updated_at: new Date().toISOString() });
    res.json({ success: true });
  });

  // ==================== 商城幻灯片/广告API ====================

  // 获取幻灯片列表
  router.get('/shop-slides', (req, res) => {
    const { position, status } = req.query;
    let slides = db.findAll('web_banners');
    if (position) slides = slides.filter((s: any) => s.position === position);
    if (status) slides = slides.filter((s: any) => s.status === status);
    else slides = slides.filter((s: any) => s.status === 'active');
    slides.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    res.json(slides);
  });

  // 创建幻灯片
  router.post('/shop-slides', (req, res) => {
    const { title, image_url, link_url, position, sort_order, start_time, end_time } = req.body;
    const id = `slide_${Date.now()}`;
    db.insert('web_banners', {
      id, title, image_url, link_url,
      position: position || 'home',
      sort_order: sort_order || 0,
      status: 'active',
      start_time, end_time,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  // 更新幻灯片
  router.put('/shop-slides/:id', (req, res) => {
    db.update('web_banners', req.params.id, req.body);
    res.json({ success: true });
  });

  // 删除幻灯片
  router.delete('/shop-slides/:id', (req, res) => {
    db.deleteById('web_banners', req.params.id);
    res.json({ success: true });
  });

  // ==================== 商城导航API ====================

  // 获取导航列表
  router.get('/shop-navigation', (req, res) => {
    const { location } = req.query;
    let navs = db.findAll('shop_navigation');
    if (location) navs = navs.filter((n: any) => n.location === location);
    navs.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    res.json(navs);
  });

  // 创建导航
  router.post('/shop-navigation', (req, res) => {
    const { name, url, icon, location, sort_order, is_show } = req.body;
    const id = `nav_${Date.now()}`;
    db.insert('shop_navigation', {
      id, name, url, icon,
      location: location || 'header',
      sort_order: sort_order || 0,
      is_show: is_show !== false ? 1 : 0,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  // 更新导航
  router.put('/shop-navigation/:id', (req, res) => {
    db.update('shop_navigation', req.params.id, req.body);
    res.json({ success: true });
  });

  // 删除导航
  router.delete('/shop-navigation/:id', (req, res) => {
    db.deleteById('shop_navigation', req.params.id);
    res.json({ success: true });
  });

  // ==================== 商城搜索API ====================

  // 搜索热词
  router.get('/shop-search-hot', (req, res) => {
    let hotWords = db.findWhere('shop_search_history', { type: 'hot' });
    if (hotWords.length === 0) {
      hotWords = [
        { id: 'hw1', keyword: '热门商品', search_count: 1000, type: 'hot' },
        { id: 'hw2', keyword: '新品上市', search_count: 800, type: 'hot' },
        { id: 'hw3', keyword: '特价促销', search_count: 600, type: 'hot' },
        { id: 'hw4', keyword: '精品推荐', search_count: 400, type: 'hot' }
      ];
    }
    res.json(hotWords.sort((a: any, b: any) => b.search_count - a.search_count).slice(0, 10));
  });

  // 搜索建议
  router.get('/shop-search-suggest', (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
      res.json([]);
      return;
    }
    const goods = db.findAll('shop_goods');
    const suggestions = goods
      .filter((g: any) => g.name.toLowerCase().includes((keyword as string).toLowerCase()))
      .map((g: any) => ({ id: g.id, name: g.name, type: 'goods' }))
      .slice(0, 10);
    res.json(suggestions);
  });

  // 搜索历史
  router.get('/shop-search-history', (req, res) => {
    const { user_id } = req.query;
    let history = db.findWhere('shop_search_history', { user_id: user_id || 'guest', type: 'history' });
    history = history.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(history.slice(0, 20));
  });

  // 添加搜索历史
  router.post('/shop-search-history', (req, res) => {
    const { user_id, keyword } = req.body;
    if (!keyword) {
      res.status(400).json({ success: false });
      return;
    }
    // 删除同用户同关键词旧记录
    const old = db.findWhere('shop_search_history', { user_id: user_id || 'guest', keyword, type: 'history' });
    old.forEach((h: any) => db.deleteById('shop_search_history', h.id));
    const id = `sh_${Date.now()}`;
    db.insert('shop_search_history', {
      id, user_id: user_id || 'guest', keyword, type: 'history',
      created_at: new Date().toISOString()
    });
    res.json({ success: true });
  });

  // 清除搜索历史
  router.delete('/shop-search-history', (req, res) => {
    const { user_id } = req.query;
    const history = db.findWhere('shop_search_history', { user_id: user_id || 'guest', type: 'history' });
    history.forEach((h: any) => db.deleteById('shop_search_history', h.id));
    res.json({ success: true });
  });

  // ==================== 商城快递/物流API ====================

  // 获取快递公司列表
  router.get('/shop-express', (req, res) => {
    const expressList = [
      { code: 'SF', name: '顺丰速运', logo: '' },
      { code: 'YTO', name: '圆通快递', logo: '' },
      { code: 'ZTO', name: '中通快递', logo: '' },
      { code: 'YD', name: '韵达快递', logo: '' },
      { code: 'STO', name: '申通快递', logo: '' },
      { code: 'EMS', name: 'EMS', logo: '' },
      { code: 'YZPY', name: '邮政快递包裹', logo: '' },
      { code: 'JD', name: '京东物流', logo: '' }
    ];
    res.json(expressList);
  });

  // 查询物流轨迹
  router.get('/shop-express/tracking', (req, res) => {
    const { express_code, tracking_no } = req.query;
    // 模拟物流信息
    const tracks = [
      { time: new Date().toISOString(), status: '已发货', location: '商家仓库' },
      { time: new Date(Date.now() - 86400000).toISOString(), status: '运输中', location: '中转站' },
      { time: new Date(Date.now() - 172800000).toISOString(), status: '已揽收', location: '收件地' }
    ];
    res.json({
      express_code, tracking_no,
      express_name: '顺丰速运',
      status: 'transit',
      current: '运输中',
      tracks
    });
  });

  // ==================== 商城优惠券API ====================

  // 获取优惠券列表
  router.get('/shop-coupons', (req, res) => {
    const { status, user_id } = req.query;
    let coupons = db.findAll('shop_coupons');
    coupons = coupons.filter((c: any) => {
      const now = new Date().toISOString();
      if (c.start_time && c.start_time > now) return false;
      if (c.end_time && c.end_time < now) return false;
      if (status === 'available') return c.stock > 0;
      if (status === 'user' && user_id) {
        const userCoupons = db.findWhere('shop_user_coupons', { user_id, coupon_id: c.id });
        return userCoupons.length > 0;
      }
      return true;
    });
    res.json(coupons);
  });

  // 领取优惠券
  router.post('/shop-coupons/claim', (req, res) => {
    const { coupon_id, user_id } = req.body;
    const coupon = db.findById('shop_coupons', coupon_id);
    if (!coupon) {
      res.status(404).json({ success: false, message: '优惠券不存在' });
      return;
    }
    if (coupon.stock <= 0) {
      res.status(400).json({ success: false, message: '优惠券已领完' });
      return;
    }
    const existing = db.findWhere('shop_user_coupons', { user_id, coupon_id });
    if (existing.length > 0) {
      res.status(400).json({ success: false, message: '已领取过该优惠券' });
      return;
    }
    const id = `uc_${Date.now()}`;
    db.insert('shop_user_coupons', {
      id, user_id, coupon_id,
      status: 'unused',
      claimed_at: new Date().toISOString()
    });
    db.update('shop_coupons', coupon_id, { stock: coupon.stock - 1 });
    res.json({ success: true });
  });

  // 获取用户优惠券
  router.get('/shop-user-coupons', (req, res) => {
    const { user_id, status } = req.query;
    let userCoupons = db.findWhere('shop_user_coupons', { user_id });
    if (status) userCoupons = userCoupons.filter((uc: any) => uc.status === status);
    userCoupons = userCoupons.map((uc: any) => {
      const coupon = db.findById('shop_coupons', uc.coupon_id);
      return { ...uc, coupon };
    });
    res.json(userCoupons);
  });

  // 使用优惠券
  router.put('/shop-user-coupons/:id/use', (req, res) => {
    const uc = db.findById('shop_user_coupons', req.params.id);
    if (!uc) {
      res.status(404).json({ success: false, message: '用户优惠券不存在' });
      return;
    }
    db.update('shop_user_coupons', req.params.id, { status: 'used', used_at: new Date().toISOString() });
    res.json({ success: true });
  });

  // ==================== 商城积分日志API ====================

  // 获取用户积分日志
  router.get('/shop-points-logs', (req, res) => {
    const { user_id, type } = req.query;
    let logs = db.findAll('shop_point_logs');
    if (user_id) logs = logs.filter((l: any) => l.user_id === user_id);
    if (type) logs = logs.filter((l: any) => l.type === type);
    logs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(logs);
  });

  // 添加积分
  router.post('/shop-points/add', (req, res) => {
    const { user_id, points, type, description } = req.body;
    if (!user_id || !points) {
      res.status(400).json({ success: false, message: '参数错误' });
      return;
    }
    const user = db.findById('shop_users', user_id);
    if (!user) {
      res.status(404).json({ success: false, message: '用户不存在' });
      return;
    }
    const newPoints = (user.points || 0) + points;
    db.update('shop_users', user_id, { points: newPoints });
    const id = `pl_${Date.now()}`;
    db.insert('shop_point_logs', {
      id, user_id, type: type || 'earn',
      points: Math.abs(points),
      balance: newPoints,
      description: description || (points > 0 ? '获得积分' : '使用积分'),
      created_at: new Date().toISOString()
    });
    res.json({ success: true, points: newPoints });
  });

  // ==================== 商城收藏API增强 ====================

  // 获取商品收藏状态
  router.get('/shop-favorites/check', (req, res) => {
    const { goods_id, user_id } = req.query;
    if (!user_id) {
      res.json({ favorited: false });
      return;
    }
    const favor = db.findWhere('shop_user_favorites', { user_id, goods_id });
    res.json({ favorited: favor.length > 0 });
  });

  // ==================== 商城促销/活动API ====================

  // 获取促销商品
  router.get('/shop-promotions', (req, res) => {
    const { type } = req.query;
    let goods = db.findWhere('shop_goods', { is_promotion: 1 });
    if (type === 'flash') {
      goods = goods.filter((g: any) => g.flash_stock > 0);
    }
    res.json(goods);
  });

  // ==================== 质量管理 ====================

  // 质量标准管理
  router.get('/quality-standards', (req, res) => {
    const { type, keyword } = req.query;
    let standards = db.findAll('quality_standards');
    if (type) standards = standards.filter((s: any) => s.type === type);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      standards = standards.filter((s: any) => 
        s.code.toLowerCase().includes(kw) || s.name.toLowerCase().includes(kw)
      );
    }
    res.json(standards);
  });

  router.post('/quality-standards', (req, res) => {
    const { code, name, type, description, items } = req.body;
    if (!code || !name) {
      res.status(400).json({ success: false, message: '请提供标准编码和名称' });
      return;
    }
    const id = `qs_${Date.now()}`;
    db.insert('quality_standards', {
      id, code, name, type: type || 'product', description, items,
      status: 'active', created_at: new Date().toISOString()
    });
    res.json({ success: true, id });
  });

  router.put('/quality-standards/:id', (req, res) => {
    db.update('quality_standards', req.params.id, req.body);
    res.json({ success: true });
  });

  router.delete('/quality-standards/:id', (req, res) => {
    db.deleteById('quality_standards', req.params.id);
    res.json({ success: true });
  });

  // 质量检验管理
  router.get('/quality-inspections', (req, res) => {
    const { type, result, keyword } = req.query;
    let inspections = db.findAll('quality_inspections');
    if (type) inspections = inspections.filter((i: any) => i.type === type);
    if (result) inspections = inspections.filter((i: any) => i.result === result);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      inspections = inspections.filter((i: any) => 
        i.code.toLowerCase().includes(kw) || i.reference_code?.toLowerCase().includes(kw)
      );
    }
    // 获取检验明细
    inspections = inspections.map((i: any) => {
      const items = db.findWhere('quality_inspection_items', { inspection_id: i.id });
      return { ...i, items };
    });
    res.json(inspections);
  });

  router.post('/quality-inspections', (req, res) => {
    const { type, reference_type, reference_id, reference_code, inspector, inspection_date, items, remark } = req.body;
    
    const id = `qi_${Date.now()}`;
    const code = `QI${Date.now().toString().slice(-8)}`;
    
    let total_items = items?.length || 0;
    let passed_items = 0;
    let failed_items = 0;
    items?.forEach((item: any) => {
      if (item.result === 'passed') passed_items++;
      if (item.result === 'failed') failed_items++;
    });
    
    let result = 'pending';
    if (total_items > 0) {
      if (failed_items === 0) result = 'passed';
      else if (passed_items === 0) result = 'failed';
      else result = 'partial';
    }

    db.insert('quality_inspections', {
      id, code, type: type || 'incoming',
      reference_type, reference_id, reference_code,
      inspector, inspection_date: inspection_date || new Date().toISOString(),
      total_items, passed_items, failed_items, result, remark,
      created_at: new Date().toISOString()
    });

    items?.forEach((item: any) => {
      const itemId = `qii_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      db.insert('quality_inspection_items', {
        id: itemId, inspection_id: id,
        standard_id: item.standard_id,
        item_name: item.item_name,
        standard_value: item.standard_value,
        actual_value: item.actual_value,
        result: item.result || 'pending',
        remark: item.remark
      });
    });

    res.json({ success: true, id, code });
  });

  router.put('/quality-inspections/:id', (req, res) => {
    const { result, remark } = req.body;
    db.update('quality_inspections', req.params.id, { result, remark });
    res.json({ success: true });
  });

  // 缺陷管理
  router.get('/quality-defects', (req, res) => {
    const { status, defect_level, keyword } = req.query;
    let defects = db.findAll('quality_defects');
    if (status) defects = defects.filter((d: any) => d.status === status);
    if (defect_level) defects = defects.filter((d: any) => d.defect_level === defect_level);
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      defects = defects.filter((d: any) => 
        d.code.toLowerCase().includes(kw) || d.description?.toLowerCase().includes(kw)
      );
    }
    res.json(defects);
  });

  router.post('/quality-defects', (req, res) => {
    const { inspection_id, defect_type, defect_level, description, quantity, cause, solution, responsible_person } = req.body;
    
    const id = `qd_${Date.now()}`;
    const code = `DF${Date.now().toString().slice(-8)}`;

    db.insert('quality_defects', {
      id, code, inspection_id,
      defect_type, defect_level: defect_level || 'minor',
      description, quantity: quantity || 1,
      cause, solution, status: 'open', responsible_person,
      created_at: new Date().toISOString()
    });

    res.json({ success: true, id, code });
  });

  router.put('/quality-defects/:id', (req, res) => {
    const { status, cause, solution, responsible_person } = req.body;
    const updates: any = { status, cause, solution, responsible_person };
    if (status === 'closed') updates.closed_at = new Date().toISOString();
    db.update('quality_defects', req.params.id, updates);
    res.json({ success: true });
  });

  // 纠正措施管理
  router.get('/quality-corrective-actions', (req, res) => {
    const { defect_id, status } = req.query;
    let actions = db.findAll('quality_corrective_actions');
    if (defect_id) actions = actions.filter((a: any) => a.defect_id === defect_id);
    if (status) actions = actions.filter((a: any) => a.status === status);
    res.json(actions);
  });

  router.post('/quality-corrective-actions', (req, res) => {
    const { defect_id, action_type, description, responsible_person, due_date } = req.body;
    
    const id = `ca_${Date.now()}`;

    db.insert('quality_corrective_actions', {
      id, defect_id, action_type, description,
      responsible_person, due_date, status: 'pending',
      created_at: new Date().toISOString()
    });

    res.json({ success: true, id });
  });

  router.put('/quality-corrective-actions/:id', (req, res) => {
    const { status, effect_evaluation } = req.body;
    const updates: any = { status, effect_evaluation };
    if (status === 'completed') updates.completed_date = new Date().toISOString();
    db.update('quality_corrective_actions', req.params.id, updates);
    res.json({ success: true });
  });

  // ============ Sitemap ============
  router.get('/sitemap.xml', (req, res) => {
    const host = req.get('host') || 'localhost:8080';
    const articles = db.findWhere('cms_articles', { status: 'published' });
    const goods = db.findWhere('shop_goods', { status: 'online' });
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += `  <url><loc>http://${host}/site</loc><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>http://${host}/shop</loc><priority>1.0</priority></url>\n`;
    articles.forEach((a: any) => {
      xml += `  <url><loc>http://${host}/site/article/${a.id}</loc><lastmod>${a.updated_at||a.created_at}</lastmod><priority>0.8</priority></url>\n`;
    });
    goods.forEach((g: any) => {
      xml += `  <url><loc>http://${host}/shop/goods/${g.id}</loc><lastmod>${g.updated_at||g.created_at}</lastmod><priority>0.8</priority></url>\n`;
    });
    xml += '</urlset>';
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  });

  // ============ 快递管理 ============
  router.get('/shop-express', (req, res) => res.json(db.findAll('shop_express_companies')));
  router.post('/shop-express', (req, res) => {
    const { name, code, website, phone } = req.body;
    db.insert('shop_express_companies', { id: 'exp_' + Date.now(), name, code, website, phone, is_enabled: 1, created_at: new Date().toISOString() });
    res.json({ success: true });
  });
  router.put('/shop-express/:id', (req, res) => { db.update('shop_express_companies', req.params.id, req.body); res.json({ success: true }); });
  router.delete('/shop-express/:id', (req, res) => { db.delete('shop_express_companies', req.params.id); res.json({ success: true }); });

  // ============ 导航管理 ============
  router.get('/shop-navigation', (req, res) => {
    const { type } = req.query;
    let items = db.findAll('shop_navigation');
    if (type) items = items.filter((n: any) => n.type === type);
    res.json(items.sort((a: any, b: any) => a.sort_order - b.sort_order));
  });
  router.post('/shop-navigation', (req, res) => {
    const item = { id: 'nav_' + Date.now(), ...req.body, created_at: new Date().toISOString() };
    db.insert('shop_navigation', item); res.json({ success: true, id: item.id });
  });
  router.put('/shop-navigation/:id', (req, res) => { db.update('shop_navigation', req.params.id, req.body); res.json({ success: true }); });
  router.delete('/shop-navigation/:id', (req, res) => { db.delete('shop_navigation', req.params.id); res.json({ success: true }); });

  // ============ 用户余额 ============
  router.get('/shop-balance', (req, res) => {
    const { user_id } = req.query;
    const logs = db.findWhere('shop_balance_logs', { user_id });
    res.json({ balance: logs.reduce((s: number, l: any) => s + (l.amount || 0), 0), logs: logs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50) });
  });
  router.post('/shop-balance', (req, res) => {
    const { user_id, amount, type, remark } = req.body;
    db.insert('shop_balance_logs', { id: 'bal_' + Date.now(), user_id, amount, type: type || 'recharge', remark: remark || '', created_at: new Date().toISOString() });
    // Update user balance
    const user = db.findById('shop_users', user_id);
    if (user) db.update('shop_users', user_id, { balance: (user.balance || 0) + amount, updated_at: new Date().toISOString() });
    res.json({ success: true });
  });

  // ============ 订单导出CSV ============
  router.get('/shop-orders-export', (req, res) => {
    const orders = db.findAll('shop_orders');
    const headers = 'ID,订单号,用户,金额,支付状态,订单状态,创建时间\n';
    const rows = orders.map((o: any) => `"${o.id}","${o.order_no||o.id}","${o.user_name||''}","${o.pay_amount||o.total_amount}","${o.pay_status}","${o.order_status}","${o.created_at}"`).join('\n');
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename=orders.csv');
    res.send(headers + rows);
  });

  // ============ 商品SEO字段（已包含在goods API中） ============

  // ============ 省份数据 ============
  router.get('/shop-regions', (req, res) => {
    const regions = [
      { code: '110000', name: '北京市', level: 1 },
      { code: '310000', name: '上海市', level: 1 },
      { code: '440000', name: '广东省', level: 1, cities: [
        { code: '440100', name: '广州市' }, { code: '440300', name: '深圳市' }, { code: '441900', name: '东莞市' },
        { code: '440600', name: '佛山市' }, { code: '442000', name: '中山市' }, { code: '441300', name: '惠州市' },
      ]},
      { code: '330000', name: '浙江省', level: 1, cities: [
        { code: '330100', name: '杭州市' }, { code: '330200', name: '宁波市' }, { code: '330300', name: '温州市' },
      ]},
      { code: '320000', name: '江苏省', level: 1, cities: [
        { code: '320100', name: '南京市' }, { code: '320500', name: '苏州市' }, { code: '320200', name: '无锡市' },
      ]},
      { code: '500000', name: '重庆市', level: 1 },
      { code: '120000', name: '天津市', level: 1 },
    ];
    res.json(regions);
  });

  return router;
}

function hashPwd(pwd: string): string {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    hash = ((hash << 5) - hash) + pwd.charCodeAt(i);
    hash = hash & hash;
  }
  return String(hash);
}

app.use('/uploads', express.static(uploadDir));

app.use('/api', apiRouter());

app.use(express.static(path.join(__dirname, '../client')));

app.get('*', (_req, res) => {
  const indexPath = path.join(__dirname, '../client/index.html');
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
