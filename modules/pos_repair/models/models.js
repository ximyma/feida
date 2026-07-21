// Odoo 模块: pos_repair
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "saleorderline",
    "_description": "saleorderline",
    "_auto": true,
    "_fields": {
      "is_repair_line": {
        "type": "boolean",
        "label": "Is linked to repair"
      }
    },
    "_inherit": "sale.order.line"
  }
];
