// Odoo 模块: auth_passkey
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "auth.passkey.key",
    "_description": "Passkey",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "credential_identifier": {
        "type": "char",
        "label": "base.group_system",
        "required": true
      },
      "public_key": {
        "type": "char",
        "label": "base.group_system",
        "required": true
      },
      "sign_count": {
        "type": "integer",
        "label": "base.group_system"
      },
      "create_uid": {
        "type": "many2one",
        "label": "res.users"
      }
    }
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "auth_passkey_key_ids": {
        "type": "one2many",
        "label": "auth.passkey.key"
      }
    },
    "_inherit": "res.users"
  }
];
