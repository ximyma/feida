// Odoo 模块: payment_iyzico
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
      "iyzico_key_id": {
        "type": "char",
        "label": "Iyzico API Key"
      },
      "iyzico_key_secret": {
        "type": "char",
        "label": "iyzico_key_secret"
      }
    },
    "_inherit": "payment.provider"
  }
];
