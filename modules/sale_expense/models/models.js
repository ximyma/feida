// Odoo 模块: sale_expense
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "sale.order.line",
    "_description": "sale.order.line",
    "_auto": true,
    "_fields": {
      "sale_order_id": {
        "type": "many2one",
        "label": "sale_order_id"
      },
      "sale_order_line_id": {
        "type": "many2one",
        "label": "sale_order_line_id"
      },
      "can_be_reinvoiced": {
        "type": "boolean",
        "label": "Can be reinvoiced"
      }
    },
    "_inherit": "hr.expense"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "expense_policy_tooltip": {
        "type": "char",
        "label": "_compute_expense_policy_tooltip"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "hr.expense",
    "_description": "hr.expense",
    "_auto": true,
    "_fields": {
      "expense_ids": {
        "type": "one2many",
        "label": "expense_ids"
      },
      "expense_count": {
        "type": "integer",
        "label": "# of Expenses"
      }
    },
    "_inherit": "sale.order"
  }
];
