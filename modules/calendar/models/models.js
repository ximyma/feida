// Odoo 模块: calendar
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "calendar.alarm",
    "_description": "Event Alarm",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "alarm_type": {
        "type": "selection",
        "label": "alarm_type"
      },
      "duration": {
        "type": "integer",
        "label": "Remind Before",
        "required": true
      },
      "interval": {
        "type": "selection",
        "label": "interval"
      },
      "duration_minutes": {
        "type": "integer",
        "label": "duration_minutes"
      },
      "mail_template_id": {
        "type": "many2one",
        "label": "mail_template_id"
      },
      "body": {
        "type": "text",
        "label": "Additional Message"
      },
      "notify_responsible": {
        "type": "boolean",
        "label": "Notify Responsible",
        "default": false
      }
    }
  },
  {
    "_name": "calendar.attendee",
    "_description": "Calendar Attendee Information",
    "_auto": true,
    "_fields": {
      "event_id": {
        "type": "many2one",
        "label": "calendar.event",
        "required": true
      },
      "recurrence_id": {
        "type": "many2one",
        "label": "calendar.recurrence"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner",
        "required": true
      },
      "email": {
        "type": "char",
        "label": "Email"
      },
      "phone": {
        "type": "char",
        "label": "Phone"
      },
      "common_name": {
        "type": "char",
        "label": "Common name"
      },
      "access_token": {
        "type": "char",
        "label": "Invitation Token"
      },
      "mail_tz": {
        "type": "selection",
        "label": "_compute_mail_tz"
      },
      "state": {
        "type": "selection",
        "label": "Status",
        "default": "needsAction"
      },
      "availability": {
        "type": "selection",
        "label": "availability"
      }
    }
  },
  {
    "_name": "calendar.event",
    "_description": "Calendar Event",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Meeting Subject",
        "required": true
      },
      "description": {
        "type": "html",
        "label": "Description"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "location": {
        "type": "char",
        "label": "Location"
      },
      "notes": {
        "type": "html",
        "label": "Notes"
      },
      "videocall_location": {
        "type": "char",
        "label": "Meeting URL"
      },
      "access_token": {
        "type": "char",
        "label": "Invitation Token"
      },
      "videocall_source": {
        "type": "selection",
        "label": "discuss"
      },
      "videocall_channel_id": {
        "type": "many2one",
        "label": "discuss.channel"
      },
      "privacy": {
        "type": "selection",
        "label": "privacy"
      },
      "effective_privacy": {
        "type": "selection",
        "label": "effective_privacy"
      },
      "show_as": {
        "type": "selection",
        "label": "show_as"
      },
      "is_highlighted": {
        "type": "boolean",
        "label": "is_highlighted"
      },
      "is_organizer_alone": {
        "type": "boolean",
        "label": "_compute_is_organizer_alone"
      },
      "active": {
        "type": "boolean",
        "label": "active"
      },
      "categ_ids": {
        "type": "many2many",
        "label": "categ_ids"
      },
      "start": {
        "type": "datetime",
        "label": "start"
      },
      "stop": {
        "type": "datetime",
        "label": "stop"
      },
      "display_time": {
        "type": "char",
        "label": "Event Time"
      },
      "allday": {
        "type": "boolean",
        "label": "All Day",
        "default": false
      },
      "start_date": {
        "type": "date",
        "label": "start_date"
      },
      "stop_date": {
        "type": "date",
        "label": "stop_date"
      },
      "duration": {
        "type": "float",
        "label": "Duration"
      },
      "res_id": {
        "type": "char",
        "label": "Document ID"
      },
      "res_model_id": {
        "type": "many2one",
        "label": "ir.model"
      },
      "res_model": {
        "type": "char",
        "label": "res_model"
      },
      "res_model_name": {
        "type": "char",
        "label": "res_model_id.name"
      },
      "activity_ids": {
        "type": "one2many",
        "label": "mail.activity"
      },
      "attendee_ids": {
        "type": "one2many",
        "label": "attendee_ids"
      },
      "current_attendee": {
        "type": "many2one",
        "label": "calendar.attendee"
      },
      "current_status": {
        "type": "selection",
        "label": "Attending?"
      },
      "should_show_status": {
        "type": "boolean",
        "label": "_compute_should_show_status"
      },
      "partner_ids": {
        "type": "many2many",
        "label": "partner_ids"
      },
      "invalid_email_partner_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "unavailable_partner_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "alarm_ids": {
        "type": "many2many",
        "label": "alarm_ids"
      },
      "recurrency": {
        "type": "boolean",
        "label": "Recurrent"
      },
      "recurrence_id": {
        "type": "many2one",
        "label": "recurrence_id"
      },
      "follow_recurrence": {
        "type": "boolean",
        "label": "follow_recurrence",
        "default": false
      },
      "recurrence_update": {
        "type": "selection",
        "label": "recurrence_update"
      },
      "rrule": {
        "type": "char",
        "label": "Recurrent Rule"
      },
      "rrule_type_ui": {
        "type": "selection",
        "label": "Repeat"
      },
      "rrule_type": {
        "type": "selection",
        "label": "Recurrence"
      },
      "event_tz": {
        "type": "selection",
        "label": "event_tz"
      },
      "end_type": {
        "type": "selection",
        "label": "end_type"
      },
      "interval": {
        "type": "integer",
        "label": "interval"
      },
      "count": {
        "type": "integer",
        "label": "count"
      },
      "mon": {
        "type": "boolean",
        "label": "_compute_recurrence"
      },
      "tue": {
        "type": "boolean",
        "label": "_compute_recurrence"
      },
      "wed": {
        "type": "boolean",
        "label": "_compute_recurrence"
      },
      "thu": {
        "type": "boolean",
        "label": "_compute_recurrence"
      },
      "fri": {
        "type": "boolean",
        "label": "_compute_recurrence"
      },
      "sat": {
        "type": "boolean",
        "label": "_compute_recurrence"
      },
      "sun": {
        "type": "boolean",
        "label": "_compute_recurrence"
      },
      "month_by": {
        "type": "selection",
        "label": "month_by"
      },
      "day": {
        "type": "integer",
        "label": "Date of month"
      },
      "weekday": {
        "type": "selection",
        "label": "_compute_recurrence"
      },
      "byday": {
        "type": "selection",
        "label": "By day"
      },
      "until": {
        "type": "date",
        "label": "_compute_recurrence"
      },
      "display_description": {
        "type": "boolean",
        "label": "_compute_display_description"
      },
      "attendees_count": {
        "type": "integer",
        "label": "_compute_attendees_count"
      },
      "accepted_count": {
        "type": "integer",
        "label": "_compute_attendees_count"
      },
      "declined_count": {
        "type": "integer",
        "label": "_compute_attendees_count"
      },
      "tentative_count": {
        "type": "integer",
        "label": "_compute_attendees_count"
      },
      "awaiting_count": {
        "type": "integer",
        "label": "_compute_attendees_count"
      },
      "user_can_edit": {
        "type": "boolean",
        "label": "_compute_user_can_edit"
      }
    }
  },
  {
    "_name": "calendar.event.type",
    "_description": "Event Meeting Type",
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
      }
    }
  },
  {
    "_name": "calendar.filters",
    "_description": "Calendar Filters",
    "_auto": true,
    "_fields": {
      "user_id": {
        "type": "many2one",
        "label": "res.users",
        "required": true
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "partner_checked": {
        "type": "boolean",
        "label": "Checked",
        "default": true
      }
    }
  },
  {
    "_name": "calendar.recurrence",
    "_description": "Event Recurrence Rule",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "_compute_name"
      },
      "base_event_id": {
        "type": "many2one",
        "label": "base_event_id"
      },
      "calendar_event_ids": {
        "type": "one2many",
        "label": "calendar.event"
      },
      "event_tz": {
        "type": "selection",
        "label": "event_tz"
      },
      "rrule": {
        "type": "char",
        "label": "_compute_rrule"
      },
      "dtstart": {
        "type": "datetime",
        "label": "_compute_dtstart"
      },
      "rrule_type": {
        "type": "selection",
        "label": "weekly",
        "default": "weekly"
      },
      "end_type": {
        "type": "selection",
        "label": "count",
        "default": "count"
      },
      "interval": {
        "type": "integer",
        "label": "interval"
      },
      "count": {
        "type": "integer",
        "label": "count"
      },
      "mon": {
        "type": "boolean",
        "label": "mon"
      },
      "tue": {
        "type": "boolean",
        "label": "tue"
      },
      "wed": {
        "type": "boolean",
        "label": "wed"
      },
      "thu": {
        "type": "boolean",
        "label": "thu"
      },
      "fri": {
        "type": "boolean",
        "label": "fri"
      },
      "sat": {
        "type": "boolean",
        "label": "sat"
      },
      "sun": {
        "type": "boolean",
        "label": "sun"
      },
      "month_by": {
        "type": "selection",
        "label": "date",
        "default": "date"
      },
      "day": {
        "type": "integer",
        "label": "day"
      },
      "weekday": {
        "type": "selection",
        "label": "Weekday"
      },
      "byday": {
        "type": "selection",
        "label": "By day"
      },
      "until": {
        "type": "date",
        "label": "Repeat Until"
      },
      "trigger_id": {
        "type": "many2one",
        "label": "ir.cron.trigger"
      }
    }
  },
  {
    "_name": "discusschannel",
    "_description": "discusschannel",
    "_auto": true,
    "_fields": {
      "calendar_event_ids": {
        "type": "one2many",
        "label": "calendar.event"
      }
    },
    "_inherit": "discuss.channel"
  },
  {
    "_name": "mailactivity",
    "_description": "mailactivity",
    "_auto": true,
    "_fields": {
      "calendar_event_id": {
        "type": "many2one",
        "label": "calendar.event"
      }
    },
    "_inherit": "mail.activity"
  },
  {
    "_name": "mailactivitytype",
    "_description": "mailactivitytype",
    "_auto": true,
    "_fields": {
      "category": {
        "type": "selection",
        "label": "meeting"
      }
    },
    "_inherit": "mail.activity.type"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "meeting_count": {
        "type": "integer",
        "label": "# Meetings"
      },
      "meeting_ids": {
        "type": "many2many",
        "label": "calendar.event"
      },
      "calendar_last_notif_ack": {
        "type": "datetime",
        "label": "calendar_last_notif_ack"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "calendar_default_privacy": {
        "type": "selection",
        "label": "calendar_default_privacy"
      }
    },
    "_inherit": "res.users"
  },
  {
    "_name": "resuserssettings",
    "_description": "resuserssettings",
    "_auto": true,
    "_fields": {
      "calendar_default_privacy": {
        "type": "selection",
        "label": "calendar_default_privacy"
      }
    },
    "_inherit": "res.users.settings"
  }
];
