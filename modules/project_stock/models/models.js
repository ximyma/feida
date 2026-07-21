// Odoo 模块: project_stock
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "project_id": {
        "type": "many2one",
        "label": "project.project"
      }
    },
    "_inherit": "stock.picking"
  }
];
