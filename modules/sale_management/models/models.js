// Odoo 模块: sale_management
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "digestdigest",
    "_description": "digestdigest",
    "_auto": true,
    "_fields": {
      "kpi_all_sale_total": {
        "type": "boolean",
        "label": "All Sales"
      },
      "kpi_all_sale_total_value": {
        "type": "monetary",
        "label": "_compute_kpi_sale_total_value"
      }
    },
    "_inherit": "digest.digest"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "sale_order_template_id": {
        "type": "many2one",
        "label": "sale_order_template_id"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "sale.order.template",
    "_description": "sale.order.template",
    "_auto": true,
    "_fields": {
      "sale_order_template_id": {
        "type": "many2one",
        "label": "sale_order_template_id"
      }
    },
    "_inherit": "sale.order"
  },
  {
    "_name": "saleorderline",
    "_description": "Sales Order Line",
    "_auto": true,
    "_fields": {
      "is_optional": {
        "type": "boolean",
        "label": "is_optional"
      }
    },
    "_inherit": "sale.order.line"
  },
  {
    "_name": "sale.order.template.line",
    "_description": "Quotation Template Line",
    "_auto": true,
    "_fields": {
      "sale_order_template_id": {
        "type": "many2one",
        "label": "sale_order_template_id"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "name": {
        "type": "text",
        "label": "name"
      },
      "allowed_uom_ids": {
        "type": "many2many",
        "label": "uom.uom"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "product_uom_id"
      },
      "product_uom_qty": {
        "type": "float",
        "label": "product_uom_qty"
      },
      "display_type": {
        "type": "selection",
        "label": "display_type"
      },
      "parent_id": {
        "type": "many2one",
        "label": "parent_id"
      },
      "is_optional": {
        "type": "boolean",
        "label": "is_optional"
      }
    }
  }
];
