// Odoo 模块: payment_mercado_pago
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
      "mercado_pago_account_country_id": {
        "type": "many2one",
        "label": "mercado_pago_account_country_id"
      },
      "mercado_pago_is_oauth_supported": {
        "type": "boolean",
        "label": "_compute_mercado_pago_is_oauth_supported"
      },
      "mercado_pago_access_token": {
        "type": "char",
        "label": "mercado_pago_access_token"
      },
      "mercado_pago_access_token_expiry": {
        "type": "datetime",
        "label": "mercado_pago_access_token_expiry"
      },
      "mercado_pago_refresh_token": {
        "type": "char",
        "label": "mercado_pago_refresh_token"
      },
      "mercado_pago_public_key": {
        "type": "char",
        "label": "mercado_pago_public_key"
      }
    },
    "_inherit": "payment.provider"
  },
  {
    "_name": "paymenttoken",
    "_description": "paymenttoken",
    "_auto": true,
    "_fields": {
      "mercado_pago_customer_id": {
        "type": "char",
        "label": "mercado_pago_customer_id"
      }
    },
    "_inherit": "payment.token"
  }
];
