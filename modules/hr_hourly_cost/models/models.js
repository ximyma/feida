// Odoo 模块: hr_hourly_cost
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hremployee",
    "_description": "hremployee",
    "_auto": true,
    "_fields": {
      "hourly_cost": {
        "type": "monetary",
        "label": "Hourly Cost"
      }
    },
    "_inherit": "hr.employee"
  }
];
