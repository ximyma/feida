// Odoo 模块: hr_attendance
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hr.attendance",
    "_description": "Attendance",
    "_auto": true,
    "_fields": {
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee",
        "required": true
      },
      "department_id": {
        "type": "many2one",
        "label": "hr.department"
      },
      "manager_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "attendance_manager_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "is_manager": {
        "type": "boolean",
        "label": "_compute_is_manager"
      },
      "check_in": {
        "type": "datetime",
        "label": "Check In",
        "required": true
      },
      "check_out": {
        "type": "datetime",
        "label": "Check Out"
      },
      "date": {
        "type": "date",
        "label": "Date",
        "required": true
      },
      "worked_hours": {
        "type": "float",
        "label": "Worked Hours"
      },
      "color": {
        "type": "integer",
        "label": "_compute_color"
      },
      "overtime_hours": {
        "type": "float",
        "label": "Over Time"
      },
      "overtime_status": {
        "type": "selection",
        "label": "to_approve"
      },
      "validated_overtime_hours": {
        "type": "float",
        "label": "Extra Hours"
      },
      "in_latitude": {
        "type": "float",
        "label": "Latitude"
      },
      "in_longitude": {
        "type": "float",
        "label": "Longitude"
      },
      "in_location": {
        "type": "char",
        "label": "Based on GPS-Coordinates if available or on IP Address"
      },
      "in_ip_address": {
        "type": "char",
        "label": "IP Address"
      },
      "in_browser": {
        "type": "char",
        "label": "Browser"
      },
      "in_mode": {
        "type": "selection",
        "label": "Mode"
      },
      "out_latitude": {
        "type": "float",
        "label": "out_latitude"
      },
      "out_longitude": {
        "type": "float",
        "label": "out_longitude"
      },
      "out_location": {
        "type": "char",
        "label": "Based on GPS-Coordinates if available or on IP Address"
      },
      "out_ip_address": {
        "type": "char",
        "label": "out_ip_address"
      },
      "out_browser": {
        "type": "char",
        "label": "out_browser"
      },
      "out_mode": {
        "type": "selection",
        "label": "kiosk"
      },
      "expected_hours": {
        "type": "float",
        "label": "Theoretical Hours"
      },
      "device_tracking_enabled": {
        "type": "boolean",
        "label": "employee_id.company_id.attendance_device_tracking"
      },
      "linked_overtime_ids": {
        "type": "many2many",
        "label": "hr.attendance.overtime.line"
      }
    }
  },
  {
    "_name": "hr.attendance.overtime.line",
    "_description": "Attendance Overtime Line",
    "_auto": true,
    "_fields": {
      "employee_id": {
        "type": "many2one",
        "label": "employee_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "employee_id.company_id"
      },
      "date": {
        "type": "date",
        "label": "Day",
        "required": true
      },
      "status": {
        "type": "selection",
        "label": "status"
      },
      "duration": {
        "type": "float",
        "label": "Extra Hours",
        "required": true
      },
      "manual_duration": {
        "type": "float",
        "label": "manual_duration"
      },
      "time_start": {
        "type": "datetime",
        "label": "Start"
      },
      "time_stop": {
        "type": "datetime",
        "label": "Stop"
      },
      "amount_rate": {
        "type": "float",
        "label": "Overtime pay rate",
        "required": true
      },
      "is_manager": {
        "type": "boolean",
        "label": "_compute_is_manager"
      },
      "rule_ids": {
        "type": "many2many",
        "label": "hr.attendance.overtime.rule"
      }
    }
  },
  {
    "_name": "hr.attendance.overtime.rule",
    "_description": "Overtime Rule",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "description": {
        "type": "html",
        "label": "description"
      },
      "base_off": {
        "type": "selection",
        "label": "base_off"
      },
      "timing_type": {
        "type": "selection",
        "label": "timing_type"
      },
      "timing_start": {
        "type": "float",
        "label": "From"
      },
      "timing_stop": {
        "type": "float",
        "label": "To"
      },
      "expected_hours_from_contract": {
        "type": "boolean",
        "label": "expected_hours_from_contract"
      },
      "resource_calendar_id": {
        "type": "many2one",
        "label": "resource_calendar_id"
      },
      "expected_hours": {
        "type": "float",
        "label": "Usual work hours"
      },
      "quantity_period": {
        "type": "selection",
        "label": "quantity_period"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "ruleset_id": {
        "type": "many2one",
        "label": "hr.attendance.overtime.ruleset",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "ruleset_id.company_id"
      },
      "paid": {
        "type": "boolean",
        "label": "Pay Extra Hours"
      },
      "amount_rate": {
        "type": "float",
        "label": "Rate"
      },
      "employee_tolerance": {
        "type": "float",
        "label": "employee_tolerance"
      },
      "employer_tolerance": {
        "type": "float",
        "label": "employer_tolerance"
      },
      "information_display": {
        "type": "char",
        "label": "Information"
      }
    }
  },
  {
    "_name": "hr.attendance.overtime.ruleset",
    "_description": "Overtime Ruleset",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "description": {
        "type": "html",
        "label": "description"
      },
      "rule_ids": {
        "type": "one2many",
        "label": "hr.attendance.overtime.rule"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "country_id": {
        "type": "many2one",
        "label": "country_id"
      },
      "rate_combination_mode": {
        "type": "selection",
        "label": "rate_combination_mode"
      },
      "rules_count": {
        "type": "integer",
        "label": "_compute_rules_count"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      }
    }
  },
  {
    "_name": "hremployee",
    "_description": "hremployee",
    "_auto": true,
    "_fields": {
      "attendance_manager_id": {
        "type": "many2one",
        "label": "attendance_manager_id"
      },
      "attendance_ids": {
        "type": "one2many",
        "label": "attendance_ids"
      },
      "last_attendance_id": {
        "type": "many2one",
        "label": "last_attendance_id"
      },
      "last_check_in": {
        "type": "datetime",
        "label": "last_check_in"
      },
      "last_check_out": {
        "type": "datetime",
        "label": "last_check_out"
      },
      "attendance_state": {
        "type": "selection",
        "label": "attendance_state"
      },
      "hours_last_month": {
        "type": "float",
        "label": "_compute_hours_last_month"
      },
      "hours_last_month_overtime": {
        "type": "float",
        "label": "_compute_hours_last_month"
      },
      "hours_today": {
        "type": "float",
        "label": "hours_today"
      },
      "hours_previously_today": {
        "type": "float",
        "label": "hours_previously_today"
      },
      "last_attendance_worked_hours": {
        "type": "float",
        "label": "last_attendance_worked_hours"
      },
      "hours_last_month_display": {
        "type": "char",
        "label": "hours_last_month_display"
      },
      "overtime_ids": {
        "type": "one2many",
        "label": "overtime_ids"
      },
      "total_overtime": {
        "type": "float",
        "label": "_compute_total_overtime"
      },
      "display_extra_hours": {
        "type": "boolean",
        "label": "company_id.hr_attendance_display_overtime"
      },
      "ruleset_id": {
        "type": "many2one",
        "label": "version_id.ruleset_id"
      }
    },
    "_inherit": "hr.employee"
  },
  {
    "_name": "hremployeepublic",
    "_description": "hremployeepublic",
    "_auto": true,
    "_fields": {
      "attendance_state": {
        "type": "selection",
        "label": "employee_id.attendance_state"
      },
      "hours_today": {
        "type": "float",
        "label": "employee_id.hours_today"
      },
      "hours_last_month": {
        "type": "float",
        "label": "employee_id.hours_last_month"
      },
      "hours_last_month_overtime": {
        "type": "float",
        "label": "employee_id.hours_last_month_overtime"
      },
      "last_attendance_id": {
        "type": "many2one",
        "label": "employee_id.last_attendance_id"
      },
      "total_overtime": {
        "type": "float",
        "label": "employee_id.total_overtime"
      },
      "attendance_manager_id": {
        "type": "many2one",
        "label": "employee_id.attendance_manager_id"
      },
      "last_check_in": {
        "type": "datetime",
        "label": "employee_id.last_check_in"
      },
      "last_check_out": {
        "type": "datetime",
        "label": "employee_id.last_check_out"
      },
      "display_extra_hours": {
        "type": "boolean",
        "label": "company_id.hr_attendance_display_overtime"
      }
    },
    "_inherit": "hr.employee.public"
  },
  {
    "_name": "hr.version",
    "_description": "hr.version",
    "_auto": true,
    "_fields": {
      "ruleset_id": {
        "type": "many2one",
        "label": "ruleset_id"
      }
    },
    "_inherit": "hr.version"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "overtime_company_threshold": {
        "type": "integer",
        "label": "Tolerance Time In Favor Of Company"
      },
      "overtime_employee_threshold": {
        "type": "integer",
        "label": "Tolerance Time In Favor Of Employee"
      },
      "hr_attendance_display_overtime": {
        "type": "boolean",
        "label": "Display Extra Hours"
      },
      "attendance_kiosk_mode": {
        "type": "selection",
        "label": "attendance_kiosk_mode"
      },
      "attendance_barcode_source": {
        "type": "selection",
        "label": "attendance_barcode_source"
      },
      "attendance_kiosk_delay": {
        "type": "integer",
        "label": "attendance_kiosk_delay"
      },
      "attendance_kiosk_key": {
        "type": "char",
        "label": "hr_attendance.group_hr_attendance_user"
      },
      "attendance_kiosk_url": {
        "type": "char",
        "label": "_compute_attendance_kiosk_url"
      },
      "attendance_kiosk_use_pin": {
        "type": "boolean",
        "label": "Employee PIN Identification"
      },
      "attendance_from_systray": {
        "type": "boolean",
        "label": "Attendance From Systray",
        "default": false
      },
      "attendance_overtime_validation": {
        "type": "selection",
        "label": "attendance_overtime_validation"
      },
      "auto_check_out": {
        "type": "boolean",
        "label": "Automatic Check Out",
        "default": false
      },
      "auto_check_out_tolerance": {
        "type": "float",
        "label": "auto_check_out_tolerance"
      },
      "absence_management": {
        "type": "boolean",
        "label": "Absence Management",
        "default": false
      },
      "attendance_device_tracking": {
        "type": "boolean",
        "label": "Device & Location Tracking",
        "default": false
      }
    },
    "_inherit": "res.company"
  }
];
