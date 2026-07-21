// Odoo 模块: purchase_stock
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "purchase_order_line_ids": {
        "type": "one2many",
        "label": "purchase.order.line"
      },
      "monthly_demand": {
        "type": "float",
        "label": "_compute_monthly_demand"
      },
      "suggested_qty": {
        "type": "integer",
        "label": "_compute_suggested_quantity"
      },
      "suggest_estimated_price": {
        "type": "float",
        "label": "_compute_suggest_estimated_price"
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "productsupplierinfo",
    "_description": "productsupplierinfo",
    "_auto": true,
    "_fields": {
      "last_purchase_date": {
        "type": "date",
        "label": "Last Purchase"
      },
      "show_set_supplier_button": {
        "type": "boolean",
        "label": "show_set_supplier_button"
      }
    },
    "_inherit": "product.supplierinfo"
  },
  {
    "_name": "purchaseorder",
    "_description": "purchaseorder",
    "_auto": true,
    "_fields": {
      "incoterm_location": {
        "type": "char",
        "label": "Incoterm Location"
      },
      "incoming_picking_count": {
        "type": "integer",
        "label": "Incoming Shipment count"
      },
      "picking_ids": {
        "type": "many2many",
        "label": "stock.picking"
      },
      "dest_address_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "picking_type_id": {
        "type": "many2one",
        "label": "stock.picking.type",
        "required": true
      },
      "default_location_dest_id_usage": {
        "type": "selection",
        "label": "picking_type_id.default_location_dest_id.usage"
      },
      "reference_ids": {
        "type": "many2many",
        "label": "reference_ids"
      },
      "is_shipped": {
        "type": "boolean",
        "label": "_compute_is_shipped"
      },
      "effective_date": {
        "type": "datetime",
        "label": "Arrival"
      },
      "on_time_rate": {
        "type": "float",
        "label": "partner_id.on_time_rate"
      },
      "receipt_status": {
        "type": "selection",
        "label": "receipt_status"
      }
    },
    "_inherit": "purchase.order"
  },
  {
    "_name": "purchaseorderline",
    "_description": "purchaseorderline",
    "_auto": true,
    "_fields": {
      "qty_received_method": {
        "type": "selection",
        "label": "stock_moves"
      },
      "move_ids": {
        "type": "one2many",
        "label": "stock.move"
      },
      "orderpoint_id": {
        "type": "many2one",
        "label": "stock.warehouse.orderpoint"
      },
      "move_dest_ids": {
        "type": "many2many",
        "label": "stock.move"
      },
      "product_description_variants": {
        "type": "char",
        "label": "Custom Description"
      },
      "propagate_cancel": {
        "type": "boolean",
        "label": "Propagate cancellation",
        "default": true
      },
      "forecasted_issue": {
        "type": "boolean",
        "label": "_compute_forecasted_issue"
      },
      "is_storable": {
        "type": "boolean",
        "label": "product_id.is_storable"
      },
      "location_final_id": {
        "type": "many2one",
        "label": "stock.location"
      }
    },
    "_inherit": "purchase.order.line"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "days_to_purchase": {
        "type": "float",
        "label": "days_to_purchase"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "purchase_line_ids": {
        "type": "one2many",
        "label": "purchase.order.line"
      },
      "on_time_rate": {
        "type": "float",
        "label": "on_time_rate"
      },
      "suggest_based_on": {
        "type": "char",
        "label": "30_days",
        "default": "30_days"
      },
      "suggest_days": {
        "type": "integer",
        "label": "suggest_days"
      },
      "suggest_percent": {
        "type": "integer",
        "label": "suggest_percent"
      },
      "group_rfq": {
        "type": "selection",
        "label": "group_rfq"
      },
      "group_on": {
        "type": "selection",
        "label": "group_on"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "purchase_id": {
        "type": "many2one",
        "label": "purchase_id"
      },
      "days_to_arrive": {
        "type": "datetime",
        "label": "_compute_effective_date"
      },
      "delay_pass": {
        "type": "datetime",
        "label": "_compute_date_order"
      }
    },
    "_inherit": "stock.picking"
  },
  {
    "_name": "stockwarehouse",
    "_description": "stockwarehouse",
    "_auto": true,
    "_fields": {
      "buy_to_resupply": {
        "type": "boolean",
        "label": "buy_to_resupply"
      },
      "buy_pull_id": {
        "type": "many2one",
        "label": "stock.rule"
      }
    },
    "_inherit": "stock.warehouse"
  },
  {
    "_name": "stockwarehouseorderpoint",
    "_description": "stockwarehouseorderpoint",
    "_auto": true,
    "_fields": {
      "show_supplier": {
        "type": "boolean",
        "label": "Show supplier column"
      },
      "supplier_id": {
        "type": "many2one",
        "label": "supplier_id"
      },
      "supplier_id_placeholder": {
        "type": "char",
        "label": "_compute_supplier_id_placeholder"
      },
      "vendor_ids": {
        "type": "one2many",
        "label": "product_id.seller_ids"
      },
      "effective_vendor_id": {
        "type": "many2one",
        "label": "effective_vendor_id"
      },
      "available_vendor": {
        "type": "many2one",
        "label": "res.partner"
      }
    },
    "_inherit": "stock.warehouse.orderpoint"
  },
  {
    "_name": "stocklot",
    "_description": "stocklot",
    "_auto": true,
    "_fields": {
      "purchase_order_ids": {
        "type": "many2many",
        "label": "purchase.order"
      },
      "purchase_order_count": {
        "type": "integer",
        "label": "Purchase order count"
      }
    },
    "_inherit": "stock.lot"
  },
  {
    "_name": "stockmove",
    "_description": "stockmove",
    "_auto": true,
    "_fields": {
      "purchase_line_id": {
        "type": "many2one",
        "label": "purchase_line_id"
      },
      "created_purchase_line_ids": {
        "type": "many2many",
        "label": "created_purchase_line_ids"
      }
    },
    "_inherit": "stock.move"
  },
  {
    "_name": "stockreference",
    "_description": "stockreference",
    "_auto": true,
    "_fields": {
      "purchase_ids": {
        "type": "many2many",
        "label": "purchase_ids"
      }
    },
    "_inherit": "stock.reference"
  },
  {
    "_name": "stockrule",
    "_description": "stockrule",
    "_auto": true,
    "_fields": {
      "action": {
        "type": "selection",
        "label": "action"
      }
    },
    "_inherit": "stock.rule"
  }
];
