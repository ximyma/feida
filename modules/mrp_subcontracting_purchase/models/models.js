// Odoo 模块: mrp_subcontracting_purchase
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "purchaseorder",
    "_description": "purchaseorder",
    "_auto": true,
    "_fields": {
      "subcontracting_resupply_picking_count": {
        "type": "integer",
        "label": "subcontracting_resupply_picking_count"
      }
    },
    "_inherit": "purchase.order"
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "subcontracting_source_purchase_count": {
        "type": "integer",
        "label": "subcontracting_source_purchase_count"
      }
    },
    "_inherit": "stock.picking"
  }
];
