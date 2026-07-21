// Odoo 模块: payment_flutterwave
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
      "flutterwave_public_key": {
        "type": "char",
        "label": "flutterwave_public_key"
      },
      "flutterwave_secret_key": {
        "type": "char",
        "label": "flutterwave_secret_key"
      },
      "flutterwave_webhook_secret": {
        "type": "char",
        "label": "flutterwave_webhook_secret"
      }
    },
    "_inherit": "payment.provider"
  },
  {
    "_name": "paymenttoken",
    "_description": "paymenttoken",
    "_auto": true,
    "_fields": {
      "flutterwave_customer_email": {
        "type": "char",
        "label": "flutterwave_customer_email"
      }
    },
    "_inherit": "payment.token"
  }
];
