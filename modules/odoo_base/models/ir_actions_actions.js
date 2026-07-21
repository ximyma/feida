// Auto-generated from Odoo model: ir.actions.actions
// Description: Actions

exports.model = {
  "_name": "ir_actions_actions",
  "_description": "Actions",
  "_fields": {
    "name": {
      "type": "char",
      "label": "Action Name",
      "required": true
    },
    "type": {
      "type": "char",
      "label": "Action Type",
      "required": true
    },
    "xml_id": {
      "type": "char",
      "label": "_compute_xml_id"
    },
    "path": {
      "type": "char",
      "label": "Path to show in the URL"
    },
    "help": {
      "type": "text",
      "label": "Action Description"
    },
    "binding_model_id": {
      "type": "many2one",
      "label": "ir.model",
      "relation": "ir_model"
    },
    "binding_type": {
      "type": "selection",
      "label": "action"
    },
    "binding_view_types": {
      "type": "char",
      "label": "list,form",
      "default": "lis"
    }
  }
};
