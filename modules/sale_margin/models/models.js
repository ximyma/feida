// Odoo 模块: sale_margin
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "margin": {
        "type": "monetary",
        "label": "Margin"
      },
      "margin_percent": {
        "type": "float",
        "label": "Margin (%)"
      }
    },
    "_inherit": "sale.order"
  },
  {
    "_name": "saleorderline",
    "_description": "saleorderline",
    "_auto": true,
    "_fields": {
      "margin": {
        "type": "float",
        "label": "margin"
      },
      "margin_percent": {
        "type": "float",
        "label": "margin_percent"
      },
      "purchase_price": {
        "type": "float",
        "label": "purchase_price"
      }
    },
    "_inherit": "sale.order.line"
  }
];
