// Odoo 模块: sales_team
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "crm.tag",
    "_description": "CRM Tag",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Tag Name",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "Color"
      }
    }
  },
  {
    "_name": "crm.team",
    "_description": "Sales Team",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Sales Team",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "active": {
        "type": "boolean",
        "label": "If the active field is set to false, it will allow you to hide the Sales Team without removing it.",
        "default": true
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "currency_id"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "is_membership_multi": {
        "type": "boolean",
        "label": "is_membership_multi"
      },
      "member_ids": {
        "type": "many2many",
        "label": "member_ids"
      },
      "member_company_ids": {
        "type": "many2many",
        "label": "member_company_ids"
      },
      "member_warning": {
        "type": "text",
        "label": "Membership Issue Warning"
      },
      "crm_team_member_ids": {
        "type": "one2many",
        "label": "crm_team_member_ids"
      },
      "crm_team_member_all_ids": {
        "type": "one2many",
        "label": "crm_team_member_all_ids"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "favorite_user_ids": {
        "type": "many2many",
        "label": "favorite_user_ids"
      },
      "is_favorite": {
        "type": "boolean",
        "label": "is_favorite"
      },
      "dashboard_button_name": {
        "type": "char",
        "label": "Dashboard Button"
      }
    }
  },
  {
    "_name": "crm.team.member",
    "_description": "Sales Team Member",
    "_auto": true,
    "_fields": {
      "crm_team_id": {
        "type": "many2one",
        "label": "crm_team_id"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "user_in_teams_ids": {
        "type": "many2many",
        "label": "user_in_teams_ids"
      },
      "user_company_ids": {
        "type": "many2many",
        "label": "user_company_ids"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "is_membership_multi": {
        "type": "boolean",
        "label": "is_membership_multi"
      },
      "member_warning": {
        "type": "text",
        "label": "_compute_member_warning"
      },
      "image_1920": {
        "type": "text",
        "label": "Image"
      },
      "image_128": {
        "type": "text",
        "label": "Image (128)"
      },
      "name": {
        "type": "char",
        "label": "Name"
      },
      "email": {
        "type": "char",
        "label": "Email"
      },
      "phone": {
        "type": "char",
        "label": "Phone"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      }
    }
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "crm_team_ids": {
        "type": "many2many",
        "label": "crm_team_ids"
      },
      "crm_team_member_ids": {
        "type": "one2many",
        "label": "crm.team.member"
      },
      "sale_team_id": {
        "type": "many2one",
        "label": "sale_team_id"
      }
    },
    "_inherit": "res.users"
  }
];
