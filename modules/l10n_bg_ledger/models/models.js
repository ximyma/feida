// Odoo 模块: l10n_bg_ledger
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountjournal",
    "_description": "accountjournal",
    "_auto": true,
    "_fields": {
      "l10n_bg_customer_invoice": {
        "type": "selection",
        "label": "Customer Invoices",
        "default": "01"
      },
      "l10n_bg_credit_notes": {
        "type": "selection",
        "label": "Credit Notes",
        "default": "03"
      },
      "l10n_bg_debit_notes": {
        "type": "selection",
        "label": "Debit Notes",
        "default": "02"
      }
    },
    "_inherit": "account.journal"
  },
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_bg_document_type": {
        "type": "selection",
        "label": "l10n_bg_document_type"
      },
      "l10n_bg_document_number": {
        "type": "char",
        "label": "Document Number (BG)"
      },
      "l10n_bg_exemption_reason": {
        "type": "selection",
        "label": "Exemption reason (BG)"
      }
    },
    "_inherit": "account.move"
  }
];
