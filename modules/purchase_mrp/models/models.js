// Odoo 模块: purchase_mrp
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mrpbomline",
    "_description": "mrpbomline",
    "_auto": true,
    "_fields": {
      "cost_share": {
        "type": "float",
        "label": "cost_share"
      }
    },
    "_inherit": "mrp.bom.line"
  },
  {
    "_name": "mrpproduction",
    "_description": "mrpproduction",
    "_auto": true,
    "_fields": {
      "purchase_order_count": {
        "type": "integer",
        "label": "purchase_order_count"
      }
    },
    "_inherit": "mrp.production"
  },
  {
    "_name": "purchaseorder",
    "_description": "purchaseorder",
    "_auto": true,
    "_fields": {
      "mrp_production_count": {
        "type": "integer",
        "label": "mrp_production_count"
      }
    },
    "_inherit": "purchase.order"
  }
];
