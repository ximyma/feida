// Odoo 模块: pos_online_payment_self_order
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "posconfig",
    "_description": "posconfig",
    "_auto": true,
    "_fields": {
      "self_order_online_payment_method_id": {
        "type": "many2one",
        "label": "pos.payment.method"
      }
    },
    "_inherit": "pos.config"
  },
  {
    "_name": "posorder",
    "_description": "posorder",
    "_auto": true,
    "_fields": {
      "use_self_order_online_payment": {
        "type": "boolean",
        "label": "_compute_use_self_order_online_payment"
      }
    },
    "_inherit": "pos.order"
  }
];
