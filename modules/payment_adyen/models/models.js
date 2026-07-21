// Odoo 模块: payment_adyen
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
      "adyen_merchant_account": {
        "type": "char",
        "label": "adyen_merchant_account"
      },
      "adyen_api_key": {
        "type": "char",
        "label": "adyen_api_key"
      },
      "adyen_client_key": {
        "type": "char",
        "label": "adyen_client_key"
      },
      "adyen_hmac_key": {
        "type": "char",
        "label": "adyen_hmac_key"
      },
      "adyen_api_url_prefix": {
        "type": "char",
        "label": "adyen_api_url_prefix"
      }
    },
    "_inherit": "payment.provider"
  },
  {
    "_name": "paymenttoken",
    "_description": "paymenttoken",
    "_auto": true,
    "_fields": {
      "adyen_shopper_reference": {
        "type": "char",
        "label": "adyen_shopper_reference"
      }
    },
    "_inherit": "payment.token"
  }
];
