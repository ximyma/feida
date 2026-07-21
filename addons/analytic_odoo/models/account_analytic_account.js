// Auto-generated from Odoo model: account.analytic.account
// Description: Analytic Account

exports.model = {
  "_name": "account_analytic_account",
  "_description": "Analytic Account",
  "_fields": {
    "name": {
      "type": "char",
      "label": "Analytic Account",
      "required": true
    },
    "code": {
      "type": "char",
      "label": "Reference"
    },
    "active": {
      "type": "boolean",
      "label": "Active",
      "default": true
    },
    "plan_id": {
      "type": "many2one",
      "label": "account.analytic.plan",
      "required": true,
      "index": true,
      "relation": "account_analytic_plan"
    },
    "root_plan_id": {
      "type": "many2one",
      "label": "account.analytic.plan",
      "relation": "account_analytic_plan"
    },
    "color": {
      "type": "integer",
      "label": "Color Index"
    },
    "line_ids": {
      "type": "one2many",
      "label": "account.analytic.line"
    },
    "company_id": {
      "type": "many2one",
      "label": "res.company",
      "relation": "res_company"
    },
    "partner_id": {
      "type": "many2one",
      "label": "res.partner",
      "relation": "res_partner"
    },
    "balance": {
      "type": "float",
      "label": "_compute_debit_credit_balance"
    },
    "debit": {
      "type": "float",
      "label": "_compute_debit_credit_balance"
    },
    "credit": {
      "type": "float",
      "label": "_compute_debit_credit_balance"
    },
    "currency_id": {
      "type": "many2one",
      "label": "company_id.currency_id",
      "relation": "company_id_currency_id"
    }
  }
};
