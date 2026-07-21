// Odoo 模块: l10n_fr
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_fr_closing_sequence_id": {
        "type": "many2one",
        "label": "ir.sequence"
      },
      "ape": {
        "type": "char",
        "label": "APE"
      },
      "is_france_country": {
        "type": "boolean",
        "label": "is_france_country"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_fr_is_french": {
        "type": "boolean",
        "label": "_compute_l10n_fr_is_french"
      }
    },
    "_inherit": "res.partner"
  }
];
