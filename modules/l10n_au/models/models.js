// Odoo 模块: l10n_au
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_au_is_gst_registered": {
        "type": "boolean",
        "label": "Australia GST registered"
      },
      "l10n_au_trading_name": {
        "type": "char",
        "label": "Trading Name"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartnerbank",
    "_description": "respartnerbank",
    "_auto": true,
    "_fields": {
      "aba_bsb": {
        "type": "char",
        "label": "BSB"
      }
    },
    "_inherit": "res.partner.bank"
  }
];
