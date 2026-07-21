// demo_erp — 城市表
// 演示: required校验、unique约束
exports.model = {
  _name: 'demo_city',
  _description: '城市',
  _fields: {
    name:    { type: 'char', label: '城市名', required: true },
    code:    { type: 'char', label: '区号', required: true },
    is_capital: { type: 'boolean', label: '是否省会', default: false },
  },
  _sql_constraints: [
    ['code_uniq', 'unique(code)', '区号不能重复'],
  ],
};
