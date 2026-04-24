/**
 * 前端权限控制 Hook
 * 用于检查用户权限并控制UI显示
 */

import { useState, useEffect, useCallback } from 'react';

// 权限模块定义
export const PERMISSION_MODULES = {
  p_org: '组织架构',
  p_personnel: '人事管理',
  p_attendance: '考勤管理',
  p_salary: '薪酬管理',
  p_performance: '绩效管理',
  p_recruitment: '招聘管理',
  p_logistics: '后勤管理',
  p_approval: '审批流程',
  p_system: '系统管理'
};

// 角色权限映射（与后端保持一致）
const ROLE_PERMISSIONS = {
  super_admin: Object.keys(PERMISSION_MODULES),
  sys_admin: Object.keys(PERMISSION_MODULES),
  hr_admin: ['p_org', 'p_personnel', 'p_attendance', 'p_salary', 'p_performance', 'p_recruitment', 'p_logistics', 'p_approval'],
  hr_staff: ['p_personnel', 'p_attendance', 'p_recruitment'],
  dept_manager: ['p_personnel', 'p_attendance', 'p_approval'],
  employee: []
};

/**
 * 权限控制 Hook
 */
export function usePermission() {
  const [user, setUser] = useState<any>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化：从 localStorage 加载用户信息
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        
        // 计算用户权限
        const userPermissions = calculatePermissions(userData.roleIds || []);
        setPermissions(userPermissions);
      } catch (e) {
        console.error('解析用户信息失败:', e);
      }
    }
    setLoading(false);
  }, []);

  // 计算用户权限
  const calculatePermissions = useCallback((roleIds: string[]): string[] => {
    const allPermissions = new Set<string>();
    
    roleIds.forEach(roleId => {
      // 从 roleId 提取角色名称 (如 'role_super_admin' -> 'super_admin')
      const roleName = roleId.replace('role_', '');
      const perms = (ROLE_PERMISSIONS as Record<string, string[]>)[roleName] || [];
      perms.forEach((p: string) => allPermissions.add(p));
    });
    
    return Array.from(allPermissions);
  }, []);

  // 检查是否有某个权限
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    
    // 超级管理员拥有所有权限
    if (user.roleIds?.includes('role_super_admin') || user.roleIds?.includes('role_sys_admin')) {
      return true;
    }
    
    return permissions.includes(permission);
  }, [user, permissions]);

  // 检查是否有任意一个权限
  const hasAnyPermission = useCallback((permissionList: string[]): boolean => {
    return permissionList.some(p => hasPermission(p));
  }, [hasPermission]);

  // 检查是否有所有权限
  const hasAllPermissions = useCallback((permissionList: string[]): boolean => {
    return permissionList.every(p => hasPermission(p));
  }, [hasPermission]);

  // 登录
  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        const userPermissions = calculatePermissions(data.user.roleIds || []);
        setPermissions(userPermissions);
        return { success: true, user: data.user };
      }
      
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: '登录失败' };
    }
  }, [calculatePermissions]);

  // 登出
  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
    setPermissions([]);
  }, []);

  return {
    user,
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    login,
    logout
  };
}

/**
 * 权限包装组件
 * 根据权限控制子组件的显示
 */
export function PermissionGuard({ 
  permission, 
  children, 
  fallback = null 
}: { 
  permission: string | string[]; 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();
  
  const hasAccess = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission);
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * 权限控制按钮
 */
export function PermissionButton({ 
  permission, 
  children, 
  onClick,
  disabled,
  ...props 
}: any) {
  const { hasPermission } = usePermission();
  
  const hasAccess = hasPermission(permission);
  
  return (
    <button 
      {...props} 
      onClick={hasAccess ? onClick : undefined}
      disabled={!hasAccess || disabled}
      style={{ 
        ...props.style,
        opacity: hasAccess ? 1 : 0.5,
        cursor: hasAccess ? 'pointer' : 'not-allowed'
      }}
    >
      {children}
    </button>
  );
}

/**
 * 菜单权限过滤
 */
export function filterMenuByPermission(menuItems: any[], hasPermission: (p: string) => boolean) {
  return menuItems.filter(item => {
    // 没有权限要求的菜单项始终显示
    if (!item.permission) return true;
    
    // 检查权限
    return hasPermission(item.permission);
  });
}

export default usePermission;
