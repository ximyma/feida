// Odoo 模块: project_mrp_account
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mrpproduction",
    "_description": "mrpproduction",
    "_auto": true,
    "_fields": {
      "has_analytic_account": {
        "type": "boolean",
        "label": "_compute_has_analytic_account"
      }
    },
    "_inherit": "mrp.production"
  }
];
