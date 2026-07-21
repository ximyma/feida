// Odoo 模块: event_crm
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "crmlead",
    "_description": "crmlead",
    "_auto": true,
    "_fields": {
      "event_lead_rule_id": {
        "type": "many2one",
        "label": "event.lead.rule"
      },
      "event_id": {
        "type": "many2one",
        "label": "event.event"
      },
      "registration_ids": {
        "type": "many2many",
        "label": "registration_ids"
      },
      "registration_count": {
        "type": "integer",
        "label": "registration_count"
      }
    },
    "_inherit": "crm.lead"
  },
  {
    "_name": "eventevent",
    "_description": "eventevent",
    "_auto": true,
    "_fields": {
      "lead_ids": {
        "type": "one2many",
        "label": "lead_ids"
      },
      "lead_count": {
        "type": "integer",
        "label": "lead_count"
      }
    },
    "_inherit": "event.event"
  },
  {
    "_name": "event.lead.request",
    "_description": "Event Lead Request",
    "_auto": true,
    "_fields": {
      "event_id": {
        "type": "many2one",
        "label": "event.event",
        "required": true
      },
      "event_lead_rule_ids": {
        "type": "many2many",
        "label": "event.lead.rule"
      },
      "processed_registration_id": {
        "type": "integer",
        "label": "Processed Registration"
      }
    }
  },
  {
    "_name": "event.lead.rule",
    "_description": "Event Lead Rules",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Rule Name",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "lead_ids": {
        "type": "one2many",
        "label": "lead_ids"
      },
      "lead_creation_basis": {
        "type": "selection",
        "label": "lead_creation_basis"
      },
      "lead_creation_trigger": {
        "type": "selection",
        "label": "lead_creation_trigger"
      },
      "event_type_ids": {
        "type": "many2many",
        "label": "event_type_ids"
      },
      "event_id": {
        "type": "many2one",
        "label": "event_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "event_registration_filter": {
        "type": "text",
        "label": "Registrations Domain"
      },
      "lead_type": {
        "type": "selection",
        "label": "lead_type"
      },
      "lead_sales_team_id": {
        "type": "many2one",
        "label": "lead_sales_team_id"
      },
      "lead_user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "lead_tag_ids": {
        "type": "many2many",
        "label": "crm.tag"
      }
    }
  },
  {
    "_name": "eventregistration",
    "_description": "eventregistration",
    "_auto": true,
    "_fields": {
      "lead_ids": {
        "type": "many2many",
        "label": "lead_ids"
      },
      "lead_count": {
        "type": "integer",
        "label": "lead_count"
      }
    },
    "_inherit": "event.registration"
  }
];
