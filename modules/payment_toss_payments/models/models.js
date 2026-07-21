// Odoo 模块: payment_toss_payments
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
      "toss_payments_client_key": {
        "type": "char",
        "label": "toss_payments_client_key"
      },
      "toss_payments_secret_key": {
        "type": "char",
        "label": "toss_payments_secret_key"
      },
      "toss_payments_webhook_url": {
        "type": "char",
        "label": "toss_payments_webhook_url"
      }
    },
    "_inherit": "payment.provider"
  },
  {
    "_name": "paymenttransaction",
    "_description": "paymenttransaction",
    "_auto": true,
    "_fields": {
      "toss_payments_payment_secret": {
        "type": "char",
        "label": "toss_payments_payment_secret"
      }
    },
    "_inherit": "payment.transaction"
  }
];
