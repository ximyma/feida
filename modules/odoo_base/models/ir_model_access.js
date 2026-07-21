// Auto-generated from Odoo model: ir.model.access
// Description: Model Access

exports.model = {
  "_name": "ir_model_access",
  "_description": "Model Access",
  "_fields": {
    "name": {
      "type": "char",
      "required": true,
      "index": true
    },
    "active": {
      "type": "boolean",
      "default": true
    },
    "model_id": {
      "type": "many2one",
      "label": "ir.model",
      "required": true,
      "index": true,
      "relation": "ir_model"
    },
    "group_id": {
      "type": "many2one",
      "label": "res.groups",
      "index": true,
      "relation": "res_groups"
    },
    "perm_read": {
      "type": "boolean",
      "label": "Read Access"
    },
    "perm_write": {
      "type": "boolean",
      "label": "Write Access"
    },
    "perm_create": {
      "type": "boolean",
      "label": "Create Access"
    },
    "perm_unlink": {
      "type": "boolean",
      "label": "Delete Access"
    }
  }
};
