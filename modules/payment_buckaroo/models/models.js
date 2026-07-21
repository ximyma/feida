// Odoo 模块: payment_buckaroo
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
      "buckaroo_website_key": {
        "type": "char",
        "label": "buckaroo_website_key"
      },
      "buckaroo_secret_key": {
        "type": "char",
        "label": "buckaroo_secret_key"
      }
    },
    "_inherit": "payment.provider"
  }
];
