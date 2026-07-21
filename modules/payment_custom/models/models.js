// Odoo 模块: payment_custom
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
      "custom_mode": {
        "type": "selection",
        "label": "custom_mode"
      },
      "qr_code": {
        "type": "boolean",
        "label": "qr_code"
      }
    },
    "_inherit": "payment.provider"
  }
];
