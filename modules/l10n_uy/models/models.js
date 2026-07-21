// Odoo 模块: l10n_uy
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_uy_tax_category": {
        "type": "selection",
        "label": "l10n_uy_tax_category"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "l10n_latamidentificationtype",
    "_description": "l10n_latamidentificationtype",
    "_auto": true,
    "_fields": {
      "l10n_uy_dgi_code": {
        "type": "char",
        "label": "DGI Code"
      }
    },
    "_inherit": "l10n_latam.identification.type"
  }
];
