// Odoo 模块: crm_iap_mine
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "crm.iap.lead.industry",
    "_description": "CRM IAP Lead Industry",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Industry",
        "required": true
      },
      "reveal_ids": {
        "type": "char",
        "label": ",",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      }
    }
  },
  {
    "_name": "crm.iap.lead.mining.request",
    "_description": "CRM Lead Mining Request",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Request Number",
        "required": true
      },
      "state": {
        "type": "selection",
        "label": "draft",
        "required": true,
        "default": "draft"
      },
      "lead_number": {
        "type": "integer",
        "label": "Number of Leads",
        "required": true
      },
      "search_type": {
        "type": "selection",
        "label": "companies",
        "required": true,
        "default": "companies"
      },
      "error_type": {
        "type": "selection",
        "label": "error_type"
      },
      "lead_type": {
        "type": "selection",
        "label": "lead",
        "required": true
      },
      "team_id": {
        "type": "many2one",
        "label": "team_id"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "crm.tag"
      },
      "lead_ids": {
        "type": "one2many",
        "label": "crm.lead"
      },
      "lead_count": {
        "type": "integer",
        "label": "_compute_lead_count"
      },
      "filter_on_size": {
        "type": "boolean",
        "label": "Filter on Size",
        "default": false
      },
      "company_size_min": {
        "type": "integer",
        "label": "Size"
      },
      "company_size_max": {
        "type": "integer",
        "label": "company_size_max"
      },
      "country_ids": {
        "type": "many2many",
        "label": "res.country"
      },
      "state_ids": {
        "type": "many2many",
        "label": "res.country.state"
      },
      "available_state_ids": {
        "type": "one2many",
        "label": "res.country.state"
      },
      "industry_ids": {
        "type": "many2many",
        "label": "crm.iap.lead.industry"
      },
      "contact_number": {
        "type": "integer",
        "label": "Number of Contacts"
      },
      "contact_filter_type": {
        "type": "selection",
        "label": "role",
        "default": "role"
      },
      "preferred_role_id": {
        "type": "many2one",
        "label": "crm.iap.lead.role"
      },
      "role_ids": {
        "type": "many2many",
        "label": "crm.iap.lead.role"
      },
      "seniority_id": {
        "type": "many2one",
        "label": "crm.iap.lead.seniority"
      },
      "lead_credits": {
        "type": "char",
        "label": "_compute_tooltip"
      },
      "lead_contacts_credits": {
        "type": "char",
        "label": "_compute_tooltip"
      },
      "lead_total_credits": {
        "type": "char",
        "label": "_compute_tooltip"
      }
    }
  },
  {
    "_name": "crm.iap.lead.role",
    "_description": "People Role",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Role Name",
        "required": true
      },
      "reveal_id": {
        "type": "char",
        "label": "reveal_id",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      }
    }
  },
  {
    "_name": "crm.iap.lead.seniority",
    "_description": "People Seniority",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "reveal_id": {
        "type": "char",
        "label": "reveal_id",
        "required": true
      }
    }
  },
  {
    "_name": "crmlead",
    "_description": "crmlead",
    "_auto": true,
    "_fields": {
      "lead_mining_request_id": {
        "type": "many2one",
        "label": "crm.iap.lead.mining.request"
      }
    },
    "_inherit": "crm.lead"
  }
];
