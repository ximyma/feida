// Odoo 模块: product_expiry
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "stocklot",
    "_description": "stocklot",
    "_auto": true,
    "_fields": {
      "use_expiration_date": {
        "type": "boolean",
        "label": "use_expiration_date"
      },
      "expiration_date": {
        "type": "datetime",
        "label": "expiration_date"
      },
      "use_date": {
        "type": "datetime",
        "label": "Best before Date"
      },
      "removal_date": {
        "type": "datetime",
        "label": "Removal Date"
      },
      "alert_date": {
        "type": "datetime",
        "label": "Alert Date"
      },
      "product_expiry_alert": {
        "type": "boolean",
        "label": "_compute_product_expiry_alert"
      },
      "product_expiry_reminded": {
        "type": "boolean",
        "label": "Expiry has been reminded"
      }
    },
    "_inherit": "stock.lot"
  },
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "free_qty": {
        "type": "float",
        "label": "Available quantity (computed as Quantity On Hand "
      },
      "virtual_available": {
        "type": "float",
        "label": "Forecast quantity (computed as Quantity On Hand "
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "use_expiration_date": {
        "type": "boolean",
        "label": "Use Expiration Date"
      },
      "expiration_time": {
        "type": "integer",
        "label": "Expiration Date"
      },
      "use_time": {
        "type": "integer",
        "label": "Best Before Date"
      },
      "removal_time": {
        "type": "integer",
        "label": "Removal Date"
      },
      "alert_time": {
        "type": "integer",
        "label": "Alert Date"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "stockmove",
    "_description": "stockmove",
    "_auto": true,
    "_fields": {
      "use_expiration_date": {
        "type": "boolean",
        "label": "use_expiration_date"
      }
    },
    "_inherit": "stock.move"
  },
  {
    "_name": "stockmoveline",
    "_description": "stockmoveline",
    "_auto": true,
    "_fields": {
      "expiration_date": {
        "type": "datetime",
        "label": "expiration_date"
      },
      "removal_date": {
        "type": "datetime",
        "label": "Removal Date"
      },
      "is_expired": {
        "type": "boolean",
        "label": "lot_id.product_expiry_alert"
      },
      "use_expiration_date": {
        "type": "boolean",
        "label": "use_expiration_date"
      }
    },
    "_inherit": "stock.move.line"
  },
  {
    "_name": "stockquant",
    "_description": "stockquant",
    "_auto": true,
    "_fields": {
      "expiration_date": {
        "type": "datetime",
        "label": "lot_id.expiration_date"
      },
      "removal_date": {
        "type": "datetime",
        "label": "lot_id.removal_date"
      },
      "use_expiration_date": {
        "type": "boolean",
        "label": "product_id.use_expiration_date"
      },
      "available_quantity": {
        "type": "float",
        "label": "On hand quantity which hasn"
      }
    },
    "_inherit": "stock.quant"
  }
];
