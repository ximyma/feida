// Odoo 模块: stock_dropshipping
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "purchaseorder",
    "_description": "purchaseorder",
    "_auto": true,
    "_fields": {
      "dropship_picking_count": {
        "type": "integer",
        "label": "Dropship Count"
      }
    },
    "_inherit": "purchase.order"
  },
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "dropship_picking_count": {
        "type": "integer",
        "label": "Dropship Count"
      }
    },
    "_inherit": "sale.order"
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "is_dropship": {
        "type": "boolean",
        "label": "Is a Dropship"
      }
    },
    "_inherit": "stock.picking"
  },
  {
    "_name": "stockpickingtype",
    "_description": "stockpickingtype",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "selection",
        "label": "code"
      }
    },
    "_inherit": "stock.picking.type"
  }
];
