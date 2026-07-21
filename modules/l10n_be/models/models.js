// Odoo 模块: l10n_be
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountjournal",
    "_description": "accountjournal",
    "_auto": true,
    "_fields": {
      "invoice_reference_model": {
        "type": "selection",
        "label": "invoice_reference_model"
      }
    },
    "_inherit": "account.journal"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "tax_scope": {
        "type": "selection",
        "label": "tax_scope"
      }
    },
    "_inherit": "account.tax"
  }
];
