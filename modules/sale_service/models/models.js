// Odoo 模块: sale_service
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "saleorderline",
    "_description": "saleorderline",
    "_auto": true,
    "_fields": {
      "is_service": {
        "type": "boolean",
        "label": "Is a Service"
      }
    },
    "_inherit": "sale.order.line"
  }
];
