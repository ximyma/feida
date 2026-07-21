// Odoo 模块: snailmail
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "snailmail.letter",
    "_description": "snailmail.letter",
    "_auto": true,
    "_fields": {
      "snailmail_error": {
        "type": "boolean",
        "label": "snailmail_error"
      },
      "letter_ids": {
        "type": "one2many",
        "label": "snailmail.letter"
      },
      "message_type": {
        "type": "selection",
        "label": "message_type"
      }
    },
    "_inherit": "mail.message"
  },
  {
    "_name": "mailnotification",
    "_description": "mailnotification",
    "_auto": true,
    "_fields": {
      "notification_type": {
        "type": "selection",
        "label": "snail"
      },
      "letter_id": {
        "type": "many2one",
        "label": "snailmail.letter"
      },
      "failure_type": {
        "type": "selection",
        "label": "failure_type"
      }
    },
    "_inherit": "mail.notification"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "snailmail_color": {
        "type": "boolean",
        "label": "snailmail_color",
        "default": true
      },
      "snailmail_cover": {
        "type": "boolean",
        "label": "Add a Cover Page",
        "default": false
      },
      "snailmail_duplex": {
        "type": "boolean",
        "label": "Both sides",
        "default": false
      }
    },
    "_inherit": "res.company"
  }
];
