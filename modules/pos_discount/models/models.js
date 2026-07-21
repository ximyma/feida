// Odoo 模块: pos_discount
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "posconfig",
    "_description": "posconfig",
    "_auto": true,
    "_fields": {
      "iface_discount": {
        "type": "boolean",
        "label": "Order Discounts"
      },
      "discount_pc": {
        "type": "float",
        "label": "Discount Percentage"
      },
      "discount_product_id": {
        "type": "many2one",
        "label": "product.product"
      }
    },
    "_inherit": "pos.config"
  }
];
