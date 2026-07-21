// Odoo 模块: sale_expense_margin
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "saleorderline",
    "_description": "saleorderline",
    "_auto": true,
    "_fields": {
      "expense_id": {
        "type": "many2one",
        "label": "hr.expense"
      }
    },
    "_inherit": "sale.order.line"
  }
];
