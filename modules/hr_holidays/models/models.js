// Odoo 模块: hr_holidays
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hrdepartment",
    "_description": "hrdepartment",
    "_auto": true,
    "_fields": {
      "absence_of_today": {
        "type": "integer",
        "label": "absence_of_today"
      },
      "leave_to_approve_count": {
        "type": "integer",
        "label": "leave_to_approve_count"
      },
      "allocation_to_approve_count": {
        "type": "integer",
        "label": "allocation_to_approve_count"
      }
    },
    "_inherit": "hr.department"
  },
  {
    "_name": "hremployee",
    "_description": "hremployee",
    "_auto": true,
    "_fields": {
      "leave_manager_id": {
        "type": "many2one",
        "label": "leave_manager_id"
      },
      "current_leave_id": {
        "type": "many2one",
        "label": "hr.leave.type"
      },
      "current_leave_state": {
        "type": "selection",
        "label": "_compute_leave_status"
      },
      "leave_date_from": {
        "type": "date",
        "label": "From Date"
      },
      "leave_date_to": {
        "type": "date",
        "label": "To Date"
      },
      "allocation_count": {
        "type": "float",
        "label": "Total number of days allocated."
      },
      "allocations_count": {
        "type": "integer",
        "label": "Total number of allocations"
      },
      "show_leaves": {
        "type": "boolean",
        "label": "Able to see Remaining Time Off"
      },
      "is_absent": {
        "type": "boolean",
        "label": "Absent Today"
      },
      "allocation_display": {
        "type": "char",
        "label": "_compute_allocation_remaining_display"
      },
      "allocation_remaining_display": {
        "type": "char",
        "label": "_compute_allocation_remaining_display"
      },
      "hr_icon_display": {
        "type": "selection",
        "label": "hr_icon_display"
      }
    },
    "_inherit": "hr.employee"
  },
  {
    "_name": "hremployeepublic",
    "_description": "hremployeepublic",
    "_auto": true,
    "_fields": {
      "leave_manager_id": {
        "type": "many2one",
        "label": "leave_manager_id"
      },
      "leave_date_to": {
        "type": "date",
        "label": "To Date"
      },
      "show_leaves": {
        "type": "boolean",
        "label": "Able to see Remaining Time Off"
      },
      "is_absent": {
        "type": "boolean",
        "label": "Absent Today"
      },
      "allocation_display": {
        "type": "char",
        "label": "_compute_allocation_display"
      },
      "allocation_remaining_display": {
        "type": "char",
        "label": "employee_id.allocation_remaining_display"
      }
    },
    "_inherit": "hr.employee.public"
  },
  {
    "_name": "hr.leave",
    "_description": "Time Off",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Description"
      },
      "private_name": {
        "type": "char",
        "label": "Time Off Description"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "holiday_status_id": {
        "type": "many2one",
        "label": "holiday_status_id"
      },
      "holiday_status_requires_allocation": {
        "type": "boolean",
        "label": "holiday_status_id.requires_allocation"
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "validation_type": {
        "type": "selection",
        "label": "Validation Type"
      },
      "employee_id": {
        "type": "many2one",
        "label": "employee_id"
      },
      "employee_company_id": {
        "type": "many2one",
        "label": "employee_id.company_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "active_employee": {
        "type": "boolean",
        "label": "employee_id.active"
      },
      "tz_mismatch": {
        "type": "boolean",
        "label": "_compute_tz_mismatch"
      },
      "tz": {
        "type": "selection",
        "label": "_compute_tz"
      },
      "department_id": {
        "type": "many2one",
        "label": "department_id"
      },
      "notes": {
        "type": "text",
        "label": "Reasons"
      },
      "resource_calendar_id": {
        "type": "many2one",
        "label": "resource.calendar"
      },
      "max_leaves": {
        "type": "float",
        "label": "_compute_leaves"
      },
      "virtual_remaining_leaves": {
        "type": "float",
        "label": "_compute_leaves"
      },
      "date_from": {
        "type": "datetime",
        "label": "date_from"
      },
      "date_to": {
        "type": "datetime",
        "label": "date_to"
      },
      "number_of_days": {
        "type": "float",
        "label": "number_of_days"
      },
      "number_of_hours": {
        "type": "float",
        "label": "number_of_hours"
      },
      "last_several_days": {
        "type": "boolean",
        "label": "All day"
      },
      "duration_display": {
        "type": "char",
        "label": "Requested"
      },
      "meeting_id": {
        "type": "many2one",
        "label": "calendar.event"
      },
      "first_approver_id": {
        "type": "many2one",
        "label": "first_approver_id"
      },
      "second_approver_id": {
        "type": "many2one",
        "label": "second_approver_id"
      },
      "can_approve": {
        "type": "boolean",
        "label": "_compute_can_approve"
      },
      "can_validate": {
        "type": "boolean",
        "label": "_compute_can_validate"
      },
      "can_refuse": {
        "type": "boolean",
        "label": "_compute_can_refuse"
      },
      "can_cancel": {
        "type": "boolean",
        "label": "_compute_can_cancel"
      },
      "can_back_to_approve": {
        "type": "boolean",
        "label": "_compute_can_back_to_approve"
      },
      "attachment_ids": {
        "type": "one2many",
        "label": "ir.attachment"
      },
      "supported_attachment_ids": {
        "type": "many2many",
        "label": "supported_attachment_ids"
      },
      "supported_attachment_ids_count": {
        "type": "integer",
        "label": "_compute_supported_attachment_ids"
      },
      "leave_type_request_unit": {
        "type": "selection",
        "label": "holiday_status_id.request_unit"
      },
      "leave_type_support_document": {
        "type": "boolean",
        "label": "holiday_status_id.support_document"
      },
      "request_date_from": {
        "type": "date",
        "label": "Request Start Date"
      },
      "request_date_to": {
        "type": "date",
        "label": "Request End Date"
      },
      "request_hour_from": {
        "type": "float",
        "label": "Hour from"
      },
      "request_hour_to": {
        "type": "float",
        "label": "Hour to"
      },
      "request_date_from_period": {
        "type": "selection",
        "label": "request_date_from_period"
      },
      "request_date_to_period": {
        "type": "selection",
        "label": "request_date_to_period"
      },
      "request_unit_half": {
        "type": "boolean",
        "label": "Half-Day"
      },
      "request_unit_hours": {
        "type": "boolean",
        "label": "Specific Time"
      },
      "is_hatched": {
        "type": "boolean",
        "label": "Hatched"
      },
      "is_striked": {
        "type": "boolean",
        "label": "Striked"
      },
      "has_mandatory_day": {
        "type": "boolean",
        "label": "_compute_has_mandatory_day"
      },
      "leave_type_increases_duration": {
        "type": "char",
        "label": "_compute_leave_type_increases_duration"
      },
      "dashboard_warning_message": {
        "type": "char",
        "label": "_compute_dashboard_warning_message"
      }
    }
  },
  {
    "_name": "hr.leave.accrual.plan",
    "_description": "Accrual Plan",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "time_off_type_id": {
        "type": "many2one",
        "label": "hr.leave.type"
      },
      "employees_count": {
        "type": "integer",
        "label": "Employees"
      },
      "level_ids": {
        "type": "one2many",
        "label": "hr.leave.accrual.level"
      },
      "allocation_ids": {
        "type": "one2many",
        "label": "hr.leave.allocation"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "transition_mode": {
        "type": "selection",
        "label": "transition_mode"
      },
      "show_transition_mode": {
        "type": "boolean",
        "label": "_compute_show_transition_mode"
      },
      "is_based_on_worked_time": {
        "type": "boolean",
        "label": "_compute_is_based_on_worked_time"
      },
      "accrued_gain_time": {
        "type": "selection",
        "label": "accrued_gain_time"
      },
      "can_be_carryover": {
        "type": "boolean",
        "label": "can_be_carryover"
      },
      "carryover_date": {
        "type": "selection",
        "label": "carryover_date"
      },
      "carryover_day": {
        "type": "selection",
        "label": "carryover_day"
      },
      "carryover_month": {
        "type": "selection",
        "label": "carryover_month"
      },
      "added_value_type": {
        "type": "selection",
        "label": "day"
      },
      "level_count": {
        "type": "integer",
        "label": "Levels"
      }
    }
  },
  {
    "_name": "hr.leave.accrual.level",
    "_description": "Accrual Plan Level",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "accrual_plan_id": {
        "type": "many2one",
        "label": "hr.leave.accrual.plan",
        "required": true
      },
      "accrued_gain_time": {
        "type": "selection",
        "label": "accrual_plan_id.accrued_gain_time"
      },
      "start_count": {
        "type": "integer",
        "label": "start_count"
      },
      "start_type": {
        "type": "selection",
        "label": "start_type"
      },
      "milestone_date": {
        "type": "selection",
        "label": "milestone_date"
      },
      "added_value": {
        "type": "float",
        "label": "added_value",
        "required": true
      },
      "added_value_type": {
        "type": "selection",
        "label": "added_value_type"
      },
      "frequency": {
        "type": "selection",
        "label": "frequency"
      },
      "week_day": {
        "type": "selection",
        "label": "week_day"
      },
      "first_day": {
        "type": "selection",
        "label": "1",
        "default": "1"
      },
      "second_day": {
        "type": "selection",
        "label": "15",
        "default": "15"
      },
      "first_month_day": {
        "type": "selection",
        "label": "first_month_day"
      },
      "first_month": {
        "type": "selection",
        "label": "first_month"
      },
      "second_month_day": {
        "type": "selection",
        "label": "second_month_day"
      },
      "second_month": {
        "type": "selection",
        "label": "second_month"
      },
      "yearly_month": {
        "type": "selection",
        "label": "yearly_month"
      },
      "yearly_day": {
        "type": "selection",
        "label": "yearly_day"
      },
      "cap_accrued_time": {
        "type": "boolean",
        "label": "cap_accrued_time"
      },
      "maximum_leave": {
        "type": "float",
        "label": "maximum_leave"
      },
      "cap_accrued_time_yearly": {
        "type": "boolean",
        "label": "cap_accrued_time_yearly"
      },
      "maximum_leave_yearly": {
        "type": "float",
        "label": "maximum_leave_yearly"
      },
      "can_be_carryover": {
        "type": "boolean",
        "label": "accrual_plan_id.can_be_carryover"
      },
      "action_with_unused_accruals": {
        "type": "selection",
        "label": "action_with_unused_accruals"
      },
      "carryover_options": {
        "type": "selection",
        "label": "carryover_options"
      },
      "postpone_max_days": {
        "type": "integer",
        "label": "postpone_max_days"
      },
      "can_modify_value_type": {
        "type": "boolean",
        "label": "_compute_can_modify_value_type",
        "default": false
      },
      "accrual_validity": {
        "type": "boolean",
        "label": "_compute_accrual_validity"
      },
      "accrual_validity_count": {
        "type": "integer",
        "label": "accrual_validity_count"
      },
      "accrual_validity_type": {
        "type": "selection",
        "label": "accrual_validity_type"
      }
    }
  },
  {
    "_name": "hr.leave.allocation",
    "_description": "Time Off Allocation",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "is_name_custom": {
        "type": "boolean",
        "label": "is_name_custom"
      },
      "name_validity": {
        "type": "char",
        "label": "Description with validity"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "date_from": {
        "type": "date",
        "label": "Start Date"
      },
      "date_to": {
        "type": "date",
        "label": "End Date"
      },
      "holiday_status_id": {
        "type": "many2one",
        "label": "holiday_status_id"
      },
      "employee_id": {
        "type": "many2one",
        "label": "employee_id"
      },
      "employee_company_id": {
        "type": "many2one",
        "label": "employee_id.company_id"
      },
      "active_employee": {
        "type": "boolean",
        "label": "Active Employee"
      },
      "manager_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "notes": {
        "type": "text",
        "label": "Reasons"
      },
      "number_of_days": {
        "type": "float",
        "label": "number_of_days"
      },
      "number_of_days_display": {
        "type": "float",
        "label": "number_of_days_display"
      },
      "number_of_hours_display": {
        "type": "float",
        "label": "number_of_hours_display"
      },
      "duration_display": {
        "type": "char",
        "label": "Allocated (Days/Hours)"
      },
      "last_executed_carryover_date": {
        "type": "date",
        "label": "last_executed_carryover_date"
      },
      "approver_id": {
        "type": "many2one",
        "label": "approver_id"
      },
      "second_approver_id": {
        "type": "many2one",
        "label": "second_approver_id"
      },
      "validation_type": {
        "type": "selection",
        "label": "Validation Type"
      },
      "can_approve": {
        "type": "boolean",
        "label": "Can Approve"
      },
      "can_validate": {
        "type": "boolean",
        "label": "Can Validate"
      },
      "can_refuse": {
        "type": "boolean",
        "label": "Can Refuse"
      },
      "type_request_unit": {
        "type": "selection",
        "label": "type_request_unit"
      },
      "department_id": {
        "type": "many2one",
        "label": "hr.department"
      },
      "lastcall": {
        "type": "date",
        "label": "Date of the last accrual allocation"
      },
      "actual_lastcall": {
        "type": "date",
        "label": "actual_lastcall"
      },
      "nextcall": {
        "type": "date",
        "label": "Date of the next accrual allocation",
        "default": false
      },
      "already_accrued": {
        "type": "boolean",
        "label": "already_accrued"
      },
      "yearly_accrued_amount": {
        "type": "float",
        "label": "yearly_accrued_amount"
      },
      "allocation_type": {
        "type": "selection",
        "label": "allocation_type"
      },
      "is_officer": {
        "type": "boolean",
        "label": "_compute_is_officer"
      },
      "accrual_plan_id": {
        "type": "many2one",
        "label": "hr.leave.accrual.plan"
      },
      "max_leaves": {
        "type": "float",
        "label": "_compute_leaves"
      },
      "leaves_taken": {
        "type": "float",
        "label": "_compute_leaves"
      },
      "virtual_remaining_leaves": {
        "type": "float",
        "label": "_compute_leaves"
      },
      "expiring_carryover_days": {
        "type": "float",
        "label": "The number of carried over days that will expire on carried_over_days_expiration_date"
      },
      "carried_over_days_expiration_date": {
        "type": "date",
        "label": "Carried over days expiration date"
      }
    }
  },
  {
    "_name": "hr.leave.mandatory.day",
    "_description": "Mandatory Day",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "start_date": {
        "type": "date",
        "label": "start_date",
        "required": true
      },
      "end_date": {
        "type": "date",
        "label": "end_date",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "color"
      },
      "resource_calendar_id": {
        "type": "many2one",
        "label": "resource_calendar_id"
      },
      "department_ids": {
        "type": "many2many",
        "label": "hr.department"
      },
      "job_ids": {
        "type": "many2many",
        "label": "hr.job"
      }
    }
  },
  {
    "_name": "hr.leave.type",
    "_description": "Time Off Type",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Time Off Type",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "create_calendar_meeting": {
        "type": "boolean",
        "label": "Display Time Off in Calendar",
        "default": true
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "icon_id": {
        "type": "many2one",
        "label": "ir.attachment"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "hide_on_dashboard": {
        "type": "boolean",
        "label": "Hide On Dashboard",
        "default": false
      },
      "max_leaves": {
        "type": "float",
        "label": "_compute_leaves"
      },
      "leaves_taken": {
        "type": "float",
        "label": "leaves_taken"
      },
      "virtual_remaining_leaves": {
        "type": "float",
        "label": "virtual_remaining_leaves"
      },
      "allocation_count": {
        "type": "integer",
        "label": "allocation_count"
      },
      "group_days_leave": {
        "type": "float",
        "label": "group_days_leave"
      },
      "is_used": {
        "type": "boolean",
        "label": "_compute_is_used"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "country_id": {
        "type": "many2one",
        "label": "res.country"
      },
      "country_code": {
        "type": "char",
        "label": "country_id.code"
      },
      "responsible_ids": {
        "type": "many2many",
        "label": "responsible_ids"
      },
      "leave_validation_type": {
        "type": "selection",
        "label": "leave_validation_type"
      },
      "requires_allocation": {
        "type": "boolean",
        "label": "Requires allocation",
        "required": true,
        "default": true
      },
      "employee_requests": {
        "type": "boolean",
        "label": "Allow Employee Requests",
        "required": true,
        "default": false
      },
      "allocation_validation_type": {
        "type": "selection",
        "label": "allocation_validation_type"
      },
      "has_valid_allocation": {
        "type": "boolean",
        "label": "_compute_valid"
      },
      "time_type": {
        "type": "selection",
        "label": "other",
        "default": "leave"
      },
      "request_unit": {
        "type": "selection",
        "label": "request_unit"
      },
      "unpaid": {
        "type": "boolean",
        "label": "Is Unpaid",
        "default": false
      },
      "include_public_holidays_in_duration": {
        "type": "boolean",
        "label": "Ignore Public Holidays",
        "default": false
      },
      "leave_notif_subtype_id": {
        "type": "many2one",
        "label": "mail.message.subtype"
      },
      "allocation_notif_subtype_id": {
        "type": "many2one",
        "label": "mail.message.subtype"
      },
      "support_document": {
        "type": "boolean",
        "label": "Supporting Document"
      },
      "allow_request_on_top": {
        "type": "boolean",
        "label": "Allow Request on Top",
        "default": false
      },
      "elligible_for_accrual_rate": {
        "type": "boolean",
        "label": "Eligible for Accrual Rate"
      },
      "accruals_ids": {
        "type": "one2many",
        "label": "hr.leave.accrual.plan"
      },
      "accrual_count": {
        "type": "float",
        "label": "_compute_accrual_count"
      },
      "allows_negative": {
        "type": "boolean",
        "label": "Allow Negative Cap"
      },
      "max_allowed_negative": {
        "type": "integer",
        "label": "Maximum Excess Amount"
      }
    }
  },
  {
    "_name": "resourcecalendarleaves",
    "_description": "resourcecalendarleaves",
    "_auto": true,
    "_fields": {
      "holiday_id": {
        "type": "many2one",
        "label": "hr.leave"
      },
      "elligible_for_accrual_rate": {
        "type": "boolean",
        "label": "Eligible for Accrual Rate",
        "default": false
      }
    },
    "_inherit": "resource.calendar.leaves"
  },
  {
    "_name": "resourcecalendar",
    "_description": "resourcecalendar",
    "_auto": true,
    "_fields": {
      "associated_leaves_count": {
        "type": "integer",
        "label": "Time Off Count"
      }
    },
    "_inherit": "resource.calendar"
  },
  {
    "_name": "resourceresource",
    "_description": "resourceresource",
    "_auto": true,
    "_fields": {
      "leave_date_to": {
        "type": "date",
        "label": "user_id.leave_date_to"
      }
    },
    "_inherit": "resource.resource"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "leave_date_to": {
        "type": "date",
        "label": "_compute_leave_date_to"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "leave_date_to": {
        "type": "date",
        "label": "employee_id.leave_date_to"
      }
    },
    "_inherit": "res.users"
  }
];
