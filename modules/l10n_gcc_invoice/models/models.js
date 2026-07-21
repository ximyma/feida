// Odoo 模块: l10n_gcc_invoice
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "narration": {
        "type": "html",
        "label": "narration"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accountmoveline",
    "_description": "accountmoveline",
    "_auto": true,
    "_fields": {
      "l10n_gcc_invoice_tax_amount": {
        "type": "float",
        "label": "Tax Amount"
      },
      "l10n_gcc_line_name": {
        "type": "char",
        "label": "_compute_l10n_gcc_line_name"
      }
    },
    "_inherit": "account.move.line"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_gcc_dual_language_invoice": {
        "type": "boolean",
        "label": "GCC Formatted Invoices"
      },
      "l10n_gcc_country_is_gcc": {
        "type": "boolean",
        "label": "_compute_l10n_gcc_country_is_gcc"
      }
    },
    "_inherit": "res.company"
  }
];
