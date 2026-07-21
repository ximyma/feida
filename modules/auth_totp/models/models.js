// Odoo 模块: auth_totp
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "totp_secret": {
        "type": "char",
        "label": "_compute_totp_secret"
      },
      "totp_last_counter": {
        "type": "integer",
        "label": "totp_last_counter"
      },
      "totp_enabled": {
        "type": "boolean",
        "label": "Two-factor authentication"
      },
      "totp_trusted_device_ids": {
        "type": "one2many",
        "label": "auth_totp.device"
      }
    },
    "_inherit": "res.users"
  }
];
