// Odoo 模块: l10n_vn
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_vn_e_invoice_number": {
        "type": "char",
        "label": "l10n_vn_e_invoice_number"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "respartnerbank",
    "_description": "respartnerbank",
    "_auto": true,
    "_fields": {
      "proxy_type": {
        "type": "selection",
        "label": "merchant_id"
      }
    },
    "_inherit": "res.partner.bank"
  }
];
