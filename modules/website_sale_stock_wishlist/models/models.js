// Odoo 模块: website_sale_stock_wishlist
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "productwishlist",
    "_description": "productwishlist",
    "_auto": true,
    "_fields": {
      "stock_notification": {
        "type": "boolean",
        "label": "_compute_stock_notification",
        "required": true,
        "default": false
      }
    },
    "_inherit": "product.wishlist"
  }
];
