// Odoo 模块: l10n_sa_edi_pos
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "posorder",
    "_description": "posorder",
    "_auto": true,
    "_fields": {
      "l10n_sa_invoice_qr_code_str": {
        "type": "char",
        "label": "account_move.l10n_sa_qr_code_str"
      },
      "l10n_sa_invoice_edi_state": {
        "type": "selection",
        "label": "account_move.edi_state"
      }
    },
    "_inherit": "pos.order"
  }
];
