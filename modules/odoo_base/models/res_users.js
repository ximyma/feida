// Auto-generated from Odoo model: res.users
// Description: User

exports.model = {
  "_name": "res_users",
  "_description": "User",
  "_fields": {
    "partner_id": {
      "type": "many2one",
      "label": "res.partner",
      "required": true,
      "index": true,
      "relation": "res_partner"
    },
    "login": {
      "type": "char",
      "label": "Used to log into the system",
      "required": true
    },
    "password": {
      "type": "char",
      "label": "_compute_password"
    },
    "new_password": {
      "type": "char",
      "label": "Set Password"
    },
    "api_key_ids": {
      "type": "one2many",
      "label": "res.users.apikeys"
    },
    "signature": {
      "type": "text",
      "label": "Email Signature"
    },
    "active": {
      "type": "boolean",
      "default": true
    },
    "active_partner": {
      "type": "boolean",
      "label": "partner_id.active"
    },
    "action_id": {
      "type": "many2one",
      "label": "ir.actions.actions",
      "relation": "ir_actions_actions"
    },
    "log_ids": {
      "type": "one2many",
      "label": "res.users.log"
    },
    "device_ids": {
      "type": "one2many",
      "label": "res.device"
    },
    "login_date": {
      "type": "datetime",
      "label": "log_ids.create_date"
    },
    "share": {
      "type": "boolean",
      "label": "_compute_share"
    },
    "companies_count": {
      "type": "integer",
      "label": "_compute_companies_count"
    },
    "tz_offset": {
      "type": "char",
      "label": "_compute_tz_offset"
    },
    "res_users_settings_ids": {
      "type": "one2many",
      "label": "res.users.settings"
    },
    "res_users_settings_id": {
      "type": "many2one",
      "label": "res.users.settings",
      "relation": "res_users_settings"
    },
    "company_id": {
      "type": "many2one",
      "label": "res.company",
      "required": true,
      "relation": "res_company"
    },
    "company_ids": {
      "type": "many2many",
      "label": "res.company"
    },
    "name": {
      "type": "char",
      "label": "partner_id.name"
    },
    "email": {
      "type": "char",
      "label": "partner_id.email"
    },
    "email_domain_placeholder": {
      "type": "char",
      "label": "_compute_email_domain_placeholder"
    },
    "phone": {
      "type": "char",
      "label": "partner_id.phone"
    },
    "group_ids": {
      "type": "many2many",
      "label": "res.groups"
    },
    "all_group_ids": {
      "type": "many2many",
      "label": "res.groups"
    },
    "accesses_count": {
      "type": "integer",
      "label": "# Access Rights"
    },
    "rules_count": {
      "type": "integer",
      "label": "# Record Rules"
    },
    "groups_count": {
      "type": "integer",
      "label": "# Groups"
    },
    "role": {
      "type": "selection",
      "label": "group_user"
    }
  }
};
