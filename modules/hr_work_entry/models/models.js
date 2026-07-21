// Odoo 模块: hr_work_entry
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hremployee",
    "_description": "hremployee",
    "_auto": true,
    "_fields": {
      "has_work_entries": {
        "type": "boolean",
        "label": "_compute_has_work_entries"
      },
      "work_entry_source": {
        "type": "selection",
        "label": "version_id.work_entry_source"
      },
      "work_entry_source_calendar_invalid": {
        "type": "boolean",
        "label": "version_id.work_entry_source_calendar_invalid"
      }
    },
    "_inherit": "hr.employee"
  },
  {
    "_name": "hr.user.work.entry.employee",
    "_description": "Work Entries Employees",
    "_auto": true,
    "_fields": {
      "user_id": {
        "type": "many2one",
        "label": "res.users",
        "required": true
      },
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "is_checked": {
        "type": "boolean",
        "label": "is_checked",
        "default": true
      }
    }
  },
  {
    "_name": "hrversion",
    "_description": "hrversion",
    "_auto": true,
    "_fields": {
      "date_generated_from": {
        "type": "datetime",
        "label": "Generated From",
        "required": true
      },
      "date_generated_to": {
        "type": "datetime",
        "label": "Generated To",
        "required": true
      },
      "last_generation_date": {
        "type": "date",
        "label": "Last Generation Date"
      },
      "work_entry_source": {
        "type": "selection",
        "label": "calendar",
        "required": true,
        "default": "calendar"
      },
      "work_entry_source_calendar_invalid": {
        "type": "boolean",
        "label": "work_entry_source_calendar_invalid"
      }
    },
    "_inherit": "hr.version"
  },
  {
    "_name": "hr.work.entry",
    "_description": "HR Work Entry",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee",
        "required": true
      },
      "version_id": {
        "type": "many2one",
        "label": "hr.version",
        "required": true
      },
      "work_entry_source": {
        "type": "selection",
        "label": "version_id.work_entry_source"
      },
      "date": {
        "type": "date",
        "label": "date",
        "required": true
      },
      "duration": {
        "type": "float",
        "label": "Duration"
      },
      "work_entry_type_id": {
        "type": "many2one",
        "label": "work_entry_type_id"
      },
      "display_code": {
        "type": "char",
        "label": "work_entry_type_id.display_code"
      },
      "code": {
        "type": "char",
        "label": "work_entry_type_id.code"
      },
      "external_code": {
        "type": "char",
        "label": "work_entry_type_id.external_code"
      },
      "color": {
        "type": "integer",
        "label": "work_entry_type_id.color"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "conflict": {
        "type": "boolean",
        "label": "Conflicts"
      },
      "department_id": {
        "type": "many2one",
        "label": "hr.department"
      },
      "amount_rate": {
        "type": "float",
        "label": "Pay rate"
      },
      "country_id": {
        "type": "many2one",
        "label": "res.country"
      }
    }
  },
  {
    "_name": "hr.work.entry.type",
    "_description": "HR Work Entry Type",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "display_code": {
        "type": "char",
        "label": "Display Code"
      },
      "code": {
        "type": "char",
        "label": "Payroll Code",
        "required": true
      },
      "external_code": {
        "type": "char",
        "label": "Use this code to export your data to a third party"
      },
      "color": {
        "type": "integer",
        "label": "color"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "active": {
        "type": "boolean",
        "label": "active"
      },
      "country_id": {
        "type": "many2one",
        "label": "country_id"
      },
      "country_code": {
        "type": "char",
        "label": "country_id.code"
      },
      "is_leave": {
        "type": "boolean",
        "label": "is_leave"
      },
      "is_work": {
        "type": "boolean",
        "label": "is_work"
      },
      "amount_rate": {
        "type": "float",
        "label": "amount_rate"
      },
      "is_extra_hours": {
        "type": "boolean",
        "label": "is_extra_hours"
      }
    }
  },
  {
    "_name": "resourcecalendarattendance",
    "_description": "resourcecalendarattendance",
    "_auto": true,
    "_fields": {
      "work_entry_type_id": {
        "type": "many2one",
        "label": "work_entry_type_id"
      }
    },
    "_inherit": "resource.calendar.attendance"
  },
  {
    "_name": "resourcecalendarleaves",
    "_description": "resourcecalendarleaves",
    "_auto": true,
    "_fields": {
      "work_entry_type_id": {
        "type": "many2one",
        "label": "work_entry_type_id"
      }
    },
    "_inherit": "resource.calendar.leaves"
  }
];
