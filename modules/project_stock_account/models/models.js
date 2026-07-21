// Odoo 模块: project_stock_account
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountanalyticline",
    "_description": "accountanalyticline",
    "_auto": true,
    "_fields": {
      "category": {
        "type": "selection",
        "label": "picking_entry"
      }
    },
    "_inherit": "account.analytic.line"
  },
  {
    "_name": "accountanalyticapplicability",
    "_description": "Analytic Plan",
    "_auto": true,
    "_fields": {
      "business_domain": {
        "type": "selection",
        "label": "business_domain"
      }
    },
    "_inherit": "account.analytic.applicability"
  },
  {
    "_name": "stockpickingtype",
    "_description": "stockpickingtype",
    "_auto": true,
    "_fields": {
      "analytic_costs": {
        "type": "boolean",
        "label": "Validating stock pickings will generate analytic entries for the selected project. Products set for re-invoicing will also be billed to the customer."
      }
    },
    "_inherit": "stock.picking.type"
  }
];
