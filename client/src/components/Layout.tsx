import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAppConfig } from '../contexts/AppConfigContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  Clock,
  Banknote,
  BarChart3,
  Target,
  UserPlus,
  Truck,
  ClipboardCheck,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Calendar,
  Coffee,
  TrendingUp,
  Settings,
  FileText,
  GitBranch,
  Bell,
  Printer,
  Star,
  Shield,
  KeyRound,
  Database,
  ArrowUpDown,
  Eye,
  BookOpen,
  UserCircle,
} from 'lucide-react';

// 一级导航配置
const menuItems = [
  { id: 'home', to: '/', icon: LayoutDashboard, label: '首页仪表盘' },
  { id: 'org', to: '/organization', icon: Building2, label: '组织管理' },
  { id: 'statistics', to: '/statistics', icon: BarChart3, label: '数据统计' },
  { id: 'selfservice', to: '/selfservice', icon: UserCircle, label: '员工自助' },
];

// 二级导航配置
const subMenuItems: Record<string, { label: string; to: string }[]> = {
  '/personnel': [
    { label: '人事首页', to: '/personnel' },
    { label: '字段自定义', to: '/personnel/field' },
    { label: '劳动合同', to: '/personnel/contract' },
    { label: '员工异动', to: '/personnel/change' },
    { label: '提醒设置', to: '/personnel/reminder' },
    { label: '员工子集', to: '/personnel/subset' },
    { label: '打印模板', to: '/personnel/print' },
    { label: '在线测评', to: '/personnel/assessment' },
    { label: '人才盘点', to: '/personnel/talent' },
  ],
  '/salary': [
    { label: '薪酬管理', to: '/salary' },
    { label: '工资表查看', to: '/salary/table' },
    { label: '企业缴纳', to: '/salary/company' },
    { label: '薪酬配置', to: '/salary/config' },
  ],
  '/attendance': [
    { label: '考勤首页', to: '/attendance' },
    { label: '排班管理', to: '/attendance/schedule' },
    { label: '班次配置', to: '/attendance/shift' },
    { label: '考勤规则', to: '/attendance/rules' },
    { label: '休假管理', to: '/attendance/leave' },
    { label: '加班管理', to: '/attendance/overtime' },
    { label: '统计报表', to: '/attendance/statistics' },
  ],
  '/performance': [
    { label: 'KPI指标库', to: '/performance/kpi' },
    { label: '考核周期', to: '/performance/cycle' },
    { label: '考核记录', to: '/performance/record' },
    { label: '考核等级', to: '/performance/grade' },
  ],
  '/recruitment': [
    { label: '招聘职位', to: '/recruitment/position' },
    { label: '简历投递', to: '/recruitment/resume' },
    { label: '候选人列表', to: '/recruitment/candidate' },
    { label: 'Offer记录', to: '/recruitment/offer' },
  ],
  '/logistics': [
    { label: '宿舍管理', to: '/logistics/dormitory' },
    { label: '食堂管理', to: '/logistics/canteen' },
    { label: '车辆管理', to: '/logistics/vehicle' },
    { label: '访客登记', to: '/logistics/visitor' },
  ],
  '/approval': [
    { label: '请假申请', to: '/approval/leave' },
    { label: '加班申请', to: '/approval/overtime' },
    { label: '离职申请', to: '/approval/resignation' },
    { label: '审批记录', to: '/approval/record' },
  ],
  '/training': [
    { label: '培训计划', to: '/training' },
    { label: '课程管理', to: '/training/course' },
  ],
  '/office': [
    { label: '通知公告', to: '/office/announcement' },
    { label: '文档管理', to: '/office/document' },
    { label: '问卷调查', to: '/office/survey' },
  ],
  '/selfservice': [
    { label: '员工自助', to: '/selfservice' },
  ],
  '/system': [
    { label: '系统概览', to: '/system' },
    { label: '用户管理', to: '/system/users' },
    { label: '角色权限', to: '/system/roles' },
    { label: '系统配置', to: '/system/config' },
    { label: 'APP设置', to: '/system/app-settings' },
    { label: '数据管理', to: '/system/data' },
    { label: '审计日志', to: '/system/logs' },
    { label: '登录日志', to: '/system/login-logs' },
    { label: '企业微信', to: '/system/wechat' },
    { label: '钉钉集成', to: '/system/dingtalk' },
    { label: 'API文档', to: '/system/api-doc' },
    { label: '任务管理', to: '/system/tasks' },
  ],
};

