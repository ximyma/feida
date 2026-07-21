// Odoo 模块: l10n_my_edi_pos
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "pos.order",
    "_description": "pos.order",
    "_auto": true,
    "_fields": {
      "pos_order_ids": {
        "type": "many2many",
        "label": "pos_order_ids"
      },
      "pos_config_id": {
        "type": "many2one",
        "label": "pos_config_id"
      },
      "linked_order_count": {
        "type": "integer",
        "label": "linked_order_count"
      },
      "pos_order_date_range": {
        "type": "char",
        "label": "pos_order_date_range"
      }
    },
    "_inherit": "myinvois.document"
  },
  {
    "_name": "myinvois.document",
    "_description": "myinvois.document",
    "_auto": true,
    "_fields": {
      "consolidated_invoice_ids": {
        "type": "many2many",
        "label": "consolidated_invoice_ids"
      }
    },
    "_inherit": "pos.order"
  }
];
