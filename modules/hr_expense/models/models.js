// Odoo 模块: hr_expense
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hr.expense",
    "_description": "hr.expense",
    "_auto": true,
    "_fields": {
      "expense_ids": {
        "type": "one2many",
        "label": "hr.expense"
      },
      "nb_expenses": {
        "type": "integer",
        "label": "_compute_nb_expenses"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accountmoveline",
    "_description": "accountmoveline",
    "_auto": true,
    "_fields": {
      "expense_id": {
        "type": "many2one",
        "label": "hr.expense"
      }
    },
    "_inherit": "account.move.line"
  },
  {
    "_name": "accountpayment",
    "_description": "accountpayment",
    "_auto": true,
    "_fields": {
      "expense_ids": {
        "type": "one2many",
        "label": "move_id.expense_ids"
      }
    },
    "_inherit": "account.payment"
  },
  {
    "_name": "accountanalyticapplicability",
    "_description": "Analytic Plan",
    "_auto": true,
    "_fields": {
      "business_domain": {
        "type": "selection",
        "label": "business_domain"
      }
    },
    "_inherit": "account.analytic.applicability"
  },
  {
    "_name": "hrdepartment",
    "_description": "hrdepartment",
    "_auto": true,
    "_fields": {
      "expenses_to_approve_count": {
        "type": "integer",
        "label": "_compute_expenses_to_approve_count"
      }
    },
    "_inherit": "hr.department"
  },
  {
    "_name": "res.users",
    "_description": "res.users",
    "_auto": true,
    "_fields": {
      "expense_manager_id": {
        "type": "many2one",
        "label": "expense_manager_id"
      },
      "filter_for_expense": {
        "type": "boolean",
        "label": "_search_filter_for_expense"
      }
    },
    "_inherit": "hr.employee"
  },
  {
    "_name": "hremployeepublic",
    "_description": "hremployeepublic",
    "_auto": true,
    "_fields": {
      "expense_manager_id": {
        "type": "many2one",
        "label": "res.users"
      }
    },
    "_inherit": "hr.employee.public"
  },
  {
    "_name": "hremployee",
    "_description": "hremployee",
    "_auto": true,
    "_fields": {
      "filter_for_expense": {
        "type": "boolean",
        "label": "_search_filter_for_expense"
      }
    },
    "_inherit": "hr.employee.public"
  },
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "standard_price_update_warning": {
        "type": "char",
        "label": "_compute_standard_price_update_warning"
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "can_be_expensed": {
        "type": "boolean",
        "label": "Expenses"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "expense_journal_id": {
        "type": "many2one",
        "label": "expense_journal_id"
      },
      "company_expense_allowed_payment_method_line_ids": {
        "type": "many2many",
        "label": "company_expense_allowed_payment_method_line_ids"
      }
    },
    "_inherit": "res.company"
  }
];
