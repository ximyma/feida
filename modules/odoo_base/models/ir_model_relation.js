// Auto-generated from Odoo model: ir.model.relation
// Description: Relation Model

exports.model = {
  "_name": "ir_model_relation",
  "_description": "Relation Model",
  "_fields": {
    "name": {
      "type": "char",
      "label": "Relation Name",
      "required": true,
      "index": true
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
    "write_date": {
      "type": "datetime"
    },
    "create_date": {
      "type": "datetime"
    }
  }
};
