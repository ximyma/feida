// Odoo 模块: l10n_us
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "respartnerbank",
    "_description": "respartnerbank",
    "_auto": true,
    "_fields": {
      "show_aba_routing": {
        "type": "boolean",
        "label": "_compute_show_aba_routing"
      },
      "l10n_us_bank_account_type": {
        "type": "selection",
        "label": "l10n_us_bank_account_type"
      }
    },
    "_inherit": "res.partner.bank"
  }
];
