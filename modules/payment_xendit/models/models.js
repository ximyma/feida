// Odoo 模块: payment_xendit
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
      "xendit_public_key": {
        "type": "char",
        "label": "xendit_public_key"
      },
      "xendit_secret_key": {
        "type": "char",
        "label": "xendit_secret_key"
      },
      "xendit_webhook_token": {
        "type": "char",
        "label": "xendit_webhook_token"
      }
    },
    "_inherit": "payment.provider"
  }
];
