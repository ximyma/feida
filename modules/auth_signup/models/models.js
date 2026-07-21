// Odoo 模块: auth_signup
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "signup_type": {
        "type": "char",
        "label": "Signup Token Type"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "state": {
        "type": "selection",
        "label": "_compute_state"
      }
    },
    "_inherit": "res.users"
  }
];
