import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAppConfig } from '../contexts/AppConfigContext';
import AIFloatingButton from './AIFloatingButton/AIFloatingButton';
import { useI18n, LanguageSwitcher } from '../i18n';
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
  Package,
  Globe,
  DollarSign,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';

const menuItems = [
  { id: 'home', to: '/', icon: LayoutDashboard, label: '首页仪表盘' },
  { id: 'org', to: '/organization', icon: Building2, label: '组织管理' },
  { id: 'product', to: '/product', icon: Package, label: '产品档案' },
  { id: 'statistics', to: '/statistics', icon: BarChart3, label: '数据统计' },
  { id: 'selfservice', to: '/selfservice', icon: UserCircle, label: '员工自助' },
];

const subMenuItems: Record<string, { label: string; to: string; key?: string }[]> = {
  '/personnel': [
    { label: '人事首页', to: '/personnel' },
    { label: '字段自定义', to: '/personnel/field' },
    { label: '劳动合同', to: '/personnel/contract' },
    { label: '员工变动', to: '/personnel/change' },
    { label: '提醒管理', to: '/personnel/reminder' },
    { label: '人员子集', to: '/personnel/subset' },
    { label: '打印模板', to: '/personnel/print' },
    { label: '考核评估', to: '/personnel/assessment' },
    { label: '人才报表', to: '/personnel/talent' },
  ],
  '/salary': [
    { label: '薪酬首页', to: '/salary' },
    { label: '工资表', to: '/salary/table' },
    { label: '薪资配置', to: '/salary/config' },
    { label: '薪资公式', to: '/salary/formula' },
    { label: '企业缴纳', to: '/salary/company' },
  ],
  '/attendance': [
    { label: '考勤首页', to: '/attendance' },
    { label: '班次管理', to: '/attendance/shift' },
    { label: '排班管理', to: '/attendance/schedule' },
    { label: '考勤规则', to: '/attendance/rules' },
    { label: '假期管理', to: '/attendance/leave' },
    { label: '加班管理', to: '/attendance/overtime' },
    { label: '考勤统计', to: '/attendance/statistics' },
    { label: '日报查询', to: '/attendance/daily-report' },
  ],
  '/performance': [
    { label: '绩效首页', to: '/performance' },
    { label: 'KPI管理', to: '/performance/kpi' },
    { label: '周期管理', to: '/performance/cycle' },
    { label: '绩效记录', to: '/performance/record' },
    { label: '评分等级', to: '/performance/grade' },
  ],
  '/recruitment': [
    { label: '招聘首页', to: '/recruitment' },
    { label: '职位管理', to: '/recruitment/position' },
    { label: '简历管理', to: '/recruitment/resume' },
    { label: '候选人管理', to: '/recruitment/candidate' },
    { label: 'Offer管理', to: '/recruitment/offer' },
  ],
  '/logistics': [
    { label: '后勤首页', to: '/logistics' },
    { label: '宿舍管理', to: '/logistics/dormitory' },
    { label: '食堂管理', to: '/logistics/canteen' },
    { label: '车辆管理', to: '/logistics/vehicle' },
    { label: '访客管理', to: '/logistics/visitor' },
  ],
  '/approval': [
    { label: '审批首页', to: '/approval' },
    { label: '请假申请', to: '/approval/leave' },
    { label: '加班申请', to: '/approval/overtime' },
    { label: '离职申请', to: '/approval/resignation' },
    { label: '审批记录', to: '/approval/record' },
  ],
  '/training': [
    { label: '培训首页', to: '/training' },
    { label: '课程管理', to: '/training/course' },
  ],
  '/office': [
    { label: '通知公告', to: '/office/announcement' },
    { label: '文档管理', to: '/office/document' },
    { label: '问卷调查', to: '/office/survey' },
  ],
  '/product': [
    { label: '产品首页', to: '/product' },
    { label: '颜色库', to: '/product/colors' },
    { label: '尺码管理', to: '/product/sizes' },
    { label: '品类管理', to: '/product/categories' },
    { label: '款号管理', to: '/product/styles' },
    { label: '款色管理', to: '/product/style-colors' },
    { label: 'SKU管理', to: '/product/skus' },
    { label: '箱型管理', to: '/product/box-types' },
    { label: '编码规则', to: '/product/coding-rules' },
    { label: '配码规则', to: '/product/size-ratios' },
  ],
  '/plm': [
    { label: '工艺管理', to: '/plm' },
    { label: '物料属性', to: '/plm/material-attributes' },
    { label: '物料主数据', to: '/plm/materials' },
    { label: '工序库', to: '/plm/processes' },
    { label: '工艺路线', to: '/plm/process-routes' },
    { label: '部件库', to: '/plm/components' },
    { label: 'BOM管理', to: '/plm/boms' },
    { label: '损耗规则', to: '/plm/scrap-rules' },
    { label: '大底资料库', to: '/plm/soles' },
    { label: '季节物料库', to: '/plm/season-materials' },
  ],
  '/warehouse': [
    { label: '仓储管理', to: '/warehouse' },
    { label: '仓库档案', to: '/warehouse/warehouses' },
    { label: '货位管理', to: '/warehouse/locations' },
    { label: '库存查询', to: '/warehouse/inventory' },
    { label: '入库管理', to: '/warehouse/stock-in' },
    { label: '出库管理', to: '/warehouse/stock-out' },
    { label: '库存盘点', to: '/warehouse/stock-check' },
    { label: '库存调拨', to: '/warehouse/transfer' },
    { label: '条码管理', to: '/warehouse/barcodes' },
  ],
  '/sales': [
    { label: '销售管理', to: '/sales' },
    { label: '客户分组', to: '/sales/customer-groups' },
    { label: '客户档案', to: '/sales/customers' },
    { label: '销售订单', to: '/sales/orders' },
    { label: '发货管理', to: '/sales/deliveries' },
    { label: '退货管理', to: '/sales/returns' },
  ],
  '/purchase': [
    { label: '采购管理', to: '/purchase' },
    { label: '供应商分组', to: '/purchase/supplier-groups' },
    { label: '供应商档案', to: '/purchase/suppliers' },
    { label: '采购订单', to: '/purchase/orders' },
    { label: '采购入库', to: '/purchase/receipts' },
  ],
  '/production': [
    { label: '生产管理', to: '/production' },
    { label: '工作中心', to: '/production/work-centers' },
    { label: '生产计划', to: '/production/plans' },
    { label: '生产工单', to: '/production/work-orders' },
    { label: '报工管理', to: '/production/reporting' },
  ],
  '/finance': [
    { label: '财务管理', to: '/finance' },
    { label: '科目管理', to: '/finance/accounts' },
    { label: '凭证管理', to: '/finance/journal-entries' },
    { label: '应收发票', to: '/finance/ar-invoices' },
    { label: '应付发票', to: '/finance/ap-invoices' },
    { label: '收付款管理', to: '/finance/payments' },
  ],
  '/dashboard': [
    { label: '数据中心', to: '/dashboard' },
  ],
  '/cms': [
    { label: '网站管理', to: '/admin/cms', key: 'cms-home' },
    { label: '栏目管理', to: '/admin/cms?tab=channels', key: 'cms-channels' },
    { label: '文章管理', to: '/admin/cms?tab=articles', key: 'cms-articles' },
    { label: 'Banner管理', to: '/admin/cms?tab=banners', key: 'cms-banners' },
    { label: '评论管理', to: '/admin/cms?tab=comments', key: 'cms-comments' },
    { label: '素材库', to: '/admin/cms?tab=media', key: 'cms-media' },
    { label: '内容分组', to: '/admin/cms?tab=groups', key: 'cms-groups' },
    { label: '敏感词', to: '/admin/cms?tab=sensitive', key: 'cms-sensitive' },
    { label: '网站配置', to: '/admin/cms?tab=config', key: 'cms-config' },
    { label: '🌐 访问网站', to: '/site', key: 'public-site' },
  ],
  '/shop-admin': [
    { label: '商城管理', to: '/admin/shop', key: 'shop-home' },
    { label: '商品管理', to: '/admin/shop?tab=goods', key: 'shop-goods' },
    { label: '订单管理', to: '/admin/shop?tab=orders', key: 'shop-orders' },
    { label: '售后管理', to: '/admin/shop?tab=aftersale', key: 'shop-aftersale' },
    { label: '评价管理', to: '/admin/shop?tab=reviews', key: 'shop-reviews' },
    { label: '品牌管理', to: '/admin/shop?tab=brands', key: 'shop-brands' },
    { label: '优惠券', to: '/admin/shop?tab=coupons', key: 'shop-coupons' },
    { label: '秒杀活动', to: '/admin/shop?tab=seckill', key: 'shop-seckill' },
    { label: '分销管理', to: '/admin/shop?tab=distribution', key: 'shop-distribution' },
    { label: '仓库管理', to: '/admin/shop?tab=warehouse', key: 'shop-warehouse' },
    { label: '快递管理', to: '/admin/shop?tab=express', key: 'shop-express' },
    { label: '页面装修', to: '/admin/shop?tab=decoration', key: 'shop-decoration' },
    { label: '🛒 访问商城', to: '/shop', key: 'public-shop' },
  ],
  '/ai': [
    { label: 'AI助手', to: '/ai-assistant', key: 'ai-chat' },
    { label: '知识库', to: '/ai-knowledge', key: 'ai-knowledge' },
    { label: 'BI分析', to: '/ai-bianalytics', key: 'ai-analytics' },
    { label: '智能预警', to: '/ai-alerts', key: 'ai-alerts' },
  ],
  '/quality': [
    { label: '质量管理', to: '/quality' },
    { label: '质量标准', to: '/quality/standards' },
    { label: '质量检验', to: '/quality/inspections' },
    { label: '缺陷管理', to: '/quality/defects' },
    { label: '纠正措施', to: '/quality/corrective-actions' },
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
    { label: 'AI配置', to: '/system/ai-settings' },
    { label: '数据管理', to: '/system/data' },
    { label: '审计日志', to: '/system/logs' },
    { label: '登录日志', to: '/system/login-logs' },
    { label: '企业微信', to: '/system/wechat' },
    { label: '钉钉集成', to: '/system/dingtalk' },
    { label: 'API文档', to: '/system/api-doc' },
    { label: '任务管理', to: '/system/tasks' },
  { label: '插件管理', to: '/system/plugins', key: 'plugins' },
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
  '/plm': GitBranch,
  '/warehouse': Package,
  '/sales': TrendingUp,
  '/purchase': ShoppingCart,
  '/production': Settings,
  '/finance': DollarSign,
  '/website': Globe,
  '/cms': Globe,
  '/shop-admin': ShoppingCart,
  '/ai': Sparkles,
  '/quality': Shield,
};

const newModuleLabels: Record<string, string> = {
  '/personnel': '人事管理',
  '/salary': '薪酬管理',
  '/attendance': '考勤管理',
  '/performance': '绩效管理',
  '/recruitment': '招聘管理',
  '/logistics': '后勤管理',
  '/approval': '流程审批',
  '/training': '培训管理',
  '/office': '综合事务',
  '/selfservice': '员工自助',
  '/system': '系统管理',
  '/plm': '工艺管理',
  '/warehouse': '仓储管理',
  '/sales': '销售管理',
  '/purchase': '采购管理',
  '/production': '生产管理',
  '/finance': '财务管理',
  '/website': '网站商城',
  '/cms': '网站管理',
  '/shop-admin': '商城管理',
  '/ai': 'AI智能',
  '/quality': '质量管理',
};

const Layout: React.FC = () => {
  const { config } = useAppConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('__current_user') || '{}'); }
    catch { return {}; }
  })();

  const MODULE_PERM: Record<string, string> = {
    '/personnel': 'p_personnel',
    '/salary': 'p_salary',
    '/attendance': 'p_attendance',
    '/performance': 'p_performance',
    '/recruitment': 'p_recruitment',
    '/logistics': 'p_logistics',
    '/approval': 'p_approval',
    '/training': 'p_training',
    '/office': 'p_office',
    '/product': 'p_product',
    '/plm': 'p_plm',
    '/warehouse': 'p_warehouse',
    '/sales': 'p_sales',
    '/purchase': 'p_purchase',
    '/production': 'p_production',
    '/finance': 'p_finance',
    '/dashboard': 'p_dashboard',
    '/website': 'p_website',
    '/cms': 'p_website',
    '/shop-admin': 'p_website',
    '/ai': 'p_website',
    '/quality': 'p_quality',
    '/selfservice': 'p_selfservice',
    '/system': 'p_system',
  };

  const USER_ROLE_PERMS: Record<string, string[]> = {
    super_admin: ['p_org','p_personnel','p_attendance','p_salary','p_performance','p_recruitment','p_logistics','p_approval','p_training','p_office','p_product','p_plm','p_warehouse','p_sales','p_purchase','p_production','p_finance','p_dashboard','p_website','p_quality','p_selfservice','p_system'],
    sys_admin:   ['p_org','p_personnel','p_attendance','p_salary','p_performance','p_recruitment','p_logistics','p_approval','p_training','p_office','p_product','p_plm','p_warehouse','p_sales','p_purchase','p_production','p_finance','p_dashboard','p_website','p_quality','p_selfservice','p_system'],
    hr_admin:    ['p_personnel','p_attendance','p_salary','p_performance','p_recruitment','p_approval'],
    hr_staff:    ['p_personnel','p_attendance','p_salary','p_approval'],
    dept_manager:['p_org','p_personnel','p_attendance','p_approval'],
    employee:    ['p_personnel','p_attendance','p_approval'],
  };

  const userPerms = (() => {
    const roleIdsRaw = currentUser.roleIds;
    let roleIds: string[] = [];
    
    // 解析roleIds（可能是JSON字符串或数组）
    if (typeof roleIdsRaw === 'string') {
      try {
        roleIds = JSON.parse(roleIdsRaw);
      } catch {
        roleIds = [];
      }
    } else if (Array.isArray(roleIdsRaw)) {
      roleIds = roleIdsRaw;
    }
    
    if (currentUser.userType === 'super_admin') return USER_ROLE_PERMS.super_admin;
    if (currentUser.userType === 'tech_admin') return USER_ROLE_PERMS.sys_admin;
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

  const hasModule = (path: string): boolean => {
    const perm = MODULE_PERM[path];
    return perm ? userPerms.includes(perm) : true;
  };

  const isAdmin = currentUser.userType === 'super_admin' || currentUser.userType === 'tech_admin';

  const handleLogout = () => {
    sessionStorage.removeItem('__current_user');
    navigate('/login');
  };

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ['/personnel','/salary','/attendance','/performance','/recruitment','/logistics','/approval','/product','/system','/cms','/shop-admin','/ai'].forEach(p => {
      initial[p] = location.pathname.startsWith(p) ||
        (p === '/cms' && location.pathname.startsWith('/admin/cms')) ||
        (p === '/shop-admin' && location.pathname.startsWith('/admin/shop'));
    });
    return initial;
  });

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleSubmenu = (path: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const isModuleActive = (path: string) => {
    if (path === '/cms') return location.pathname.startsWith('/admin/cms');
    if (path === '/shop-admin') return location.pathname.startsWith('/admin/shop');
    return location.pathname.startsWith(path);
  };

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
          <span className="flex-1 text-sm">{t(item.label)}</span>
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
          <span className="flex-1 text-sm text-left">{t(label)}</span>
          <ChevronDown className={`w-4 h-4 transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="ml-6 mt-1 space-y-0.5">
            {subs.map((sub) => (
              <NavLink
                key={sub.key || sub.to}
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
                {t(sub.label)}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-sidebar flex flex-col z-50 transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
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

        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {menuItems.map(renderNavItem)}

          <div className="h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent my-3" />

          {hasModule('/personnel') && renderNewModuleNav('/personnel')}
          {hasModule('/attendance') && renderNewModuleNav('/attendance')}
          {hasModule('/salary') && renderNewModuleNav('/salary')}
          {hasModule('/performance') && renderNewModuleNav('/performance')}
          {hasModule('/recruitment') && renderNewModuleNav('/recruitment')}
          {hasModule('/logistics') && renderNewModuleNav('/logistics')}
          {hasModule('/office') && renderNewModuleNav('/office')}
          {hasModule('/training') && renderNewModuleNav('/training')}
          {hasModule('/approval') && renderNewModuleNav('/approval')}
          {hasModule('/plm') && renderNewModuleNav('/plm')}
          {hasModule('/warehouse') && renderNewModuleNav('/warehouse')}
          {hasModule('/sales') && renderNewModuleNav('/sales')}
          {hasModule('/purchase') && renderNewModuleNav('/purchase')}
          {hasModule('/production') && renderNewModuleNav('/production')}
          {hasModule('/finance') && renderNewModuleNav('/finance')}
          {hasModule('/cms') && renderNewModuleNav('/cms')}
          {hasModule('/shop-admin') && renderNewModuleNav('/shop-admin')}
          {hasModule('/ai') && renderNewModuleNav('/ai')}
          {hasModule('/quality') && renderNewModuleNav('/quality')}
          {hasModule('/selfservice') && renderNewModuleNav('/selfservice')}
          {isAdmin && renderNewModuleNav('/system')}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <LanguageSwitcher />
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
              return null;
            }
          })()}
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Mobile-only sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-3 left-3 z-30 p-2 rounded-lg bg-white shadow-md hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <div className="p-6 pt-6 max-w-[1600px] mx-auto">
          <div className="min-h-screen">
            <Outlet />
          </div>
        </div>
      </main>

      <AIFloatingButton />
    </div>
  );
};

export default Layout;