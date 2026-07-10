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

// 细粒度权限点目录（与后端 RBAC_CATALOG 对应，#108）
export const PERMISSION_CATALOG = [
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
  { moduleKey: 'system', moduleName: '系统', points: [
    { key: 'system:user:manage', label: '用户管理' }, { key: 'system:role:manage', label: '角色权限管理' },
    { key: 'system:config', label: '系统配置' }, { key: 'system:log:view', label: '审计日志' },
    { key: 'system:data', label: '数据管理' }
  ]}
];
export const ALL_PERMISSION_POINTS = PERMISSION_CATALOG.flatMap(g => g.points.map(p => p.key));

// 可用站点（与后端 RBAC_SITES 对应，#130）
export const SITE_CATALOG = [
  { code: 'main', name: '主站' },
  { code: 'shop', name: '商城' },
  { code: 'portal', name: '门户资讯' },
];

// 角色权限映射（与后端保持一致）：模块级(p_*) + 细粒度权限点(cms:*/shop:*/hr:*/system:*)
const MODULE_KEYS = Object.keys(PERMISSION_MODULES);
const ROLE_PERMISSIONS = {
  super_admin: [...MODULE_KEYS, ...ALL_PERMISSION_POINTS],
  sys_admin: [...MODULE_KEYS, ...ALL_PERMISSION_POINTS],
  hr_admin: [
    ...MODULE_KEYS.filter(k => k !== 'p_org'),
    'cms:article:view', 'cms:article:create', 'cms:article:edit', 'cms:article:publish', 'cms:channel:manage', 'cms:comment:moderate', 'cms:media:manage',
    'shop:order:view', 'shop:goods:manage', 'hr:employee:manage', 'hr:contract:manage', 'hr:attendance:manage', 'hr:salary:manage',
    'hr:performance:manage', 'hr:recruitment:manage', 'hr:logistics:manage', 'hr:approval:manage', 'system:user:manage', 'system:config', 'system:log:view'
  ],
  hr_staff: ['p_personnel', 'p_attendance', 'p_recruitment', 'cms:article:view', 'cms:article:create', 'hr:employee:manage'],
  dept_manager: ['p_personnel', 'p_attendance', 'p_approval', 'hr:approval:manage', 'hr:attendance:manage'],
  employee: []
};

// 角色→站点范围映射（与后端 RBAC_ROLES.sites 一致，#130）：'*' 表示全部站点
const ROLE_SITE_SCOPE: Record<string, string[]> = {
  super_admin: ['*'],
  sys_admin: ['*'],
  hr_admin: ['main', 'shop'],
  hr_staff: ['main'],
  dept_manager: ['main'],
  employee: []
};

/**
 * 权限控制 Hook
 */
// 计算用户权限（纯函数，可独立测试）
export function computePermissions(roleIds: string[]): string[] {
  const all = new Set<string>();
  (roleIds || []).forEach(roleId => {
    const roleName = String(roleId).replace('role_', '');
    ((ROLE_PERMISSIONS as Record<string, string[]>)[roleName] || []).forEach(p => all.add(p));
  });
  return Array.from(all);
}

// 计算站点范围（纯函数，'*' 表示全部站点）
export function computeSiteScope(roleIds: string[]): string[] {
  const set = new Set<string>();
  let all = false;
  (roleIds || []).forEach(roleId => {
    const roleName = String(roleId).replace('role_', '');
    const scope = ROLE_SITE_SCOPE[roleName] || [];
    if (scope.includes('*')) all = true; else scope.forEach(s => set.add(s));
  });
  return all ? ['*'] : Array.from(set);
}

export function usePermission() {
  const [user, setUser] = useState<any>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [siteScope, setSiteScope] = useState<string[]>(['*']);
  const [loading, setLoading] = useState(true);

  // 计算用户权限
  const calculatePermissions = useCallback((roleIds: string[]): string[] => computePermissions(roleIds), []);

  // 初始化：从 localStorage 加载用户信息（同步本地计算，避免闪烁），随后异步向后端 resolve 拉取权威结果
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        const roleIds = userData.roleIds || [];
        // 1) 本地即时计算
        setPermissions(computePermissions(roleIds));
        setSiteScope(computeSiteScope(roleIds));
        // 2) 后端权威 resolve（失败则沿用本地）
        fetch('/api/rbac/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roleIds })
        }).then(r => r.ok ? r.json() : null).then(d => {
          if (d && Array.isArray(d.permissions)) {
            setPermissions(prev => Array.from(new Set([...prev, ...d.permissions])));
            if (Array.isArray(d.siteScope) && d.siteScope.length) setSiteScope(d.siteScope);
          }
        }).catch(() => { /* 离线回退本地 */ });
      } catch (e) {
        console.error('解析用户信息失败:', e);
      }
    }
    setLoading(false);
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

  // can(point) —— hasPermission 的语义化别名（供按钮显隐使用）
  const can = hasPermission;

  // 站点范围判定：'*' 表示全部站点
  const canAccessSite = useCallback((siteCode: string): boolean => {
    if (!user) return false;
    if (user.roleIds?.includes('role_super_admin') || user.roleIds?.includes('role_sys_admin')) return true;
    return siteScope.includes('*') || siteScope.includes(siteCode);
  }, [user, siteScope]);

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
        const roleIds = data.user.roleIds || [];
        setPermissions(computePermissions(roleIds));
        setSiteScope(computeSiteScope(roleIds));
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
    setSiteScope([]);
  }, []);

  return {
    user,
    permissions,
    siteScope,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
    canAccessSite,
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
