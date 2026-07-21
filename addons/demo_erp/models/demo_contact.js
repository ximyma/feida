// demo_erp — 联系人
// 演示: Many2one关联(city_id→demo_city), selection枚举, 钩子, 计算字段
exports.model = {
  _name: 'demo_contact',
  _description: '联系人',
  _fields: {
    name:      { type: 'char', label: '姓名', required: true },
    email:     { type: 'char', label: '邮箱' },
    phone:     { type: 'char', label: '电话' },
    city_id:   { type: 'many2one', label: '城市', relation: 'demo_city' },
    type:      { type: 'selection', label: '类型', default: 'client',
      selection: [{label:'客户',value:'client'},{label:'供应商',value:'supplier'},{label:'员工',value:'employee'}] },
    credit:    { type: 'float', label: '信用额度', default: 0 },
    active:    { type: 'boolean', label: '启用', default: true },
  },
  _hooks: {
    afterCreate: [
      function(id, vals, env) {
        console.log('[钩子] 新联系人创建: ' + vals.name + ' (' + id + ')');
      },
    ],
    beforeWrite: [
      function(id, vals, env) {
        if (vals.credit && vals.credit < 0) {
          throw new Error('信用额度不能为负数');
        }
      },
    ],
  },
};
