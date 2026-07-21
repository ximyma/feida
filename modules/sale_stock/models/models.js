// Odoo 模块: sale_stock
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "security_lead": {
        "type": "float",
        "label": "security_lead"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "property_warehouse_id": {
        "type": "many2one",
        "label": "stock.warehouse"
      }
    },
    "_inherit": "res.users"
  },
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "incoterm": {
        "type": "many2one",
        "label": "incoterm"
      },
      "incoterm_location": {
        "type": "char",
        "label": "Incoterm Location"
      },
      "picking_policy": {
        "type": "selection",
        "label": "picking_policy"
      },
      "warehouse_id": {
        "type": "many2one",
        "label": "warehouse_id"
      },
      "picking_ids": {
        "type": "one2many",
        "label": "stock.picking"
      },
      "delivery_count": {
        "type": "integer",
        "label": "Delivery Orders"
      },
      "delivery_status": {
        "type": "selection",
        "label": "delivery_status"
      },
      "late_availability": {
        "type": "boolean",
        "label": "late_availability"
      },
      "stock_reference_ids": {
        "type": "many2many",
        "label": "stock_reference_ids"
      },
      "effective_date": {
        "type": "datetime",
        "label": "Effective Date"
      },
      "expected_date": {
        "type": "datetime",
        "label": "Delivery date you can promise to the customer, computed from the minimum lead time of "
      },
      "json_popover": {
        "type": "char",
        "label": "JSON data for the popover widget"
      },
      "show_json_popover": {
        "type": "boolean",
        "label": "Has late picking"
      }
    },
    "_inherit": "sale.order"
  },
  {
    "_name": "saleorderline",
    "_description": "saleorderline",
    "_auto": true,
    "_fields": {
      "qty_delivered_method": {
        "type": "selection",
        "label": "stock_move"
      },
      "route_ids": {
        "type": "many2many",
        "label": "stock.route"
      },
      "move_ids": {
        "type": "one2many",
        "label": "stock.move"
      },
      "virtual_available_at_date": {
        "type": "float",
        "label": "_compute_qty_at_date"
      },
      "scheduled_date": {
        "type": "datetime",
        "label": "_compute_qty_at_date"
      },
      "forecast_expected_date": {
        "type": "datetime",
        "label": "_compute_qty_at_date"
      },
      "free_qty_today": {
        "type": "float",
        "label": "_compute_qty_at_date"
      },
      "qty_available_today": {
        "type": "float",
        "label": "_compute_qty_at_date"
      },
      "warehouse_id": {
        "type": "many2one",
        "label": "stock.warehouse"
      },
      "qty_to_deliver": {
        "type": "float",
        "label": "_compute_qty_to_deliver"
      },
      "is_mto": {
        "type": "boolean",
        "label": "_compute_is_mto"
      },
      "display_qty_widget": {
        "type": "boolean",
        "label": "_compute_qty_to_deliver"
      },
      "is_storable": {
        "type": "boolean",
        "label": "product_id.is_storable"
      },
      "customer_lead": {
        "type": "float",
        "label": "customer_lead"
      }
    },
    "_inherit": "sale.order.line"
  },
  {
    "_name": "stockroute",
    "_description": "stockroute",
    "_auto": true,
    "_fields": {
      "sale_selectable": {
        "type": "boolean",
        "label": "Selectable on Sales Order Line"
      }
    },
    "_inherit": "stock.route"
  },
  {
    "_name": "stockmove",
    "_description": "stockmove",
    "_auto": true,
    "_fields": {
      "sale_line_id": {
        "type": "many2one",
        "label": "sale.order.line"
      }
    },
    "_inherit": "stock.move"
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "sale_id": {
        "type": "many2one",
        "label": "sale.order"
      }
    },
    "_inherit": "stock.picking"
  },
  {
    "_name": "stocklot",
    "_description": "stocklot",
    "_auto": true,
    "_fields": {
      "sale_order_ids": {
        "type": "many2many",
        "label": "sale.order"
      },
      "sale_order_count": {
        "type": "integer",
        "label": "Sale order count"
      }
    },
    "_inherit": "stock.lot"
  },
  {
    "_name": "stockreference",
    "_description": "stockreference",
    "_auto": true,
    "_fields": {
      "sale_ids": {
        "type": "many2many",
        "label": "sale_ids"
      }
    },
    "_inherit": "stock.reference"
  }
];
