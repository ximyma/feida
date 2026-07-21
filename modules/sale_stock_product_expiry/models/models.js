// Odoo 模块: sale_stock_product_expiry
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "saleorderline",
    "_description": "saleorderline",
    "_auto": true,
    "_fields": {
      "use_expiration_date": {
        "type": "boolean",
        "label": "product_id.use_expiration_date"
      }
    },
    "_inherit": "sale.order.line"
  }
];
