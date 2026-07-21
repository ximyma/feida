// Odoo 模块: hr_work_entry_holidays
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hrleavetype",
    "_description": "hrleavetype",
    "_auto": true,
    "_fields": {
      "work_entry_type_id": {
        "type": "many2one",
        "label": "hr.work.entry.type"
      }
    },
    "_inherit": "hr.leave.type"
  },
  {
    "_name": "hrworkentry",
    "_description": "hrworkentry",
    "_auto": true,
    "_fields": {
      "leave_id": {
        "type": "many2one",
        "label": "hr.leave"
      },
      "leave_state": {
        "type": "selection",
        "label": "leave_id.state"
      }
    },
    "_inherit": "hr.work.entry"
  },
  {
    "_name": "hrworkentrytype",
    "_description": "HR Work Entry Type",
    "_auto": true,
    "_fields": {
      "leave_type_ids": {
        "type": "one2many",
        "label": "leave_type_ids"
      }
    },
    "_inherit": "hr.work.entry.type"
  }
];
