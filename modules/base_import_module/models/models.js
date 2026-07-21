// Odoo 模块: base_import_module
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "irmodulemodule",
    "_description": "irmodulemodule",
    "_auto": true,
    "_fields": {
      "imported": {
        "type": "boolean",
        "label": "Imported Module"
      },
      "module_type": {
        "type": "selection",
        "label": "module_type"
      }
    },
    "_inherit": "ir.module.module"
  }
];
