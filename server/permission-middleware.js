/**
 * 权限管理中间件
 * 用于检查用户权限
 */

const ALLOWED = [
  // 基础模块
  'employees','departments','positions','ranks',
  'users','roles','permissions',
  // 考勤模块
  'shift_types','schedules','attendance_records','leave_records','leave_balances',
  'overtime_records','shift_change_requests','attendance_rules','check_locations',
  'daily_attendance_reports','monthly_attendance_summary',
  // 薪资模块
  'salaries','salary_items','salary_item_templates','salary_adjustments',
  'location_allowances','company_contributions',
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
  'approval_flows','approval_requests','approval_records',
  // 人事管理模块
  'employee_changes','field_definitions','employee_subsets','subset_records',
  'print_templates','reminders','reminder_logs',
  // 系统模块
  'system_config','audit_logs','login_logs','data_backups'
];

// 模块权限映射
const MODULE_PERMISSIONS = {
  'employees': 'p_personnel',
  'departments': 'p_org',
  'positions': 'p_org',
  'attendance_records': 'p_attendance',
  'leave_records': 'p_attendance',
  'overtime_records': 'p_attendance',
  'schedules': 'p_attendance',
  'salaries': 'p_salary',
  'salary_adjustments': 'p_salary',
  'performance_records': 'p_performance',
  'candidates': 'p_recruitment',
  'offers': 'p_recruitment',
  'dormitories': 'p_logistics',
  'vehicles': 'p_logistics',
  'approval_requests': 'p_approval',
  'users': 'p_system',
  'roles': 'p_system',
  'permissions': 'p_system'
};

// 角色权限映射
const ROLE_PERMISSIONS = {
  'super_admin': ['p_org', 'p_personnel', 'p_attendance', 'p_salary', 'p_performance', 'p_recruitment', 'p_logistics', 'p_approval', 'p_system'],
  'sys_admin': ['p_org', 'p_personnel', 'p_attendance', 'p_salary', 'p_performance', 'p_recruitment', 'p_logistics', 'p_approval', 'p_system'],
  'hr_admin': ['p_org', 'p_personnel', 'p_attendance', 'p_salary', 'p_performance', 'p_recruitment', 'p_logistics', 'p_approval'],
  'hr_staff': ['p_personnel', 'p_attendance', 'p_recruitment'],
  'dept_manager': ['p_personnel', 'p_attendance', 'p_approval'],
  'employee': []
};

/**
 * 检查用户是否有权限访问某个模块
 * @param userId 用户ID
 * @param module 模块名称（表名）
 * @param db 数据库服务
 * @returns { hasPermission: boolean, reason?: string }
 */
function checkPermission(userId, module, db) {
  // 超级管理员拥有所有权限
  const user = db.findById('users', userId);
  if (!user) return { hasPermission: false, reason: '用户不存在' };
  
  const roleIds = JSON.parse(user.roleIds || '[]');
  if (roleIds.includes('role_super_admin') || roleIds.includes('role_sys_admin')) {
    return { hasPermission: true };
  }
  
  // 获取模块所需权限
  const requiredPermission = MODULE_PERMISSIONS[module];
  if (!requiredPermission) {
    // 未配置权限的模块默认允许访问
    return { hasPermission: true };
  }
  
  // 检查用户角色权限
  for (const roleId of roleIds) {
    const role = db.findById('roles', roleId);
    if (!role) continue;
    
    const roleName = role.name;
    const permissions = ROLE_PERMISSIONS[roleName] || [];
    
    if (permissions.includes(requiredPermission)) {
      return { hasPermission: true };
    }
  }
  
  return { 
    hasPermission: false, 
    reason: `需要权限: ${requiredPermission}` 
  };
}

/**
 * 获取用户所有权限
 * @param userId 用户ID
 * @param db 数据库服务
 * @returns 权限列表
 */
function getUserPermissions(userId, db) {
  const user = db.findById('users', userId);
  if (!user) return [];
  
  const roleIds = JSON.parse(user.roleIds || '[]');
  const allPermissions = new Set();
  
  roleIds.forEach(roleId => {
    const role = db.findById('roles', roleId);
    if (!role) return;
    
    const roleName = role.name;
    const permissions = ROLE_PERMISSIONS[roleName] || [];
    permissions.forEach(p => allPermissions.add(p));
  });
  
  return Array.from(allPermissions);
}

/**
 * 中间件：检查API权限
 */
function permissionMiddleware(req, res, next) {
  // 从header获取用户ID（实际应用中应从JWT token解析）
  const userId = req.headers['x-user-id'] || req.body.userId;
  
  if (!userId) {
    // 未登录用户只允许访问公开接口
    if (req.path.startsWith('/api/auth/') || req.path === '/api/health') {
      return next();
    }
    return res.status(401).json({ error: '未登录' });
  }
  
  // 检查权限
  const module = req.params.table || req.path.split('/')[2];
  const result = checkPermission(userId, module, req.app.locals.db);
  
  if (!result.hasPermission) {
    return res.status(403).json({ error: result.reason || '无权限' });
  }
  
  next();
}

module.exports = {
  ALLOWED,
  checkPermission,
  getUserPermissions,
  permissionMiddleware,
  MODULE_PERMISSIONS,
  ROLE_PERMISSIONS
};
