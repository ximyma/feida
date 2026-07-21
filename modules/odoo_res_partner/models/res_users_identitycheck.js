// Auto-generated from Odoo model: res.users.identitycheck
// Description: Password Check Wizard

exports.model = {
  "_name": "res_users_identitycheck",
  "_description": "Password Check Wizard",
  "_fields": {
    "request": {
      "type": "char"
    },
    "auth_method": {
      "type": "selection",
      "label": "password"
    },
    "password": {
      "type": "char"
    }
  }
};
