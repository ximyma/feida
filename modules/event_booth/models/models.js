// Odoo 模块: event_booth
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "event.booth",
    "_description": "Event Booth",
    "_auto": true,
    "_fields": {
      "event_type_id": {
        "type": "many2one",
        "label": "set null"
      },
      "event_id": {
        "type": "many2one",
        "label": "event.event",
        "required": true
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "contact_name": {
        "type": "char",
        "label": "Renter Name"
      },
      "contact_email": {
        "type": "char",
        "label": "Renter Email"
      },
      "contact_phone": {
        "type": "char",
        "label": "Renter Phone"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "is_available": {
        "type": "boolean",
        "label": "_compute_is_available"
      }
    }
  },
  {
    "_name": "event.booth.category",
    "_description": "Event Booth Category",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "description": {
        "type": "html",
        "label": "Description"
      },
      "booth_ids": {
        "type": "one2many",
        "label": "booth_ids"
      }
    }
  },
  {
    "_name": "eventevent",
    "_description": "eventevent",
    "_auto": true,
    "_fields": {
      "event_booth_ids": {
        "type": "one2many",
        "label": "event_booth_ids"
      },
      "event_booth_count": {
        "type": "integer",
        "label": "event_booth_count"
      },
      "event_booth_count_available": {
        "type": "integer",
        "label": "event_booth_count_available"
      },
      "event_booth_category_ids": {
        "type": "many2many",
        "label": "event_booth_category_ids"
      },
      "event_booth_category_available_ids": {
        "type": "many2many",
        "label": "event_booth_category_available_ids"
      }
    },
    "_inherit": "event.event"
  },
  {
    "_name": "eventtype",
    "_description": "eventtype",
    "_auto": true,
    "_fields": {
      "event_type_booth_ids": {
        "type": "one2many",
        "label": "event_type_booth_ids"
      }
    },
    "_inherit": "event.type"
  },
  {
    "_name": "event.type.booth",
    "_description": "Event Booth Template",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "event_type_id": {
        "type": "many2one",
        "label": "event_type_id"
      },
      "booth_category_id": {
        "type": "many2one",
        "label": "booth_category_id"
      }
    }
  }
];
