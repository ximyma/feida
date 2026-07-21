// Auto-generated from Odoo model: res.country.state
// Description: Country state

exports.model = {
  "_name": "res_country_state",
  "_description": "Country state",
  "_fields": {
    "country_id": {
      "type": "many2one",
      "label": "res.country",
      "required": true,
      "index": true,
      "relation": "res_country"
    },
    "name": {
      "type": "char",
      "label": "State Name",
      "required": true
    },
    "code": {
      "type": "char",
      "label": "State Code",
      "required": true
    }
  }
};
