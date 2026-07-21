// Odoo 模块: pos_glory_cash
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "glory_websocket_address": {
        "type": "char",
        "label": "Cash Machine IP"
      },
      "glory_username": {
        "type": "char",
        "label": "Cash Machine Username"
      },
      "glory_password": {
        "type": "char",
        "label": "Cash Machine Password"
      }
    },
    "_inherit": "pos.payment.method"
  }
];
