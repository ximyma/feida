// Odoo 模块: iap_mail
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "iap.account",
    "_description": "iap.account",
    "_auto": true,
    "_fields": {
      "company_ids": {
        "type": "many2many",
        "label": "res.company"
      },
      "warning_threshold": {
        "type": "float",
        "label": "Email Alert Threshold"
      },
      "warning_user_ids": {
        "type": "many2many",
        "label": "res.users"
      }
    }
  }
];
