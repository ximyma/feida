// Odoo 模块: event_sale
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "eventevent",
    "_description": "eventevent",
    "_auto": true,
    "_fields": {
      "sale_order_lines_ids": {
        "type": "one2many",
        "label": "sale_order_lines_ids"
      },
      "sale_price_total": {
        "type": "monetary",
        "label": "sale_price_total"
      }
    },
    "_inherit": "event.event"
  },
  {
    "_name": "eventregistration",
    "_description": "eventregistration",
    "_auto": true,
    "_fields": {
      "sale_order_id": {
        "type": "many2one",
        "label": "sale.order"
      },
      "sale_order_line_id": {
        "type": "many2one",
        "label": "sale.order.line"
      },
      "state": {
        "type": "selection",
        "label": "_compute_registration_status"
      },
      "utm_campaign_id": {
        "type": "many2one",
        "label": "_compute_utm_campaign_id"
      },
      "utm_source_id": {
        "type": "many2one",
        "label": "_compute_utm_source_id"
      },
      "utm_medium_id": {
        "type": "many2one",
        "label": "_compute_utm_medium_id"
      }
    },
    "_inherit": "event.registration"
  },
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "attendee_count": {
        "type": "integer",
        "label": "Attendee Count"
      }
    },
    "_inherit": "sale.order"
  },
  {
    "_name": "saleorderline",
    "_description": "saleorderline",
    "_auto": true,
    "_fields": {
      "event_id": {
        "type": "many2one",
        "label": "event_id"
      },
      "event_slot_id": {
        "type": "many2one",
        "label": "event_slot_id"
      },
      "event_ticket_id": {
        "type": "many2one",
        "label": "event_ticket_id"
      },
      "is_multi_slots": {
        "type": "boolean",
        "label": "event_id.is_multi_slots"
      },
      "registration_ids": {
        "type": "one2many",
        "label": "event.registration"
      }
    },
    "_inherit": "sale.order.line"
  }
];
