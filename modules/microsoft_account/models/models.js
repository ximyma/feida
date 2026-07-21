// Odoo 模块: microsoft_account
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "microsoft_calendar_rtoken": {
        "type": "char",
        "label": "Microsoft Refresh Token"
      },
      "microsoft_calendar_token": {
        "type": "char",
        "label": "Microsoft User token"
      },
      "microsoft_calendar_token_validity": {
        "type": "datetime",
        "label": "Microsoft Token Validity"
      }
    },
    "_inherit": "res.users"
  }
];
