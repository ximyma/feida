// Auto-generated from Odoo model: res.country.group
// Description: Country Group

exports.model = {
  "_name": "res_country_group",
  "_description": "Country Group",
  "_fields": {
    "name": {
      "type": "char",
      "required": true
    },
    "code": {
      "type": "char",
      "label": "Code"
    },
    "country_ids": {
      "type": "many2many",
      "label": "res.country"
    }
  }
};
