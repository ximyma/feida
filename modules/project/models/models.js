// Odoo 模块: project
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountanalyticaccount",
    "_description": "Analytic Account",
    "_auto": true,
    "_fields": {
      "project_ids": {
        "type": "one2many",
        "label": "project.project"
      },
      "project_count": {
        "type": "integer",
        "label": "Project Count"
      }
    },
    "_inherit": "account.analytic.account"
  },
  {
    "_name": "digestdigest",
    "_description": "digestdigest",
    "_auto": true,
    "_fields": {
      "kpi_project_task_opened": {
        "type": "boolean",
        "label": "Open Tasks"
      },
      "kpi_project_task_opened_value": {
        "type": "integer",
        "label": "_compute_project_task_opened_value"
      }
    },
    "_inherit": "digest.digest"
  },
  {
    "_name": "project.collaborator",
    "_description": "Collaborators in project shared",
    "_auto": true,
    "_fields": {
      "project_id": {
        "type": "many2one",
        "label": "project.project",
        "required": true
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner",
        "required": true
      },
      "partner_email": {
        "type": "char",
        "label": "partner_id.email"
      },
      "limited_access": {
        "type": "boolean",
        "label": "Limited Access",
        "default": false
      }
    }
  },
  {
    "_name": "project.milestone",
    "_description": "Project Milestone",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "project_id": {
        "type": "many2one",
        "label": "project.project",
        "required": true
      },
      "deadline": {
        "type": "date",
        "label": "deadline"
      },
      "is_reached": {
        "type": "boolean",
        "label": "Reached",
        "default": false
      },
      "reached_date": {
        "type": "date",
        "label": "_compute_reached_date"
      },
      "task_ids": {
        "type": "one2many",
        "label": "project.task"
      },
      "project_allow_milestones": {
        "type": "boolean",
        "label": "_compute_project_allow_milestones"
      },
      "is_deadline_exceeded": {
        "type": "boolean",
        "label": "_compute_is_deadline_exceeded"
      },
      "is_deadline_future": {
        "type": "boolean",
        "label": "_compute_is_deadline_future"
      },
      "task_count": {
        "type": "integer",
        "label": "# of Tasks"
      },
      "done_task_count": {
        "type": "integer",
        "label": "# of Done Tasks"
      },
      "can_be_marked_as_done": {
        "type": "boolean",
        "label": "_compute_can_be_marked_as_done"
      }
    }
  },
  {
    "_name": "project.project",
    "_description": "Project",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "description": {
        "type": "html",
        "label": "Description to provide more information and context about this project"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "analytic_account_balance": {
        "type": "monetary",
        "label": "account_id.balance"
      },
      "account_id": {
        "type": "many2one",
        "label": "account.analytic.account"
      },
      "favorite_user_ids": {
        "type": "many2many",
        "label": "favorite_user_ids"
      },
      "is_favorite": {
        "type": "boolean",
        "label": "_compute_is_favorite"
      },
      "label_tasks": {
        "type": "char",
        "label": "Use Tasks as"
      },
      "tasks": {
        "type": "one2many",
        "label": "project.task"
      },
      "resource_calendar_id": {
        "type": "many2one",
        "label": "resource_calendar_id"
      },
      "type_ids": {
        "type": "many2many",
        "label": "project.task.type"
      },
      "task_count": {
        "type": "integer",
        "label": "_compute_task_count"
      },
      "open_task_count": {
        "type": "integer",
        "label": "_compute_open_task_count"
      },
      "task_ids": {
        "type": "one2many",
        "label": "project.task"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "alias_id": {
        "type": "many2one",
        "label": "Internal email associated with this project. Incoming emails are automatically synchronized "
      },
      "privacy_visibility": {
        "type": "selection",
        "label": "privacy_visibility"
      },
      "privacy_visibility_warning": {
        "type": "char",
        "label": "Privacy Visibility Warning"
      },
      "access_instruction_message": {
        "type": "char",
        "label": "Access Instruction Message"
      },
      "date_start": {
        "type": "date",
        "label": "Start Date"
      },
      "date": {
        "type": "date",
        "label": "Expiration Date"
      },
      "allow_task_dependencies": {
        "type": "boolean",
        "label": "Task Dependencies"
      },
      "allow_milestones": {
        "type": "boolean",
        "label": "Milestones"
      },
      "allow_recurring_tasks": {
        "type": "boolean",
        "label": "Recurring Tasks"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "project.tags",
        "relation": "project_project_project_tags_rel"
      },
      "task_properties_definition": {
        "type": "char",
        "label": "Task Properties"
      },
      "closed_task_count": {
        "type": "integer",
        "label": "_compute_closed_task_count"
      },
      "task_completion_percentage": {
        "type": "float",
        "label": "_compute_task_completion_percentage"
      },
      "collaborator_ids": {
        "type": "one2many",
        "label": "project.collaborator"
      },
      "collaborator_count": {
        "type": "integer",
        "label": "# Collaborators"
      },
      "stage_id": {
        "type": "many2one",
        "label": "project.project.stage"
      },
      "stage_id_color": {
        "type": "integer",
        "label": "Stage Color"
      },
      "duration_tracking": {
        "type": "char",
        "label": "project.group_project_stages"
      },
      "update_ids": {
        "type": "one2many",
        "label": "project.update"
      },
      "update_count": {
        "type": "integer",
        "label": "_compute_total_update_ids"
      },
      "last_update_id": {
        "type": "many2one",
        "label": "project.update"
      },
      "last_update_status": {
        "type": "selection",
        "label": "last_update_status"
      },
      "last_update_color": {
        "type": "integer",
        "label": "_compute_last_update_color"
      },
      "milestone_ids": {
        "type": "one2many",
        "label": "project.milestone"
      },
      "milestone_count": {
        "type": "integer",
        "label": "_compute_milestone_count"
      },
      "milestone_count_reached": {
        "type": "integer",
        "label": "_compute_milestone_reached_count"
      },
      "is_milestone_exceeded": {
        "type": "boolean",
        "label": "_compute_is_milestone_exceeded"
      },
      "milestone_progress": {
        "type": "integer",
        "label": "Milestones Reached"
      },
      "next_milestone_id": {
        "type": "many2one",
        "label": "project.milestone"
      },
      "can_mark_milestone_as_done": {
        "type": "boolean",
        "label": "_compute_next_milestone_id"
      },
      "is_milestone_deadline_exceeded": {
        "type": "boolean",
        "label": "_compute_next_milestone_id"
      },
      "is_template": {
        "type": "boolean",
        "label": "is_template"
      },
      "show_ratings": {
        "type": "boolean",
        "label": "_compute_show_ratings"
      }
    }
  },
  {
    "_name": "project.project.stage",
    "_description": "Project Stage",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "mail_template_id": {
        "type": "many2one",
        "label": "mail.template"
      },
      "fold": {
        "type": "boolean",
        "label": "Folded"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "color": {
        "type": "integer",
        "label": "Color"
      }
    }
  },
  {
    "_name": "project.role",
    "_description": "Project Role",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "color"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      }
    }
  },
  {
    "_name": "project.tags",
    "_description": "Project Tags",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "project_ids": {
        "type": "many2many",
        "label": "project.project"
      },
      "task_ids": {
        "type": "many2many",
        "label": "project.task"
      }
    }
  },
  {
    "_name": "project.task",
    "_description": "Task",
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
      "description": {
        "type": "html",
        "label": "Description"
      },
      "priority": {
        "type": "selection",
        "label": "priority"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "stage_id": {
        "type": "many2one",
        "label": "project.task.type"
      },
      "stage_id_color": {
        "type": "integer",
        "label": "Stage Color"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "project.tags"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "is_closed": {
        "type": "boolean",
        "label": "Closed state"
      },
      "create_date": {
        "type": "datetime",
        "label": "Created On"
      },
      "write_date": {
        "type": "datetime",
        "label": "Last Updated On"
      },
      "date_end": {
        "type": "datetime",
        "label": "Ending Date"
      },
      "date_assign": {
        "type": "datetime",
        "label": "Assigning Date"
      },
      "date_deadline": {
        "type": "datetime",
        "label": "Deadline"
      },
      "date_last_stage_update": {
        "type": "datetime",
        "label": "Last Stage Update"
      },
      "project_id": {
        "type": "many2one",
        "label": "project.project"
      },
      "display_in_project": {
        "type": "boolean",
        "label": "_compute_display_in_project"
      },
      "task_properties": {
        "type": "char",
        "label": "Properties"
      },
      "allocated_hours": {
        "type": "float",
        "label": "Allocated Time"
      },
      "subtask_allocated_hours": {
        "type": "float",
        "label": "Sub-tasks Allocated Time"
      },
      "role_ids": {
        "type": "many2many",
        "label": "role_ids"
      },
      "user_ids": {
        "type": "many2many",
        "label": "res.users",
        "relation": "project_task_user_rel"
      },
      "portal_user_names": {
        "type": "char",
        "label": "_compute_portal_user_names"
      },
      "personal_stage_type_ids": {
        "type": "many2many",
        "label": "project.task.type"
      },
      "personal_stage_id": {
        "type": "many2one",
        "label": "project.task.stage.personal"
      },
      "personal_stage_type_id": {
        "type": "many2one",
        "label": "project.task.type"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "partner_phone": {
        "type": "char",
        "label": "partner_phone"
      },
      "email_from": {
        "type": "char",
        "label": "Email From"
      },
      "email_cc": {
        "type": "char",
        "label": "Email addresses that were in the CC of the incoming emails from this task and that are not currently linked to an existing customer."
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "rating_active": {
        "type": "boolean",
        "label": "Stage Rating Status"
      },
      "attachment_ids": {
        "type": "one2many",
        "label": "attachment_ids"
      },
      "displayed_image_id": {
        "type": "many2one",
        "label": "ir.attachment"
      },
      "parent_id": {
        "type": "many2one",
        "label": "project.task"
      },
      "child_ids": {
        "type": "one2many",
        "label": "project.task"
      },
      "subtask_count": {
        "type": "integer",
        "label": "Sub-task Count"
      },
      "closed_subtask_count": {
        "type": "integer",
        "label": "Closed Sub-tasks Count"
      },
      "project_privacy_visibility": {
        "type": "selection",
        "label": "project_id.privacy_visibility"
      },
      "subtask_completion_percentage": {
        "type": "float",
        "label": "_compute_subtask_completion_percentage"
      },
      "working_hours_open": {
        "type": "float",
        "label": "_compute_elapsed"
      },
      "working_hours_close": {
        "type": "float",
        "label": "_compute_elapsed"
      },
      "working_days_open": {
        "type": "float",
        "label": "_compute_elapsed"
      },
      "working_days_close": {
        "type": "float",
        "label": "_compute_elapsed"
      },
      "website_message_ids": {
        "type": "one2many",
        "label": "model"
      },
      "allow_milestones": {
        "type": "boolean",
        "label": "project_id.allow_milestones"
      },
      "milestone_id": {
        "type": "many2one",
        "label": "milestone_id"
      },
      "has_late_and_unreached_milestone": {
        "type": "boolean",
        "label": "has_late_and_unreached_milestone"
      },
      "allow_task_dependencies": {
        "type": "boolean",
        "label": "project_id.allow_task_dependencies"
      },
      "depend_on_ids": {
        "type": "many2many",
        "label": "project.task",
        "relation": "task_dependencies_rel"
      },
      "depend_on_count": {
        "type": "integer",
        "label": "Depending on Tasks"
      },
      "closed_depend_on_count": {
        "type": "integer",
        "label": "Closed Depending on Tasks"
      },
      "dependent_ids": {
        "type": "many2many",
        "label": "project.task",
        "relation": "task_dependencies_rel"
      },
      "dependent_tasks_count": {
        "type": "integer",
        "label": "Dependent Tasks"
      },
      "display_parent_task_button": {
        "type": "boolean",
        "label": "_compute_display_parent_task_button"
      },
      "current_user_same_company_partner": {
        "type": "boolean",
        "label": "_compute_current_user_same_company_partner"
      },
      "display_follow_button": {
        "type": "boolean",
        "label": "_compute_display_follow_button"
      },
      "allow_recurring_tasks": {
        "type": "boolean",
        "label": "project_id.allow_recurring_tasks"
      },
      "recurring_task": {
        "type": "boolean",
        "label": "Recurrent"
      },
      "recurring_count": {
        "type": "integer",
        "label": "Tasks in Recurrence"
      },
      "recurrence_id": {
        "type": "many2one",
        "label": "project.task.recurrence"
      },
      "repeat_interval": {
        "type": "integer",
        "label": "Repeat Every"
      },
      "repeat_unit": {
        "type": "selection",
        "label": "repeat_unit"
      },
      "repeat_type": {
        "type": "selection",
        "label": "repeat_type"
      },
      "repeat_until": {
        "type": "date",
        "label": "End Date"
      },
      "display_name": {
        "type": "char",
        "label": "display_name"
      },
      "link_preview_name": {
        "type": "char",
        "label": "_compute_link_preview_name"
      },
      "is_template": {
        "type": "boolean",
        "label": "is_template"
      },
      "has_project_template": {
        "type": "boolean",
        "label": "project_id.is_template"
      },
      "has_template_ancestor": {
        "type": "boolean",
        "label": "_compute_has_template_ancestor"
      }
    }
  },
  {
    "_name": "project.task.recurrence",
    "_description": "Task Recurrence",
    "_auto": true,
    "_fields": {
      "task_ids": {
        "type": "one2many",
        "label": "project.task"
      },
      "repeat_interval": {
        "type": "integer",
        "label": "Repeat Every"
      },
      "repeat_unit": {
        "type": "selection",
        "label": "repeat_unit"
      },
      "repeat_type": {
        "type": "selection",
        "label": "repeat_type"
      },
      "repeat_until": {
        "type": "date",
        "label": "End Date"
      }
    }
  },
  {
    "_name": "project.task.stage.personal",
    "_description": "Personal Task Stage",
    "_auto": true,
    "_fields": {
      "task_id": {
        "type": "many2one",
        "label": "project.task",
        "required": true
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users",
        "required": true
      },
      "stage_id": {
        "type": "many2one",
        "label": "project.task.type"
      }
    }
  },
  {
    "_name": "project.task.type",
    "_description": "Task Stage",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "project_ids": {
        "type": "many2many",
        "label": "project.project"
      },
      "mail_template_id": {
        "type": "many2one",
        "label": "mail_template_id"
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "fold": {
        "type": "boolean",
        "label": "Folded"
      },
      "rating_template_id": {
        "type": "many2one",
        "label": "rating_template_id"
      },
      "auto_validation_state": {
        "type": "boolean",
        "label": "Automatic Kanban Status",
        "default": false
      },
      "rotting_threshold_days": {
        "type": "integer",
        "label": "Days to rot"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "rating_request_deadline": {
        "type": "datetime",
        "label": "_compute_rating_request_deadline"
      },
      "rating_active": {
        "type": "boolean",
        "label": "Send a customer rating request"
      },
      "rating_status": {
        "type": "selection",
        "label": "rating_status"
      },
      "rating_status_period": {
        "type": "selection",
        "label": "rating_status_period"
      }
    }
  },
  {
    "_name": "project.update",
    "_description": "Project Update",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Title",
        "required": true
      },
      "status": {
        "type": "selection",
        "label": "status"
      },
      "color": {
        "type": "integer",
        "label": "_compute_color"
      },
      "progress": {
        "type": "integer",
        "label": "progress"
      },
      "progress_percentage": {
        "type": "float",
        "label": "_compute_progress_percentage"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users",
        "required": true
      },
      "description": {
        "type": "html",
        "label": "description"
      },
      "date": {
        "type": "date",
        "label": "date"
      },
      "project_id": {
        "type": "many2one",
        "label": "project.project",
        "required": true
      },
      "name_cropped": {
        "type": "char",
        "label": "_compute_name_cropped"
      },
      "task_count": {
        "type": "integer",
        "label": "Task Count"
      },
      "closed_task_count": {
        "type": "integer",
        "label": "Closed Task Count"
      },
      "closed_task_percentage": {
        "type": "integer",
        "label": "Closed Task Percentage"
      },
      "label_tasks": {
        "type": "char",
        "label": "project_id.label_tasks"
      }
    }
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "project_ids": {
        "type": "one2many",
        "label": "project.project"
      },
      "task_ids": {
        "type": "one2many",
        "label": "project.task"
      },
      "task_count": {
        "type": "integer",
        "label": "_compute_task_count"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "favorite_project_ids": {
        "type": "many2many",
        "label": "project.project"
      }
    },
    "_inherit": "res.users"
  }
];
