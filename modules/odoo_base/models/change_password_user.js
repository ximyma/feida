// Auto-generated from Odoo model: change.password.user
// Description: User, Change Password Wizard

exports.model = {
  "_name": "change_password_user",
  "_description": "User, Change Password Wizard",
  "_fields": {
    "wizard_id": {
      "type": "many2one",
      "label": "change.password.wizard",
      "required": true,
      "relation": "change_password_wizard"
    },
    "user_id": {
      "type": "many2one",
      "label": "res.users",
      "required": true,
      "relation": "res_users"
    },
    "user_login": {
      "type": "char",
      "label": "User Login"
    },
    "new_passwd": {
      "type": "char",
      "label": "New Password",
      "default": ""
    }
  }
};
