// Auto-generated from Odoo model: res.bank
// Description: Bank

exports.model = {
  "_name": "res_bank",
  "_description": "Bank",
  "_fields": {
    "name": {
      "type": "char",
      "required": true
    },
    "street": {
      "type": "char"
    },
    "street2": {
      "type": "char"
    },
    "zip": {
      "type": "char"
    },
    "city": {
      "type": "char"
    },
    "state": {
      "type": "many2one",
      "label": "res.country.state",
      "relation": "res_country_state"
    },
    "country": {
      "type": "many2one",
      "label": "res.country",
      "relation": "res_country"
    },
    "country_code": {
      "type": "char",
      "label": "country.code"
    },
    "email": {
      "type": "char"
    },
    "phone": {
      "type": "char"
    },
    "active": {
      "type": "boolean",
      "default": true
    },
    "bic": {
      "type": "char",
      "label": "Bank Identifier Code",
      "index": true
    }
  }
};
