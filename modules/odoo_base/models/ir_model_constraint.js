// Auto-generated from Odoo model: ir.model.constraint
// Description: Model Constraint

exports.model = {
  "_name": "ir_model_constraint",
  "_description": "Model Constraint",
  "_fields": {
    "name": {
      "type": "char",
      "label": "Constraint",
      "required": true,
      "index": true
    },
    "definition": {
      "type": "char",
      "label": "PostgreSQL constraint definition"
    },
    "message": {
      "type": "char",
      "label": "Error message returned when the constraint is violated."
    },
    "model": {
      "type": "many2one",
      "label": "ir.model",
      "required": true,
      "index": true,
      "relation": "ir_model"
    },
    "module": {
      "type": "many2one",
      "label": "ir.module.module",
      "required": true,
      "index": true,
      "relation": "ir_module_module"
    },
    "type": {
      "type": "char",
      "label": "Constraint Type",
      "required": true
    }
  }
};
