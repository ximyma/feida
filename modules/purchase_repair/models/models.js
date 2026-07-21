// Odoo 模块: purchase_repair
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "purchaseorder",
    "_description": "purchaseorder",
    "_auto": true,
    "_fields": {
      "repair_count": {
        "type": "integer",
        "label": "Count of source repairs"
      }
    },
    "_inherit": "purchase.order"
  },
  {
    "_name": "repairorder",
    "_description": "repairorder",
    "_auto": true,
    "_fields": {
      "purchase_count": {
        "type": "integer",
        "label": "Count of generated POs"
      }
    },
    "_inherit": "repair.order"
  }
];
