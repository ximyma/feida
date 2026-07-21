// Odoo 模块: hr_recruitment
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "calendarevent",
    "_description": "calendarevent",
    "_auto": true,
    "_fields": {
      "applicant_id": {
        "type": "many2one",
        "label": "hr.applicant"
      }
    },
    "_inherit": "calendar.event"
  },
  {
    "_name": "digestdigest",
    "_description": "digestdigest",
    "_auto": true,
    "_fields": {
      "kpi_hr_recruitment_new_colleagues": {
        "type": "boolean",
        "label": "New Employees"
      },
      "kpi_hr_recruitment_new_colleagues_value": {
        "type": "integer",
        "label": "_compute_kpi_hr_recruitment_new_colleagues_value"
      }
    },
    "_inherit": "digest.digest"
  },
  {
    "_name": "hr.applicant",
    "_description": "Applicant",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "partner_name": {
        "type": "char",
        "label": "Applicant"
      },
      "email_from": {
        "type": "char",
        "label": "email_from"
      },
      "email_normalized": {
        "type": "char",
        "label": "trigram"
      },
      "partner_phone": {
        "type": "char",
        "label": "partner_phone"
      },
      "partner_phone_sanitized": {
        "type": "char",
        "label": "partner_phone_sanitized"
      },
      "linkedin_profile": {
        "type": "char",
        "label": "LinkedIn Profile"
      },
      "type_id": {
        "type": "many2one",
        "label": "hr.recruitment.degree"
      },
      "availability": {
        "type": "date",
        "label": "Availability"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "emp_is_active": {
        "type": "boolean",
        "label": "Employee Active"
      },
      "employee_name": {
        "type": "char",
        "label": "employee_id.name"
      },
      "probability": {
        "type": "float",
        "label": "Probability"
      },
      "create_date": {
        "type": "datetime",
        "label": "Applied on"
      },
      "stage_id": {
        "type": "many2one",
        "label": "hr.recruitment.stage"
      },
      "last_stage_id": {
        "type": "many2one",
        "label": "hr.recruitment.stage"
      },
      "categ_ids": {
        "type": "many2many",
        "label": "hr.applicant.category"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "date_closed": {
        "type": "datetime",
        "label": "Hire Date"
      },
      "date_open": {
        "type": "datetime",
        "label": "Assigned"
      },
      "date_last_stage_update": {
        "type": "datetime",
        "label": "Last Stage Update"
      },
      "priority": {
        "type": "selection",
        "label": "Evaluation",
        "default": "0"
      },
      "job_id": {
        "type": "many2one",
        "label": "hr.job"
      },
      "salary_proposed_extra": {
        "type": "char",
        "label": "Proposed Salary Extra"
      },
      "salary_expected_extra": {
        "type": "char",
        "label": "Expected Salary Extra"
      },
      "salary_proposed": {
        "type": "float",
        "label": "Proposed"
      },
      "salary_expected": {
        "type": "float",
        "label": "Expected"
      },
      "department_id": {
        "type": "many2one",
        "label": "department_id"
      },
      "day_open": {
        "type": "float",
        "label": "_compute_day"
      },
      "day_close": {
        "type": "float",
        "label": "_compute_day"
      },
      "delay_close": {
        "type": "float",
        "label": "_compute_delay"
      },
      "user_email": {
        "type": "char",
        "label": "user_id.email"
      },
      "attachment_number": {
        "type": "integer",
        "label": "_get_attachment_number"
      },
      "attachment_ids": {
        "type": "one2many",
        "label": "ir.attachment"
      },
      "kanban_state": {
        "type": "selection",
        "label": "kanban_state"
      },
      "legend_blocked": {
        "type": "char",
        "label": "stage_id.legend_blocked"
      },
      "legend_done": {
        "type": "char",
        "label": "stage_id.legend_done"
      },
      "legend_waiting": {
        "type": "char",
        "label": "stage_id.legend_waiting"
      },
      "legend_normal": {
        "type": "char",
        "label": "stage_id.legend_normal"
      },
      "refuse_reason_id": {
        "type": "many2one",
        "label": "hr.applicant.refuse.reason"
      },
      "meeting_ids": {
        "type": "one2many",
        "label": "calendar.event"
      },
      "meeting_display_text": {
        "type": "char",
        "label": "_compute_meeting_display"
      },
      "meeting_display_date": {
        "type": "date",
        "label": "_compute_meeting_display"
      },
      "campaign_id": {
        "type": "many2one",
        "label": "set null"
      },
      "medium_id": {
        "type": "many2one",
        "label": "set null"
      },
      "source_id": {
        "type": "many2one",
        "label": "set null"
      },
      "interviewer_ids": {
        "type": "many2many",
        "label": "res.users"
      },
      "application_status": {
        "type": "selection",
        "label": "application_status"
      },
      "application_count": {
        "type": "integer",
        "label": "_compute_application_count"
      },
      "applicant_properties": {
        "type": "char",
        "label": "Properties"
      },
      "applicant_notes": {
        "type": "html",
        "label": "applicant_notes"
      },
      "refuse_date": {
        "type": "datetime",
        "label": "Refuse Date"
      },
      "talent_pool_ids": {
        "type": "many2many",
        "label": "hr.talent.pool"
      },
      "pool_applicant_id": {
        "type": "many2one",
        "label": "hr.applicant"
      },
      "is_pool_applicant": {
        "type": "boolean",
        "label": "_compute_is_pool"
      },
      "is_applicant_in_pool": {
        "type": "boolean",
        "label": "is_applicant_in_pool"
      },
      "talent_pool_count": {
        "type": "integer",
        "label": "_compute_talent_pool_count"
      }
    }
  },
  {
    "_name": "hr.applicant.category",
    "_description": "Category of applicant",
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
      }
    }
  },
  {
    "_name": "hr.applicant.refuse.reason",
    "_description": "Refuse Reason of Applicant",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "name": {
        "type": "char",
        "label": "Description",
        "required": true
      },
      "template_id": {
        "type": "many2one",
        "label": "mail.template"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      }
    }
  },
  {
    "_name": "hrdepartment",
    "_description": "hrdepartment",
    "_auto": true,
    "_fields": {
      "new_applicant_count": {
        "type": "integer",
        "label": "new_applicant_count"
      },
      "new_hired_employee": {
        "type": "integer",
        "label": "new_hired_employee"
      },
      "expected_employee": {
        "type": "integer",
        "label": "expected_employee"
      }
    },
    "_inherit": "hr.department"
  },
  {
    "_name": "hremployee",
    "_description": "hremployee",
    "_auto": true,
    "_fields": {
      "applicant_ids": {
        "type": "one2many",
        "label": "hr.applicant"
      }
    },
    "_inherit": "hr.employee"
  },
  {
    "_name": "hr.job",
    "_description": "hr.job",
    "_auto": true,
    "_fields": {
      "expected_employees": {
        "type": "integer",
        "label": "hr_recruitment.group_hr_recruitment_interviewer,hr.group_hr_user"
      },
      "no_of_employee": {
        "type": "integer",
        "label": "hr_recruitment.group_hr_recruitment_interviewer,hr.group_hr_user"
      },
      "requirements": {
        "type": "text",
        "label": "hr_recruitment.group_hr_recruitment_interviewer,hr.group_hr_user"
      },
      "user_id": {
        "type": "many2one",
        "label": "hr_recruitment.group_hr_recruitment_interviewer,hr.group_hr_user"
      },
      "address_id": {
        "type": "many2one",
        "label": "address_id"
      },
      "application_ids": {
        "type": "one2many",
        "label": "hr.applicant"
      },
      "application_count": {
        "type": "integer",
        "label": "_compute_application_count"
      },
      "open_application_count": {
        "type": "integer",
        "label": "_compute_open_application_count"
      },
      "all_application_count": {
        "type": "integer",
        "label": "_compute_all_application_count"
      },
      "new_application_count": {
        "type": "integer",
        "label": "new_application_count"
      },
      "old_application_count": {
        "type": "integer",
        "label": "old_application_count"
      },
      "applicant_hired": {
        "type": "integer",
        "label": "_compute_applicant_hired"
      },
      "manager_id": {
        "type": "many2one",
        "label": "manager_id"
      },
      "document_ids": {
        "type": "one2many",
        "label": "ir.attachment"
      },
      "documents_count": {
        "type": "integer",
        "label": "_compute_document_ids"
      },
      "employee_count": {
        "type": "integer",
        "label": "_compute_employee_count"
      },
      "alias_id": {
        "type": "many2one",
        "label": "Email alias for this job position. New emails will automatically create new applicants for this job position."
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "is_favorite": {
        "type": "boolean",
        "label": "_compute_is_favorite"
      },
      "favorite_user_ids": {
        "type": "many2many",
        "label": "res.users"
      },
      "interviewer_ids": {
        "type": "many2many",
        "label": "interviewer_ids"
      },
      "extended_interviewer_ids": {
        "type": "many2many",
        "label": "res.users"
      },
      "industry_id": {
        "type": "many2one",
        "label": "res.partner.industry"
      },
      "expected_degree": {
        "type": "many2one",
        "label": "hr.recruitment.degree"
      },
      "activity_count": {
        "type": "integer",
        "label": "_compute_activities"
      },
      "job_properties": {
        "type": "char",
        "label": "Properties"
      },
      "applicant_properties_definition": {
        "type": "char",
        "label": "Applicant Properties"
      },
      "no_of_hired_employee": {
        "type": "integer",
        "label": "no_of_hired_employee"
      },
      "job_source_ids": {
        "type": "one2many",
        "label": "hr.recruitment.source"
      }
    }
  },
  {
    "_name": "hr.job.platform",
    "_description": "Job Platforms",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "email": {
        "type": "char",
        "label": "Applications received from this Email won",
        "required": true
      },
      "regex": {
        "type": "char",
        "label": "The regex facilitates to extract information from the subject or body "
      }
    }
  },
  {
    "_name": "hr.recruitment.degree",
    "_description": "Applicant Degree",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Degree Name",
        "required": true
      },
      "score": {
        "type": "float",
        "label": "Score",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      }
    }
  },
  {
    "_name": "hr.recruitment.source",
    "_description": "Source of Applicants",
    "_auto": true,
    "_fields": {
      "email": {
        "type": "char",
        "label": "alias_id.display_name"
      },
      "has_domain": {
        "type": "char",
        "label": "_compute_has_domain"
      },
      "job_id": {
        "type": "many2one",
        "label": "hr.job"
      },
      "alias_id": {
        "type": "many2one",
        "label": "mail.alias"
      },
      "medium_id": {
        "type": "many2one",
        "label": "utm.medium"
      },
      "campaign_id": {
        "type": "many2one",
        "label": "utm.campaign"
      }
    }
  },
  {
    "_name": "hr.recruitment.stage",
    "_description": "Recruitment Stages",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Stage Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "job_ids": {
        "type": "many2many",
        "label": "job_ids"
      },
      "requirements": {
        "type": "text",
        "label": "Requirements"
      },
      "template_id": {
        "type": "many2one",
        "label": "template_id"
      },
      "fold": {
        "type": "boolean",
        "label": "fold"
      },
      "hired_stage": {
        "type": "boolean",
        "label": "Hired Stage"
      },
      "rotting_threshold_days": {
        "type": "integer",
        "label": "Days to rot"
      },
      "legend_blocked": {
        "type": "char",
        "label": "legend_blocked"
      },
      "legend_waiting": {
        "type": "char",
        "label": "legend_waiting"
      },
      "legend_done": {
        "type": "char",
        "label": "legend_done"
      },
      "legend_normal": {
        "type": "char",
        "label": "legend_normal"
      },
      "is_warning_visible": {
        "type": "boolean",
        "label": "_compute_is_warning_visible"
      }
    }
  },
  {
    "_name": "hr.talent.pool",
    "_description": "Talent Pool",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "name": {
        "type": "char",
        "label": "Title",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "pool_manager": {
        "type": "many2one",
        "label": "pool_manager"
      },
      "talent_ids": {
        "type": "many2many",
        "label": "hr.applicant"
      },
      "no_of_talents": {
        "type": "integer",
        "label": "no_of_talents"
      },
      "description": {
        "type": "html",
        "label": "Talent Pool Description"
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "categ_ids": {
        "type": "many2many",
        "label": "categ_ids"
      }
    }
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "job_properties_definition": {
        "type": "char",
        "label": "Job Properties"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "applicant_ids": {
        "type": "one2many",
        "label": "hr.applicant"
      }
    },
    "_inherit": "res.partner"
  }
];
