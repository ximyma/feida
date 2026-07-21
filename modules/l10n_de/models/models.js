// Odoo 模块: l10n_de
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_de_datev_code": {
        "type": "char",
        "label": "4 digits code use by Datev"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_de_stnr": {
        "type": "char",
        "label": "l10n_de_stnr"
      },
      "l10n_de_widnr": {
        "type": "char",
        "label": "W-IdNr."
      }
    },
    "_inherit": "res.company"
  }
];
