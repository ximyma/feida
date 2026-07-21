// Odoo 模块: l10n_es_pos
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "account.journal",
    "_description": "account.journal",
    "_auto": true,
    "_fields": {
      "is_spanish": {
        "type": "boolean",
        "label": "Company located in Spain"
      },
      "l10n_es_simplified_invoice_journal_id": {
        "type": "many2one",
        "label": "l10n_es_simplified_invoice_journal_id"
      },
      "simplified_partner_id": {
        "type": "many2one",
        "label": "simplified_partner_id"
      }
    },
    "_inherit": "pos.config"
  },
  {
    "_name": "posorder",
    "_description": "posorder",
    "_auto": true,
    "_fields": {
      "is_l10n_es_simplified_invoice": {
        "type": "boolean",
        "label": "Simplified invoice"
      },
      "l10n_es_simplified_invoice_number": {
        "type": "char",
        "label": "Simplified invoice number"
      }
    },
    "_inherit": "pos.order"
  }
];
