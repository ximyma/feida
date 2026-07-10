/**
 * 轻量多语言 i18n 骨架（不引入第三方依赖，避免破坏 package.json）
 * - 以"中文原文"作为翻译 key；未提供译文的 locale 自动回退到 key（即中文）。
 * - 当前内置 zh-CN（默认）与 en；新增语言只需在 AVAILABLE_LOCALES 与 DICTS 中扩展。
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface LocaleMeta {
  code: string;
  name: string;
}

export const AVAILABLE_LOCALES: LocaleMeta[] = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en', name: 'English' },
];

// 英文译文表：key = 中文原文，value = 英文
// 仅覆盖导航主分组、顶层菜单与常用操作；其余文本回退到中文（key）
const EN_DICT: Record<string, string> = {
  // 顶层菜单
  '首页仪表盘': 'Dashboard',
  '组织管理': 'Organization',
  '产品档案': 'Products',
  '数据统计': 'Statistics',
  '员工自助': 'Self Service',
  // 模块分组
  '人事管理': 'Personnel',
  '薪酬管理': 'Compensation',
  '考勤管理': 'Attendance',
  '绩效管理': 'Performance',
  '招聘管理': 'Recruitment',
  '后勤管理': 'Logistics',
  '流程审批': 'Approval',
  '培训管理': 'Training',
  '综合事务': 'General Affairs',
  '系统管理': 'System',
  '工艺管理': 'PLM',
  '仓储管理': 'Warehouse',
  '销售管理': 'Sales',
  '采购管理': 'Procurement',
  '生产管理': 'Production',
  '财务管理': 'Finance',
  '网站商城': 'Website & Mall',
  '网站管理': 'Website',
  '商城管理': 'Mall',
  'AI智能': 'AI',
  '质量管理': 'Quality',
  // 常用操作
  '保存': 'Save',
  '取消': 'Cancel',
  '删除': 'Delete',
  '编辑': 'Edit',
  '新增': 'Add',
  '搜索': 'Search',
  '导出': 'Export',
  '导入': 'Import',
  '确认': 'Confirm',
  '提交': 'Submit',
  '重置': 'Reset',
  '操作': 'Actions',
  '状态': 'Status',
  '名称': 'Name',
  '创建时间': 'Created At',
  '登录': 'Sign In',
  '登出': 'Sign Out',
  '用户名': 'Username',
  '密码': 'Password',
  '语言': 'Language',
  '退出登录': 'Logout',
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
  '成功': 'Success', '失败': 'Failed', '加载中': 'Loading', '暂无数据': 'No Data', '总计': 'Total',
};

const DICTS: Record<string, Record<string, string>> = {
  'en': EN_DICT,
  // zh-CN 无需字典：t() 回退到 key（即中文原文）
};

interface I18nContextType {
  locale: string;
  locales: LocaleMeta[];
  setLocale: (code: string) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<string>(() => {
    try { return localStorage.getItem('app_locale') || 'zh-CN'; } catch { return 'zh-CN'; }
  });

  const setLocale = useCallback((code: string) => {
    try { localStorage.setItem('app_locale', code); } catch { /* ignore */ }
    setLocaleState(code);
    if (typeof document !== 'undefined') document.documentElement.lang = code;
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const dict = DICTS[locale];
    let str: string = (dict && dict[key]) || key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return str;
  }, [locale]);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, locales: AVAILABLE_LOCALES, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n 必须在 <I18nProvider> 内使用');
  return ctx;
}

/** 语言切换器（侧边栏底部用） */
export function LanguageSwitcher() {
  const { locale, locales, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const current = locales.find((l) => l.code === locale) || locales[0];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white text-sm transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm7.5-3H14m1 0l1.5 1.5M21 18l-3-3m0 0l-3 3m3-3v6" />
        </svg>
        <span className="flex-1 text-left">{current?.name}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-sidebar-accent rounded-lg overflow-hidden shadow-xl z-20">
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${l.code === locale ? 'bg-sidebar-primary text-white' : 'text-white/80 hover:bg-white/10'}`}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default I18nProvider;
