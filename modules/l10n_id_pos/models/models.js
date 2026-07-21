// Odoo 模块: l10n_id_pos
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "posorder",
    "_description": "posorder",
    "_auto": true,
    "_fields": {
      "l10n_id_qris_transaction_ids": {
        "type": "many2many",
        "label": "l10n_id.qris.transaction"
      }
    },
    "_inherit": "pos.order"
  }
];
