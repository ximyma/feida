// Odoo 模块: event_sms
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "eventmail",
    "_description": "eventmail",
    "_auto": true,
    "_fields": {
      "notification_type": {
        "type": "selection",
        "label": "sms"
      },
      "template_ref": {
        "type": "char",
        "label": "sms.template"
      }
    },
    "_inherit": "event.mail"
  },
  {
    "_name": "eventtypemail",
    "_description": "eventtypemail",
    "_auto": true,
    "_fields": {
      "notification_type": {
        "type": "selection",
        "label": "sms"
      },
      "template_ref": {
        "type": "char",
        "label": "sms.template"
      }
    },
    "_inherit": "event.type.mail"
  }
];
