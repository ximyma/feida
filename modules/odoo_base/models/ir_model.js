// Auto-generated from Odoo model: ir.model
// Description: Models

exports.model = {
  "_name": "ir_model",
  "_description": "Models",
  "_fields": {
    "name": {
      "type": "char",
      "label": "Model Description",
      "required": true
    },
    "model": {
      "type": "char",
      "label": "x_",
      "required": true,
      "default": "x_"
    },
    "order": {
      "type": "char",
      "label": "Order",
      "required": true,
      "default": "id"
    },
    "info": {
      "type": "text",
      "label": "Information"
    },
    "field_id": {
      "type": "one2many",
      "label": "ir.model.fields",
      "required": true
    },
    "inherited_model_ids": {
      "type": "many2many",
      "label": "ir.model"
    },
    "state": {
      "type": "selection",
      "label": "manual"
    },
    "access_ids": {
      "type": "one2many",
      "label": "ir.model.access"
    },
    "rule_ids": {
      "type": "one2many",
      "label": "ir.rule"
    },
    "abstract": {
      "type": "boolean",
      "label": "Abstract Model"
    },
    "transient": {
      "type": "boolean",
      "label": "Transient Model"
    },
    "modules": {
      "type": "char",
      "label": "_in_modules"
    },
    "view_ids": {
      "type": "one2many",
      "label": "ir.ui.view"
    },
    "count": {
      "type": "integer",
      "label": "_compute_count"
    },
    "fold_name": {
      "type": "char",
      "label": "Fold Field"
    }
  }
};
