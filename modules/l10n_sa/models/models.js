// Odoo 模块: l10n_sa
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_sa_qr_code_str": {
        "type": "char",
        "label": "Zatka QR Code"
      },
      "l10n_sa_show_reason": {
        "type": "boolean",
        "label": "_compute_show_l10n_sa_reason"
      },
      "l10n_sa_reason": {
        "type": "selection",
        "label": "ZATCA Reason"
      },
      "l10n_sa_confirmation_datetime": {
        "type": "datetime",
        "label": "ZATCA Issue Date"
      }
    },
    "_inherit": "account.move"
  }
];
