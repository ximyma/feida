// Odoo 模块: phone_validation
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "phone.blacklist",
    "_description": "Phone Blacklist",
    "_auto": true,
    "_fields": {
      "number": {
        "type": "char",
        "label": "Phone Number",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      }
    }
  }
];
