// Auto-generated from Odoo model: ir.actions.act_window.view
// Description: Action Window View

exports.model = {
  "_name": "ir_actions_act_window_view",
  "_description": "Action Window View",
  "_fields": {
    "sequence": {
      "type": "integer"
    },
    "view_id": {
      "type": "many2one",
      "label": "ir.ui.view",
      "relation": "ir_ui_view"
    },
    "view_mode": {
      "type": "selection",
      "label": "View Type",
      "required": true
    },
    "act_window_id": {
      "type": "many2one",
      "label": "ir.actions.act_window",
      "relation": "ir_actions_act_window"
    },
    "multi": {
      "type": "boolean",
      "label": "On Multiple Doc."
    }
  }
};
