// Auto-generated from Odoo model: ir.model.fields.selection
// Description: Fields Selection

exports.model = {
  "_name": "ir_model_fields_selection",
  "_description": "Fields Selection",
  "_fields": {
    "field_id": {
      "type": "many2one",
      "label": "ir.model.fields",
      "required": true,
      "index": true,
      "relation": "ir_model_fields"
    },
    "value": {
      "type": "char",
      "required": true
    },
    "name": {
      "type": "char",
      "required": true
    },
    "sequence": {
      "type": "integer",
      "default": 1000
    }
  }
};
