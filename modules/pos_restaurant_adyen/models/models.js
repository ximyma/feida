// Odoo 模块: pos_restaurant_adyen
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "adyen_merchant_account": {
        "type": "char",
        "label": "The POS merchant account code used in Adyen"
      }
    },
    "_inherit": "pos.payment.method"
  }
];
