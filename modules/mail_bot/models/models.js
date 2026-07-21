// Odoo 模块: mail_bot
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "odoobot_state": {
        "type": "selection",
        "label": "odoobot_state"
      },
      "odoobot_failed": {
        "type": "boolean",
        "label": "odoobot_failed"
      }
    },
    "_inherit": "res.users"
  }
];
