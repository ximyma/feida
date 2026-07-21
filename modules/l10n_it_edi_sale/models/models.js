// Odoo 模块: l10n_it_edi_sale
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "l10n_it_origin_document_type": {
        "type": "selection",
        "label": "l10n_it_origin_document_type"
      },
      "l10n_it_origin_document_name": {
        "type": "char",
        "label": "l10n_it_origin_document_name"
      },
      "l10n_it_origin_document_date": {
        "type": "date",
        "label": "l10n_it_origin_document_date"
      },
      "l10n_it_cig": {
        "type": "char",
        "label": "l10n_it_cig"
      },
      "l10n_it_cup": {
        "type": "char",
        "label": "l10n_it_cup"
      },
      "l10n_it_partner_pa": {
        "type": "boolean",
        "label": "_compute_l10n_it_partner_pa"
      }
    },
    "_inherit": "sale.order"
  }
];
