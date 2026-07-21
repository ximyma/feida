// Odoo 模块: l10n_in_ewaybill_irn
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "l10ninewaybill",
    "_description": "l10ninewaybill",
    "_auto": true,
    "_fields": {
      "is_process_through_irn": {
        "type": "boolean",
        "label": "_compute_is_process_through_irn"
      },
      "is_sent_through_irn": {
        "type": "boolean",
        "label": "is_sent_through_irn"
      }
    },
    "_inherit": "l10n.in.ewaybill"
  }
];
