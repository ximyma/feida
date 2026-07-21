// Odoo 模块: delivery
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "delivery.carrier",
    "_description": "Shipping Methods",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Delivery Method",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "sequence": {
        "type": "integer",
        "label": "Determine the display order"
      },
      "delivery_type": {
        "type": "selection",
        "label": "delivery_type"
      },
      "allow_cash_on_delivery": {
        "type": "boolean",
        "label": "allow_cash_on_delivery"
      },
      "integration_level": {
        "type": "selection",
        "label": "rate",
        "default": "rate_and_ship"
      },
      "prod_environment": {
        "type": "boolean",
        "label": "Environment"
      },
      "debug_logging": {
        "type": "boolean",
        "label": "Debug logging"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product",
        "required": true
      },
      "tracking_url": {
        "type": "char",
        "label": "Tracking Link"
      },
      "currency_id": {
        "type": "many2one",
        "label": "product_id.currency_id"
      },
      "invoice_policy": {
        "type": "selection",
        "label": "invoice_policy"
      },
      "country_ids": {
        "type": "many2many",
        "label": "res.country"
      },
      "state_ids": {
        "type": "many2many",
        "label": "res.country.state"
      },
      "zip_prefix_ids": {
        "type": "many2many",
        "label": "zip_prefix_ids"
      },
      "max_weight": {
        "type": "float",
        "label": "Max Weight"
      },
      "weight_uom_name": {
        "type": "char",
        "label": "Weight unit of measure label"
      },
      "max_volume": {
        "type": "float",
        "label": "Max Volume"
      },
      "volume_uom_name": {
        "type": "char",
        "label": "Volume unit of measure label"
      },
      "must_have_tag_ids": {
        "type": "many2many",
        "label": "Must Have Tags",
        "relation": "product_tag_delivery_carrier_must_have_rel"
      },
      "excluded_tag_ids": {
        "type": "many2many",
        "label": "Excluded Tags",
        "relation": "product_tag_delivery_carrier_excluded_rel"
      },
      "carrier_description": {
        "type": "text",
        "label": "carrier_description"
      },
      "margin": {
        "type": "float",
        "label": "This percentage will be added to the shipping price."
      },
      "fixed_margin": {
        "type": "float",
        "label": "This fixed amount will be added to the shipping price."
      },
      "free_over": {
        "type": "boolean",
        "label": "Free if order amount is above",
        "default": false
      },
      "amount": {
        "type": "float",
        "label": "amount"
      },
      "can_generate_return": {
        "type": "boolean",
        "label": "_compute_can_generate_return"
      },
      "return_label_on_delivery": {
        "type": "boolean",
        "label": "Generate Return Label"
      },
      "get_return_label_from_portal": {
        "type": "boolean",
        "label": "Return Label Accessible from Customer Portal"
      },
      "supports_shipping_insurance": {
        "type": "boolean",
        "label": "_compute_supports_shipping_insurance"
      },
      "shipping_insurance": {
        "type": "integer",
        "label": "shipping_insurance"
      },
      "price_rule_ids": {
        "type": "one2many",
        "label": "price_rule_ids"
      },
      "fixed_price": {
        "type": "float",
        "label": "_compute_fixed_price"
      }
    }
  },
  {
    "_name": "delivery.price.rule",
    "_description": "Delivery Price Rules",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "_compute_name"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence",
        "required": true
      },
      "carrier_id": {
        "type": "many2one",
        "label": "delivery.carrier",
        "required": true
      },
      "currency_id": {
        "type": "many2one",
        "label": "carrier_id.currency_id"
      },
      "variable": {
        "type": "selection",
        "label": "quantity",
        "required": true,
        "default": "quantity"
      },
      "operator": {
        "type": "selection",
        "label": "==",
        "required": true,
        "default": "<="
      },
      "max_value": {
        "type": "float",
        "label": "Maximum Value",
        "required": true
      },
      "list_base_price": {
        "type": "float",
        "label": "Sale Base Price",
        "required": true
      },
      "list_price": {
        "type": "float",
        "label": "Sale Price",
        "required": true
      },
      "variable_factor": {
        "type": "selection",
        "label": "variable_factor"
      }
    }
  },
  {
    "_name": "delivery.zip.prefix",
    "_description": "Delivery Zip Prefix",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Prefix",
        "required": true
      }
    }
  },
  {
    "_name": "paymentprovider",
    "_description": "paymentprovider",
    "_auto": true,
    "_fields": {
      "custom_mode": {
        "type": "selection",
        "label": "cash_on_delivery"
      }
    },
    "_inherit": "payment.provider"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "property_delivery_carrier_id": {
        "type": "many2one",
        "label": "delivery.carrier"
      },
      "is_pickup_location": {
        "type": "boolean",
        "label": "is_pickup_location"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "saleorder",
    "_description": "%s: %s",
    "_auto": true,
    "_fields": {
      "pickup_location_data": {
        "type": "char",
        "label": "pickup_location_data"
      },
      "carrier_id": {
        "type": "many2one",
        "label": "delivery.carrier"
      },
      "delivery_message": {
        "type": "char",
        "label": "delivery_message"
      },
      "delivery_set": {
        "type": "boolean",
        "label": "_compute_delivery_state"
      },
      "recompute_delivery_price": {
        "type": "boolean",
        "label": "Delivery cost should be recomputed"
      },
      "is_all_service": {
        "type": "boolean",
        "label": "Service Product"
      },
      "shipping_weight": {
        "type": "float",
        "label": "Shipping Weight"
      }
    },
    "_inherit": "sale.order"
  },
  {
    "_name": "saleorderline",
    "_description": "saleorderline",
    "_auto": true,
    "_fields": {
      "is_delivery": {
        "type": "boolean",
        "label": "Is a Delivery",
        "default": false
      },
      "product_qty": {
        "type": "float",
        "label": "product_qty"
      },
      "recompute_delivery_price": {
        "type": "boolean",
        "label": "order_id.recompute_delivery_price"
      }
    },
    "_inherit": "sale.order.line"
  }
];
