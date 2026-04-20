import { useState, useCallback, useEffect } from 'react';

// ==================== 系统管理数据层 ====================
// 支持：用户管理、角色权限、系统配置、数据管理、迁移管理

const KEYS = {
  users: '__sys_users',
  roles: '__sys_roles',
  permissions: '__sys_permissions',
  systemConfig: '__sys_config',
  auditLogs: '__sys_audit_logs',
  migrations: '__sys_migrations',
  dataBackups: '__sys_backups',
};

function load<T>(key: string, fallback: T): T {
  try {
    const s = sessionStorage.getItem(key);
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return fallback;
}

function save<T>(key: string, data: T) {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch { /* ignore */ }
}

// ==================== 类型定义 ====================

/** 用户类型 */
export type UserType = 'employee' | 'tech_admin' | 'super_admin';

/** 用户状态 */
export type UserStatus = 'active' | 'inactive' | 'locked' | 'pending';

/** 用户接口 */
export interface IUser {
  id: string;
  username: string;
  realName: string;
  password?: string;
  userType: UserType;
  /** 关联的员工ID（employee类型用户） */
  employeeId?: string;
  /** 员工工号（tech/super_admin类型用户） */
  employeeNo?: string;
  department?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  roleIds: string[];
  status: UserStatus;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  remark?: string;
}

/** 权限操作类型 */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'approve' | 'execute';

/** 模块权限定义 */
export interface IPermission {
  id: string;
  module: string;
  moduleName: string;
  actions: PermissionAction[];
  description?: string;
}

/** 角色 */
export interface IRole {
  id: string;
  code: string;
  name: string;
  type: 'system' | 'custom';
  permissionIds: string[];
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** 系统配置项 */
export interface ISystemConfig {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: 'basic' | 'security' | 'notification' | 'backup' | 'integration' | 'other';
  label: string;
  description?: string;
  editable: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
}

/** 审计日志 */
export interface IAuditLog {
  id: string;
  userId: string;
  username: string;
  realName: string;
  action: string;
  module: string;
  targetType?: string;
  targetId?: string;
  detail?: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
}

/** 迁移记录 */
export interface IMigration {
  id: string;
  version: string;
  name: string;
  description?: string;
  appliedAt?: string;
  status: 'pending' | 'applied' | 'failed' | 'rolled_back';
  rollbackSql?: string;
  executedBy?: string;
  errorMessage?: string;
}

/** 数据备份 */
export interface IDataBackup {
  id: string;
  name: string;
  type: 'full' | 'partial';
  scope: string[];
  size?: number;
  status: 'success' | 'failed' | 'in_progress';
  filePath?: string;
  createdAt: string;
  createdBy: string;
  remark?: string;
}

// ==================== 默认数据 ====================

export const DEFAULT_PERMISSIONS: IPermission[] = [
  { id: 'p_org', module: 'organization', moduleName: '组织架构', actions: ['read', 'update'] },
  { id: 'p_personnel', module: 'personnel', moduleName: '人员管理', actions: ['create','read','update','delete'] },
  { id: 'p_attendance', module: 'attendance', moduleName: '考勤管理', actions: ['create','read','update','delete'] },
  { id: 'p_salary', module: 'salary', moduleName: '薪酬管理', actions: ['create','read','update','delete'] },
  { id: 'p_performance', module: 'performance', moduleName: '绩效管理', actions: ['create','read','update','delete'] },
  { id: 'p_recruitment', module: 'recruitment', moduleName: '招聘管理', actions: ['create','read','update','delete'] },
  { id: 'p_logistics', module: 'logistics', moduleName: '后勤管理', actions: ['create','read','update','delete'] },
  { id: 'p_approval', module: 'approval', moduleName: '审批流程', actions: ['create','read','update','approve'] },
  { id: 'p_system', module: 'system', moduleName: '系统管理', actions: ['create','read','update','delete','execute'] },
];

export const DEFAULT_ROLES: IRole[] = [
  {
    id: 'role_super_admin', code: 'super_admin', name: '超级管理员', type: 'system',
    permissionIds: ['p_org','p_personnel','p_attendance','p_salary','p_performance','p_recruitment','p_logistics','p_approval','p_system'],
    description: '系统最高权限，可管理所有模块和系统设置', isActive: true, createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role_sys_admin', code: 'sys_admin', name: '系统管理员', type: 'system',
    permissionIds: ['p_org','p_personnel','p_attendance','p_salary','p_performance','p_recruitment','p_logistics','p_approval','p_system'],
    description: '技术维护人员，负责系统运维和配置', isActive: true, createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role_hr_admin', code: 'hr_admin', name: '人事管理员', type: 'system',
    permissionIds: ['p_personnel','p_attendance','p_salary','p_performance','p_recruitment','p_approval'],
    description: '人事部门负责人，拥有大部分HR模块权限', isActive: true, createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role_hr_staff', code: 'hr_staff', name: '人事专员', type: 'system',
    permissionIds: ['p_personnel','p_attendance','p_salary','p_approval'],
    description: '人事部门员工，可执行日常人事操作', isActive: true, createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role_dept_manager', code: 'dept_manager', name: '部门负责人', type: 'system',
    permissionIds: ['p_org','p_personnel','p_attendance','p_approval'],
    description: '部门负责人，查看本部门人员和管理审批', isActive: true, createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role_employee', code: 'employee', name: '普通员工', type: 'system',
    permissionIds: ['p_personnel','p_attendance','p_approval'],
    description: '普通员工，仅可查看和提交个人相关申请', isActive: true, createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const DEFAULT_SYSTEM_CONFIG: ISystemConfig[] = [
  { id: 'cfg_company_name', key: 'company_name', value: '飞达科技有限公司', type: 'string', category: 'basic', label: '公司名称', editable: true, visible: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cfg_company_logo', key: 'company_logo', value: '', type: 'string', category: 'basic', label: '公司Logo', editable: true, visible: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cfg_date_format', key: 'date_format', value: 'YYYY-MM-DD', type: 'string', category: 'basic', label: '日期格式', editable: true, visible: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cfg_datetime_format', key: 'datetime_format', value: 'YYYY-MM-DD HH:mm', type: 'string', category: 'basic', label: '日期时间格式', editable: true, visible: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cfg_pwd_min_len', key: 'password_min_length', value: '6', type: 'number', category: 'security', label: '密码最小长度', editable: true, visible: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cfg_pwd_expire', key: 'password_expire_days', value: '90', type: 'number', category: 'security', label: '密码过期天数', description: '0表示永不过期', editable: true, visible: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cfg_session_timeout', key: 'session_timeout_minutes', value: '480', type: 'number', category: 'security', label: '会话超时时间（分钟）', editable: true, visible: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cfg_login_attempts', key: 'max_login_attempts', value: '5', type: 'number', category: 'security', label: '最大登录失败次数', editable: true, visible: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cfg_auto_backup', key: 'auto_backup_enabled', value: 'true', type: 'boolean', category: 'backup', label: '自动备份', editable: true, visible: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cfg_backup_retention', key: 'backup_retention_days', value: '30', type: 'number', category: 'backup', label: '备份保留天数', editable: true, visible: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cfg_email_notify', key: 'email_notification_enabled', value: 'false', type: 'boolean', category: 'notification', label: '邮件通知', editable: true, visible: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cfg_approval_notify', key: 'approval_notification_enabled', value: 'true', type: 'boolean', category: 'notification', label: '审批通知', editable: true, visible: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cfg_feishu_enabled', key: 'feishu_integration_enabled', value: 'true', type: 'boolean', category: 'integration', label: '启用飞书集成', editable: true, visible: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cfg_calendar_sync', key: 'calendar_sync_enabled', value: 'false', type: 'boolean', category: 'integration', label: '日历同步', editable: true, visible: true, createdAt: '2026-01-01T00:00:00.000Z' },
];

export const DEFAULT_USERS: IUser[] = [
  {
    id: 'user_admin', username: 'admin', realName: '系统管理员', userType: 'super_admin',
    employeeNo: 'FD001', department: '信息技术部', phone: '13800138000', email: 'admin@feida.com',
    roleIds: ['role_super_admin'], status: 'active', createdAt: '2026-01-01T00:00:00.000Z', createdBy: 'system',
  },
  {
    id: 'user_tech', username: 'tech_admin', realName: '技术运维人员', userType: 'tech_admin',
    employeeNo: 'FD002', department: '信息技术部', phone: '13800138001', email: 'tech@feida.com',
    roleIds: ['role_sys_admin'], status: 'active', createdAt: '2026-01-01T00:00:00.000Z', createdBy: 'system',
  },
];

export const DEFAULT_MIGRATIONS: IMigration[] = [
  { id: 'mig_1.0.0', version: '1.0.0', name: '系统初始化', description: '飞达智能HR系统初始版本部署', appliedAt: '2026-01-01T00:00:00.000Z', status: 'applied', executedBy: 'system' },
  { id: 'mig_1.1.0', version: '1.1.0', name: '增加薪酬管理模块', description: '新增薪酬管理、工资表、企业缴纳功能', appliedAt: '2026-01-15T00:00:00.000Z', status: 'applied', executedBy: 'system' },
  { id: 'mig_1.2.0', version: '1.2.0', name: '增加系统管理模块', description: '新增用户管理、角色权限、系统配置、数据管理和迁移管理', status: 'pending' },
];

// ==================== Hook ====================

export function useSystemData() {
  const [users, setUsers] = useState<IUser[]>(() => load(KEYS.users, DEFAULT_USERS));
  const [roles, setRoles] = useState<IRole[]>(() => load(KEYS.roles, DEFAULT_ROLES));
  const [permissions] = useState<IPermission[]>(() => load(KEYS.permissions, DEFAULT_PERMISSIONS));
  const [systemConfig, setSystemConfig] = useState<ISystemConfig[]>(() => load(KEYS.systemConfig, DEFAULT_SYSTEM_CONFIG));
  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>(() => load(KEYS.auditLogs, []));
  const [migrations, setMigrations] = useState<IMigration[]>(() => load(KEYS.migrations, DEFAULT_MIGRATIONS));
  const [dataBackups, setDataBackups] = useState<IDataBackup[]>(() => load(KEYS.dataBackups, []));

  useEffect(() => { save(KEYS.users, users); }, [users]);
  useEffect(() => { save(KEYS.roles, roles); }, [roles]);
  useEffect(() => { save(KEYS.systemConfig, systemConfig); }, [systemConfig]);
  useEffect(() => { save(KEYS.auditLogs, auditLogs); }, [auditLogs]);
  useEffect(() => { save(KEYS.migrations, migrations); }, [migrations]);
  useEffect(() => { save(KEYS.dataBackups, dataBackups); }, [dataBackups]);

  const addAuditLog = useCallback((log: Omit<IAuditLog, 'id' | 'timestamp'>) => {
    const newLog: IAuditLog = { ...log, id: `log_${Date.now()}`, timestamp: new Date().toISOString() };
    setAuditLogs(prev => [newLog, ...prev].slice(0, 500));
  }, []);

  // --- 用户管理 ---
  const addUser = useCallback((user: Omit<IUser, 'id' | 'createdAt'>) => {
    const newUser: IUser = { ...user, id: `user_${Date.now()}`, createdAt: new Date().toISOString() };
    setUsers(prev => [...prev, newUser]);
    addAuditLog({ userId: 'current', username: 'current', realName: '当前用户', action: 'create_user', module: 'system', targetType: 'user', targetId: newUser.id, detail: `新增用户: ${newUser.realName}` });
    return newUser;
  }, [addAuditLog]);

  const updateUser = useCallback((id: string, patch: Partial<IUser>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch, updatedAt: new Date().toISOString() } : u));
    addAuditLog({ userId: 'current', username: 'current', realName: '当前用户', action: 'update_user', module: 'system', targetType: 'user', targetId: id, detail: `更新用户ID: ${id}` });
  }, [addAuditLog]);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    addAuditLog({ userId: 'current', username: 'current', realName: '当前用户', action: 'delete_user', module: 'system', targetType: 'user', targetId: id, detail: `删除用户ID: ${id}` });
  }, [addAuditLog]);

  const resetPassword = useCallback((id: string, newPassword: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password: newPassword, updatedAt: new Date().toISOString() } : u));
    addAuditLog({ userId: 'current', username: 'current', realName: '当前用户', action: 'reset_password', module: 'system', targetType: 'user', targetId: id, detail: `重置密码` });
  }, [addAuditLog]);

  // --- 角色管理 ---
  const addRole = useCallback((role: Omit<IRole, 'id' | 'createdAt'>) => {
    const newRole: IRole = { ...role, id: `role_${Date.now()}`, createdAt: new Date().toISOString() };
    setRoles(prev => [...prev, newRole]);
    return newRole;
  }, []);

  const updateRole = useCallback((id: string, patch: Partial<IRole>) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r));
  }, []);

  const deleteRole = useCallback((id: string) => {
    if (['role_super_admin','role_sys_admin','role_hr_admin'].includes(id)) return;
    setRoles(prev => prev.filter(r => r.id !== id));
    setUsers(prev => prev.map(u => ({ ...u, roleIds: u.roleIds.filter(rid => rid !== id) })));
  }, []);

  // --- 系统配置 ---
  const updateConfig = useCallback((key: string, value: string) => {
    setSystemConfig(prev => prev.map(c => c.key === key ? { ...c, value, updatedAt: new Date().toISOString() } : c));
    addAuditLog({ userId: 'current', username: 'current', realName: '当前用户', action: 'update_config', module: 'system', targetType: 'config', targetId: key, detail: `修改配置 ${key} = ${value}` });
  }, [addAuditLog]);

  // --- 数据备份 ---
  const createBackup = useCallback((name: string, scope: string[]) => {
    const backup: IDataBackup = {
      id: `backup_${Date.now()}`, name,
      type: scope.length === 0 ? 'full' : 'partial', scope,
      status: 'success', createdAt: new Date().toISOString(), createdBy: '当前用户',
    };
    setDataBackups(prev => [...prev, backup]);
    return backup;
  }, []);

  const deleteBackup = useCallback((id: string) => {
    setDataBackups(prev => prev.filter(b => b.id !== id));
  }, []);

  // --- 迁移管理 ---
  const applyMigration = useCallback((id: string) => {
    setMigrations(prev => prev.map(m => m.id === id ? { ...m, status: 'applied' as const, appliedAt: new Date().toISOString() } : m));
  }, []);

  // --- 权限检查 ---
  const hasPermission = useCallback((userId: string, module: string, action: PermissionAction): boolean => {
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    if (user.roleIds.includes('role_super_admin')) return true;
    const userRoles = roles.filter(r => user.roleIds.includes(r.id) && r.isActive);
    return userRoles.some(role => {
      const perm = permissions.find(p => p.module === module);
      return perm ? role.permissionIds.includes(perm.id) && perm.actions.includes(action) : false;
    });
  }, [users, roles, permissions]);

  const getUserStats = useCallback(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    locked: users.filter(u => u.status === 'locked').length,
    byType: {
      employee: users.filter(u => u.userType === 'employee').length,
      tech_admin: users.filter(u => u.userType === 'tech_admin').length,
      super_admin: users.filter(u => u.userType === 'super_admin').length,
    },
  }), [users]);

  return {
    users, roles, permissions, systemConfig, auditLogs, migrations, dataBackups,
    addUser, updateUser, deleteUser, resetPassword,
    addRole, updateRole, deleteRole,
    updateConfig,
    createBackup, deleteBackup,
    applyMigration,
    hasPermission, getUserStats,
    addAuditLog,
  };
}
