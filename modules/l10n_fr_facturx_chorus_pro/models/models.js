// Odoo 模块: l10n_fr_facturx_chorus_pro
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "buyer_reference": {
        "type": "char",
        "label": "Code de Service"
      },
      "contract_reference": {
        "type": "char",
        "label": "Numéro de Marché"
      },
      "purchase_order_reference": {
        "type": "char",
        "label": "Engagement Juridique"
      }
    },
    "_inherit": "account.move"
  }
];
