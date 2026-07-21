// Odoo 模块: app_common
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "ircron",
    "_description": "ircron",
    "_auto": true,
    "_fields": {
      "trigger_user_id": {
        "type": "many2one",
        "label": "res.users"
      }
    },
    "_inherit": "ir.cron"
  }
];
