// Odoo 模块: website_crm_iap_reveal
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "crmlead",
    "_description": "crmlead",
    "_auto": true,
    "_fields": {
      "reveal_ip": {
        "type": "char",
        "label": "IP Address"
      },
      "reveal_iap_credits": {
        "type": "integer",
        "label": "IAP Credits"
      },
      "reveal_rule_id": {
        "type": "many2one",
        "label": "crm.reveal.rule"
      }
    },
    "_inherit": "crm.lead"
  },
  {
    "_name": "crm.reveal.rule",
    "_description": "CRM Lead Generation Rules",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Rule Name",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "country_ids": {
        "type": "many2many",
        "label": "res.country"
      },
      "website_id": {
        "type": "many2one",
        "label": "website"
      },
      "state_ids": {
        "type": "many2many",
        "label": "res.country.state"
      },
      "regex_url": {
        "type": "char",
        "label": "URL Expression"
      },
      "sequence": {
        "type": "integer",
        "label": "Used to order the rules with same URL and countries. "
      },
      "industry_tag_ids": {
        "type": "many2many",
        "label": "crm.iap.lead.industry"
      },
      "filter_on_size": {
        "type": "boolean",
        "label": "Filter on Size",
        "default": true
      },
      "company_size_min": {
        "type": "integer",
        "label": "Company Size"
      },
      "company_size_max": {
        "type": "integer",
        "label": "company_size_max"
      },
      "contact_filter_type": {
        "type": "selection",
        "label": "role",
        "required": true,
        "default": "role"
      },
      "preferred_role_id": {
        "type": "many2one",
        "label": "crm.iap.lead.role"
      },
      "other_role_ids": {
        "type": "many2many",
        "label": "crm.iap.lead.role"
      },
      "seniority_id": {
        "type": "many2one",
        "label": "crm.iap.lead.seniority"
      },
      "extra_contacts": {
        "type": "integer",
        "label": "Number of Contacts"
      },
      "lead_for": {
        "type": "selection",
        "label": "companies",
        "required": true,
        "default": "companies"
      },
      "lead_type": {
        "type": "selection",
        "label": "lead",
        "required": true,
        "default": "opportunity"
      },
      "suffix": {
        "type": "char",
        "label": "Suffix"
      },
      "team_id": {
        "type": "many2one",
        "label": "crm.team"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "crm.tag"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "priority": {
        "type": "selection",
        "label": "Priority"
      },
      "lead_ids": {
        "type": "one2many",
        "label": "crm.lead"
      },
      "lead_count": {
        "type": "integer",
        "label": "_compute_lead_count"
      },
      "opportunity_count": {
        "type": "integer",
        "label": "_compute_lead_count"
      }
    }
  },
  {
    "_name": "crm.reveal.view",
    "_description": "CRM Reveal View",
    "_auto": true,
    "_fields": {
      "reveal_ip": {
        "type": "char",
        "label": "IP Address"
      },
      "reveal_rule_id": {
        "type": "many2one",
        "label": "crm.reveal.rule"
      },
      "reveal_state": {
        "type": "selection",
        "label": "to_process",
        "default": "to_process"
      },
      "create_date": {
        "type": "datetime",
        "label": "create_date"
      }
    }
  }
];
