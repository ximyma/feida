// Odoo 模块: l10n_dk_fik
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
      },
      "l10n_dk_fik_creditor_number": {
        "type": "char",
        "label": "l10n_dk_fik_creditor_number"
      }
    },
    "_inherit": "account.journal"
  }
];
