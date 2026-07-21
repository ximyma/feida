// Odoo 模块: mrp_repair
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mrpproduction",
    "_description": "mrpproduction",
    "_auto": true,
    "_fields": {
      "repair_count": {
        "type": "integer",
        "label": "repair_count"
      }
    },
    "_inherit": "mrp.production"
  },
  {
    "_name": "repairorder",
    "_description": "repairorder",
    "_auto": true,
    "_fields": {
      "production_count": {
        "type": "integer",
        "label": "production_count"
      }
    },
    "_inherit": "repair.order"
  }
];
