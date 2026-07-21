// Odoo 模块: hr_org_chart
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hremployee",
    "_description": "hremployee",
    "_auto": true,
    "_fields": {
      "subordinate_ids": {
        "type": "one2many",
        "label": "hr.employee"
      },
      "is_subordinate": {
        "type": "boolean",
        "label": "_compute_is_subordinate"
      }
    },
    "_inherit": "hr.employee"
  },
  {
    "_name": "hremployeepublic",
    "_description": "hremployeepublic",
    "_auto": true,
    "_fields": {
      "subordinate_ids": {
        "type": "one2many",
        "label": "employee_id.subordinate_ids"
      },
      "is_subordinate": {
        "type": "boolean",
        "label": "employee_id.is_subordinate"
      }
    },
    "_inherit": "hr.employee.public"
  }
];
