// Auto-generated from Odoo model: res.users.apikeys.description
// Description: API Key Description

exports.model = {
  "_name": "res_users_apikeys_description",
  "_description": "API Key Description",
  "_fields": {
    "name": {
      "type": "char",
      "label": "Description",
      "required": true
    },
    "duration": {
      "type": "selection",
      "label": "_selection_duration",
      "required": true
    },
    "expiration_date": {
      "type": "datetime",
      "label": "Expiration Date"
    }
  }
};
