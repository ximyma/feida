// Auto-generated from Odoo model: ir.model.data
// Description: Model Data

exports.model = {
  "_name": "ir_model_data",
  "_description": "Model Data",
  "_fields": {
    "name": {
      "type": "char",
      "label": "External Identifier",
      "required": true
    },
    "complete_name": {
      "type": "char",
      "label": "_compute_complete_name"
    },
    "model": {
      "type": "char",
      "label": "Model Name",
      "required": true
    },
    "module": {
      "type": "char",
      "required": true,
      "default": ""
    },
    "noupdate": {
      "type": "boolean",
      "label": "Non Updatable",
      "default": false
    },
    "reference": {
      "type": "char",
      "label": "Reference"
    }
  }
};
