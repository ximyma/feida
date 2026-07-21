// Odoo 模块: pos_hr
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountbankstatementline",
    "_description": "accountbankstatementline",
    "_auto": true,
    "_fields": {
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee"
      }
    },
    "_inherit": "account.bank.statement.line"
  },
  {
    "_name": "pos.config",
    "_description": "pos.config",
    "_auto": true,
    "_fields": {
      "minimal_employee_ids": {
        "type": "many2many",
        "label": "minimal_employee_ids"
      },
      "basic_employee_ids": {
        "type": "many2many",
        "label": "basic_employee_ids"
      },
      "advanced_employee_ids": {
        "type": "many2many",
        "label": "advanced_employee_ids"
      }
    }
  },
  {
    "_name": "posorder",
    "_description": "posorder",
    "_auto": true,
    "_fields": {
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "cashier": {
        "type": "char",
        "label": "Cashier name"
      }
    },
    "_inherit": "pos.order"
  },
  {
    "_name": "pospayment",
    "_description": "pospayment",
    "_auto": true,
    "_fields": {
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee"
      }
    },
    "_inherit": "pos.payment"
  },
  {
    "_name": "possession",
    "_description": "possession",
    "_auto": true,
    "_fields": {
      "employee_id": {
        "type": "many2one",
        "label": "employee_id"
      }
    },
    "_inherit": "pos.session"
  }
];
