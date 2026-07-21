// Odoo 模块: payment_paypal
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
      "paypal_email_account": {
        "type": "char",
        "label": "paypal_email_account"
      },
      "paypal_client_id": {
        "type": "char",
        "label": "paypal_client_id"
      },
      "paypal_client_secret": {
        "type": "char",
        "label": "paypal_client_secret"
      },
      "paypal_access_token": {
        "type": "char",
        "label": "paypal_access_token"
      },
      "paypal_access_token_expiry": {
        "type": "datetime",
        "label": "paypal_access_token_expiry"
      },
      "paypal_webhook_id": {
        "type": "char",
        "label": "PayPal Webhook ID"
      }
    },
    "_inherit": "payment.provider"
  },
  {
    "_name": "paymenttransaction",
    "_description": "paymenttransaction",
    "_auto": true,
    "_fields": {
      "paypal_type": {
        "type": "char",
        "label": "PayPal Transaction Type"
      }
    },
    "_inherit": "payment.transaction"
  }
];
