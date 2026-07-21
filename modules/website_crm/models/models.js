// Odoo 模块: website_crm
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "crmlead",
    "_description": "crmlead",
    "_auto": true,
    "_fields": {
      "visitor_ids": {
        "type": "many2many",
        "label": "website.visitor"
      },
      "visitor_page_count": {
        "type": "integer",
        "label": "# Page Views"
      }
    },
    "_inherit": "crm.lead"
  },
  {
    "_name": "website",
    "_description": "website",
    "_auto": true,
    "_fields": {
      "crm_default_team_id": {
        "type": "many2one",
        "label": "crm_default_team_id"
      },
      "crm_default_user_id": {
        "type": "many2one",
        "label": "crm_default_user_id"
      }
    },
    "_inherit": "website"
  },
  {
    "_name": "websitevisitor",
    "_description": "websitevisitor",
    "_auto": true,
    "_fields": {
      "lead_ids": {
        "type": "many2many",
        "label": "crm.lead"
      },
      "lead_count": {
        "type": "integer",
        "label": "# Leads"
      }
    },
    "_inherit": "website.visitor"
  }
];
