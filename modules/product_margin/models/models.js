// Odoo 模块: product_margin
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "date_from": {
        "type": "date",
        "label": "_compute_product_margin_fields_values"
      },
      "date_to": {
        "type": "date",
        "label": "_compute_product_margin_fields_values"
      },
      "invoice_state": {
        "type": "selection",
        "label": "_compute_product_margin_fields_values"
      },
      "sale_avg_price": {
        "type": "float",
        "label": "_compute_product_margin_fields_values"
      },
      "purchase_avg_price": {
        "type": "float",
        "label": "_compute_product_margin_fields_values"
      },
      "sale_num_invoiced": {
        "type": "float",
        "label": "_compute_product_margin_fields_values"
      },
      "purchase_num_invoiced": {
        "type": "float",
        "label": "_compute_product_margin_fields_values"
      },
      "sales_gap": {
        "type": "float",
        "label": "_compute_product_margin_fields_values"
      },
      "purchase_gap": {
        "type": "float",
        "label": "_compute_product_margin_fields_values"
      },
      "turnover": {
        "type": "float",
        "label": "_compute_product_margin_fields_values"
      },
      "total_cost": {
        "type": "float",
        "label": "_compute_product_margin_fields_values"
      },
      "sale_expected": {
        "type": "float",
        "label": "_compute_product_margin_fields_values"
      },
      "normal_cost": {
        "type": "float",
        "label": "_compute_product_margin_fields_values"
      },
      "total_margin": {
        "type": "float",
        "label": "_compute_product_margin_fields_values"
      },
      "expected_margin": {
        "type": "float",
        "label": "_compute_product_margin_fields_values"
      },
      "total_margin_rate": {
        "type": "float",
        "label": "_compute_product_margin_fields_values"
      },
      "expected_margin_rate": {
        "type": "float",
        "label": "_compute_product_margin_fields_values"
      }
    },
    "_inherit": "product.product"
  }
];
