// Odoo 模块: event_booth_sale
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "eventbooth",
    "_description": "eventbooth",
    "_auto": true,
    "_fields": {
      "event_booth_registration_ids": {
        "type": "one2many",
        "label": "event.booth.registration"
      },
      "sale_order_line_registration_ids": {
        "type": "many2many",
        "label": "sale_order_line_registration_ids"
      },
      "sale_order_line_id": {
        "type": "many2one",
        "label": "sale_order_line_id"
      },
      "sale_order_id": {
        "type": "many2one",
        "label": "sale_order_id"
      },
      "is_paid": {
        "type": "boolean",
        "label": "Is Paid"
      }
    },
    "_inherit": "event.booth"
  },
  {
    "_name": "eventboothcategory",
    "_description": "eventboothcategory",
    "_auto": true,
    "_fields": {
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "price": {
        "type": "float",
        "label": "price"
      },
      "price_incl": {
        "type": "float",
        "label": "price_incl"
      },
      "currency_id": {
        "type": "many2one",
        "label": "product_id.currency_id"
      },
      "price_reduce": {
        "type": "float",
        "label": "price_reduce"
      },
      "price_reduce_taxinc": {
        "type": "float",
        "label": "price_reduce_taxinc"
      },
      "image_1920": {
        "type": "text",
        "label": "_compute_image_1920"
      }
    },
    "_inherit": "event.booth.category"
  },
  {
    "_name": "event.booth.registration",
    "_description": "Event Booth Registration",
    "_auto": true,
    "_fields": {
      "sale_order_line_id": {
        "type": "many2one",
        "label": "sale.order.line",
        "required": true
      },
      "event_booth_id": {
        "type": "many2one",
        "label": "event.booth",
        "required": true
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "contact_name": {
        "type": "char",
        "label": "Contact Name"
      },
      "contact_email": {
        "type": "char",
        "label": "Contact Email"
      },
      "contact_phone": {
        "type": "char",
        "label": "Contact Phone"
      }
    }
  },
  {
    "_name": "eventtypebooth",
    "_description": "eventtypebooth",
    "_auto": true,
    "_fields": {
      "product_id": {
        "type": "many2one",
        "label": "booth_category_id.product_id"
      },
      "price": {
        "type": "float",
        "label": "booth_category_id.price"
      },
      "currency_id": {
        "type": "many2one",
        "label": "booth_category_id.currency_id"
      }
    },
    "_inherit": "event.type.booth"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "service_tracking": {
        "type": "selection",
        "label": "service_tracking"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "event_booth_ids": {
        "type": "one2many",
        "label": "event.booth"
      },
      "event_booth_count": {
        "type": "integer",
        "label": "Booth Count"
      }
    },
    "_inherit": "sale.order"
  },
  {
    "_name": "saleorderline",
    "_description": "saleorderline",
    "_auto": true,
    "_fields": {
      "event_booth_category_id": {
        "type": "many2one",
        "label": "event.booth.category"
      },
      "event_booth_pending_ids": {
        "type": "many2many",
        "label": "event_booth_pending_ids"
      },
      "event_booth_registration_ids": {
        "type": "one2many",
        "label": "event_booth_registration_ids"
      },
      "event_booth_ids": {
        "type": "one2many",
        "label": "event.booth"
      }
    },
    "_inherit": "sale.order.line"
  }
];