const newModuleIcons: Record<string, React.ElementType> = {
  '/personnel': Users,
  '/salary': Banknote,
  '/attendance': Clock,
  '/performance': Target,
  '/recruitment': UserPlus,
  '/logistics': Truck,
  '/approval': ClipboardCheck,
  '/training': BookOpen,
  '/office': FileText,
  '/selfservice': UserCircle,
  '/system': Shield,
};

const newModuleLabels: Record<string, string> = {
  '/personnel': '人事管理',
  '/salary': '薪酬管理',
  '/attendance': '考勤管理',
  '/performance': '绩效管理',
  '/recruitment': '招聘管理',
  '/logistics': '后勤管理',
  '/training': '培训管理',
  '/office': '综合事务',
  '/selfservice': '员工自助',
  '/approval': '流程审批',
  '/system': '系统管理',
};

const Layout: React.FC = () => {
  const { config } = useAppConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // 从sessionStorage读取当前用户
  const currentUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('__current_user') || '{}'); }
    catch { return {}; }
  })();

  // 模块→权限key映射（与useSystemData中permissions定义一致）
  const MODULE_PERM: Record<string, string> = {
    '/personnel': 'p_personnel',
    '/salary': 'p_salary',
    '/attendance': 'p_attendance',
    '/performance': 'p_performance',
    '/recruitment': 'p_recruitment',
    '/logistics': 'p_logistics',
    '/approval': 'p_approval',
    '/system': 'p_system',
  };

  // 员工角色映射（与useSystemData中DEFAULT_ROLES一致）
  const USER_ROLE_PERMS: Record<string, string[]> = {
    super_admin: ['p_org','p_personnel','p_attendance','p_salary','p_performance','p_recruitment','p_logistics','p_approval','p_system'],
    sys_admin:   ['p_org','p_personnel','p_attendance','p_salary','p_performance','p_recruitment','p_logistics','p_approval','p_system'],
    hr_admin:    ['p_personnel','p_attendance','p_salary','p_performance','p_recruitment','p_approval'],
    hr_staff:    ['p_personnel','p_attendance','p_salary','p_approval'],
    dept_manager:['p_org','p_personnel','p_attendance','p_approval'],
    employee:    ['p_personnel','p_attendance','p_approval'],
  };

  // 获取当前用户拥有的所有权限ID
  const userPerms = (() => {
    const roleIds: string[] = currentUser.roleIds || [];
    // super_admin 和 sys_admin 直接映射
    if (currentUser.userType === 'super_admin') return USER_ROLE_PERMS.super_admin;
    if (currentUser.userType === 'tech_admin') return USER_ROLE_PERMS.sys_admin;
    // employee类型用户查roleIds
    if (roleIds.length > 0) {
      const roleMap: Record<string, string> = {
        role_super_admin: 'super_admin', role_sys_admin: 'sys_admin',
        role_hr_admin: 'hr_admin', role_hr_staff: 'hr_staff',
        role_dept_manager: 'dept_manager', role_employee: 'employee',
      };
      const perms = new Set<string>();
      roleIds.forEach(rid => {
        const key = roleMap[rid];
        if (key && USER_ROLE_PERMS[key]) USER_ROLE_PERMS[key].forEach(p => perms.add(p));
      });
      return Array.from(perms);
    }
    return [];
  })();

  // 判断用户是否有某模块的读取权限
  const hasModule = (path: string): boolean => {
    const perm = MODULE_PERM[path];
    return perm ? userPerms.includes(perm) : true;
  };

  // 判断是否为超级管理员或系统管理员（可看系统管理）
  const isAdmin = currentUser.userType === 'super_admin' || currentUser.userType === 'tech_admin';

  const handleLogout = () => {
    sessionStorage.removeItem('__current_user');
    navigate('/login');
  };

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ['/personnel','/salary','/attendance','/performance','/recruitment','/logistics','/approval','/system'].forEach(p => {
      initial[p] = location.pathname.startsWith(p);
    });
    return initial;
  });

  // 移动端时自动关闭侧边栏
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // 路由切换时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleSubmenu = (path: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const isModuleActive = (path: string) => location.pathname.startsWith(path);

  const closeSidebar = () => setSidebarOpen(false);

  const renderNavItem = (item: typeof menuItems[0]) => (
    <NavLink
      key={item.id}
      to={item.to}
      end={item.to === '/'}
      onClick={closeSidebar}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
          isActive
            ? 'bg-sidebar-primary text-white font-medium shadow-lg shadow-sidebar-primary/20'
            : 'text-white/80 hover:bg-sidebar-accent hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'} ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
          <span className="flex-1 text-sm">{item.label}</span>
          {isActive && (
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          )}
        </>
      )}
    </NavLink>
  );

  const renderNewModuleNav = (path: string) => {
    const Icon = newModuleIcons[path];
    const label = newModuleLabels[path];
    const subs = subMenuItems[path];
    const isActive = isModuleActive(path);
    const isExpanded = expandedMenus[path];

    return (
      <div key={path}>
        <button
          onClick={() => toggleSubmenu(path)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
            isActive
              ? 'bg-sidebar-primary text-white font-medium shadow-lg shadow-sidebar-primary/20'
              : 'text-white/80 hover:bg-sidebar-accent hover:text-white'
          }`}
        >
          <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'} ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
          <span className="flex-1 text-sm text-left">{label}</span>
          <ChevronDown className={`w-4 h-4 transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="ml-6 mt-1 space-y-0.5">
            {subs.map((sub) => (
              <NavLink
                key={sub.to}
                to={sub.to}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-sidebar-primary/80 text-white font-medium'
                      : 'text-white/60 hover:text-white hover:bg-sidebar-accent/50'
                  }`
                }
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${location.pathname === sub.to ? 'bg-white scale-125' : 'bg-white/40'}`} />
                {sub.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-sidebar flex flex-col z-50 transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo 区域 */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-lg shadow-sidebar-primary/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="animate-fade-in">
              <h1 className="text-white font-bold text-base leading-tight">{config.appName}</h1>
              <p className="text-white/60 text-xs">人力资源管理系统</p>
            </div>
          </div>
        </div>

        {/* 关闭按钮（移动端） */}
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {menuItems.map(renderNavItem)}

          {/* 分隔线 */}
          <div className="h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent my-3" />

          {/* 人事 */}
          {hasModule('/personnel') && renderNewModuleNav('/personnel')}
          {/* 考勤 */}
          {hasModule('/attendance') && renderNewModuleNav('/attendance')}
          {/* 薪酬（管理员可见） */}
          {hasModule('/salary') && renderNewModuleNav('/salary')}
          {/* 绩效（管理员可见） */}
          {hasModule('/performance') && renderNewModuleNav('/performance')}
          {/* 招聘（管理员可见） */}
          {hasModule('/recruitment') && renderNewModuleNav('/recruitment')}
          {/* 后勤（管理员可见） */}
          {hasModule('/logistics') && renderNewModuleNav('/logistics')}
          {/* 综合事务 */}
          {hasModule('/office') && renderNewModuleNav('/office')}
          {/* 培训管理 */}
          {hasModule('/training') && renderNewModuleNav('/training')}
          {/* 审批 */}
          {hasModule('/approval') && renderNewModuleNav('/approval')}
          {/* 系统管理（仅管理员可见） */}
          {isAdmin && renderNewModuleNav('/system')}
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t border-sidebar-border">
          {(() => {
            try {
              const user = JSON.parse(sessionStorage.getItem('__current_user') || '{}');
              const initials = user.realName ? user.realName.slice(0, 2).toUpperCase() : 'HR';
              const typeLabel = user.userType === 'super_admin' ? '超级管理员' : user.userType === 'tech_admin' ? '技术管理员' : '普通用户';
              return (
                <div>
                  <div
                    className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sidebar-primary to-primary flex items-center justify-center text-white text-sm font-medium shadow-lg shadow-sidebar-primary/30">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{user.realName || '未登录'}</p>
                      <p className="text-white/60 text-xs">{typeLabel}</p>
                    </div>
                    <svg className={`w-4 h-4 text-white/60 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {showUserMenu && (
                    <div className="mt-1 bg-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white text-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              );
            } catch {
              return (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sidebar-primary to-primary flex items-center justify-center text-white text-sm font-medium">HR</div>
                  <div><p className="text-white text-sm font-medium">未登录</p></div>
                </div>
              );
            }
          })()}
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 lg:ml-64">
        {/* 移动端顶部导航栏 */}
        <header className="lg:hidden sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sidebar flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">{config.appName}</span>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-[1600px] mx-auto">
          <div className="min-h-[calc(100vh-48px)]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
