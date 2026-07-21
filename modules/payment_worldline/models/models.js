// Odoo 模块: payment_worldline
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
      "worldline_pspid": {
        "type": "char",
        "label": "worldline_pspid"
      },
      "worldline_api_key": {
        "type": "char",
        "label": "worldline_api_key"
      },
      "worldline_api_secret": {
        "type": "char",
        "label": "worldline_api_secret"
      },
      "worldline_webhook_key": {
        "type": "char",
        "label": "worldline_webhook_key"
      },
      "worldline_webhook_secret": {
        "type": "char",
        "label": "worldline_webhook_secret"
      }
    },
    "_inherit": "payment.provider"
  }
];
