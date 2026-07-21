// Odoo 模块: spreadsheet_dashboard
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "spreadsheet.dashboard",
    "_description": "Spreadsheet Dashboard",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "dashboard_group_id": {
        "type": "many2one",
        "label": "spreadsheet.dashboard.group",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "sample_dashboard_file_path": {
        "type": "char",
        "label": "sample_dashboard_file_path"
      },
      "is_published": {
        "type": "boolean",
        "label": "is_published",
        "default": true
      },
      "company_ids": {
        "type": "many2many",
        "label": "res.company"
      },
      "group_ids": {
        "type": "many2many",
        "label": "res.groups"
      },
      "favorite_user_ids": {
        "type": "many2many",
        "label": "favorite_user_ids"
      },
      "is_favorite": {
        "type": "boolean",
        "label": "is_favorite"
      },
      "main_data_model_ids": {
        "type": "many2many",
        "label": "ir.model"
      }
    }
  },
  {
    "_name": "spreadsheet.dashboard.group",
    "_description": "Group of dashboards",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "dashboard_ids": {
        "type": "one2many",
        "label": "spreadsheet.dashboard"
      },
      "published_dashboard_ids": {
        "type": "one2many",
        "label": "spreadsheet.dashboard"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      }
    }
  },
  {
    "_name": "spreadsheet.dashboard.share",
    "_description": "Copy of a shared dashboard",
    "_auto": true,
    "_fields": {
      "dashboard_id": {
        "type": "many2one",
        "label": "spreadsheet.dashboard",
        "required": true
      },
      "excel_export": {
        "type": "text",
        "label": "excel_export"
      },
      "access_token": {
        "type": "char",
        "label": "access_token",
        "required": true
      },
      "full_url": {
        "type": "char",
        "label": "URL"
      },
      "name": {
        "type": "char",
        "label": "dashboard_id.name"
      }
    }
  }
];
