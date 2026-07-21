// Odoo 模块: purchase_product_matrix
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "purchaseorder",
    "_description": "purchaseorder",
    "_auto": true,
    "_fields": {
      "report_grids": {
        "type": "boolean",
        "label": "Print Variant Grids",
        "default": true
      },
      "grid_product_tmpl_id": {
        "type": "many2one",
        "label": "product.template"
      },
      "grid_update": {
        "type": "boolean",
        "label": "Whether the grid field contains a new matrix to apply or not.",
        "default": false
      },
      "grid": {
        "type": "char",
        "label": "Technical storage of grid. \\nIf grid_update, will be loaded on the PO. \\nIf not, represents the matrix to open."
      }
    },
    "_inherit": "purchase.order"
  },
  {
    "_name": "purchaseorderline",
    "_description": "purchaseorderline",
    "_auto": true,
    "_fields": {
      "product_template_id": {
        "type": "many2one",
        "label": "product.template"
      },
      "is_configurable_product": {
        "type": "boolean",
        "label": "Is the product configurable?"
      },
      "product_template_attribute_value_ids": {
        "type": "many2many",
        "label": "product_id.product_template_attribute_value_ids"
      },
      "product_no_variant_attribute_value_ids": {
        "type": "many2many",
        "label": "product.template.attribute.value"
      }
    },
    "_inherit": "purchase.order.line"
  }
];
