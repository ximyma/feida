// Odoo 模块: payment_redsys
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
      "redsys_merchant_code": {
        "type": "char",
        "label": "redsys_merchant_code"
      },
      "redsys_merchant_terminal": {
        "type": "char",
        "label": "redsys_merchant_terminal"
      },
      "redsys_secret_key": {
        "type": "char",
        "label": "redsys_secret_key"
      }
    },
    "_inherit": "payment.provider"
  }
];
