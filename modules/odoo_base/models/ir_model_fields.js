// Auto-generated from Odoo model: ir.model.fields
// Description: Fields

exports.model = {
  "_name": "ir_model_fields",
  "_description": "Fields",
  "_fields": {
    "name": {
      "type": "char",
      "label": "Field Name",
      "required": true,
      "index": true,
      "default": "x_"
    },
    "model": {
      "type": "char",
      "label": "Model Name",
      "required": true,
      "index": true
    },
    "relation": {
      "type": "char",
      "label": "Related Model"
    },
    "relation_field": {
      "type": "char",
      "label": "For one2many fields, the field on the target model that implement the opposite many2one relationship"
    },
    "relation_field_id": {
      "type": "many2one",
      "label": "ir.model.fields",
      "relation": "ir_model_fields"
    },
    "model_id": {
      "type": "many2one",
      "label": "ir.model",
      "required": true,
      "index": true,
      "relation": "ir_model"
    },
    "field_description": {
      "type": "char",
      "label": "Field Label",
      "required": true,
      "default": ""
    },
    "help": {
      "type": "text",
      "label": "Field Help"
    },
    "ttype": {
      "type": "selection",
      "label": "Field Type",
      "required": true
    },
    "selection": {
      "type": "char"
    },
    "selection_ids": {
      "type": "one2many",
      "label": "ir.model.fields.selection"
    },
    "copied": {
      "type": "boolean",
      "label": "Copied"
    },
    "related": {
      "type": "char",
      "label": "Related Field Definition"
    },
    "related_field_id": {
      "type": "many2one",
      "label": "ir.model.fields",
      "relation": "ir_model_fields"
    },
    "required": {
      "type": "boolean"
    },
    "readonly": {
      "type": "boolean"
    },
    "index": {
      "type": "boolean",
      "label": "Indexed"
    },
    "translate": {
      "type": "selection",
      "label": "standard"
    },
    "company_dependent": {
      "type": "boolean",
      "label": "Company Dependent"
    },
    "size": {
      "type": "integer"
    },
    "state": {
      "type": "selection",
      "label": "manual"
    },
    "on_delete": {
      "type": "selection",
      "label": "cascade"
    },
    "domain": {
      "type": "char",
      "label": "[]",
      "default": "[]"
    },
    "groups": {
      "type": "many2many",
      "label": "res.groups"
    },
    "group_expand": {
      "type": "boolean",
      "label": "Expand Groups"
    },
    "selectable": {
      "type": "boolean",
      "default": true
    },
    "modules": {
      "type": "char",
      "label": "_in_modules"
    },
    "relation_table": {
      "type": "char",
      "label": "Used for custom many2many fields to define a custom relation table name"
    },
    "column1": {
      "type": "char",
      "label": "Column 1"
    },
    "column2": {
      "type": "char",
      "label": "Column 2"
    },
    "compute": {
      "type": "text",
      "label": "Code to compute the value of the field.\\n"
    },
    "depends": {
      "type": "char",
      "label": "Dependencies"
    },
    "store": {
      "type": "boolean",
      "label": "Stored",
      "default": true
    },
    "currency_field": {
      "type": "char",
      "label": "Currency field"
    },
    "sanitize": {
      "type": "boolean",
      "label": "Sanitize HTML",
      "default": true
    },
    "sanitize_overridable": {
      "type": "boolean",
      "label": "Sanitize HTML overridable",
      "default": false
    },
    "sanitize_tags": {
      "type": "boolean",
      "label": "Sanitize HTML Tags",
      "default": true
    },
    "sanitize_attributes": {
      "type": "boolean",
      "label": "Sanitize HTML Attributes",
      "default": true
    },
    "sanitize_style": {
      "type": "boolean",
      "label": "Sanitize HTML Style",
      "default": false
    },
    "sanitize_form": {
      "type": "boolean",
      "label": "Sanitize HTML Form",
      "default": true
    },
    "strip_style": {
      "type": "boolean",
      "label": "Strip Style Attribute",
      "default": false
    },
    "strip_classes": {
      "type": "boolean",
      "label": "Strip Class Attribute",
      "default": false
    }
  }
};
