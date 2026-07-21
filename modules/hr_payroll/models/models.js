// 薪资模块 — 模型继承示例
// _inherit: 'employees' → 扩展 employees 表，添加薪资相关字段

exports.models = [
  {
    _name: 'hr_payroll',
    _inherit: 'employees',
    _description: '员工薪资扩展 (继承 employees)',
    _fields: {
      // 薪资字段（继承到 employees 表）
      baseSalary:      { type: 'float',    label: '基本工资', groups: ['super_admin','hr_admin','hr_staff'] },
      monthlyPay:     { type: 'float',    label: '月工资总额', groups: ['super_admin','hr_admin','hr_staff'] },
      grossSalary:    { type: 'float',    label: '税前工资', groups: ['super_admin','hr_admin','hr_staff'] },
      netSalary:      { type: 'float',    label: '实发工资', groups: ['super_admin','hr_admin','hr_staff'] },
      socialSecurity: { type: 'float',    label: '社保基数', groups: ['super_admin','hr_admin','hr_staff','finance'] },
      housingFund:  { type: 'float',    label: '公积金基数', groups: ['super_admin','hr_admin','hr_staff','finance'] },
      bankAccount:    { type: 'char',    label: '工资卡号', groups: ['super_admin','hr_admin','finance'], maxLength: 30 },
      bankName:       { type: 'char',    label: '开户行', groups: ['super_admin','hr_admin','finance'] },
      payType:        { type: 'selection', label: '薪资类型',
                        selection: [{label:'月薪',value:'monthly'},{label:'时薪',value:'hourly'},{label:'计件',value:'piecework'}],
                        default: 'monthly' },
    },
  },
  {
    _name: 'payroll_records',
    _description: '工资发放记录',
    _fields: {
      employeeId: { type: 'char',    label: '员工ID', index: true },
      period:     { type: 'char',    label: '工资周期', required: true },
      basePay:    { type: 'float',    label: '基本工资' },
      overtime:   { type: 'float',    label: '加班费' },
      bonus:      { type: 'float',    label: '奖金' },
      deduction:  { type: 'float',    label: '扣款' },
      socialSecurity: { type: 'float', label: '个人社保' },
      housingFund:  { type: 'float', label: '个人公积金' },
      tax:        { type: 'float',    label: '个税' },
      netPay:     { type: 'float',    label: '实发工资' },
      status:     { type: 'selection', label: '状态', default: 'draft',
                    selection: [{label:'草稿',value:'draft'},{label:'已发放',value:'paid'},{label:'已确认',value:'confirmed'}] },
    },
  },
];
