// Odoo 模块: event_product
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "eventevent",
    "_description": "eventevent",
    "_auto": true,
    "_fields": {
      "currency_id": {
        "type": "many2one",
        "label": "currency_id"
      }
    },
    "_inherit": "event.event"
  },
  {
    "_name": "eventeventticket",
    "_description": "eventeventticket",
    "_auto": true,
    "_fields": {
      "price_reduce_taxinc": {
        "type": "float",
        "label": "price_reduce_taxinc"
      },
      "price_incl": {
        "type": "float",
        "label": "price_incl"
      }
    },
    "_inherit": "event.event.ticket"
  },
  {
    "_name": "eventregistration",
    "_description": "eventregistration",
    "_auto": true,
    "_fields": {
      "sale_status": {
        "type": "selection",
        "label": "Sale Status"
      }
    },
    "_inherit": "event.registration"
  },
  {
    "_name": "eventtypeticket",
    "_description": "eventtypeticket",
    "_auto": true,
    "_fields": {
      "description": {
        "type": "text",
        "label": "_compute_description"
      },
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "product_id.currency_id"
      },
      "price": {
        "type": "float",
        "label": "price"
      },
      "price_reduce": {
        "type": "float",
        "label": "price_reduce"
      }
    },
    "_inherit": "event.type.ticket"
  },
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "event_ticket_ids": {
        "type": "one2many",
        "label": "event.event.ticket"
      }
    },
    "_inherit": "product.product"
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
  }
];
