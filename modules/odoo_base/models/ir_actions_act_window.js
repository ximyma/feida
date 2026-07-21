// Auto-generated from Odoo model: ir.actions.act_window
// Description: Action Window

exports.model = {
  "_name": "ir_actions_act_window",
  "_description": "Action Window",
  "_fields": {
    "type": {
      "type": "char",
      "label": "ir.actions.act_window",
      "default": "ir.actions.act_window"
    },
    "view_id": {
      "type": "many2one",
      "label": "ir.ui.view",
      "relation": "ir_ui_view"
    },
    "domain": {
      "type": "char",
      "label": "Domain Value"
    },
    "context": {
      "type": "char",
      "label": "Context Value",
      "required": true
    },
    "res_id": {
      "type": "integer",
      "label": "Record ID"
    },
    "res_model": {
      "type": "char",
      "label": "Destination Model",
      "required": true
    },
    "target": {
      "type": "selection",
      "label": "current"
    },
    "view_mode": {
      "type": "char",
      "label": "list,form",
      "required": true,
      "default": "lis"
    },
    "mobile_view_mode": {
      "type": "char",
      "label": "kanban",
      "default": "kanban"
    },
    "usage": {
      "type": "char",
      "label": "Action Usage"
    },
    "view_ids": {
      "type": "one2many",
      "label": "ir.actions.act_window.view"
    },
    "views": {
      "type": "text",
      "label": "_compute_views"
    },
    "limit": {
      "type": "integer",
      "label": "Default limit for the list view",
      "default": 80
    },
    "group_ids": {
      "type": "many2many",
      "label": "res.groups"
    },
    "search_view_id": {
      "type": "many2one",
      "label": "ir.ui.view",
      "relation": "ir_ui_view"
    },
    "embedded_action_ids": {
      "type": "one2many",
      "label": "ir.embedded.actions"
    },
    "filter": {
      "type": "boolean"
    },
    "cache": {
      "type": "boolean",
      "label": "Data Caching",
      "default": true
    }
  }
};
