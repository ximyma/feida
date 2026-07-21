// Odoo 模块: purchase_requisition_stock
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "purchaseorder",
    "_description": "purchaseorder",
    "_auto": true,
    "_fields": {
      "on_time_rate_perc": {
        "type": "float",
        "label": "OTD"
      }
    },
    "_inherit": "purchase.order"
  },
  {
    "_name": "purchaseorderline",
    "_description": "purchaseorderline",
    "_auto": true,
    "_fields": {
      "on_time_rate_perc": {
        "type": "float",
        "label": "OTD"
      }
    },
    "_inherit": "purchase.order.line"
  },
  {
    "_name": "purchaserequisition",
    "_description": "purchaserequisition",
    "_auto": true,
    "_fields": {
      "warehouse_id": {
        "type": "many2one",
        "label": "stock.warehouse"
      },
      "picking_type_id": {
        "type": "many2one",
        "label": "picking_type_id"
      }
    },
    "_inherit": "purchase.requisition"
  },
  {
    "_name": "purchaserequisitionline",
    "_description": "purchaserequisitionline",
    "_auto": true,
    "_fields": {
      "move_dest_id": {
        "type": "many2one",
        "label": "stock.move"
      }
    },
    "_inherit": "purchase.requisition.line"
  },
  {
    "_name": "stockmove",
    "_description": "stockmove",
    "_auto": true,
    "_fields": {
      "requisition_line_ids": {
        "type": "one2many",
        "label": "purchase.requisition.line"
      }
    },
    "_inherit": "stock.move"
  }
];
