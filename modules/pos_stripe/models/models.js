// Odoo 模块: pos_stripe
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "stripe_serial_number": {
        "type": "char",
        "label": "[Serial number of the stripe terminal], for example: WSC513105011295"
      }
    },
    "_inherit": "pos.payment.method"
  }
];
