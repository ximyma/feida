// Odoo 模块: website_event_booth
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "eventevent",
    "_description": "eventevent",
    "_auto": true,
    "_fields": {
      "exhibition_map": {
        "type": "text",
        "label": "Exhibition Map"
      },
      "booth_menu": {
        "type": "boolean",
        "label": "booth_menu"
      },
      "booth_menu_ids": {
        "type": "one2many",
        "label": "booth_menu_ids"
      }
    },
    "_inherit": "event.event"
  },
  {
    "_name": "eventtype",
    "_description": "eventtype",
    "_auto": true,
    "_fields": {
      "booth_menu": {
        "type": "boolean",
        "label": "booth_menu"
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
