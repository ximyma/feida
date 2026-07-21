// Odoo 模块: payment_aps
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
      "aps_merchant_identifier": {
        "type": "char",
        "label": "aps_merchant_identifier"
      },
      "aps_access_code": {
        "type": "char",
        "label": "aps_access_code"
      },
      "aps_sha_request": {
        "type": "char",
        "label": "aps_sha_request"
      },
      "aps_sha_response": {
        "type": "char",
        "label": "aps_sha_response"
      }
    },
    "_inherit": "payment.provider"
  }
];
