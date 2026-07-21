// Odoo 模块: pos_mollie
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "mollie_terminal_id": {
        "type": "char",
        "label": "Mollie Terminal ID"
      },
      "mollie_payment_provider_id": {
        "type": "many2one",
        "label": "payment.provider"
      }
    },
    "_inherit": "pos.payment.method"
  }
];
