// Odoo 模块: payment_paymob
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "res.country",
    "_description": "res.country",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "selection",
        "label": "code"
      },
      "paymob_account_country_id": {
        "type": "many2one",
        "label": "paymob_account_country_id"
      },
      "paymob_public_key": {
        "type": "char",
        "label": "paymob_public_key"
      },
      "paymob_secret_key": {
        "type": "char",
        "label": "paymob_secret_key"
      },
      "paymob_hmac_key": {
        "type": "char",
        "label": "paymob_hmac_key"
      },
      "paymob_api_key": {
        "type": "char",
        "label": "paymob_api_key"
      }
    },
    "_inherit": "payment.provider"
  }
];
