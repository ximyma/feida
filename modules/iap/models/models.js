// Odoo 模块: iap
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "iap.account",
    "_description": "IAP Account",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "service_id": {
        "type": "many2one",
        "label": "iap.service",
        "required": true
      },
      "service_name": {
        "type": "char",
        "label": "service_id.technical_name"
      },
      "service_locked": {
        "type": "boolean",
        "label": "service_locked",
        "default": false
      },
      "description": {
        "type": "char",
        "label": "service_id.description"
      },
      "account_token": {
        "type": "char",
        "label": "account_token"
      },
      "company_ids": {
        "type": "many2many",
        "label": "res.company"
      },
      "balance": {
        "type": "char",
        "label": "balance"
      },
      "warning_threshold": {
        "type": "float",
        "label": "Email Alert Threshold"
      },
      "warning_user_ids": {
        "type": "many2many",
        "label": "res.users"
      },
      "state": {
        "type": "selection",
        "label": "banned"
      }
    }
  },
  {
    "_name": "iap.service",
    "_description": "IAP Service",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "technical_name": {
        "type": "char",
        "label": "technical_name",
        "required": true
      },
      "description": {
        "type": "char",
        "label": "description",
        "required": true
      },
      "unit_name": {
        "type": "char",
        "label": "unit_name",
        "required": true
      },
      "integer_balance": {
        "type": "boolean",
        "label": "integer_balance",
        "required": true
      }
    }
  }
];
