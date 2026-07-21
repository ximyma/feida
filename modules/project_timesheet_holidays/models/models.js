// Odoo 模块: project_timesheet_holidays
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountanalyticline",
    "_description": "accountanalyticline",
    "_auto": true,
    "_fields": {
      "holiday_id": {
        "type": "many2one",
        "label": "hr.leave"
      },
      "global_leave_id": {
        "type": "many2one",
        "label": "resource.calendar.leaves"
      },
      "task_id": {
        "type": "many2one",
        "label": "[("
      }
    },
    "_inherit": "account.analytic.line"
  },
  {
    "_name": "hrleave",
    "_description": "hrleave",
    "_auto": true,
    "_fields": {
      "timesheet_ids": {
        "type": "one2many",
        "label": "account.analytic.line"
      }
    },
    "_inherit": "hr.leave"
  },
  {
    "_name": "projecttask",
    "_description": "projecttask",
    "_auto": true,
    "_fields": {
      "leave_types_count": {
        "type": "integer",
        "label": "_compute_leave_types_count"
      },
      "is_timeoff_task": {
        "type": "boolean",
        "label": "Is Time off Task"
      }
    },
    "_inherit": "project.task"
  },
  {
    "_name": "resourcecalendarleaves",
    "_description": "resourcecalendarleaves",
    "_auto": true,
    "_fields": {
      "timesheet_ids": {
        "type": "one2many",
        "label": "account.analytic.line"
      }
    },
    "_inherit": "resource.calendar.leaves"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "leave_timesheet_task_id": {
        "type": "many2one",
        "label": "leave_timesheet_task_id"
      }
    },
    "_inherit": "res.company"
  }
];
