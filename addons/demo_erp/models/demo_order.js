// demo_erp — 订单
// 演示: Many2one(contact_id), 钩子自动生成订单号
exports.model = {
  _name: 'demo_order',
  _description: '订单',
  _fields: {
    order_no:    { type: 'char', label: '订单号' },
    contact_id:  { type: 'many2one', label: '客户', relation: 'demo_contact' },
    amount:      { type: 'float', label: '总金额', default: 0 },
    status:      { type: 'selection', label: '状态', default: 'draft',
      selection: [{label:'草稿',value:'draft'},{label:'已确认',value:'confirmed'},{label:'已完成',value:'done'},{label:'已取消',value:'cancelled'}] },
  },
  _hooks: {
    beforeCreate: [
      function(vals, env) {
        if (!vals.order_no) {
          var today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          vals.order_no = 'ORD' + today + Math.random().toString(36).slice(2, 6).toUpperCase();
        }
      },
    ],
  },
};
