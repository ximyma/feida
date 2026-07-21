// Auto-generated from Odoo model: account.analytic.applicability
// Description: Analytic Plan

exports.model = {
  "_name": "account_analytic_applicability",
  "_description": "Analytic Plan",
  "_fields": {
    "analytic_plan_id": {
      "type": "many2one",
      "label": "account.analytic.plan",
      "relation": "account_analytic_plan"
    },
    "business_domain": {
      "type": "selection",
      "label": "general",
      "required": true,
      "selection": [
        {
          "label": "Miscellaneous",
          "value": "general"
        }
      ]
    },
    "applicability": {
      "type": "selection",
      "label": "optional",
      "required": true
    },
    "company_id": {
      "type": "many2one",
      "label": "res.company",
      "relation": "res_company"
    }
  }
};
