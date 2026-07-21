// Odoo 模块: hr_timesheet
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "account.analytic.line.calendar.employee",
    "_description": "Personal Filters on Employees for the Calendar view",
    "_auto": true,
    "_fields": {
      "user_id": {
        "type": "many2one",
        "label": "res.users",
        "required": true
      },
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "checked": {
        "type": "boolean",
        "label": "checked",
        "default": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      }
    }
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
    "_name": "hremployee",
    "_description": "hremployee",
    "_auto": true,
    "_fields": {
      "has_timesheet": {
        "type": "boolean",
        "label": "_compute_has_timesheet"
      }
    },
    "_inherit": "hr.employee"
  },
  {
    "_name": "hremployeepublic",
    "_description": "hremployeepublic",
    "_auto": true,
    "_fields": {
      "has_timesheet": {
        "type": "boolean",
        "label": "employee_id.has_timesheet"
      }
    },
    "_inherit": "hr.employee.public"
  },
  {
    "_name": "accountanalyticline",
    "_description": "accountanalyticline",
    "_auto": true,
    "_fields": {
      "task_id": {
        "type": "many2one",
        "label": "task_id"
      },
      "parent_task_id": {
        "type": "many2one",
        "label": "project.task"
      },
      "project_id": {
        "type": "many2one",
        "label": "project_id"
      },
      "user_id": {
        "type": "many2one",
        "label": "_compute_user_id"
      },
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "job_title": {
        "type": "char",
        "label": "employee_id.job_title"
      },
      "department_id": {
        "type": "many2one",
        "label": "hr.department"
      },
      "manager_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "encoding_uom_id": {
        "type": "many2one",
        "label": "uom.uom"
      },
      "partner_id": {
        "type": "many2one",
        "label": "_compute_partner_id"
      },
      "readonly_timesheet": {
        "type": "boolean",
        "label": "_compute_readonly_timesheet"
      },
      "milestone_id": {
        "type": "many2one",
        "label": "project.milestone"
      },
      "message_partner_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "calendar_display_name": {
        "type": "char",
        "label": "_compute_calendar_display_name"
      }
    },
    "_inherit": "account.analytic.line"
  },
  {
    "_name": "projectproject",
    "_description": "projectproject",
    "_auto": true,
    "_fields": {
      "allow_timesheets": {
        "type": "boolean",
        "label": "allow_timesheets"
      },
      "account_id": {
        "type": "many2one",
        "label": "account_id"
      },
      "analytic_account_active": {
        "type": "boolean",
        "label": "Active Account"
      },
      "timesheet_ids": {
        "type": "one2many",
        "label": "account.analytic.line"
      },
      "timesheet_encode_uom_id": {
        "type": "many2one",
        "label": "uom.uom"
      },
      "total_timesheet_time": {
        "type": "float",
        "label": "total_timesheet_time"
      },
      "encode_uom_in_days": {
        "type": "boolean",
        "label": "_compute_encode_uom_in_days"
      },
      "is_internal_project": {
        "type": "boolean",
        "label": "_compute_is_internal_project"
      },
      "remaining_hours": {
        "type": "float",
        "label": "_compute_remaining_hours"
      },
      "is_project_overtime": {
        "type": "boolean",
        "label": "Project in Overtime"
      },
      "allocated_hours": {
        "type": "float",
        "label": "Allocated Time"
      },
      "effective_hours": {
        "type": "float",
        "label": "Time Spent"
      }
    },
    "_inherit": "project.project"
  },
  {
    "_name": "projecttask",
    "_description": "projecttask",
    "_auto": true,
    "_fields": {
      "project_id": {
        "type": "many2one",
        "label": "["
      },
      "analytic_account_active": {
        "type": "boolean",
        "label": "Active Analytic Account"
      },
      "allow_timesheets": {
        "type": "boolean",
        "label": "allow_timesheets"
      },
      "remaining_hours": {
        "type": "float",
        "label": "Time Remaining"
      },
      "remaining_hours_percentage": {
        "type": "float",
        "label": "_compute_remaining_hours_percentage"
      },
      "effective_hours": {
        "type": "float",
        "label": "Time Spent"
      },
      "total_hours_spent": {
        "type": "float",
        "label": "Total Time Spent"
      },
      "progress": {
        "type": "float",
        "label": "Progress"
      },
      "overtime": {
        "type": "float",
        "label": "_compute_progress_hours"
      },
      "subtask_effective_hours": {
        "type": "float",
        "label": "Time Spent on Sub-tasks"
      },
      "timesheet_ids": {
        "type": "one2many",
        "label": "account.analytic.line"
      },
      "encode_uom_in_days": {
        "type": "boolean",
        "label": "_compute_encode_uom_in_days"
      },
      "display_name": {
        "type": "char",
        "label": "display_name"
      }
    },
    "_inherit": "project.task"
  },
  {
    "_name": "projectupdate",
    "_description": "projectupdate",
    "_auto": true,
    "_fields": {
      "display_timesheet_stats": {
        "type": "boolean",
        "label": "_compute_display_timesheet_stats"
      },
      "allocated_time": {
        "type": "integer",
        "label": "Allocated Time"
      },
      "timesheet_time": {
        "type": "integer",
        "label": "Timesheet Time"
      },
      "timesheet_percentage": {
        "type": "integer",
        "label": "_compute_timesheet_percentage"
      },
      "uom_id": {
        "type": "many2one",
        "label": "uom.uom"
      }
    },
    "_inherit": "project.update"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "project_time_mode_id": {
        "type": "many2one",
        "label": "uom.uom"
      },
      "timesheet_encode_uom_id": {
        "type": "many2one",
        "label": "uom.uom"
      },
      "internal_project_id": {
        "type": "many2one",
        "label": "internal_project_id"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "uomuom",
    "_description": "uomuom",
    "_auto": true,
    "_fields": {
      "timesheet_widget": {
        "type": "char",
        "label": "Widget"
      }
    },
    "_inherit": "uom.uom"
  }
];
