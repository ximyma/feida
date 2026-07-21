// Odoo 模块: stock_delivery
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "deliverycarrier",
    "_description": "deliverycarrier",
    "_auto": true,
    "_fields": {
      "invoice_policy": {
        "type": "selection",
        "label": "invoice_policy"
      },
      "route_ids": {
        "type": "many2many",
        "label": "route_ids"
      }
    },
    "_inherit": "delivery.carrier"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "hs_code": {
        "type": "char",
        "label": "hs_code"
      },
      "country_of_origin": {
        "type": "many2one",
        "label": "country_of_origin"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "stockroute",
    "_description": "stockroute",
    "_auto": true,
    "_fields": {
      "shipping_selectable": {
        "type": "boolean",
        "label": "Applicable on Shipping Methods"
      }
    },
    "_inherit": "stock.route"
  },
  {
    "_name": "stockmove",
    "_description": "stockmove",
    "_auto": true,
    "_fields": {
      "weight": {
        "type": "float",
        "label": "_cal_move_weight"
      }
    },
    "_inherit": "stock.move"
  },
  {
    "_name": "stockmoveline",
    "_description": "stockmoveline",
    "_auto": true,
    "_fields": {
      "sale_price": {
        "type": "float",
        "label": "_compute_sale_price"
      },
      "destination_country_code": {
        "type": "char",
        "label": "picking_id.destination_country_code"
      },
      "carrier_id": {
        "type": "many2one",
        "label": "picking_id.carrier_id"
      }
    },
    "_inherit": "stock.move.line"
  },
  {
    "_name": "stockpackage",
    "_description": "stockpackage",
    "_auto": true,
    "_fields": {
      "weight": {
        "type": "float",
        "label": "_compute_weight"
      },
      "weight_uom_name": {
        "type": "char",
        "label": "Weight unit of measure label"
      },
      "weight_is_kg": {
        "type": "boolean",
        "label": "Technical field indicating whether weight uom is kg or not (i.e. lb)"
      },
      "weight_uom_rounding": {
        "type": "float",
        "label": "Technical field indicating weight"
      },
      "package_carrier_type": {
        "type": "selection",
        "label": "package_type_id.package_carrier_type"
      }
    },
    "_inherit": "stock.package"
  },
  {
    "_name": "stockpackagetype",
    "_description": "stockpackagetype",
    "_auto": true,
    "_fields": {
      "shipper_package_code": {
        "type": "char",
        "label": "Carrier Code"
      },
      "package_carrier_type": {
        "type": "selection",
        "label": "none",
        "default": "none"
      }
    },
    "_inherit": "stock.package.type"
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "carrier_price": {
        "type": "float",
        "label": "Shipping Cost"
      },
      "delivery_type": {
        "type": "selection",
        "label": "carrier_id.delivery_type"
      },
      "allowed_carrier_ids": {
        "type": "many2many",
        "label": "delivery.carrier"
      },
      "carrier_id": {
        "type": "many2one",
        "label": "delivery.carrier"
      },
      "weight": {
        "type": "float",
        "label": "_cal_weight"
      },
      "carrier_tracking_ref": {
        "type": "char",
        "label": "Tracking Reference"
      },
      "carrier_tracking_url": {
        "type": "char",
        "label": "Tracking URL"
      },
      "weight_uom_name": {
        "type": "char",
        "label": "Weight unit of measure label"
      },
      "is_return_picking": {
        "type": "boolean",
        "label": "_compute_return_picking"
      },
      "return_label_ids": {
        "type": "one2many",
        "label": "ir.attachment"
      },
      "destination_country_code": {
        "type": "char",
        "label": "partner_id.country_id.code"
      },
      "integration_level": {
        "type": "selection",
        "label": "carrier_id.integration_level"
      }
    },
    "_inherit": "stock.picking"
  }
];
