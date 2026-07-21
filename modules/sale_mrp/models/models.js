// Odoo 模块: sale_mrp
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mrpproduction",
    "_description": "mrpproduction",
    "_auto": true,
    "_fields": {
      "sale_order_count": {
        "type": "integer",
        "label": "sale_order_count"
      },
      "sale_line_id": {
        "type": "many2one",
        "label": "sale.order.line"
      }
    },
    "_inherit": "mrp.production"
  },
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "mrp_production_count": {
        "type": "integer",
        "label": "mrp_production_count"
      },
      "mrp_production_ids": {
        "type": "many2many",
        "label": "mrp_production_ids"
      }
    },
    "_inherit": "sale.order"
  }
];
