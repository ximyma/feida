// Odoo 模块: delivery_stock_picking_batch
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "stockpickingtype",
    "_description": "stockpickingtype",
    "_auto": true,
    "_fields": {
      "batch_group_by_carrier": {
        "type": "boolean",
        "label": "Carrier"
      },
      "batch_max_weight": {
        "type": "integer",
        "label": "Maximum weight"
      },
      "weight_uom_name": {
        "type": "char",
        "label": "Weight unit of measure label"
      }
    },
    "_inherit": "stock.picking.type"
  }
];
