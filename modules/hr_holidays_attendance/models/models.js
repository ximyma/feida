// Odoo 模块: hr_holidays_attendance
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hr.attendance.overtime.line",
    "_description": "hr.attendance.overtime.line",
    "_auto": true,
    "_fields": {
      "compensable_as_leave": {
        "type": "boolean",
        "label": "Compensable as Time Off"
      }
    },
    "_inherit": "hr.attendance.overtime.line"
  },
  {
    "_name": "hr.attendance.overtime.rule",
    "_description": "hr.attendance.overtime.rule",
    "_auto": true,
    "_fields": {
      "compensable_as_leave": {
        "type": "boolean",
        "label": "Give back as time off",
        "default": false
      }
    },
    "_inherit": "hr.attendance.overtime.rule"
  },
  {
    "_name": "hrleave",
    "_description": "hrleave",
    "_auto": true,
    "_fields": {
      "employee_overtime": {
        "type": "float",
        "label": "_compute_employee_overtime"
      },
      "overtime_deductible": {
        "type": "boolean",
        "label": "_compute_overtime_deductible"
      }
    },
    "_inherit": "hr.leave"
  },
  {
    "_name": "hrleaveaccruallevel",
    "_description": "hrleaveaccruallevel",
    "_auto": true,
    "_fields": {
      "frequency": {
        "type": "selection",
        "label": "frequency"
      }
    },
    "_inherit": "hr.leave.accrual.level"
  },
  {
    "_name": "hrleaveallocation",
    "_description": "hrleaveallocation",
    "_auto": true,
    "_fields": {
      "overtime_deductible": {
        "type": "boolean",
        "label": "_compute_overtime_deductible"
      },
      "employee_overtime": {
        "type": "float",
        "label": "_compute_employee_overtime"
      }
    },
    "_inherit": "hr.leave.allocation"
  },
  {
    "_name": "%(name)s (%(count)s)",
    "_description": "%(name)s (%(count)s)",
    "_auto": true,
    "_fields": {
      "overtime_deductible": {
        "type": "boolean",
        "label": "overtime_deductible"
      }
    },
    "_inherit": "hr.leave.type"
  }
];
