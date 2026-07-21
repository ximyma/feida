// Odoo 模块: event
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "event.event",
    "_description": "Event",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Event",
        "required": true
      },
      "note": {
        "type": "html",
        "label": "Note"
      },
      "description": {
        "type": "html",
        "label": "Description"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "use_barcode": {
        "type": "boolean",
        "label": "_compute_use_barcode"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "organizer_id": {
        "type": "many2one",
        "label": "organizer_id"
      },
      "event_type_id": {
        "type": "many2one",
        "label": "event_type_id"
      },
      "event_mail_ids": {
        "type": "one2many",
        "label": "event_mail_ids"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "tag_ids"
      },
      "registration_properties_definition": {
        "type": "char",
        "label": "Registration Properties"
      },
      "kanban_state": {
        "type": "selection",
        "label": "kanban_state"
      },
      "stage_id": {
        "type": "many2one",
        "label": "stage_id"
      },
      "seats_max": {
        "type": "integer",
        "label": "seats_max"
      },
      "seats_limited": {
        "type": "boolean",
        "label": "Limit Attendees",
        "required": true
      },
      "seats_reserved": {
        "type": "integer",
        "label": "seats_reserved"
      },
      "seats_available": {
        "type": "integer",
        "label": "seats_available"
      },
      "seats_used": {
        "type": "integer",
        "label": "seats_used"
      },
      "seats_taken": {
        "type": "integer",
        "label": "seats_taken"
      },
      "registration_ids": {
        "type": "one2many",
        "label": "event.registration"
      },
      "is_multi_slots": {
        "type": "boolean",
        "label": "Is Multi Slots"
      },
      "event_slot_ids": {
        "type": "one2many",
        "label": "event.slot"
      },
      "event_slot_count": {
        "type": "integer",
        "label": "Slots Count"
      },
      "event_ticket_ids": {
        "type": "one2many",
        "label": "event_ticket_ids"
      },
      "event_registrations_started": {
        "type": "boolean",
        "label": "event_registrations_started"
      },
      "event_registrations_open": {
        "type": "boolean",
        "label": "event_registrations_open"
      },
      "event_registrations_sold_out": {
        "type": "boolean",
        "label": "event_registrations_sold_out"
      },
      "start_sale_datetime": {
        "type": "datetime",
        "label": "start_sale_datetime"
      },
      "date_tz": {
        "type": "selection",
        "label": "date_tz"
      },
      "date_begin": {
        "type": "datetime",
        "label": "Start Date",
        "required": true
      },
      "date_end": {
        "type": "datetime",
        "label": "End Date",
        "required": true
      },
      "is_ongoing": {
        "type": "boolean",
        "label": "Is Ongoing"
      },
      "is_one_day": {
        "type": "boolean",
        "label": "_compute_field_is_one_day"
      },
      "is_finished": {
        "type": "boolean",
        "label": "_compute_is_finished"
      },
      "address_id": {
        "type": "many2one",
        "label": "address_id"
      },
      "address_search": {
        "type": "many2one",
        "label": "address_search"
      },
      "address_inline": {
        "type": "char",
        "label": "address_inline"
      },
      "country_id": {
        "type": "many2one",
        "label": "country_id"
      },
      "event_url": {
        "type": "char",
        "label": "event_url"
      },
      "event_share_url": {
        "type": "char",
        "label": "Event Share URL"
      },
      "lang": {
        "type": "selection",
        "label": "Language"
      },
      "badge_format": {
        "type": "selection",
        "label": "badge_format"
      },
      "badge_image": {
        "type": "text",
        "label": "Badge Background"
      },
      "ticket_instructions": {
        "type": "html",
        "label": "Ticket Instructions"
      },
      "question_ids": {
        "type": "many2many",
        "label": "event.question"
      },
      "general_question_ids": {
        "type": "many2many",
        "label": "event.question"
      },
      "specific_question_ids": {
        "type": "many2many",
        "label": "event.question"
      }
    }
  },
  {
    "_name": "event.mail",
    "_description": "Event Automated Mailing",
    "_auto": true,
    "_fields": {
      "event_id": {
        "type": "many2one",
        "label": "event.event",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Display order"
      },
      "interval_nbr": {
        "type": "integer",
        "label": "Interval"
      },
      "interval_unit": {
        "type": "selection",
        "label": "interval_unit"
      },
      "interval_type": {
        "type": "selection",
        "label": "interval_type"
      },
      "scheduled_date": {
        "type": "datetime",
        "label": "Schedule Date"
      },
      "error_datetime": {
        "type": "datetime",
        "label": "Last Error"
      },
      "last_registration_id": {
        "type": "many2one",
        "label": "event.registration"
      },
      "mail_registration_ids": {
        "type": "one2many",
        "label": "mail_registration_ids"
      },
      "mail_slot_ids": {
        "type": "one2many",
        "label": "mail_slot_ids"
      },
      "mail_done": {
        "type": "boolean",
        "label": "Sent"
      },
      "mail_state": {
        "type": "selection",
        "label": "mail_state"
      },
      "mail_count_done": {
        "type": "integer",
        "label": "# Sent"
      },
      "notification_type": {
        "type": "selection",
        "label": "mail"
      },
      "template_ref": {
        "type": "char",
        "label": "Template",
        "required": true
      }
    }
  },
  {
    "_name": "event.mail.registration",
    "_description": "Registration Mail Scheduler",
    "_auto": true,
    "_fields": {
      "scheduler_id": {
        "type": "many2one",
        "label": "event.mail",
        "required": true
      },
      "registration_id": {
        "type": "many2one",
        "label": "event.registration",
        "required": true
      },
      "scheduled_date": {
        "type": "datetime",
        "label": "Scheduled Time"
      },
      "mail_sent": {
        "type": "boolean",
        "label": "Mail Sent"
      }
    }
  },
  {
    "_name": "event.mail.slot",
    "_description": "Slot Mail Scheduler",
    "_auto": true,
    "_fields": {
      "event_slot_id": {
        "type": "many2one",
        "label": "event.slot",
        "required": true
      },
      "scheduled_date": {
        "type": "datetime",
        "label": "Schedule Date"
      },
      "scheduler_id": {
        "type": "many2one",
        "label": "event.mail",
        "required": true
      },
      "last_registration_id": {
        "type": "many2one",
        "label": "event.registration"
      },
      "mail_count_done": {
        "type": "integer",
        "label": "# Sent"
      },
      "mail_done": {
        "type": "boolean",
        "label": "Sent"
      }
    }
  },
  {
    "_name": "event.question",
    "_description": "Event Question",
    "_auto": true,
    "_fields": {
      "title": {
        "type": "char",
        "label": "title",
        "required": true
      },
      "question_type": {
        "type": "selection",
        "label": "question_type"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "event_type_ids": {
        "type": "many2many",
        "label": "event.type"
      },
      "event_ids": {
        "type": "many2many",
        "label": "event.event"
      },
      "event_count": {
        "type": "integer",
        "label": "# Events"
      },
      "is_default": {
        "type": "boolean",
        "label": "Default question"
      },
      "is_reusable": {
        "type": "boolean",
        "label": "Is Reusable"
      },
      "answer_ids": {
        "type": "one2many",
        "label": "event.question.answer"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "once_per_order": {
        "type": "boolean",
        "label": "Ask once per order"
      },
      "is_mandatory_answer": {
        "type": "boolean",
        "label": "Mandatory Answer"
      }
    }
  },
  {
    "_name": "event.question.answer",
    "_description": "Event Question Answer",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Answer",
        "required": true
      },
      "question_id": {
        "type": "many2one",
        "label": "event.question",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      }
    }
  },
  {
    "_name": "event.registration",
    "_description": "Event Registration",
    "_auto": true,
    "_fields": {
      "event_id": {
        "type": "many2one",
        "label": "event_id"
      },
      "is_multi_slots": {
        "type": "boolean",
        "label": "Is Event Multi Slots"
      },
      "event_slot_id": {
        "type": "many2one",
        "label": "event_slot_id"
      },
      "event_ticket_id": {
        "type": "many2one",
        "label": "event_ticket_id"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "barcode": {
        "type": "char",
        "label": "Barcode"
      },
      "utm_campaign_id": {
        "type": "many2one",
        "label": "utm.campaign"
      },
      "utm_source_id": {
        "type": "many2one",
        "label": "utm.source"
      },
      "utm_medium_id": {
        "type": "many2one",
        "label": "utm.medium"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "name": {
        "type": "char",
        "label": "name"
      },
      "email": {
        "type": "char",
        "label": "Email"
      },
      "phone": {
        "type": "char",
        "label": "Phone"
      },
      "company_name": {
        "type": "char",
        "label": "company_name"
      },
      "date_closed": {
        "type": "datetime",
        "label": "date_closed"
      },
      "event_begin_date": {
        "type": "datetime",
        "label": "Event Start Date"
      },
      "event_end_date": {
        "type": "datetime",
        "label": "Event End Date"
      },
      "event_date_range": {
        "type": "char",
        "label": "Date Range"
      },
      "event_organizer_id": {
        "type": "many2one",
        "label": "Event Organizer"
      },
      "event_user_id": {
        "type": "many2one",
        "label": "Event Responsible"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "registration_answer_ids": {
        "type": "one2many",
        "label": "event.registration.answer"
      },
      "registration_answer_choice_ids": {
        "type": "one2many",
        "label": "event.registration.answer"
      },
      "mail_registration_ids": {
        "type": "one2many",
        "label": "mail_registration_ids"
      },
      "registration_properties": {
        "type": "char",
        "label": "registration_properties"
      }
    }
  },
  {
    "_name": "event.registration.answer",
    "_description": "Event Registration Answer",
    "_auto": true,
    "_fields": {
      "question_id": {
        "type": "many2one",
        "label": "question_id"
      },
      "registration_id": {
        "type": "many2one",
        "label": "event.registration",
        "required": true
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "event_id": {
        "type": "many2one",
        "label": "event.event"
      },
      "question_type": {
        "type": "selection",
        "label": "question_id.question_type"
      },
      "value_answer_id": {
        "type": "many2one",
        "label": "event.question.answer"
      },
      "value_text_box": {
        "type": "text",
        "label": "Text answer"
      }
    }
  },
  {
    "_name": "event.slot",
    "_description": "Event Slot",
    "_auto": true,
    "_fields": {
      "event_id": {
        "type": "many2one",
        "label": "event.event",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "date": {
        "type": "date",
        "label": "Date",
        "required": true
      },
      "date_tz": {
        "type": "selection",
        "label": "event_id.date_tz"
      },
      "start_hour": {
        "type": "float",
        "label": "Starting Hour",
        "required": true
      },
      "end_hour": {
        "type": "float",
        "label": "Ending Hour",
        "required": true
      },
      "start_datetime": {
        "type": "datetime",
        "label": "Start Datetime"
      },
      "end_datetime": {
        "type": "datetime",
        "label": "End Datetime"
      },
      "is_sold_out": {
        "type": "boolean",
        "label": "is_sold_out"
      },
      "registration_ids": {
        "type": "one2many",
        "label": "event.registration"
      },
      "seats_available": {
        "type": "integer",
        "label": "seats_available"
      },
      "seats_reserved": {
        "type": "integer",
        "label": "seats_reserved"
      },
      "seats_taken": {
        "type": "integer",
        "label": "seats_taken"
      },
      "seats_used": {
        "type": "integer",
        "label": "seats_used"
      }
    }
  },
  {
    "_name": "event.stage",
    "_description": "Event Stage",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Stage Name",
        "required": true
      },
      "description": {
        "type": "text",
        "label": "Stage description"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "fold": {
        "type": "boolean",
        "label": "Folded in Kanban",
        "default": false
      },
      "pipe_end": {
        "type": "boolean",
        "label": "pipe_end"
      }
    }
  },
  {
    "_name": "event.tag.category",
    "_description": "Event Tag Category",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "tag_ids": {
        "type": "one2many",
        "label": "event.tag"
      }
    }
  },
  {
    "_name": "event.tag",
    "_description": "Event Tag",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "category_id": {
        "type": "many2one",
        "label": "event.tag.category",
        "required": true
      },
      "category_sequence": {
        "type": "integer",
        "label": "category_id.sequence"
      },
      "color": {
        "type": "integer",
        "label": "color"
      }
    }
  },
  {
    "_name": "event.event.ticket",
    "_description": "Event Ticket",
    "_auto": true,
    "_fields": {
      "event_type_id": {
        "type": "many2one",
        "label": "set null"
      },
      "event_id": {
        "type": "many2one",
        "label": "event_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "start_sale_datetime": {
        "type": "datetime",
        "label": "Registration Start"
      },
      "end_sale_datetime": {
        "type": "datetime",
        "label": "Registration End"
      },
      "is_launched": {
        "type": "boolean",
        "label": "Are sales launched"
      },
      "is_expired": {
        "type": "boolean",
        "label": "Is Expired"
      },
      "sale_available": {
        "type": "boolean",
        "label": "sale_available"
      },
      "registration_ids": {
        "type": "one2many",
        "label": "event.registration"
      },
      "seats_reserved": {
        "type": "integer",
        "label": "Reserved Seats"
      },
      "seats_available": {
        "type": "integer",
        "label": "Available Seats"
      },
      "seats_used": {
        "type": "integer",
        "label": "Used Seats"
      },
      "seats_taken": {
        "type": "integer",
        "label": "Taken Seats"
      },
      "limit_max_per_order": {
        "type": "integer",
        "label": "Limit per Order"
      },
      "is_sold_out": {
        "type": "boolean",
        "label": "is_sold_out"
      },
      "color": {
        "type": "char",
        "label": "Color",
        "default": "#875A7B"
      }
    }
  },
  {
    "_name": "event.type",
    "_description": "Event Template",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Event Template",
        "required": true
      },
      "note": {
        "type": "html",
        "label": "Note"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "event_type_ticket_ids": {
        "type": "one2many",
        "label": "event.type.ticket"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "event.tag"
      },
      "has_seats_limitation": {
        "type": "boolean",
        "label": "Limited Seats"
      },
      "seats_max": {
        "type": "integer",
        "label": "seats_max"
      },
      "default_timezone": {
        "type": "selection",
        "label": "default_timezone"
      },
      "event_type_mail_ids": {
        "type": "one2many",
        "label": "event_type_mail_ids"
      },
      "ticket_instructions": {
        "type": "html",
        "label": "Ticket Instructions"
      },
      "question_ids": {
        "type": "many2many",
        "label": "question_ids"
      }
    }
  },
  {
    "_name": "event.type.mail",
    "_description": "Mail Scheduling on Event Category",
    "_auto": true,
    "_fields": {
      "event_type_id": {
        "type": "many2one",
        "label": "event_type_id"
      },
      "interval_nbr": {
        "type": "integer",
        "label": "Interval"
      },
      "interval_unit": {
        "type": "selection",
        "label": "interval_unit"
      },
      "interval_type": {
        "type": "selection",
        "label": "interval_type"
      },
      "notification_type": {
        "type": "selection",
        "label": "mail"
      },
      "template_ref": {
        "type": "char",
        "label": "Template",
        "required": true
      }
    }
  },
  {
    "_name": "event.type.ticket",
    "_description": "Event Template Ticket",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "name": {
        "type": "char",
        "label": "name"
      },
      "description": {
        "type": "text",
        "label": "description"
      },
      "event_type_id": {
        "type": "many2one",
        "label": "event_type_id"
      },
      "seats_limited": {
        "type": "boolean",
        "label": "Limit Attendees"
      },
      "seats_max": {
        "type": "integer",
        "label": "seats_max"
      }
    }
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "event_count": {
        "type": "integer",
        "label": "event_count"
      },
      "static_map_url": {
        "type": "char",
        "label": "_compute_static_map_url"
      },
      "static_map_url_is_valid": {
        "type": "boolean",
        "label": "_compute_static_map_url_is_valid"
      }
    },
    "_inherit": "res.partner"
  }
];
