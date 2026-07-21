// Auto-generated from Odoo model: account.analytic.plan
// Description: Analytic Plans

exports.model = {
  "_name": "account_analytic_plan",
  "_description": "Analytic Plans",
  "_fields": {
    "name": {
      "type": "char",
      "label": "_inverse_name",
      "required": true
    },
    "description": {
      "type": "text",
      "label": "Description"
    },
    "parent_id": {
      "type": "many2one",
      "label": "account.analytic.plan",
      "relation": "account_analytic_plan"
    },
    "parent_path": {
      "type": "char",
      "label": "btree"
    },
    "root_id": {
      "type": "many2one",
      "label": "account.analytic.plan",
      "relation": "account_analytic_plan"
    },
    "children_ids": {
      "type": "one2many",
      "label": "account.analytic.plan"
    },
    "children_count": {
      "type": "integer",
      "label": "Children Plans Count"
    },
    "complete_name": {
      "type": "char",
      "label": "Complete Name"
    },
    "account_ids": {
      "type": "one2many",
      "label": "account.analytic.account"
    },
    "account_count": {
      "type": "integer",
      "label": "Analytic Accounts Count"
    },
    "all_account_count": {
      "type": "integer",
      "label": "All Analytic Accounts Count"
    },
    "color": {
      "type": "integer",
      "label": "Color"
    },
    "sequence": {
      "type": "integer",
      "default": 10
    },
    "default_applicability": {
      "type": "selection",
      "label": "optional",
      "selection": [
        {
          "label": "Optional",
          "value": "optional"
        },
        {
          "label": "Mandatory",
          "value": "mandatory"
        },
        {
          "label": "Unavailable",
          "value": "unavailable"
        }
      ]
    },
    "applicability_ids": {
      "type": "one2many",
      "label": "account.analytic.applicability"
    }
  }
};
