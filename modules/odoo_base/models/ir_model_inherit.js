// Auto-generated from Odoo model: ir.model.inherit
// Description: Model Inheritance Tree

exports.model = {
  "_name": "ir_model_inherit",
  "_description": "Model Inheritance Tree",
  "_fields": {
    "model_id": {
      "type": "many2one",
      "label": "ir.model",
      "required": true,
      "relation": "ir_model"
    },
    "parent_id": {
      "type": "many2one",
      "label": "ir.model",
      "required": true,
      "relation": "ir_model"
    },
    "parent_field_id": {
      "type": "many2one",
      "label": "ir.model.fields",
      "relation": "ir_model_fields"
    }
  }
};
