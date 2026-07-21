// Odoo 模块: payment_razorpay
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
      "razorpay_key_id": {
        "type": "char",
        "label": "razorpay_key_id"
      },
      "razorpay_key_secret": {
        "type": "char",
        "label": "razorpay_key_secret"
      },
      "razorpay_webhook_secret": {
        "type": "char",
        "label": "razorpay_webhook_secret"
      },
      "razorpay_account_id": {
        "type": "char",
        "label": "razorpay_account_id"
      },
      "razorpay_refresh_token": {
        "type": "char",
        "label": "razorpay_refresh_token"
      },
      "razorpay_public_token": {
        "type": "char",
        "label": "razorpay_public_token"
      },
      "razorpay_access_token": {
        "type": "char",
        "label": "razorpay_access_token"
      },
      "razorpay_access_token_expiry": {
        "type": "datetime",
        "label": "razorpay_access_token_expiry"
      }
    },
    "_inherit": "payment.provider"
  }
];
