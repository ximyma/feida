// Odoo 模块: website_sale_wishlist
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "product.wishlist",
    "_description": "Product Wishlist",
    "_auto": true,
    "_fields": {
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product",
        "required": true
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "pricelist_id": {
        "type": "many2one",
        "label": "product.pricelist"
      },
      "price": {
        "type": "monetary",
        "label": "currency_id"
      },
      "website_id": {
        "type": "many2one",
        "label": "website",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "required": true,
        "default": true
      }
    }
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "wishlist_ids": {
        "type": "one2many",
        "label": "product.wishlist"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "website",
    "_description": "website",
    "_auto": true,
    "_fields": {
      "wishlist_opt_products_design_classes": {
        "type": "char",
        "label": "wishlist_opt_products_design_classes"
      },
      "wishlist_grid_columns": {
        "type": "integer",
        "label": "wishlist_grid_columns"
      },
      "wishlist_mobile_columns": {
        "type": "integer",
        "label": "wishlist_mobile_columns"
      },
      "wishlist_gap": {
        "type": "char",
        "label": "wishlist_gap"
      }
    },
    "_inherit": "website"
  }
];
