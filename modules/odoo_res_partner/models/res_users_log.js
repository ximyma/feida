// Auto-generated from Odoo model: res.users.log
// Description: Users Log

exports.model = {
  "_name": "res_users_log",
  "_description": "Users Log",
  "_fields": {
    "create_uid": {
      "type": "many2one",
      "label": "res.users",
      "index": true,
      "relation": "res_users"
    }
  }
};
