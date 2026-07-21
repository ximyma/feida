// Odoo 模块: website_livechat
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "discusschannel",
    "_description": "discusschannel",
    "_auto": true,
    "_fields": {
      "is_pending_chat_request": {
        "type": "boolean",
        "label": "is_pending_chat_request"
      },
      "livechat_visitor_id": {
        "type": "many2one",
        "label": "website.visitor"
      }
    },
    "_inherit": "discuss.channel"
  },
  {
    "_name": "website",
    "_description": "website",
    "_auto": true,
    "_fields": {
      "channel_id": {
        "type": "many2one",
        "label": "im_livechat.channel"
      }
    },
    "_inherit": "website"
  },
  {
    "_name": "Visitor #%d (%s)",
    "_description": "Visitor #%d (%s)",
    "_auto": true,
    "_fields": {
      "livechat_operator_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "livechat_operator_name": {
        "type": "char",
        "label": "Operator Name"
      },
      "discuss_channel_ids": {
        "type": "one2many",
        "label": "discuss.channel"
      },
      "session_count": {
        "type": "integer",
        "label": "# Sessions"
      }
    },
    "_inherit": "website.visitor"
  }
];
