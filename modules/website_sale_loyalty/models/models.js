// Odoo 模块: website_sale_loyalty
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "loyalty.program",
    "_description": "loyalty.program",
    "_auto": true,
    "_fields": {
      "ecommerce_ok": {
        "type": "boolean",
        "label": "Available on Website",
        "default": true
      },
      "show_non_published_product_warning": {
        "type": "boolean",
        "label": "_compute_show_non_published_product_warning"
      }
    }
  },
  {
    "_name": "loyaltyrule",
    "_description": "loyaltyrule",
    "_auto": true,
    "_fields": {
      "website_id": {
        "type": "many2one",
        "label": "program_id.website_id"
      }
    },
    "_inherit": "loyalty.rule"
  },
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "disabled_auto_rewards": {
        "type": "many2many",
        "label": "loyalty.reward",
        "relation": "sale_order_disabled_auto_rewards_rel"
      }
    },
    "_inherit": "sale.order"
  }
];
