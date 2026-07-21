// Odoo 模块: l10n_th
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "respartnerbank",
    "_description": "respartnerbank",
    "_auto": true,
    "_fields": {
      "proxy_type": {
        "type": "selection",
        "label": "ewallet_id"
      }
    },
    "_inherit": "res.partner.bank"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_th_branch_name": {
        "type": "char",
        "label": "_compute_l10n_th_branch_name"
      }
    },
    "_inherit": "res.partner"
  }
];
