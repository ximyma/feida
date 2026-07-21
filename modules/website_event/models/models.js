// Odoo 模块: website_event
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "event.event",
    "_description": "event.event",
    "_auto": true,
    "_fields": {
      "subtitle": {
        "type": "char",
        "label": "Event Subtitle"
      },
      "is_participating": {
        "type": "boolean",
        "label": "Is Participating"
      },
      "is_visible_on_website": {
        "type": "boolean",
        "label": "Visible On Website"
      },
      "event_register_url": {
        "type": "char",
        "label": "Event Registration Link"
      },
      "website_visibility": {
        "type": "selection",
        "label": "website_visibility"
      },
      "website_published": {
        "type": "boolean",
        "label": "website_published"
      },
      "website_menu": {
        "type": "boolean",
        "label": "website_menu"
      },
      "menu_id": {
        "type": "many2one",
        "label": "website.menu"
      },
      "introduction_menu": {
        "type": "boolean",
        "label": "introduction_menu"
      },
      "introduction_menu_ids": {
        "type": "one2many",
        "label": "introduction_menu_ids"
      },
      "address_name": {
        "type": "char",
        "label": "address_id.name"
      },
      "register_menu": {
        "type": "boolean",
        "label": "register_menu"
      },
      "register_menu_ids": {
        "type": "one2many",
        "label": "register_menu_ids"
      },
      "community_menu": {
        "type": "boolean",
        "label": "community_menu"
      },
      "community_menu_ids": {
        "type": "one2many",
        "label": "community_menu_ids"
      },
      "other_menu_ids": {
        "type": "one2many",
        "label": "other_menu_ids"
      },
      "is_ongoing": {
        "type": "boolean",
        "label": "is_ongoing"
      },
      "is_done": {
        "type": "boolean",
        "label": "is_done"
      },
      "start_today": {
        "type": "boolean",
        "label": "start_today"
      },
      "start_remaining": {
        "type": "integer",
        "label": "start_remaining"
      }
    }
  },
  {
    "_name": "eventregistration",
    "_description": "eventregistration",
    "_auto": true,
    "_fields": {
      "visitor_id": {
        "type": "many2one",
        "label": "website.visitor"
      }
    },
    "_inherit": "event.registration"
  },
  {
    "_name": "eventtype",
    "_description": "eventtype",
    "_auto": true,
    "_fields": {
      "website_menu": {
        "type": "boolean",
        "label": "Display a dedicated menu on Website"
      },
      "community_menu": {
        "type": "boolean",
        "label": "community_menu"
      }
    },
    "_inherit": "event.type"
  },
  {
    "_name": "website.event.menu",
    "_description": "Website Event Menu",
    "_auto": true,
    "_fields": {
      "menu_id": {
        "type": "many2one",
        "label": "website.menu"
      },
      "event_id": {
        "type": "many2one",
        "label": "event.event"
      },
      "view_id": {
        "type": "many2one",
        "label": "ir.ui.view"
      },
      "menu_type": {
        "type": "selection",
        "label": "menu_type"
      }
    },
    "_inherit": "website.seo.metadata"
  },
  {
    "_name": "websitevisitor",
    "_description": "websitevisitor",
    "_auto": true,
    "_fields": {
      "event_registration_ids": {
        "type": "one2many",
        "label": "event_registration_ids"
      },
      "event_registration_count": {
        "type": "integer",
        "label": "event_registration_count"
      },
      "event_registered_ids": {
        "type": "many2many",
        "label": "event_registered_ids"
      }
    },
    "_inherit": "website.visitor"
  }
];
