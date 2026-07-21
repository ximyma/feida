// Odoo 模块: l10n_ca
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_ca_pst": {
        "type": "char",
        "label": "partner_id.l10n_ca_pst"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_ca_pst": {
        "type": "char",
        "label": "PST number"
      }
    },
    "_inherit": "res.partner"
  }
];
