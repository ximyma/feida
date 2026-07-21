// Odoo 模块: payment_mollie
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "paymentprovider",
    "_description": "paymentprovider",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "selection",
        "label": "code"
      },
      "mollie_api_key": {
        "type": "char",
        "label": "mollie_api_key"
      }
    },
    "_inherit": "payment.provider"
  }
];
