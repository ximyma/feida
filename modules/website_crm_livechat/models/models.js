// Odoo 模块: website_crm_livechat
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "crmlead",
    "_description": "crmlead",
    "_auto": true,
    "_fields": {
      "visitor_sessions_count": {
        "type": "integer",
        "label": "# Sessions"
      }
    },
    "_inherit": "crm.lead"
  }
];
