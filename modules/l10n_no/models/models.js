// Odoo 模块: l10n_no
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
      "l10n_no_standard_code": {
        "type": "char",
        "label": "Standard Tax Code"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_no_bronnoysund_number": {
        "type": "char",
        "label": "partner_id.l10n_no_bronnoysund_number"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_no_bronnoysund_number": {
        "type": "char",
        "label": "Register of Legal Entities (Brønnøysund Register Center)"
      }
    },
    "_inherit": "res.partner"
  }
];
