// Auto-generated from Odoo model: ir.actions.server.history
// Description: Server Action History

exports.model = {
  "_name": "ir_actions_server_history",
  "_description": "Server Action History",
  "_fields": {
    "action_id": {
      "type": "many2one",
      "label": "ir.actions.server",
      "required": true,
      "relation": "ir_actions_server"
    },
    "code": {
      "type": "text"
    }
  }
};
