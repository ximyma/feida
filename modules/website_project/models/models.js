// Odoo 模块: website_project
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "projecttask",
    "_description": "projecttask",
    "_auto": true,
    "_fields": {
      "partner_name": {
        "type": "char",
        "label": "Customer Name"
      },
      "partner_company_name": {
        "type": "char",
        "label": "Company Name"
      }
    },
    "_inherit": "project.task"
  }
];
