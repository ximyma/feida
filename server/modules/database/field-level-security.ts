/**
 * 字段级权限 — 敏感字段自动脱敏/隐藏
 * 参照 Odoo field-level security (groups="base.group_system")
 *
 * 用法:
 *   import { maskFields } from './field-level-security';
 *   const safe = maskFields(records, user.roleIds);
 */

// 敏感字段定义: 字段名 → 需要排除的角色(非这些角色则不可见)
const SENSITIVE_FIELDS: Record<string, string[]> = {
  // 薪资字段 — 仅 super_admin/hr_admin/hr_staff 可见
  'baseSalary': ['super_admin', 'hr_admin', 'hr_staff'],
  'monthlyPay': ['super_admin', 'hr_admin', 'hr_staff'],
  'grossSalary': ['super_admin', 'hr_admin', 'hr_staff'],
  'netSalary': ['super_admin', 'hr_admin', 'hr_staff'],
  'salaryAmount': ['super_admin', 'hr_admin', 'hr_staff'],
  'amount': ['super_admin', 'hr_admin', 'hr_staff'],  // 仅在薪资上下文
  // 身份证/敏感个人信息
  'idCard': ['super_admin', 'hr_admin'],
  'bankAccount': ['super_admin', 'hr_admin', 'finance'],
  'emergencyContact': ['super_admin', 'hr_admin'],
  'password': [], // 永远不可见
  'password_hash': [], // 永远不可见
};

/** 检查用户是否有角色权限 */
function hasRole(roleIds: string[], allowedRoles: string[]): boolean {
  if (allowedRoles.length === 0) return false; // 空 = 永远不可见
  return roleIds.some(r => allowedRoles.includes(r));
}

/** 对单条记录脱敏 */
export function maskRecord(record: Record<string, any>, roleIds: string[]): Record<string, any> {
  if (!record) return record;
  const masked = { ...record };
  for (const field of Object.keys(SENSITIVE_FIELDS)) {
    if (field in masked && !hasRole(roleIds, SENSITIVE_FIELDS[field])) {
      delete masked[field];
    }
  }
  return masked;
}

/** 批量脱敏 */
export function maskFields(records: any[], roleIds: string[]): any[] {
  return records.map(r => maskRecord(r, roleIds));
}
