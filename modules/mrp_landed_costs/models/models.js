// Odoo 模块: mrp_landed_costs
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "stocklandedcost",
    "_description": "stocklandedcost",
    "_auto": true,
    "_fields": {
      "target_model": {
        "type": "selection",
        "label": "target_model"
      },
      "mrp_production_ids": {
        "type": "many2many",
        "label": "mrp_production_ids"
      }
    },
    "_inherit": "stock.landed.cost"
  }
];
