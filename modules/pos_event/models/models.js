// Odoo 模块: pos_event
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "event.event",
    "_description": "event.event",
    "_auto": true,
    "_fields": {
      "image_1024": {
        "type": "text",
        "label": "PoS Image"
      }
    }
  },
  {
    "_name": "event.registration",
    "_description": "event.registration",
    "_auto": true,
    "_fields": {
      "pos_order_id": {
        "type": "many2one",
        "label": "pos_order_line_id.order_id"
      },
      "pos_order_line_id": {
        "type": "many2one",
        "label": "pos.order.line"
      }
    }
  },
  {
    "_name": "posorder",
    "_description": "posorder",
    "_auto": true,
    "_fields": {
      "attendee_count": {
        "type": "integer",
        "label": "Attendee Count"
      }
    },
    "_inherit": "pos.order"
  },
  {
    "_name": "posorderline",
    "_description": "posorderline",
    "_auto": true,
    "_fields": {
      "event_ticket_id": {
        "type": "many2one",
        "label": "event.event.ticket"
      },
      "event_registration_ids": {
        "type": "one2many",
        "label": "event.registration"
      }
    },
    "_inherit": "pos.order.line"
  }
];
