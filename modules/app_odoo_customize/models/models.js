// Odoo 模块: app_odoo_customize
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "ir.module.addons.path",
    "_description": "Module Addons Path",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Short Name"
      },
      "path": {
        "type": "char",
        "label": "Path"
      },
      "path_temp": {
        "type": "char",
        "label": "Path Temp"
      },
      "color": {
        "type": "char",
        "label": "color"
      },
      "module_ids": {
        "type": "one2many",
        "label": "ir.module.module"
      },
      "module_count": {
        "type": "integer",
        "label": "_compute_module_count"
      }
    }
  },
  {
    "_name": "irmodulemodule",
    "_description": "irmodulemodule",
    "_auto": true,
    "_fields": {
      "local_updatable": {
        "type": "boolean",
        "label": "Local updatable",
        "default": false
      },
      "addons_path_id": {
        "type": "many2one",
        "label": "ir.module.addons.path"
      },
      "addons_path": {
        "type": "char",
        "label": "Addons Path"
      },
      "license": {
        "type": "char",
        "label": "license"
      },
      "module_type": {
        "type": "selection",
        "label": "odooapp.cn",
        "default": "official"
      }
    },
    "_inherit": "ir.module.module"
  }
];
