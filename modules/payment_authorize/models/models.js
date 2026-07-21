// Odoo 模块: payment_authorize
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
      "authorize_login": {
        "type": "char",
        "label": "authorize_login"
      },
      "authorize_transaction_key": {
        "type": "char",
        "label": "authorize_transaction_key"
      },
      "authorize_signature_key": {
        "type": "char",
        "label": "authorize_signature_key"
      },
      "authorize_client_key": {
        "type": "char",
        "label": "authorize_client_key"
      }
    },
    "_inherit": "payment.provider"
  },
  {
    "_name": "paymenttoken",
    "_description": "paymenttoken",
    "_auto": true,
    "_fields": {
      "authorize_profile": {
        "type": "char",
        "label": "authorize_profile"
      }
    },
    "_inherit": "payment.token"
  }
];
