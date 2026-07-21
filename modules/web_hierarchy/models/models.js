// Odoo 模块: web_hierarchy
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "iractionsact_windowview",
    "_description": "iractionsact_windowview",
    "_auto": true,
    "_fields": {
      "view_mode": {
        "type": "selection",
        "label": "hierarchy"
      }
    },
    "_inherit": "ir.actions.act_window.view"
  },
  {
    "_name": "iruiview",
    "_description": "iruiview",
    "_auto": true,
    "_fields": {
      "type": {
        "type": "selection",
        "label": "hierarchy"
      }
    },
    "_inherit": "ir.ui.view"
  }
];
