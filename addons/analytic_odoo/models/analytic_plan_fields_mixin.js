// Auto-generated from Odoo model: analytic.plan.fields.mixin
// Description: Analytic Plan Fields

exports.model = {
  "_name": "analytic_plan_fields_mixin",
  "_description": "Analytic Plan Fields",
  "_fields": {
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
