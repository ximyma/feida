// Odoo 模块: payment_asiapay
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
      "asiapay_brand": {
        "type": "selection",
        "label": "asiapay_brand"
      },
      "asiapay_merchant_id": {
        "type": "char",
        "label": "asiapay_merchant_id"
      },
      "asiapay_secure_hash_secret": {
        "type": "char",
        "label": "asiapay_secure_hash_secret"
      },
      "asiapay_secure_hash_function": {
        "type": "selection",
        "label": "asiapay_secure_hash_function"
      }
    },
    "_inherit": "payment.provider"
  }
];
