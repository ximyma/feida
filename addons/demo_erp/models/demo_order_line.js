// demo_erp — 订单明细
// 演示: Many2one(order_id + product_id), 从order反向通过children()查询
exports.model = {
  _name: 'demo_order_line',
  _description: '订单明细',
  _fields: {
    order_id:    { type: 'many2one', label: '订单', relation: 'demo_order', required: true },
    product_id:  { type: 'many2one', label: '产品', relation: 'demo_product' },
    qty:         { type: 'integer', label: '数量', required: true, default: 1 },
    unit_price:  { type: 'float', label: '单价' },
    subtotal:    { type: 'float', label: '小计' },
  },
  _hooks: {
    beforeCreate: [
      function(vals, env) {
        if (!vals.subtotal && vals.qty && vals.unit_price) {
          vals.subtotal = vals.qty * vals.unit_price;
        }
      },
    ],
    afterCreate: [
      function(id, vals, env) {
        try {
          var orderId = vals.order_id;
          if (orderId) {
            var lines = env['demo_order_line'].search({ order_id: orderId });
            var total = lines.toArray().reduce(function(s, l) { return s + (l.subtotal || 0); }, 0);
            env['demo_order'].browse(orderId).write({ amount: total });
          }
        } catch(e) {}
      },
    ],
  },
};
