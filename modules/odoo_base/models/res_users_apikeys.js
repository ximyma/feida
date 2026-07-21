// Auto-generated from Odoo model: res.users.apikeys
// Description: Users API Keys

exports.model = {
  "_name": "res_users_apikeys",
  "_description": "Users API Keys",
  "_fields": {
    "name": {
      "type": "char",
      "label": "Description",
      "required": true
    },
    "user_id": {
      "type": "many2one",
      "label": "res.users",
      "required": true,
      "index": true,
      "relation": "res_users"
    },
    "scope": {
      "type": "char",
      "label": "Scope"
    },
    "create_date": {
      "type": "datetime",
      "label": "Creation Date"
    },
    "expiration_date": {
      "type": "datetime",
      "label": "Expiration Date"
    }
  }
};
