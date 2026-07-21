// Auto-generated from Odoo model: analytic.mixin
// Description: Analytic Mixin

exports.model = {
  "_name": "analytic_mixin",
  "_description": "Analytic Mixin",
  "_fields": {
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
