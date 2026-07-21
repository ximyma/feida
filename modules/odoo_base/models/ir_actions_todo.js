// Auto-generated from Odoo model: ir.actions.todo
// Description: Configuration Wizards

exports.model = {
  "_name": "ir_actions_todo",
  "_description": "Configuration Wizards",
  "_fields": {
    "action_id": {
      "type": "many2one",
      "label": "ir.actions.actions",
      "required": true,
      "index": true,
      "relation": "ir_actions_actions"
    },
    "sequence": {
      "type": "integer",
      "default": 10
    },
    "state": {
      "type": "selection",
      "label": "open"
    },
    "name": {
      "type": "char"
    }
  }
};
