// Odoo 模块: sale_crm
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "crmlead",
    "_description": "crmlead",
    "_auto": true,
    "_fields": {
      "sale_amount_total": {
        "type": "monetary",
        "label": "_compute_sale_data"
      },
      "quotation_count": {
        "type": "integer",
        "label": "_compute_sale_data"
      },
      "sale_order_count": {
        "type": "integer",
        "label": "_compute_sale_data"
      },
      "order_ids": {
        "type": "one2many",
        "label": "sale.order"
      }
    },
    "_inherit": "crm.lead"
  },
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "opportunity_id": {
        "type": "many2one",
        "label": "opportunity_id"
      }
    },
    "_inherit": "sale.order"
  }
];
