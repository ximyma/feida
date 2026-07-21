// 中国本土化模块 — ORM模型
exports.models = [
  {
    _name: 'tax_rates',
    _description: '税率表',
    _rec_name: 'name',
    _fields: {
      name:        { type: 'char', label: '名称', required: true },
      rate:        { type: 'float', label: '税率(%)' },
      description: { type: 'text', label: '描述' },
    },
  },
  {
    _name: 'payment_methods',
    _description: '付款方式',
    _rec_name: 'name',
    _fields: {
      name:        { type: 'char', label: '名称', required: true },
      code:        { type: 'char', label: '编码' },
      description: { type: 'text', label: '描述' },
      is_active:   { type: 'boolean', label: '启用', default: true },
    },
  },
  {
    _name: 'account_chart',
    _description: '会计科目表',
    _rec_name: 'name',
    _fields: {
      code:        { type: 'char', label: '科目编码', required: true, index: true },
      name:        { type: 'char', label: '科目名称', required: true },
      type:        { type: 'selection', label: '类型', selection: [
                      {label:'资产',value:'asset'},{label:'负债',value:'liability'},{label:'权益',value:'equity'},
                      {label:'成本',value:'cost'},{label:'收入',value:'revenue'},{label:'费用',value:'expense'}
                    ]},
      level:       { type: 'integer', label: '级次' },
      parent_code: { type: 'char', label: '上级编码' },
      is_active:   { type: 'boolean', label: '启用', default: true },
    },
  },
  {
    _name: 'holidays',
    _description: '节假日',
    _rec_name: 'name',
    _fields: {
      name:         { type: 'char', label: '名称', required: true },
      holiday_date: { type: 'date', label: '日期' },
      description:  { type: 'text', label: '描述' },
    },
  },
];
