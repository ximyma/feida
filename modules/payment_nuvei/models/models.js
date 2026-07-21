// Odoo 模块: payment_nuvei
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
      "nuvei_merchant_identifier": {
        "type": "char",
        "label": "nuvei_merchant_identifier"
      },
      "nuvei_site_identifier": {
        "type": "char",
        "label": "nuvei_site_identifier"
      },
      "nuvei_secret_key": {
        "type": "char",
        "label": "nuvei_secret_key"
      }
    },
    "_inherit": "payment.provider"
  }
];
