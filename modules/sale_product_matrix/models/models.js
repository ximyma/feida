// Odoo 模块: sale_product_matrix
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "product_add_mode": {
        "type": "selection",
        "label": "product_add_mode"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "report_grids": {
        "type": "boolean",
        "label": "Print Variant Grids",
        "default": true
      },
      "grid_product_tmpl_id": {
        "type": "many2one",
        "label": "grid_product_tmpl_id"
      },
      "grid_update": {
        "type": "boolean",
        "label": "grid_update",
        "default": false
      },
      "grid": {
        "type": "char",
        "label": "grid"
      }
    },
    "_inherit": "sale.order"
  },
  {
    "_name": "saleorderline",
    "_description": "saleorderline",
    "_auto": true,
    "_fields": {
      "product_add_mode": {
        "type": "selection",
        "label": "product_template_id.product_add_mode"
      }
    },
    "_inherit": "sale.order.line"
  }
];
