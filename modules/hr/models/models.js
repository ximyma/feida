// Odoo 模块: hr
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "discusschannel",
    "_description": "discusschannel",
    "_auto": true,
    "_fields": {
      "subscription_department_ids": {
        "type": "many2many",
        "label": "subscription_department_ids"
      }
    },
    "_inherit": "discuss.channel"
  },
  {
    "_name": "hr.contract.type",
    "_description": "Contract Type",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "code": {
        "type": "char",
        "label": "_compute_code"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "country_id": {
        "type": "many2one",
        "label": "res.country"
      }
    }
  },
  {
    "_name": "hr.department",
    "_description": "Department",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Department Name",
        "required": true
      },
      "complete_name": {
        "type": "char",
        "label": "Complete Name"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "parent_id": {
        "type": "many2one",
        "label": "hr.department"
      },
      "child_ids": {
        "type": "one2many",
        "label": "hr.department"
      },
      "manager_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "member_ids": {
        "type": "one2many",
        "label": "hr.employee"
      },
      "has_read_access": {
        "type": "boolean",
        "label": "_search_has_read_access"
      },
      "total_employee": {
        "type": "integer",
        "label": "_compute_total_employee"
      },
      "jobs_ids": {
        "type": "one2many",
        "label": "hr.job"
      },
      "plan_ids": {
        "type": "one2many",
        "label": "mail.activity.plan"
      },
      "plans_count": {
        "type": "integer",
        "label": "_compute_plan_count"
      },
      "note": {
        "type": "text",
        "label": "Note"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "parent_path": {
        "type": "char",
        "label": "parent_path"
      },
      "master_department_id": {
        "type": "many2one",
        "label": "master_department_id"
      }
    }
  },
  {
    "_name": "hr.departure.reason",
    "_description": "Departure Reason",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "name": {
        "type": "char",
        "label": "Reason",
        "required": true
      },
      "country_id": {
        "type": "many2one",
        "label": "res.country"
      },
      "country_code": {
        "type": "char",
        "label": "country_id.code"
      }
    }
  },
  {
    "_name": "hr.employee",
    "_description": "Employee",
    "_auto": true,
    "_fields": {
      "version_id": {
        "type": "many2one",
        "label": "version_id"
      },
      "current_version_id": {
        "type": "many2one",
        "label": "current_version_id"
      },
      "current_date_version": {
        "type": "date",
        "label": "current_date_version"
      },
      "version_ids": {
        "type": "one2many",
        "label": "version_ids"
      },
      "versions_count": {
        "type": "integer",
        "label": "_compute_versions_count"
      },
      "name": {
        "type": "char",
        "label": "Employee Name"
      },
      "resource_id": {
        "type": "many2one",
        "label": "resource.resource",
        "required": true
      },
      "resource_calendar_id": {
        "type": "many2one",
        "label": "version_id.resource_calendar_id"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "user_partner_id": {
        "type": "many2one",
        "label": "user_id.partner_id"
      },
      "share": {
        "type": "boolean",
        "label": "user_id.share"
      },
      "phone": {
        "type": "char",
        "label": "user_id.phone"
      },
      "im_status": {
        "type": "char",
        "label": "user_id.im_status"
      },
      "email": {
        "type": "char",
        "label": "user_id.email"
      },
      "hr_presence_state": {
        "type": "selection",
        "label": "hr_presence_state"
      },
      "last_activity": {
        "type": "date",
        "label": "_compute_last_activity"
      },
      "last_activity_time": {
        "type": "char",
        "label": "_compute_last_activity"
      },
      "hr_icon_display": {
        "type": "selection",
        "label": "hr_icon_display"
      },
      "show_hr_icon_display": {
        "type": "boolean",
        "label": "_compute_presence_icon"
      },
      "newly_hired": {
        "type": "boolean",
        "label": "Newly Hired"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "company_country_id": {
        "type": "many2one",
        "label": "res.country"
      },
      "company_country_code": {
        "type": "char",
        "label": "company_country_id.code"
      },
      "work_phone": {
        "type": "char",
        "label": "Work Phone"
      },
      "mobile_phone": {
        "type": "char",
        "label": "Work Mobile"
      },
      "work_email": {
        "type": "char",
        "label": "Work Email"
      },
      "work_contact_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "legal_name": {
        "type": "char",
        "label": "_compute_legal_name"
      },
      "is_user_active": {
        "type": "boolean",
        "label": "user_id.active"
      },
      "private_phone": {
        "type": "char",
        "label": "Private Phone"
      },
      "private_email": {
        "type": "char",
        "label": "Private Email"
      },
      "lang": {
        "type": "selection",
        "label": "Lang"
      },
      "place_of_birth": {
        "type": "char",
        "label": "Place of Birth"
      },
      "country_of_birth": {
        "type": "many2one",
        "label": "res.country"
      },
      "birthday": {
        "type": "date",
        "label": "Birthday"
      },
      "birthday_public_display": {
        "type": "boolean",
        "label": "Show to all employees",
        "default": false
      },
      "birthday_public_display_string": {
        "type": "char",
        "label": "Public Date of Birth",
        "default": "hidden"
      },
      "bank_account_ids": {
        "type": "many2many",
        "label": "bank_account_ids"
      },
      "is_trusted_bank_account": {
        "type": "boolean",
        "label": "_compute_is_trusted_bank_account"
      },
      "primary_bank_account_id": {
        "type": "many2one",
        "label": "res.partner.bank"
      },
      "has_multiple_bank_accounts": {
        "type": "boolean",
        "label": "_compute_has_multiple_bank_accounts",
        "default": false
      },
      "salary_distribution": {
        "type": "char",
        "label": "Salary Distribution"
      },
      "permit_no": {
        "type": "char",
        "label": "Work Permit No"
      },
      "visa_no": {
        "type": "char",
        "label": "Visa No"
      },
      "visa_expire": {
        "type": "date",
        "label": "Visa Expiration Date"
      },
      "work_permit_expiration_date": {
        "type": "date",
        "label": "Work Permit Expiration Date"
      },
      "has_work_permit": {
        "type": "text",
        "label": "Work Permit"
      },
      "work_permit_scheduled_activity": {
        "type": "boolean",
        "label": "hr.group_hr_user",
        "default": false
      },
      "work_permit_name": {
        "type": "char",
        "label": "work_permit_name"
      },
      "certificate": {
        "type": "selection",
        "label": "_get_certificate_selection"
      },
      "study_field": {
        "type": "char",
        "label": "Field of Study"
      },
      "study_school": {
        "type": "char",
        "label": "School"
      },
      "emergency_contact": {
        "type": "char",
        "label": "hr.group_hr_user"
      },
      "emergency_phone": {
        "type": "char",
        "label": "hr.group_hr_user"
      },
      "work_location_name": {
        "type": "char",
        "label": "Work Location Name"
      },
      "work_location_type": {
        "type": "selection",
        "label": "work_location_type"
      },
      "contract_date_start": {
        "type": "date",
        "label": "version_id.contract_date_start"
      },
      "contract_date_end": {
        "type": "date",
        "label": "version_id.contract_date_end"
      },
      "trial_date_end": {
        "type": "date",
        "label": "version_id.trial_date_end"
      },
      "contract_wage": {
        "type": "monetary",
        "label": "version_id.contract_wage"
      },
      "date_start": {
        "type": "date",
        "label": "version_id.date_start"
      },
      "date_end": {
        "type": "date",
        "label": "version_id.date_end"
      },
      "is_current": {
        "type": "boolean",
        "label": "version_id.is_current"
      },
      "is_past": {
        "type": "boolean",
        "label": "version_id.is_past"
      },
      "is_future": {
        "type": "boolean",
        "label": "version_id.is_future"
      },
      "is_in_contract": {
        "type": "boolean",
        "label": "version_id.is_in_contract"
      },
      "structure_type_id": {
        "type": "many2one",
        "label": "version_id.structure_type_id"
      },
      "contract_type_id": {
        "type": "many2one",
        "label": "version_id.contract_type_id"
      },
      "parent_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "child_ids": {
        "type": "one2many",
        "label": "hr.employee"
      },
      "coach_id": {
        "type": "many2one",
        "label": "coach_id"
      },
      "category_ids": {
        "type": "many2many",
        "label": "category_ids"
      },
      "tz": {
        "type": "selection",
        "label": "tz"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "barcode": {
        "type": "char",
        "label": "Badge ID"
      },
      "pin": {
        "type": "char",
        "label": "PIN"
      },
      "message_main_attachment_id": {
        "type": "many2one",
        "label": "hr.group_hr_user"
      },
      "id_card": {
        "type": "text",
        "label": "ID Card Copy"
      },
      "driving_license": {
        "type": "text",
        "label": "Driving License"
      },
      "private_car_plate": {
        "type": "char",
        "label": "hr.group_hr_user"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "related_partners_count": {
        "type": "integer",
        "label": "_compute_related_partners_count"
      },
      "employee_properties": {
        "type": "char",
        "label": "Properties"
      },
      "activity_ids": {
        "type": "one2many",
        "label": "hr.group_hr_user"
      },
      "activity_state": {
        "type": "selection",
        "label": "hr.group_hr_user"
      },
      "activity_user_id": {
        "type": "many2one",
        "label": "hr.group_hr_user"
      },
      "activity_type_id": {
        "type": "many2one",
        "label": "hr.group_hr_user"
      },
      "activity_type_icon": {
        "type": "char",
        "label": "hr.group_hr_user"
      },
      "activity_date_deadline": {
        "type": "date",
        "label": "hr.group_hr_user"
      },
      "my_activity_date_deadline": {
        "type": "date",
        "label": "hr.group_hr_user"
      },
      "activity_summary": {
        "type": "char",
        "label": "hr.group_hr_user"
      },
      "activity_exception_decoration": {
        "type": "selection",
        "label": "hr.group_hr_user"
      },
      "activity_exception_icon": {
        "type": "char",
        "label": "hr.group_hr_user"
      },
      "message_is_follower": {
        "type": "boolean",
        "label": "hr.group_hr_user"
      },
      "message_follower_ids": {
        "type": "one2many",
        "label": "hr.group_hr_user"
      },
      "message_partner_ids": {
        "type": "many2many",
        "label": "hr.group_hr_user"
      },
      "message_ids": {
        "type": "one2many",
        "label": "hr.group_hr_user"
      },
      "has_message": {
        "type": "boolean",
        "label": "hr.group_hr_user"
      },
      "message_needaction": {
        "type": "boolean",
        "label": "hr.group_hr_user"
      },
      "message_needaction_counter": {
        "type": "integer",
        "label": "hr.group_hr_user"
      },
      "message_has_error": {
        "type": "boolean",
        "label": "hr.group_hr_user"
      },
      "message_has_error_counter": {
        "type": "integer",
        "label": "hr.group_hr_user"
      },
      "message_attachment_count": {
        "type": "integer",
        "label": "hr.group_hr_user"
      }
    }
  },
  {
    "_name": "hr.employee.category",
    "_description": "Employee Category",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Tag Name",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "employee_ids": {
        "type": "many2many",
        "label": "hr.employee"
      }
    }
  },
  {
    "_name": "hr.employee.public",
    "_description": "Public Employee",
    "_auto": true,
    "_fields": {
      "create_date": {
        "type": "datetime",
        "label": "create_date"
      },
      "name": {
        "type": "char",
        "label": "name"
      },
      "active": {
        "type": "boolean",
        "label": "active"
      },
      "department_id": {
        "type": "many2one",
        "label": "hr.department"
      },
      "member_of_department": {
        "type": "boolean",
        "label": "_compute_member_of_department"
      },
      "job_id": {
        "type": "many2one",
        "label": "hr.job"
      },
      "job_title": {
        "type": "char",
        "label": "employee_id.job_title"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "address_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "mobile_phone": {
        "type": "char",
        "label": "mobile_phone"
      },
      "work_phone": {
        "type": "char",
        "label": "work_phone"
      },
      "work_email": {
        "type": "char",
        "label": "work_email"
      },
      "share": {
        "type": "boolean",
        "label": "employee_id.share"
      },
      "phone": {
        "type": "char",
        "label": "employee_id.phone"
      },
      "im_status": {
        "type": "char",
        "label": "employee_id.im_status"
      },
      "email": {
        "type": "char",
        "label": "employee_id.email"
      },
      "work_contact_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "work_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "work_location_name": {
        "type": "char",
        "label": "employee_id.work_location_name"
      },
      "work_location_type": {
        "type": "selection",
        "label": "employee_id.work_location_type"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "resource_id": {
        "type": "many2one",
        "label": "resource.resource"
      },
      "tz": {
        "type": "selection",
        "label": "resource_id.tz"
      },
      "color": {
        "type": "integer",
        "label": "color"
      },
      "hr_presence_state": {
        "type": "selection",
        "label": "hr_presence_state"
      },
      "hr_icon_display": {
        "type": "selection",
        "label": "hr_icon_display"
      },
      "show_hr_icon_display": {
        "type": "boolean",
        "label": "_compute_presence_icon"
      },
      "last_activity": {
        "type": "date",
        "label": "_compute_last_activity"
      },
      "last_activity_time": {
        "type": "char",
        "label": "_compute_last_activity"
      },
      "resource_calendar_id": {
        "type": "many2one",
        "label": "resource.calendar"
      },
      "country_code": {
        "type": "char",
        "label": "_compute_country_code"
      },
      "is_manager": {
        "type": "boolean",
        "label": "_compute_is_manager"
      },
      "is_user": {
        "type": "boolean",
        "label": "_compute_is_user"
      },
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "child_ids": {
        "type": "one2many",
        "label": "hr.employee.public"
      },
      "image_1920": {
        "type": "text",
        "label": "Image"
      },
      "image_1024": {
        "type": "text",
        "label": "Image 1024"
      },
      "image_512": {
        "type": "text",
        "label": "Image 512"
      },
      "image_256": {
        "type": "text",
        "label": "Image 256"
      },
      "image_128": {
        "type": "text",
        "label": "Image 128"
      },
      "avatar_1920": {
        "type": "text",
        "label": "Avatar"
      },
      "avatar_1024": {
        "type": "text",
        "label": "Avatar 1024"
      },
      "avatar_512": {
        "type": "text",
        "label": "Avatar 512"
      },
      "avatar_256": {
        "type": "text",
        "label": "Avatar 256"
      },
      "avatar_128": {
        "type": "text",
        "label": "Avatar 128"
      },
      "parent_id": {
        "type": "many2one",
        "label": "hr.employee.public"
      },
      "coach_id": {
        "type": "many2one",
        "label": "hr.employee.public"
      },
      "user_partner_id": {
        "type": "many2one",
        "label": "user_id.partner_id"
      },
      "birthday_public_display_string": {
        "type": "char",
        "label": "Public Date of Birth"
      },
      "newly_hired": {
        "type": "boolean",
        "label": "Newly Hired"
      }
    }
  },
  {
    "_name": "hr.job",
    "_description": "Job Position",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "name": {
        "type": "char",
        "label": "Job Position",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "expected_employees": {
        "type": "integer",
        "label": "_compute_employees"
      },
      "no_of_employee": {
        "type": "integer",
        "label": "_compute_employees"
      },
      "no_of_recruitment": {
        "type": "integer",
        "label": "Target"
      },
      "employee_ids": {
        "type": "one2many",
        "label": "hr.employee"
      },
      "description": {
        "type": "html",
        "label": "Job Description"
      },
      "requirements": {
        "type": "text",
        "label": "Requirements"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "allowed_user_ids": {
        "type": "many2many",
        "label": "res.users"
      },
      "department_id": {
        "type": "many2one",
        "label": "hr.department"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "contract_type_id": {
        "type": "many2one",
        "label": "hr.contract.type"
      }
    }
  },
  {
    "_name": "hr.payroll.structure.type",
    "_description": "Salary Structure Type",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Salary Structure Type"
      },
      "default_resource_calendar_id": {
        "type": "many2one",
        "label": "default_resource_calendar_id"
      },
      "country_id": {
        "type": "many2one",
        "label": "country_id"
      },
      "country_code": {
        "type": "char",
        "label": "country_id.code"
      }
    }
  },
  {
    "_name": "hr.version",
    "_description": "Version",
    "_auto": true,
    "_fields": {
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "employee_id": {
        "type": "many2one",
        "label": "employee_id"
      },
      "name": {
        "type": "char",
        "label": "name"
      },
      "display_name": {
        "type": "char",
        "label": "_compute_display_name"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "date_version": {
        "type": "date",
        "label": "hr.group_hr_user",
        "required": true
      },
      "last_modified_uid": {
        "type": "many2one",
        "label": "res.users"
      },
      "last_modified_date": {
        "type": "datetime",
        "label": "Last Modified on",
        "required": true
      },
      "country_id": {
        "type": "many2one",
        "label": "country_id"
      },
      "identification_id": {
        "type": "char",
        "label": "identification_id"
      },
      "ssnid": {
        "type": "char",
        "label": "SSN No"
      },
      "passport_id": {
        "type": "char",
        "label": "Passport No"
      },
      "passport_expiration_date": {
        "type": "date",
        "label": "Passport Expiration Date"
      },
      "sex": {
        "type": "selection",
        "label": "sex"
      },
      "private_street": {
        "type": "char",
        "label": "Private Street"
      },
      "private_street2": {
        "type": "char",
        "label": "Private Street2"
      },
      "private_city": {
        "type": "char",
        "label": "Private City"
      },
      "allowed_country_state_ids": {
        "type": "many2many",
        "label": "res.country.state"
      },
      "private_state_id": {
        "type": "many2one",
        "label": "private_state_id"
      },
      "private_zip": {
        "type": "char",
        "label": "Private Zip"
      },
      "private_country_id": {
        "type": "many2one",
        "label": "res.country"
      },
      "distance_home_work": {
        "type": "integer",
        "label": "Home-Work Distance"
      },
      "km_home_work": {
        "type": "integer",
        "label": "Home-Work Distance in Km"
      },
      "distance_home_work_unit": {
        "type": "selection",
        "label": "distance_home_work_unit"
      },
      "marital": {
        "type": "selection",
        "label": "marital"
      },
      "spouse_complete_name": {
        "type": "char",
        "label": "Spouse Legal Name"
      },
      "spouse_birthdate": {
        "type": "date",
        "label": "Spouse Birthdate"
      },
      "children": {
        "type": "integer",
        "label": "Dependent Children"
      },
      "employee_type": {
        "type": "selection",
        "label": "employee_type"
      },
      "department_id": {
        "type": "many2one",
        "label": "hr.department"
      },
      "member_of_department": {
        "type": "boolean",
        "label": "Member of department"
      },
      "job_id": {
        "type": "many2one",
        "label": "hr.job"
      },
      "job_title": {
        "type": "char",
        "label": "_compute_job_title"
      },
      "is_custom_job_title": {
        "type": "boolean",
        "label": "_compute_is_custom_job_title",
        "default": false
      },
      "address_id": {
        "type": "many2one",
        "label": "address_id"
      },
      "work_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "departure_reason_id": {
        "type": "many2one",
        "label": "hr.departure.reason"
      },
      "departure_description": {
        "type": "html",
        "label": "Additional Information"
      },
      "departure_date": {
        "type": "date",
        "label": "Departure Date"
      },
      "resource_calendar_id": {
        "type": "many2one",
        "label": "resource.calendar"
      },
      "is_flexible": {
        "type": "boolean",
        "label": "_compute_is_flexible"
      },
      "is_fully_flexible": {
        "type": "boolean",
        "label": "_compute_is_flexible"
      },
      "tz": {
        "type": "selection",
        "label": "employee_id.tz"
      },
      "contract_date_start": {
        "type": "date",
        "label": "Contract Start Date"
      },
      "contract_date_end": {
        "type": "date",
        "label": "contract_date_end"
      },
      "trial_date_end": {
        "type": "date",
        "label": "End of Trial Period"
      },
      "date_start": {
        "type": "date",
        "label": "_compute_dates"
      },
      "date_end": {
        "type": "date",
        "label": "_compute_dates"
      },
      "is_current": {
        "type": "boolean",
        "label": "_compute_is_current"
      },
      "is_past": {
        "type": "boolean",
        "label": "_compute_is_past"
      },
      "is_future": {
        "type": "boolean",
        "label": "_compute_is_future"
      },
      "is_in_contract": {
        "type": "boolean",
        "label": "_compute_is_in_contract"
      },
      "contract_template_id": {
        "type": "many2one",
        "label": "contract_template_id"
      },
      "structure_type_id": {
        "type": "many2one",
        "label": "hr.payroll.structure.type"
      },
      "active_employee": {
        "type": "boolean",
        "label": "employee_id.active"
      },
      "currency_id": {
        "type": "many2one",
        "label": "Currency"
      },
      "wage": {
        "type": "monetary",
        "label": "Wage"
      },
      "contract_wage": {
        "type": "monetary",
        "label": "Contract Wage"
      },
      "company_country_id": {
        "type": "many2one",
        "label": "res.country"
      },
      "country_code": {
        "type": "char",
        "label": "company_country_id.code"
      },
      "contract_type_id": {
        "type": "many2one",
        "label": "hr.contract.type"
      },
      "additional_note": {
        "type": "text",
        "label": "Additional Note"
      },
      "hr_responsible_id": {
        "type": "many2one",
        "label": "hr_responsible_id"
      }
    }
  },
  {
    "_name": "hr.work.location",
    "_description": "Work Location",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "name": {
        "type": "char",
        "label": "Work Location",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "location_type": {
        "type": "selection",
        "label": "location_type"
      },
      "address_id": {
        "type": "many2one",
        "label": "res.partner",
        "required": true
      },
      "location_number": {
        "type": "char",
        "label": "location_number"
      }
    }
  },
  {
    "_name": "mailactivityplan",
    "_description": "mailactivityplan",
    "_auto": true,
    "_fields": {
      "department_id": {
        "type": "many2one",
        "label": "department_id"
      },
      "department_assignable": {
        "type": "boolean",
        "label": "_compute_department_assignable"
      }
    },
    "_inherit": "mail.activity.plan"
  },
  {
    "_name": "mailactivityplantemplate",
    "_description": "mailactivityplantemplate",
    "_auto": true,
    "_fields": {
      "responsible_type": {
        "type": "selection",
        "label": "responsible_type"
      }
    },
    "_inherit": "mail.activity.plan.template"
  },
  {
    "_name": "mailalias",
    "_description": "mailalias",
    "_auto": true,
    "_fields": {
      "alias_contact": {
        "type": "selection",
        "label": "alias_contact"
      }
    },
    "_inherit": "mail.alias"
  },
  {
    "_name": "resourceresource",
    "_description": "resourceresource",
    "_auto": true,
    "_fields": {
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "employee_id": {
        "type": "one2many",
        "label": "hr.employee"
      },
      "job_title": {
        "type": "char",
        "label": "_compute_job_title"
      },
      "department_id": {
        "type": "many2one",
        "label": "hr.department"
      },
      "work_location_id": {
        "type": "many2one",
        "label": "employee_id.work_location_id"
      },
      "work_email": {
        "type": "char",
        "label": "employee_id.work_email"
      },
      "work_phone": {
        "type": "char",
        "label": "employee_id.work_phone"
      },
      "show_hr_icon_display": {
        "type": "boolean",
        "label": "employee_id.show_hr_icon_display"
      },
      "hr_icon_display": {
        "type": "selection",
        "label": "employee_id.hr_icon_display"
      },
      "calendar_id": {
        "type": "many2one",
        "label": "_inverse_calendar_id"
      }
    },
    "_inherit": "resource.resource"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "hr_presence_control_email_amount": {
        "type": "integer",
        "label": "# emails to send"
      },
      "hr_presence_control_ip_list": {
        "type": "char",
        "label": "Valid IP addresses"
      },
      "employee_properties_definition": {
        "type": "char",
        "label": "Employee Properties"
      },
      "hr_presence_control_login": {
        "type": "boolean",
        "label": "Based on user status in system",
        "default": true
      },
      "hr_presence_control_email": {
        "type": "boolean",
        "label": "Based on number of emails sent"
      },
      "hr_presence_control_ip": {
        "type": "boolean",
        "label": "Based on IP Address"
      },
      "hr_presence_control_attendance": {
        "type": "boolean",
        "label": "Based on attendances"
      },
      "contract_expiration_notice_period": {
        "type": "integer",
        "label": "Contract Expiry Notice Period"
      },
      "work_permit_expiration_notice_period": {
        "type": "integer",
        "label": "Work Permit Expiry Notice Period"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "employee_ids": {
        "type": "one2many",
        "label": "employee_ids"
      },
      "employees_count": {
        "type": "integer",
        "label": "_compute_employees_count"
      },
      "employee": {
        "type": "boolean",
        "label": "Whether this contact is an Employee."
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "respartnerbank",
    "_description": "respartnerbank",
    "_auto": true,
    "_fields": {
      "bank_street": {
        "type": "char",
        "label": "bank_id.street"
      },
      "bank_street2": {
        "type": "char",
        "label": "bank_id.street2"
      },
      "bank_zip": {
        "type": "char",
        "label": "bank_id.zip"
      },
      "bank_city": {
        "type": "char",
        "label": "bank_id.city"
      },
      "bank_state": {
        "type": "many2one",
        "label": "bank_id.state"
      },
      "bank_country": {
        "type": "many2one",
        "label": "bank_id.country"
      },
      "bank_email": {
        "type": "char",
        "label": "bank_id.email"
      },
      "bank_phone": {
        "type": "char",
        "label": "bank_id.phone"
      },
      "employee_id": {
        "type": "many2many",
        "label": "hr.employee"
      },
      "employee_salary_amount": {
        "type": "float",
        "label": "Salary Allocation"
      },
      "employee_salary_amount_is_percentage": {
        "type": "boolean",
        "label": "_compute_salary_amount"
      },
      "currency_symbol": {
        "type": "char",
        "label": "currency_id.symbol"
      },
      "employee_has_multiple_bank_accounts": {
        "type": "boolean",
        "label": "employee_id.has_multiple_bank_accounts"
      }
    },
    "_inherit": "res.partner.bank"
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "employee_ids": {
        "type": "one2many",
        "label": "hr.employee"
      },
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "job_title": {
        "type": "char",
        "label": "employee_id.job_title"
      },
      "work_phone": {
        "type": "char",
        "label": "employee_id.work_phone"
      },
      "mobile_phone": {
        "type": "char",
        "label": "employee_id.mobile_phone"
      },
      "work_email": {
        "type": "char",
        "label": "employee_id.work_email"
      },
      "category_ids": {
        "type": "many2many",
        "label": "employee_id.category_ids"
      },
      "work_contact_id": {
        "type": "many2one",
        "label": "employee_id.work_contact_id"
      },
      "work_location_id": {
        "type": "many2one",
        "label": "employee_id.work_location_id"
      },
      "work_location_name": {
        "type": "char",
        "label": "employee_id.work_location_name"
      },
      "work_location_type": {
        "type": "selection",
        "label": "employee_id.work_location_type"
      },
      "private_street": {
        "type": "char",
        "label": "employee_id.private_street"
      },
      "private_street2": {
        "type": "char",
        "label": "employee_id.private_street2"
      },
      "private_city": {
        "type": "char",
        "label": "employee_id.private_city"
      },
      "private_state_id": {
        "type": "many2one",
        "label": "private_state_id"
      },
      "private_zip": {
        "type": "char",
        "label": "employee_id.private_zip"
      },
      "private_country_id": {
        "type": "many2one",
        "label": "employee_id.private_country_id"
      },
      "private_phone": {
        "type": "char",
        "label": "employee_id.private_phone"
      },
      "private_email": {
        "type": "char",
        "label": "employee_id.private_email"
      },
      "km_home_work": {
        "type": "integer",
        "label": "employee_id.km_home_work"
      },
      "employee_bank_account_ids": {
        "type": "many2many",
        "label": "res.partner.bank"
      },
      "emergency_contact": {
        "type": "char",
        "label": "employee_id.emergency_contact"
      },
      "emergency_phone": {
        "type": "char",
        "label": "employee_id.emergency_phone"
      },
      "visa_expire": {
        "type": "date",
        "label": "employee_id.visa_expire"
      },
      "additional_note": {
        "type": "text",
        "label": "employee_id.additional_note"
      },
      "barcode": {
        "type": "char",
        "label": "employee_id.barcode"
      },
      "pin": {
        "type": "char",
        "label": "employee_id.pin"
      },
      "employee_count": {
        "type": "integer",
        "label": "_compute_employee_count"
      },
      "employee_resource_calendar_id": {
        "type": "many2one",
        "label": "employee_id.resource_calendar_id"
      },
      "bank_account_ids": {
        "type": "many2many",
        "label": "employee_id.bank_account_ids"
      },
      "create_employee": {
        "type": "boolean",
        "label": "Technical field, whether to create an employee",
        "default": false
      },
      "create_employee_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "is_system": {
        "type": "boolean",
        "label": "_compute_is_system"
      },
      "is_hr_user": {
        "type": "boolean",
        "label": "_compute_is_hr_user"
      }
    },
    "_inherit": "res.users"
  }
];
