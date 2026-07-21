// Auto-generated from Odoo model: account.analytic.line
// Description: Analytic Line

exports.model = {
  "_name": "account_analytic_line",
  "_description": "Analytic Line",
  "_fields": {
    "name": {
      "type": "char",
      "label": "Description",
      "required": true
    },
    "date": {
      "type": "date",
      "label": "Date",
      "required": true,
      "index": true
    },
    "amount": {
      "type": "float",
      "label": "Amount",
      "required": true
    },
    "unit_amount": {
      "type": "float",
      "label": "Quantity"
    },
    "product_uom_id": {
      "type": "many2one",
      "label": "uom.uom",
      "relation": "uom_uom"
    },
    "partner_id": {
      "type": "many2one",
      "label": "res.partner",
      "relation": "res_partner"
    },
    "user_id": {
      "type": "many2one",
      "label": "res.users",
      "index": true,
      "relation": "res_users"
    },
    "company_id": {
      "type": "many2one",
      "label": "res.company",
      "required": true,
      "relation": "res_company"
    },
    "currency_id": {
      "type": "many2one",
      "label": "company_id.currency_id",
      "relation": "company_id_currency_id"
    },
    "category": {
      "type": "selection",
      "label": "other",
      "default": "other"
    },
    "fiscal_year_search": {
      "type": "boolean",
      "label": "_search_fiscal_date"
    },
    "analytic_precision": {
      "type": "integer",
      "label": "decimal.precision"
    },
    "account_id": {
      "type": "many2one",
      "label": "account.analytic.account",
      "index": true,
      "relation": "account_analytic_account"
    },
    "auto_account_id": {
      "type": "many2one",
      "label": "account.analytic.account",
      "relation": "account_analytic_account"
    }
  }
};
