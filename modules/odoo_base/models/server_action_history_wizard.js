// Auto-generated from Odoo model: server.action.history.wizard
// Description: Server Action History Wizard

exports.model = {
  "_name": "server_action_history_wizard",
  "_description": "Server Action History Wizard",
  "_fields": {
    "action_id": {
      "type": "many2one",
      "label": "ir.actions.server",
      "relation": "ir_actions_server"
    },
    "code_diff": {
      "type": "text",
      "label": "_compute_code_diff"
    },
    "current_code": {
      "type": "text",
      "label": "action_id.code"
    },
    "revision": {
      "type": "many2one",
      "label": "ir.actions.server.history",
      "relation": "ir_actions_server_history"
    }
  }
};
