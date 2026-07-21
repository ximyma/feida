// Auto-generated from Odoo model: res.currency
// Description: Currency

exports.model = {
  "_name": "res_currency",
  "_description": "Currency",
  "_fields": {
    "name": {
      "type": "char",
      "label": "Currency",
      "required": true
    },
    "iso_numeric": {
      "type": "integer",
      "label": "Currency numeric code."
    },
    "full_name": {
      "type": "char",
      "label": "Name"
    },
    "symbol": {
      "type": "char",
      "label": "Currency sign, to be used when printing amounts.",
      "required": true
    },
    "rate": {
      "type": "float",
      "label": "_compute_current_rate"
    },
    "inverse_rate": {
      "type": "float",
      "label": "_compute_current_rate"
    },
    "rate_string": {
      "type": "char",
      "label": "_compute_current_rate"
    },
    "rate_ids": {
      "type": "one2many",
      "label": "res.currency.rate"
    },
    "rounding": {
      "type": "float",
      "label": "Rounding Factor"
    },
    "decimal_places": {
      "type": "integer",
      "label": "_compute_decimal_places"
    },
    "active": {
      "type": "boolean",
      "default": true
    },
    "position": {
      "type": "selection",
      "label": "after"
    },
    "date": {
      "type": "date",
      "label": "_compute_date"
    },
    "currency_unit_label": {
      "type": "char",
      "label": "Currency Unit"
    },
    "currency_subunit_label": {
      "type": "char",
      "label": "Currency Subunit"
    },
    "is_current_company_currency": {
      "type": "boolean",
      "label": "_compute_is_current_company_currency"
    }
  }
};
