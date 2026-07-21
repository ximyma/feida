// Odoo 模块: pos_mercado_pago
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "mp_bearer_token": {
        "type": "char",
        "label": "mp_bearer_token"
      },
      "mp_webhook_secret_key": {
        "type": "char",
        "label": "mp_webhook_secret_key"
      },
      "mp_id_point_smart": {
        "type": "char",
        "label": "mp_id_point_smart"
      },
      "mp_id_point_smart_complet": {
        "type": "char",
        "label": "mp_id_point_smart_complet"
      }
    },
    "_inherit": "pos.payment.method"
  }
];
