// Odoo 模块: website_event_exhibitor
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "eventevent",
    "_description": "eventevent",
    "_auto": true,
    "_fields": {
      "sponsor_ids": {
        "type": "one2many",
        "label": "event.sponsor"
      },
      "sponsor_count": {
        "type": "integer",
        "label": "Sponsor Count"
      },
      "exhibitor_menu": {
        "type": "boolean",
        "label": "exhibitor_menu"
      },
      "exhibitor_menu_ids": {
        "type": "one2many",
        "label": "exhibitor_menu_ids"
      }
    },
    "_inherit": "event.event"
  },
  {
    "_name": "event.sponsor",
    "_description": "Event Sponsor",
    "_auto": true,
    "_fields": {
      "event_id": {
        "type": "many2one",
        "label": "event.event",
        "required": true
      },
      "sponsor_type_id": {
        "type": "many2one",
        "label": "sponsor_type_id"
      },
      "url": {
        "type": "char",
        "label": "Sponsor Website"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "subtitle": {
        "type": "char",
        "label": "Slogan"
      },
      "exhibitor_type": {
        "type": "selection",
        "label": "exhibitor_type"
      },
      "website_description": {
        "type": "html",
        "label": "website_description"
      },
      "show_on_ticket": {
        "type": "boolean",
        "label": "Show on ticket",
        "default": true
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner",
        "required": true
      },
      "partner_name": {
        "type": "char",
        "label": "Name"
      },
      "partner_email": {
        "type": "char",
        "label": "Email"
      },
      "partner_phone": {
        "type": "char",
        "label": "Phone"
      },
      "name": {
        "type": "char",
        "label": "Sponsor Name"
      },
      "email": {
        "type": "char",
        "label": "Sponsor Email"
      },
      "phone": {
        "type": "char",
        "label": "Sponsor Phone"
      },
      "image_512": {
        "type": "text",
        "label": "image_512"
      },
      "image_256": {
        "type": "text",
        "label": "Image 256"
      },
      "image_128": {
        "type": "text",
        "label": "Image 128"
      },
      "website_image_url": {
        "type": "char",
        "label": "website_image_url"
      },
      "hour_from": {
        "type": "float",
        "label": "Opening hour"
      },
      "hour_to": {
        "type": "float",
        "label": "End hour"
      },
      "event_date_tz": {
        "type": "selection",
        "label": "Timezone"
      },
      "is_in_opening_hours": {
        "type": "boolean",
        "label": "is_in_opening_hours"
      },
      "country_id": {
        "type": "many2one",
        "label": "country_id"
      },
      "country_flag_url": {
        "type": "char",
        "label": "country_flag_url"
      }
    }
  },
  {
    "_name": "event.sponsor.type",
    "_description": "Event Sponsor Level",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Sponsor Level",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "display_ribbon_style": {
        "type": "selection",
        "label": "display_ribbon_style"
      }
    }
  },
  {
    "_name": "eventtype",
    "_description": "eventtype",
    "_auto": true,
    "_fields": {
      "exhibitor_menu": {
        "type": "boolean",
        "label": "exhibitor_menu"
      }
    },
    "_inherit": "event.type"
  },
  {
    "_name": "websiteeventmenu",
    "_description": "websiteeventmenu",
    "_auto": true,
    "_fields": {
      "menu_type": {
        "type": "selection",
        "label": "menu_type"
      }
    },
    "_inherit": "website.event.menu"
  }
];
