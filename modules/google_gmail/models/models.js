// Odoo 模块: google_gmail
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "fetchmail.server",
    "_description": "fetchmail.server",
    "_auto": true,
    "_fields": {
      "server_type": {
        "type": "selection",
        "label": "gmail"
      }
    }
  },
  {
    "_name": "ir.mail_server",
    "_description": "ir.mail_server",
    "_auto": true,
    "_fields": {
      "smtp_authentication": {
        "type": "selection",
        "label": "smtp_authentication"
      }
    }
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "outgoing_mail_server_type": {
        "type": "selection",
        "label": "outgoing_mail_server_type"
      }
    },
    "_inherit": "res.users"
  }
];
