// 薪资模块 — 视图注册
// 模块安装时自动加载，注册前端路由

exports.views = [
  {
    path: '/payroll',
    label: '薪资管理',
    icon: 'DollarOutlined',
    component: 'PayrollPage',     // 对应 client/src/pages/PayrollPage
    category: 'HR',
  },
  {
    path: '/payroll/records',
    label: '工资发放',
    icon: 'FileTextOutlined',
    component: 'PayrollRecordsPage',
    category: 'HR',
  },
];
