// Odoo 模块: payment_ecpay
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "paymentprovider",
    "_description": "paymentprovider",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "selection",
        "label": "ecpay"
      },
      "ecpay_merchant_id": {
        "type": "char",
        "label": "ecpay_merchant_id"
      },
      "ecpay_hash_key": {
        "type": "char",
        "label": "ecpay_hash_key"
      },
      "ecpay_hash_iv": {
        "type": "char",
        "label": "ecpay_hash_iv"
      }
    },
    "_inherit": "payment.provider"
  }
];
