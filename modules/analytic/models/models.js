// Odoo 模块: analytic
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "account.analytic.account",
    "_description": "Analytic Account",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "code": {
        "type": "char",
        "label": "code"
      },
      "active": {
        "type": "boolean",
        "label": "active"
      },
      "plan_id": {
        "type": "many2one",
        "label": "plan_id"
      },
      "root_plan_id": {
        "type": "many2one",
        "label": "root_plan_id"
      },
      "color": {
        "type": "integer",
        "label": "color"
      },
      "line_ids": {
        "type": "one2many",
        "label": "line_ids"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "balance": {
        "type": "monetary",
        "label": "balance"
      },
      "debit": {
        "type": "monetary",
        "label": "debit"
      },
      "credit": {
        "type": "monetary",
        "label": "credit"
      },
      "currency_id": {
        "type": "many2one",
        "label": "currency_id"
      }
    }
  },
  {
    "_name": "account.analytic.distribution.model",
    "_description": "Analytic Distribution Model",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "partner_category_id": {
        "type": "many2one",
        "label": "partner_category_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      }
    }
  },
  {
    "_name": "account.analytic.line",
    "_description": "Analytic Line",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "date": {
        "type": "date",
        "label": "date"
      },
      "amount": {
        "type": "monetary",
        "label": "amount"
      },
      "unit_amount": {
        "type": "float",
        "label": "unit_amount"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "product_uom_id"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "currency_id"
      },
      "category": {
        "type": "selection",
        "label": "category"
      },
      "fiscal_year_search": {
        "type": "boolean",
        "label": "fiscal_year_search"
      },
      "analytic_distribution": {
        "type": "char",
        "label": "analytic_distribution"
      },
      "analytic_precision": {
        "type": "integer",
        "label": "analytic_precision"
      }
    }
  },
  {
    "_name": "account.analytic.plan",
    "_description": "Analytic Plans",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "description": {
        "type": "text",
        "label": "Description"
      },
      "parent_id": {
        "type": "many2one",
        "label": "parent_id"
      },
      "parent_path": {
        "type": "char",
        "label": "btree"
      },
      "root_id": {
        "type": "many2one",
        "label": "root_id"
      },
      "children_ids": {
        "type": "one2many",
        "label": "children_ids"
      },
      "children_count": {
        "type": "integer",
        "label": "children_count"
      },
      "complete_name": {
        "type": "char",
        "label": "complete_name"
      },
      "account_ids": {
        "type": "one2many",
        "label": "account_ids"
      },
      "account_count": {
        "type": "integer",
        "label": "account_count"
      },
      "all_account_count": {
        "type": "integer",
        "label": "all_account_count"
      },
      "color": {
        "type": "integer",
        "label": "color"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "default_applicability": {
        "type": "selection",
        "label": "default_applicability"
      },
      "applicability_ids": {
        "type": "one2many",
        "label": "applicability_ids"
      }
    }
  },
  {
    "_name": "account.analytic.applicability",
    "_description": "Analytic Plan",
    "_auto": true,
    "_fields": {
      "analytic_plan_id": {
        "type": "many2one",
        "label": "account.analytic.plan"
      },
      "business_domain": {
        "type": "selection",
        "label": "business_domain"
      },
      "applicability": {
        "type": "selection",
        "label": "applicability"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      }
    }
  }
];
