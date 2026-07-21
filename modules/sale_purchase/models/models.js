// Odoo 模块: sale_purchase
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "service_to_purchase": {
        "type": "boolean",
        "label": "service_to_purchase"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "purchaseorder",
    "_description": "purchaseorder",
    "_auto": true,
    "_fields": {
      "sale_order_count": {
        "type": "integer",
        "label": "sale_order_count"
      },
      "has_sale_order": {
        "type": "boolean",
        "label": "has_sale_order"
      }
    },
    "_inherit": "purchase.order"
  },
  {
    "_name": "purchaseorderline",
    "_description": "purchaseorderline",
    "_auto": true,
    "_fields": {
      "sale_order_id": {
        "type": "many2one",
        "label": "sale_line_id.order_id"
      },
      "sale_line_id": {
        "type": "many2one",
        "label": "sale.order.line"
      }
    },
    "_inherit": "purchase.order.line"
  },
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "purchase_order_count": {
        "type": "integer",
        "label": "purchase_order_count"
      }
    },
    "_inherit": "sale.order"
  },
  {
    "_name": "saleorderline",
    "_description": "saleorderline",
    "_auto": true,
    "_fields": {
      "purchase_line_ids": {
        "type": "one2many",
        "label": "purchase.order.line"
      },
      "purchase_line_count": {
        "type": "integer",
        "label": "Number of generated purchase items"
      }
    },
    "_inherit": "sale.order.line"
  }
];
