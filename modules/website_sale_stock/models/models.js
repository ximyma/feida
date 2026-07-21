// Odoo 模块: website_sale_stock
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "stock_notification_partner_ids": {
        "type": "many2many",
        "label": "res.partner",
        "relation": "stock_notification_product_partner_rel"
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "productribbon",
    "_description": "productribbon",
    "_auto": true,
    "_fields": {
      "assign": {
        "type": "selection",
        "label": "assign"
      }
    },
    "_inherit": "product.ribbon"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "allow_out_of_stock_order": {
        "type": "boolean",
        "label": "Sell when Out-of-Stock",
        "default": true
      },
      "available_threshold": {
        "type": "float",
        "label": "Show Threshold"
      },
      "show_availability": {
        "type": "boolean",
        "label": "Show availability Qty",
        "default": false
      },
      "out_of_stock_message": {
        "type": "html",
        "label": "Out-of-Stock Message"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "website_id": {
        "type": "many2one",
        "label": "website"
      }
    },
    "_inherit": "stock.picking"
  },
  {
    "_name": "website",
    "_description": "website",
    "_auto": true,
    "_fields": {
      "warehouse_id": {
        "type": "many2one",
        "label": "stock.warehouse"
      }
    },
    "_inherit": "website"
  }
];
