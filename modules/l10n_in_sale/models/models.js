// Odoo 模块: l10n_in_sale
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "l10n_in_reseller_partner_id": {
        "type": "many2one",
        "label": "res.partner"
      }
    },
    "_inherit": "sale.order"
  }
];
