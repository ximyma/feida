// Auto-generated from Odoo model: ir.actions.client
// Description: Client Action

exports.model = {
  "_name": "ir_actions_client",
  "_description": "Client Action",
  "_fields": {
    "type": {
      "type": "char",
      "label": "ir.actions.client",
      "default": "ir.actions.client"
    },
    "tag": {
      "type": "char",
      "label": "Client action tag",
      "required": true
    },
    "target": {
      "type": "selection",
      "label": "current"
    },
    "res_model": {
      "type": "char",
      "label": "Destination Model"
    },
    "context": {
      "type": "char",
      "label": "Context Value",
      "required": true,
      "default": "{}"
    },
    "params": {
      "type": "text",
      "label": "_compute_params"
    },
    "params_store": {
      "type": "text",
      "label": "Params storage"
    }
  }
};
