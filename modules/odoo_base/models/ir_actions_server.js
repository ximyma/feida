// Auto-generated from Odoo model: ir.actions.server
// Description: Server Actions

exports.model = {
  "_name": "ir_actions_server",
  "_description": "Server Actions",
  "_fields": {
    "name": {
      "type": "char",
      "label": "_compute_name"
    },
    "automated_name": {
      "type": "char",
      "label": "_compute_name"
    },
    "type": {
      "type": "char",
      "label": "ir.actions.server",
      "default": "ir.actions.server"
    },
    "usage": {
      "type": "selection",
      "label": "ir_actions_server"
    },
    "state": {
      "type": "selection",
      "label": "object_write"
    },
    "sequence": {
      "type": "integer",
      "label": "When dealing with multiple actions, the execution order is ",
      "default": 5
    },
    "model_id": {
      "type": "many2one",
      "label": "ir.model",
      "required": true,
      "index": true,
      "relation": "ir_model"
    },
    "available_model_ids": {
      "type": "many2many",
      "label": "ir.model"
    },
    "model_name": {
      "type": "char",
      "label": "model_id.model"
    },
    "warning": {
      "type": "text",
      "label": "Warning"
    },
    "ir_cron_ids": {
      "type": "one2many",
      "label": "ir.cron"
    },
    "code": {
      "type": "text",
      "label": "Python Code"
    },
    "show_code_history": {
      "type": "boolean",
      "label": "_compute_show_code_history"
    },
    "parent_id": {
      "type": "many2one",
      "label": "ir.actions.server",
      "index": true,
      "relation": "ir_actions_server"
    },
    "child_ids": {
      "type": "one2many",
      "label": "ir.actions.server"
    },
    "crud_model_id": {
      "type": "many2one",
      "label": "ir.model",
      "relation": "ir_model"
    },
    "crud_model_name": {
      "type": "char",
      "label": "crud_model_id.model"
    },
    "link_field_id": {
      "type": "many2one",
      "label": "ir.model.fields",
      "relation": "ir_model_fields"
    },
    "group_ids": {
      "type": "many2many",
      "label": "res.groups"
    },
    "update_field_id": {
      "type": "many2one",
      "label": "ir.model.fields",
      "relation": "ir_model_fields"
    },
    "update_path": {
      "type": "char",
      "label": "Field to Update Path"
    },
    "update_related_model_id": {
      "type": "many2one",
      "label": "ir.model",
      "relation": "ir_model"
    },
    "update_field_type": {
      "type": "selection",
      "label": "update_field_id.ttype"
    },
    "update_m2m_operation": {
      "type": "selection",
      "label": "add"
    },
    "update_boolean_value": {
      "type": "selection",
      "label": "true"
    },
    "value": {
      "type": "text",
      "label": "For Python expressions, this field may hold a Python expression "
    },
    "evaluation_type": {
      "type": "selection",
      "label": "value"
    },
    "html_value": {
      "type": "text"
    },
    "sequence_id": {
      "type": "many2one",
      "label": "ir.sequence",
      "relation": "ir_sequence"
    },
    "selection_value": {
      "type": "many2one",
      "label": "ir.model.fields.selection",
      "relation": "ir_model_fields_selection"
    },
    "value_field_to_show": {
      "type": "selection",
      "label": "value"
    },
    "webhook_url": {
      "type": "char",
      "label": "Webhook URL"
    },
    "webhook_field_ids": {
      "type": "many2many",
      "label": "ir.model.fields"
    },
    "webhook_sample_payload": {
      "type": "text",
      "label": "Sample Payload"
    }
  }
};
