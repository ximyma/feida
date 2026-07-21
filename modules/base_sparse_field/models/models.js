// Odoo 模块: base_sparse_field
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "irmodelfields",
    "_description": "irmodelfields",
    "_auto": true,
    "_fields": {
      "ttype": {
        "type": "selection",
        "label": "ttype"
      },
      "serialization_field_id": {
        "type": "many2one",
        "label": "ir.model.fields"
      }
    },
    "_inherit": "ir.model.fields"
  }
];
