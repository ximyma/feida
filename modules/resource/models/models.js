// Odoo 模块: resource
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "resource.calendar",
    "_description": "Resource Working Time",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "attendance_ids": {
        "type": "one2many",
        "label": "attendance_ids"
      },
      "attendance_ids_1st_week": {
        "type": "one2many",
        "label": "resource.calendar.attendance"
      },
      "attendance_ids_2nd_week": {
        "type": "one2many",
        "label": "resource.calendar.attendance"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "leave_ids": {
        "type": "one2many",
        "label": "leave_ids"
      },
      "schedule_type": {
        "type": "selection",
        "label": "schedule_type"
      },
      "duration_based": {
        "type": "boolean",
        "label": "Attendance based on duration"
      },
      "flexible_hours": {
        "type": "boolean",
        "label": "Flexible Hours"
      },
      "full_time_required_hours": {
        "type": "float",
        "label": "full_time_required_hours"
      },
      "global_leave_ids": {
        "type": "one2many",
        "label": "global_leave_ids"
      },
      "hours_per_day": {
        "type": "float",
        "label": "Average Hour per Day"
      },
      "hours_per_week": {
        "type": "float",
        "label": "hours_per_week"
      },
      "is_fulltime": {
        "type": "boolean",
        "label": "_compute_work_time_rate"
      },
      "two_weeks_calendar": {
        "type": "boolean",
        "label": "Calendar in 2 weeks mode"
      },
      "two_weeks_explanation": {
        "type": "char",
        "label": "Explanation"
      },
      "tz": {
        "type": "selection",
        "label": "tz"
      },
      "tz_offset": {
        "type": "char",
        "label": "_compute_tz_offset"
      },
      "work_resources_count": {
        "type": "integer",
        "label": "Work Resources count"
      },
      "work_time_rate": {
        "type": "float",
        "label": "Work Time Rate"
      }
    }
  },
  {
    "_name": "resource.calendar.attendance",
    "_description": "Work Detail",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "dayofweek": {
        "type": "selection",
        "label": "dayofweek"
      },
      "hour_from": {
        "type": "float",
        "label": "Work from",
        "required": true
      },
      "hour_to": {
        "type": "float",
        "label": "Work to",
        "required": true
      },
      "duration_hours": {
        "type": "float",
        "label": "_compute_duration_hours"
      },
      "duration_days": {
        "type": "float",
        "label": "_compute_duration_days"
      },
      "calendar_id": {
        "type": "many2one",
        "label": "resource.calendar",
        "required": true
      },
      "duration_based": {
        "type": "boolean",
        "label": "calendar_id.duration_based"
      },
      "day_period": {
        "type": "selection",
        "label": "day_period"
      },
      "week_type": {
        "type": "selection",
        "label": "week_type"
      },
      "two_weeks_calendar": {
        "type": "boolean",
        "label": "Calendar in 2 weeks mode"
      },
      "display_type": {
        "type": "selection",
        "label": "display_type"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      }
    }
  },
  {
    "_name": "resource.calendar.leaves",
    "_description": "Resource Time Off Detail",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Reason"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "calendar_id": {
        "type": "many2one",
        "label": "calendar_id"
      },
      "date_from": {
        "type": "datetime",
        "label": "Start Date",
        "required": true
      },
      "date_to": {
        "type": "datetime",
        "label": "End Date",
        "required": true
      },
      "resource_id": {
        "type": "many2one",
        "label": "resource_id"
      },
      "time_type": {
        "type": "selection",
        "label": "leave",
        "default": "leave"
      }
    }
  },
  {
    "_name": "resource.resource",
    "_description": "Resources",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "resource_type": {
        "type": "selection",
        "label": "resource_type"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "avatar_128": {
        "type": "text",
        "label": "_compute_avatar_128"
      },
      "share": {
        "type": "boolean",
        "label": "user_id.share"
      },
      "email": {
        "type": "char",
        "label": "user_id.email"
      },
      "phone": {
        "type": "char",
        "label": "user_id.phone"
      },
      "time_efficiency": {
        "type": "float",
        "label": "time_efficiency"
      },
      "calendar_id": {
        "type": "many2one",
        "label": "calendar_id"
      },
      "tz": {
        "type": "selection",
        "label": "tz"
      }
    }
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "resource_calendar_ids": {
        "type": "one2many",
        "label": "resource_calendar_ids"
      },
      "resource_calendar_id": {
        "type": "many2one",
        "label": "resource_calendar_id"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "resource_ids": {
        "type": "one2many",
        "label": "resource_ids"
      },
      "resource_calendar_id": {
        "type": "many2one",
        "label": "resource_calendar_id"
      }
    },
    "_inherit": "res.users"
  }
];
