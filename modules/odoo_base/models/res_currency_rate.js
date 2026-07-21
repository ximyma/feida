// Auto-generated from Odoo model: res.currency.rate
// Description: Currency Rate

exports.model = {
  "_name": "res_currency_rate",
  "_description": "Currency Rate",
  "_fields": {
    "name": {
      "type": "date",
      "label": "Date",
      "required": true,
      "index": true
    },
    "rate": {
      "type": "float",
      "label": "avg"
    },
    "company_rate": {
      "type": "float",
      "label": "_compute_company_rate"
    },
    "inverse_company_rate": {
      "type": "float",
      "label": "_compute_inverse_company_rate"
    },
    "currency_id": {
      "type": "many2one",
      "label": "res.currency",
      "required": true,
      "index": true,
      "relation": "res_currency"
    },
    "company_id": {
      "type": "many2one",
      "label": "res.company",
      "relation": "res_company"
    }
  }
};
