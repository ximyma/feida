// Odoo 模块: project_purchase
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "projectproject",
    "_description": "projectproject",
    "_auto": true,
    "_fields": {
      "purchase_orders_count": {
        "type": "integer",
        "label": "# Purchase Orders"
      }
    },
    "_inherit": "project.project"
  },
  {
    "_name": "purchaseorder",
    "_description": "purchaseorder",
    "_auto": true,
    "_fields": {
      "project_id": {
        "type": "many2one",
        "label": "project.project"
      }
    },
    "_inherit": "purchase.order"
  }
];
