// Odoo 模块: l10n_es
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_es_is_simplified": {
        "type": "boolean",
        "label": "Is Simplified"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_es_exempt_reason": {
        "type": "selection",
        "label": "l10n_es_exempt_reason"
      },
      "l10n_es_type": {
        "type": "selection",
        "label": "l10n_es_type"
      },
      "l10n_es_bien_inversion": {
        "type": "boolean",
        "label": "Bien de Inversion",
        "default": false
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_es_simplified_invoice_limit": {
        "type": "float",
        "label": "l10n_es_simplified_invoice_limit"
      }
    },
    "_inherit": "res.company"
  }
];
