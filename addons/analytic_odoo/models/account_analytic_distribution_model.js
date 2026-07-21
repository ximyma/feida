// Auto-generated from Odoo model: account.analytic.distribution.model
// Description: Analytic Distribution Model

exports.model = {
  "_name": "account_analytic_distribution_model",
  "_description": "Analytic Distribution Model",
  "_fields": {
    "sequence": {
      "type": "integer",
      "default": 10
    },
    "partner_id": {
      "type": "many2one",
      "label": "res.partner",
      "relation": "res_partner"
    },
    "partner_category_id": {
      "type": "many2one",
      "label": "res.partner.category",
      "relation": "res_partner_category"
    },
    "company_id": {
      "type": "many2one",
      "label": "res.company",
      "relation": "res_company"
    },
    "analytic_precision": {
      "type": "integer",
      "label": "decimal.precision"
    },
    "distribution_analytic_account_ids": {
      "type": "many2many",
      "label": "account.analytic.account"
    }
  }
};
