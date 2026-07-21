// Odoo 模块: uom
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "uom.uom",
    "_description": "Product Unit of Measure",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Unit Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "_compute_sequence"
      },
      "relative_factor": {
        "type": "float",
        "label": "relative_factor"
      },
      "rounding": {
        "type": "float",
        "label": "Rounding Precision"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "relative_uom_id": {
        "type": "many2one",
        "label": "uom.uom"
      },
      "related_uom_ids": {
        "type": "one2many",
        "label": "uom.uom"
      },
      "factor": {
        "type": "float",
        "label": "Absolute Quantity"
      },
      "parent_path": {
        "type": "char",
        "label": "parent_path"
      }
    }
  }
];
