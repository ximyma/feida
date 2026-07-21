// Odoo 模块: app_saas
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "authoauthprovider",
    "_description": "authoauthprovider",
    "_auto": true,
    "_fields": {
      "code_endpoint": {
        "type": "char",
        "label": "Token by Code Endpoint"
      },
      "user_template_id": {
        "type": "many2one",
        "label": "res.users"
      }
    },
    "_inherit": "auth.oauth.provider"
  }
];
