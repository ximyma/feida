// Odoo 模块: payment_stripe
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
      "stripe_publishable_key": {
        "type": "char",
        "label": "stripe_publishable_key"
      },
      "stripe_secret_key": {
        "type": "char",
        "label": "stripe_secret_key"
      },
      "stripe_webhook_secret": {
        "type": "char",
        "label": "stripe_webhook_secret"
      }
    },
    "_inherit": "payment.provider"
  },
  {
    "_name": "paymenttoken",
    "_description": "paymenttoken",
    "_auto": true,
    "_fields": {
      "stripe_payment_method": {
        "type": "char",
        "label": "Stripe Payment Method ID"
      },
      "stripe_mandate": {
        "type": "char",
        "label": "Stripe Mandate"
      }
    },
    "_inherit": "payment.token"
  }
];
