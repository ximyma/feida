// Odoo 模块: l10n_sa_pos
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "posorder",
    "_description": "posorder",
    "_auto": true,
    "_fields": {
      "l10n_sa_reason": {
        "type": "selection",
        "label": "ZATCA Reason"
      },
      "l10n_sa_reason_value": {
        "type": "char",
        "label": "_compute_l10n_sa_reason_value"
      }
    },
    "_inherit": "pos.order"
  }
];
