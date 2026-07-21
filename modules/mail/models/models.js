// Odoo 模块: mail
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "fetchmail.server",
    "_description": "Incoming Mail Server",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "server": {
        "type": "char",
        "label": "Server Name"
      },
      "port": {
        "type": "integer",
        "label": "port"
      },
      "server_type": {
        "type": "selection",
        "label": "server_type"
      },
      "server_type_info": {
        "type": "text",
        "label": "Server Type Info"
      },
      "is_ssl": {
        "type": "boolean",
        "label": "SSL/TLS"
      },
      "attach": {
        "type": "boolean",
        "label": "Keep Attachments"
      },
      "original": {
        "type": "boolean",
        "label": "Keep Original"
      },
      "date": {
        "type": "datetime",
        "label": "Last Fetch Date"
      },
      "error_date": {
        "type": "datetime",
        "label": "Last Error Date"
      },
      "error_message": {
        "type": "text",
        "label": "Last Error Message"
      },
      "user": {
        "type": "char",
        "label": "Username"
      },
      "password": {
        "type": "char",
        "label": "password"
      },
      "object_id": {
        "type": "many2one",
        "label": "ir.model"
      },
      "priority": {
        "type": "integer",
        "label": "Server Priority"
      },
      "message_ids": {
        "type": "one2many",
        "label": "mail.mail"
      },
      "configuration": {
        "type": "text",
        "label": "Configuration"
      },
      "script": {
        "type": "char",
        "label": "/mail/static/scripts/odoo-mailgate.py",
        "default": "/mail/static/scripts/odoo-mailgate.py"
      }
    }
  },
  {
    "_name": "ir.actions.server",
    "_description": "Server Action",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "model_id": {
        "type": "many2one",
        "label": "model_id"
      },
      "crud_model_id": {
        "type": "many2one",
        "label": "crud_model_id"
      },
      "link_field_id": {
        "type": "many2one",
        "label": "link_field_id"
      },
      "update_path": {
        "type": "char",
        "label": "update_path"
      },
      "value": {
        "type": "text",
        "label": "value"
      },
      "evaluation_type": {
        "type": "selection",
        "label": "evaluation_type"
      },
      "webhook_url": {
        "type": "char",
        "label": "webhook_url"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "followers_type": {
        "type": "selection",
        "label": "followers_type"
      },
      "followers_partner_field_name": {
        "type": "char",
        "label": "followers_partner_field_name"
      },
      "partner_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "template_id": {
        "type": "many2one",
        "label": "template_id"
      },
      "mail_post_autofollow": {
        "type": "boolean",
        "label": "mail_post_autofollow"
      },
      "mail_post_method": {
        "type": "selection",
        "label": "mail_post_method"
      },
      "activity_type_id": {
        "type": "many2one",
        "label": "activity_type_id"
      },
      "activity_summary": {
        "type": "char",
        "label": "activity_summary"
      },
      "activity_note": {
        "type": "html",
        "label": "activity_note"
      },
      "activity_date_deadline_range": {
        "type": "integer",
        "label": "activity_date_deadline_range"
      },
      "activity_date_deadline_range_type": {
        "type": "selection",
        "label": "activity_date_deadline_range_type"
      },
      "activity_user_type": {
        "type": "selection",
        "label": "activity_user_type"
      },
      "activity_user_id": {
        "type": "many2one",
        "label": "activity_user_id"
      },
      "activity_user_field_name": {
        "type": "char",
        "label": "activity_user_field_name"
      }
    }
  },
  {
    "_name": "iractionsact_windowview",
    "_description": "iractionsact_windowview",
    "_auto": true,
    "_fields": {
      "view_mode": {
        "type": "selection",
        "label": "view_mode"
      }
    },
    "_inherit": "ir.actions.act_window.view"
  },
  {
    "_name": "id",
    "_description": "id",
    "_auto": true,
    "_fields": {
      "thumbnail": {
        "type": "text",
        "label": "thumbnail"
      },
      "has_thumbnail": {
        "type": "boolean",
        "label": "_compute_has_thumbnail"
      }
    },
    "_inherit": "ir.attachment"
  },
  {
    "_name": "mail.template",
    "_description": "mail.template",
    "_auto": true,
    "_fields": {
      "mail_template_ids": {
        "type": "one2many",
        "label": "mail_template_ids"
      },
      "owner_user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "owner_limit_time": {
        "type": "datetime",
        "label": "Owner Limit Time"
      },
      "owner_limit_count": {
        "type": "integer",
        "label": "Owner Limit Count"
      }
    },
    "_inherit": "ir.mail_server"
  },
  {
    "_name": "irmodel",
    "_description": "irmodel",
    "_auto": true,
    "_fields": {
      "is_mail_thread": {
        "type": "boolean",
        "label": "is_mail_thread"
      },
      "is_mail_activity": {
        "type": "boolean",
        "label": "is_mail_activity"
      },
      "is_mail_blacklist": {
        "type": "boolean",
        "label": "is_mail_blacklist"
      }
    },
    "_inherit": "ir.model"
  },
  {
    "_name": "irmodelfields",
    "_description": "irmodelfields",
    "_auto": true,
    "_fields": {
      "tracking": {
        "type": "integer",
        "label": "tracking"
      }
    },
    "_inherit": "ir.model.fields"
  },
  {
    "_name": "iruiview",
    "_description": "iruiview",
    "_auto": true,
    "_fields": {
      "type": {
        "type": "selection",
        "label": "activity"
      }
    },
    "_inherit": "ir.ui.view"
  },
  {
    "_name": "mail.activity",
    "_description": "Activity",
    "_auto": true,
    "_fields": {
      "res_model_id": {
        "type": "many2one",
        "label": "res_model_id"
      },
      "res_model": {
        "type": "char",
        "label": "res_model"
      },
      "res_id": {
        "type": "char",
        "label": "Related Document ID"
      },
      "res_name": {
        "type": "char",
        "label": "res_name"
      },
      "activity_type_id": {
        "type": "many2one",
        "label": "activity_type_id"
      },
      "activity_category": {
        "type": "selection",
        "label": "activity_type_id.category"
      },
      "activity_decoration": {
        "type": "selection",
        "label": "activity_type_id.decoration_type"
      },
      "icon": {
        "type": "char",
        "label": "Icon"
      },
      "summary": {
        "type": "char",
        "label": "Summary"
      },
      "note": {
        "type": "html",
        "label": "Note"
      },
      "date_deadline": {
        "type": "date",
        "label": "Due Date",
        "required": true
      },
      "date_done": {
        "type": "date",
        "label": "Done Date"
      },
      "feedback": {
        "type": "text",
        "label": "Feedback"
      },
      "automated": {
        "type": "boolean",
        "label": "automated"
      },
      "attachment_ids": {
        "type": "many2many",
        "label": "attachment_ids"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "user_tz": {
        "type": "selection",
        "label": "Timezone"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "recommended_activity_type_id": {
        "type": "many2one",
        "label": "mail.activity.type"
      },
      "previous_activity_type_id": {
        "type": "many2one",
        "label": "mail.activity.type"
      },
      "has_recommended_activities": {
        "type": "boolean",
        "label": "has_recommended_activities"
      },
      "mail_template_ids": {
        "type": "many2many",
        "label": "activity_type_id.mail_template_ids"
      },
      "chaining_type": {
        "type": "selection",
        "label": "activity_type_id.chaining_type"
      },
      "can_write": {
        "type": "boolean",
        "label": "_compute_can_write"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      }
    }
  },
  {
    "_name": "mail.activity.plan",
    "_description": "Activity Plan",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "template_ids": {
        "type": "one2many",
        "label": "template_ids"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "res_model_id": {
        "type": "many2one",
        "label": "res_model_id"
      },
      "res_model": {
        "type": "selection",
        "label": "res_model"
      },
      "steps_count": {
        "type": "integer",
        "label": "_compute_steps_count"
      },
      "has_user_on_demand": {
        "type": "boolean",
        "label": "Has on demand responsible"
      }
    }
  },
  {
    "_name": "mail.activity.plan.template",
    "_description": "Activity plan template",
    "_auto": true,
    "_fields": {
      "plan_id": {
        "type": "many2one",
        "label": "plan_id"
      },
      "res_model": {
        "type": "selection",
        "label": "plan_id.res_model"
      },
      "company_id": {
        "type": "many2one",
        "label": "plan_id.company_id"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "activity_type_id": {
        "type": "many2one",
        "label": "activity_type_id"
      },
      "delay_count": {
        "type": "integer",
        "label": "delay_count"
      },
      "delay_unit": {
        "type": "selection",
        "label": "delay_unit"
      },
      "delay_from": {
        "type": "selection",
        "label": "delay_from"
      },
      "icon": {
        "type": "char",
        "label": "Icon"
      },
      "summary": {
        "type": "char",
        "label": "Summary"
      },
      "responsible_type": {
        "type": "selection",
        "label": "responsible_type"
      },
      "responsible_id": {
        "type": "many2one",
        "label": "responsible_id"
      },
      "note": {
        "type": "html",
        "label": "Note"
      },
      "next_activity_ids": {
        "type": "many2many",
        "label": "next_activity_ids"
      }
    }
  },
  {
    "_name": "mail.activity.type",
    "_description": "Activity Type",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "summary": {
        "type": "char",
        "label": "Default Summary"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "create_uid": {
        "type": "many2one",
        "label": "res.users"
      },
      "delay_count": {
        "type": "integer",
        "label": "delay_count"
      },
      "delay_unit": {
        "type": "selection",
        "label": "delay_unit"
      },
      "delay_label": {
        "type": "char",
        "label": "_compute_delay_label"
      },
      "delay_from": {
        "type": "selection",
        "label": "delay_from"
      },
      "icon": {
        "type": "char",
        "label": "Icon"
      },
      "decoration_type": {
        "type": "selection",
        "label": "decoration_type"
      },
      "res_model": {
        "type": "selection",
        "label": "Model"
      },
      "triggered_next_type_id": {
        "type": "many2one",
        "label": "triggered_next_type_id"
      },
      "chaining_type": {
        "type": "selection",
        "label": "chaining_type"
      },
      "suggested_next_type_ids": {
        "type": "many2many",
        "label": "suggested_next_type_ids"
      },
      "previous_type_ids": {
        "type": "many2many",
        "label": "previous_type_ids"
      },
      "category": {
        "type": "selection",
        "label": "category"
      },
      "mail_template_ids": {
        "type": "many2many",
        "label": "mail.template"
      },
      "default_user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "default_note": {
        "type": "html",
        "label": "Default Note"
      },
      "initial_res_model": {
        "type": "selection",
        "label": "Initial model"
      },
      "res_model_change": {
        "type": "boolean",
        "label": "Model has change",
        "default": false
      }
    }
  },
  {
    "_name": "mail.alias",
    "_description": "Email Aliases",
    "_auto": true,
    "_fields": {
      "alias_name": {
        "type": "char",
        "label": "alias_name"
      },
      "alias_full_name": {
        "type": "char",
        "label": "Alias Email"
      },
      "alias_domain_id": {
        "type": "many2one",
        "label": "alias_domain_id"
      },
      "alias_domain": {
        "type": "char",
        "label": "Alias domain name"
      },
      "alias_model_id": {
        "type": "many2one",
        "label": "ir.model",
        "required": true
      },
      "alias_defaults": {
        "type": "text",
        "label": "Default Values",
        "required": true,
        "default": "{}"
      },
      "alias_force_thread_id": {
        "type": "integer",
        "label": "alias_force_thread_id"
      },
      "alias_parent_model_id": {
        "type": "many2one",
        "label": "alias_parent_model_id"
      },
      "alias_parent_thread_id": {
        "type": "integer",
        "label": "alias_parent_thread_id"
      },
      "alias_contact": {
        "type": "selection",
        "label": "alias_contact"
      },
      "alias_incoming_local": {
        "type": "boolean",
        "label": "Local-part based incoming detection",
        "default": false
      },
      "alias_bounced_content": {
        "type": "html",
        "label": "alias_bounced_content"
      },
      "alias_status": {
        "type": "selection",
        "label": "alias_status"
      }
    }
  },
  {
    "_name": "mail.alias.domain",
    "_description": "Email Domain",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "company_ids": {
        "type": "one2many",
        "label": "company_ids"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "bounce_alias": {
        "type": "char",
        "label": "bounce_alias"
      },
      "bounce_email": {
        "type": "char",
        "label": "Bounce Email"
      },
      "catchall_alias": {
        "type": "char",
        "label": "catchall_alias"
      },
      "catchall_email": {
        "type": "char",
        "label": "Catchall Email"
      },
      "default_from": {
        "type": "char",
        "label": "default_from"
      },
      "default_from_email": {
        "type": "char",
        "label": "Default From"
      }
    }
  },
  {
    "_name": "mail.blacklist",
    "_description": "Mail Blacklist",
    "_auto": true,
    "_fields": {
      "email": {
        "type": "char",
        "label": "Email Address",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      }
    }
  },
  {
    "_name": "mail.canned.response",
    "_description": "Canned Response",
    "_auto": true,
    "_fields": {
      "source": {
        "type": "char",
        "label": "source"
      },
      "substitution": {
        "type": "text",
        "label": "substitution"
      },
      "last_used": {
        "type": "datetime",
        "label": "Last Used"
      },
      "group_ids": {
        "type": "many2many",
        "label": "group_ids"
      },
      "is_shared": {
        "type": "boolean",
        "label": "is_shared"
      },
      "is_editable": {
        "type": "boolean",
        "label": "is_editable"
      }
    }
  },
  {
    "_name": "mail.followers",
    "_description": "Document Followers",
    "_auto": true,
    "_fields": {
      "res_model": {
        "type": "char",
        "label": "res_model"
      },
      "res_id": {
        "type": "char",
        "label": "res_id"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "subtype_ids": {
        "type": "many2many",
        "label": "subtype_ids"
      },
      "name": {
        "type": "char",
        "label": "Name"
      },
      "email": {
        "type": "char",
        "label": "Email"
      },
      "is_active": {
        "type": "boolean",
        "label": "Is Active"
      }
    }
  },
  {
    "_name": "mail.gateway.allowed",
    "_description": "Mail Gateway Allowed",
    "_auto": true,
    "_fields": {
      "email": {
        "type": "char",
        "label": "Email Address",
        "required": true
      },
      "email_normalized": {
        "type": "char",
        "label": "email_normalized"
      }
    }
  },
  {
    "_name": "mail.ice.server",
    "_description": "ICE Server",
    "_auto": true,
    "_fields": {
      "server_type": {
        "type": "selection",
        "label": "stun",
        "required": true,
        "default": "stun"
      },
      "uri": {
        "type": "char",
        "label": "URI",
        "required": true
      },
      "username": {
        "type": "char",
        "label": "username"
      },
      "credential": {
        "type": "char",
        "label": "credential"
      }
    }
  },
  {
    "_name": "mail.link.preview",
    "_description": "Store link preview data",
    "_auto": true,
    "_fields": {
      "source_url": {
        "type": "char",
        "label": "URL",
        "required": true
      },
      "og_type": {
        "type": "char",
        "label": "Type"
      },
      "og_title": {
        "type": "char",
        "label": "Title"
      },
      "og_site_name": {
        "type": "char",
        "label": "Site name"
      },
      "og_image": {
        "type": "char",
        "label": "Image"
      },
      "og_description": {
        "type": "text",
        "label": "Description"
      },
      "og_mimetype": {
        "type": "char",
        "label": "MIME type"
      },
      "image_mimetype": {
        "type": "char",
        "label": "Image MIME type"
      },
      "create_date": {
        "type": "datetime",
        "label": "create_date"
      },
      "message_link_preview_ids": {
        "type": "one2many",
        "label": "message_link_preview_ids"
      }
    }
  },
  {
    "_name": "mail.mail",
    "_description": "Outgoing Mails",
    "_auto": true,
    "_fields": {
      "mail_message_id": {
        "type": "many2one",
        "label": "mail.message",
        "required": true
      },
      "mail_message_id_int": {
        "type": "integer",
        "label": "_compute_mail_message_id_int"
      },
      "message_type": {
        "type": "selection",
        "label": "mail_message_id.message_type",
        "default": "email_outgoing"
      },
      "body_html": {
        "type": "text",
        "label": "Text Contents"
      },
      "body_content": {
        "type": "html",
        "label": "Rich-text Contents"
      },
      "references": {
        "type": "text",
        "label": "References"
      },
      "headers": {
        "type": "text",
        "label": "Headers"
      },
      "restricted_attachment_count": {
        "type": "integer",
        "label": "Restricted attachments"
      },
      "unrestricted_attachment_ids": {
        "type": "many2many",
        "label": "ir.attachment"
      },
      "is_notification": {
        "type": "boolean",
        "label": "Notification Email"
      },
      "email_to": {
        "type": "text",
        "label": "To"
      },
      "email_cc": {
        "type": "char",
        "label": "Cc"
      },
      "recipient_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "failure_type": {
        "type": "selection",
        "label": "failure_type"
      },
      "failure_reason": {
        "type": "text",
        "label": "failure_reason"
      },
      "auto_delete": {
        "type": "boolean",
        "label": "auto_delete"
      },
      "scheduled_date": {
        "type": "datetime",
        "label": "Scheduled Send Date"
      },
      "fetchmail_server_id": {
        "type": "many2one",
        "label": "fetchmail.server"
      }
    }
  },
  {
    "_name": "mail.message",
    "_description": "Message",
    "_auto": true,
    "_fields": {
      "subject": {
        "type": "char",
        "label": "Subject"
      },
      "date": {
        "type": "datetime",
        "label": "Date"
      },
      "body": {
        "type": "html",
        "label": "Contents",
        "default": ""
      },
      "preview": {
        "type": "char",
        "label": "preview"
      },
      "linked_message_ids": {
        "type": "many2many",
        "label": "mail.message"
      },
      "message_link_preview_ids": {
        "type": "one2many",
        "label": "message_link_preview_ids"
      },
      "reaction_ids": {
        "type": "one2many",
        "label": "reaction_ids"
      },
      "attachment_ids": {
        "type": "many2many",
        "label": "attachment_ids"
      },
      "parent_id": {
        "type": "many2one",
        "label": "parent_id"
      },
      "child_ids": {
        "type": "one2many",
        "label": "mail.message"
      },
      "model": {
        "type": "char",
        "label": "Related Document Model"
      },
      "res_id": {
        "type": "char",
        "label": "Related Document ID"
      },
      "record_name": {
        "type": "char",
        "label": "Message Record Name"
      },
      "record_alias_domain_id": {
        "type": "many2one",
        "label": "mail.alias.domain"
      },
      "record_company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "message_type": {
        "type": "selection",
        "label": "message_type"
      },
      "subtype_id": {
        "type": "many2one",
        "label": "mail.message.subtype"
      },
      "mail_activity_type_id": {
        "type": "many2one",
        "label": "mail_activity_type_id"
      },
      "is_internal": {
        "type": "boolean",
        "label": "Employee Only"
      },
      "email_from": {
        "type": "char",
        "label": "From"
      },
      "author_id": {
        "type": "many2one",
        "label": "author_id"
      },
      "author_avatar": {
        "type": "text",
        "label": "Author"
      },
      "author_guest_id": {
        "type": "many2one",
        "label": "Guest"
      },
      "is_current_user_or_guest_author": {
        "type": "boolean",
        "label": "_compute_is_current_user_or_guest_author"
      },
      "partner_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "incoming_email_to": {
        "type": "text",
        "label": "Emails To"
      },
      "incoming_email_cc": {
        "type": "char",
        "label": "Emails Cc"
      },
      "outgoing_email_to": {
        "type": "char",
        "label": "emails To"
      },
      "notified_partner_ids": {
        "type": "many2many",
        "label": "notified_partner_ids"
      },
      "needaction": {
        "type": "boolean",
        "label": "needaction"
      },
      "has_error": {
        "type": "boolean",
        "label": "has_error"
      },
      "notification_ids": {
        "type": "one2many",
        "label": "notification_ids"
      },
      "starred_partner_ids": {
        "type": "many2many",
        "label": "starred_partner_ids"
      },
      "pinned_at": {
        "type": "datetime",
        "label": "Pinned"
      },
      "starred": {
        "type": "boolean",
        "label": "starred"
      },
      "tracking_value_ids": {
        "type": "one2many",
        "label": "tracking_value_ids"
      },
      "reply_to_force_new": {
        "type": "boolean",
        "label": "reply_to_force_new"
      },
      "message_id": {
        "type": "char",
        "label": "Message-Id"
      },
      "reply_to": {
        "type": "char",
        "label": "Reply-To"
      },
      "mail_server_id": {
        "type": "many2one",
        "label": "ir.mail_server"
      },
      "email_layout_xmlid": {
        "type": "char",
        "label": "Layout"
      },
      "email_add_signature": {
        "type": "boolean",
        "label": "email_add_signature",
        "default": true
      },
      "mail_ids": {
        "type": "one2many",
        "label": "mail.mail"
      }
    }
  },
  {
    "_name": "mail.message.link.preview",
    "_description": "Link between link previews and messages",
    "_auto": true,
    "_fields": {
      "message_id": {
        "type": "many2one",
        "label": "mail.message",
        "required": true
      },
      "link_preview_id": {
        "type": "many2one",
        "label": "link_preview_id"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "is_hidden": {
        "type": "boolean",
        "label": "is_hidden"
      },
      "author_id": {
        "type": "many2one",
        "label": "message_id.author_id"
      }
    }
  },
  {
    "_name": "mail.message.reaction",
    "_description": "Message Reaction",
    "_auto": true,
    "_fields": {
      "message_id": {
        "type": "many2one",
        "label": "Message",
        "required": true
      },
      "content": {
        "type": "char",
        "label": "Content",
        "required": true
      },
      "partner_id": {
        "type": "many2one",
        "label": "Reacting Partner"
      },
      "guest_id": {
        "type": "many2one",
        "label": "Reacting Guest"
      }
    }
  },
  {
    "_name": "mail.message.schedule",
    "_description": "Scheduled Messages",
    "_auto": true,
    "_fields": {
      "mail_message_id": {
        "type": "many2one",
        "label": "mail_message_id"
      },
      "notification_parameters": {
        "type": "text",
        "label": "Notification Parameter"
      },
      "scheduled_datetime": {
        "type": "datetime",
        "label": "scheduled_datetime"
      }
    }
  },
  {
    "_name": "mail.message.subtype",
    "_description": "Message subtypes",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "description": {
        "type": "text",
        "label": "description"
      },
      "internal": {
        "type": "boolean",
        "label": "internal"
      },
      "parent_id": {
        "type": "many2one",
        "label": "parent_id"
      },
      "relation_field": {
        "type": "char",
        "label": "relation_field"
      },
      "res_model": {
        "type": "char",
        "label": "Model"
      },
      "default": {
        "type": "boolean",
        "label": "Default"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "hidden": {
        "type": "boolean",
        "label": "Hidden"
      },
      "track_recipients": {
        "type": "boolean",
        "label": "Track Recipients"
      }
    }
  },
  {
    "_name": "mail.message.translation",
    "_description": "Message Translation",
    "_auto": true,
    "_fields": {
      "message_id": {
        "type": "many2one",
        "label": "mail.message",
        "required": true
      },
      "source_lang": {
        "type": "char",
        "label": "source_lang"
      },
      "target_lang": {
        "type": "char",
        "label": "target_lang"
      },
      "body": {
        "type": "html",
        "label": "body"
      },
      "create_date": {
        "type": "datetime",
        "label": "create_date"
      },
      "treshold": {
        "type": "datetime",
        "label": "treshold"
      }
    }
  },
  {
    "_name": "mail.notification",
    "_description": "Message Notifications",
    "_auto": true,
    "_fields": {
      "author_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "mail_message_id": {
        "type": "many2one",
        "label": "mail.message",
        "required": true
      },
      "mail_mail_id": {
        "type": "many2one",
        "label": "mail.mail"
      },
      "res_partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "mail_email_address": {
        "type": "char",
        "label": "Recipient email address"
      },
      "notification_type": {
        "type": "selection",
        "label": "notification_type"
      },
      "notification_status": {
        "type": "selection",
        "label": "notification_status"
      },
      "is_read": {
        "type": "boolean",
        "label": "Is Read"
      },
      "read_date": {
        "type": "datetime",
        "label": "Read Date"
      },
      "failure_type": {
        "type": "selection",
        "label": "failure_type"
      },
      "failure_reason": {
        "type": "text",
        "label": "Failure reason"
      }
    }
  },
  {
    "_name": "mail.presence",
    "_description": "User/Guest Presence",
    "_auto": true,
    "_fields": {
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "guest_id": {
        "type": "many2one",
        "label": "mail.guest"
      },
      "last_poll": {
        "type": "datetime",
        "label": "Last Poll"
      },
      "last_presence": {
        "type": "datetime",
        "label": "Last Presence"
      },
      "status": {
        "type": "selection",
        "label": "status"
      }
    },
    "_inherit": "bus.listener.mixin"
  },
  {
    "_name": "mail.push",
    "_description": "Push Notifications",
    "_auto": true,
    "_fields": {
      "mail_push_device_id": {
        "type": "many2one",
        "label": "mail.push.device",
        "required": true
      },
      "payload": {
        "type": "text",
        "label": "payload"
      }
    }
  },
  {
    "_name": "mail.push.device",
    "_description": "Push Notification Device",
    "_auto": true,
    "_fields": {
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "endpoint": {
        "type": "char",
        "label": "Browser endpoint",
        "required": true
      },
      "keys": {
        "type": "char",
        "label": "Browser keys",
        "required": true
      },
      "expiration_time": {
        "type": "datetime",
        "label": "Expiration Token Date"
      }
    }
  },
  {
    "_name": "mail.scheduled.message",
    "_description": "Scheduled Message",
    "_auto": true,
    "_fields": {
      "subject": {
        "type": "char",
        "label": "Subject"
      },
      "body": {
        "type": "html",
        "label": "Contents"
      },
      "scheduled_date": {
        "type": "datetime",
        "label": "Scheduled Date",
        "required": true
      },
      "attachment_ids": {
        "type": "many2many",
        "label": "attachment_ids"
      },
      "composition_comment_option": {
        "type": "selection",
        "label": "composition_comment_option"
      },
      "model": {
        "type": "char",
        "label": "Related Document Model",
        "required": true
      },
      "res_id": {
        "type": "char",
        "label": "Related Document Id",
        "required": true
      },
      "author_id": {
        "type": "many2one",
        "label": "res.partner",
        "required": true
      },
      "partner_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "is_note": {
        "type": "boolean",
        "label": "Is a note",
        "default": false
      },
      "notification_parameters": {
        "type": "text",
        "label": "Notification parameters"
      },
      "send_context": {
        "type": "char",
        "label": "Sending Context"
      }
    }
  },
  {
    "_name": "my.model",
    "_description": "my.model",
    "_auto": true,
    "_fields": {
      "tracked_field": {
        "type": "many2one",
        "label": "tracked.model"
      }
    }
  },
  {
    "_name": "mail.tracking.value",
    "_description": "Mail Tracking Value",
    "_auto": true,
    "_fields": {
      "field_id": {
        "type": "many2one",
        "label": "field_id"
      },
      "field_info": {
        "type": "char",
        "label": "Removed field information"
      },
      "old_value_integer": {
        "type": "integer",
        "label": "Old Value Integer"
      },
      "old_value_float": {
        "type": "float",
        "label": "Old Value Float"
      },
      "old_value_char": {
        "type": "char",
        "label": "Old Value Char"
      },
      "old_value_text": {
        "type": "text",
        "label": "Old Value Text"
      },
      "old_value_datetime": {
        "type": "datetime",
        "label": "Old Value DateTime"
      },
      "new_value_integer": {
        "type": "integer",
        "label": "New Value Integer"
      },
      "new_value_float": {
        "type": "float",
        "label": "New Value Float"
      },
      "new_value_char": {
        "type": "char",
        "label": "New Value Char"
      },
      "new_value_text": {
        "type": "text",
        "label": "New Value Text"
      },
      "new_value_datetime": {
        "type": "datetime",
        "label": "New Value Datetime"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "mail_message_id": {
        "type": "many2one",
        "label": "mail.message",
        "required": true
      }
    }
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "alias_domain_id": {
        "type": "many2one",
        "label": "alias_domain_id"
      },
      "bounce_email": {
        "type": "char",
        "label": "Bounce Email"
      },
      "bounce_formatted": {
        "type": "char",
        "label": "Bounce"
      },
      "catchall_email": {
        "type": "char",
        "label": "Catchall Email"
      },
      "catchall_formatted": {
        "type": "char",
        "label": "Catchall"
      },
      "default_from_email": {
        "type": "char",
        "label": "default_from_email"
      },
      "email_formatted": {
        "type": "char",
        "label": "email_formatted"
      },
      "email_primary_color": {
        "type": "char",
        "label": "email_primary_color"
      },
      "email_secondary_color": {
        "type": "char",
        "label": "email_secondary_color"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "res.partner",
    "_description": "res.partner",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "email": {
        "type": "char",
        "label": "email"
      },
      "phone": {
        "type": "char",
        "label": "phone"
      },
      "parent_id": {
        "type": "many2one",
        "label": "parent_id"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "vat": {
        "type": "char",
        "label": "vat"
      },
      "contact_address_inline": {
        "type": "char",
        "label": "_compute_contact_address_inline"
      },
      "im_status": {
        "type": "char",
        "label": "IM Status"
      },
      "offline_since": {
        "type": "datetime",
        "label": "Offline since"
      }
    }
  },
  {
    "_name": "res.role",
    "_description": "res.role",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "user_ids": {
        "type": "many2many",
        "label": "res.users",
        "relation": "res_role_res_users_rel"
      }
    }
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "role_ids": {
        "type": "many2many",
        "label": "role_ids"
      },
      "can_edit_role": {
        "type": "boolean",
        "label": "_compute_can_edit_role"
      },
      "notification_type": {
        "type": "selection",
        "label": "notification_type"
      },
      "presence_ids": {
        "type": "one2many",
        "label": "mail.presence"
      },
      "out_of_office_from": {
        "type": "datetime",
        "label": "out_of_office_from"
      },
      "out_of_office_to": {
        "type": "datetime",
        "label": "out_of_office_to"
      },
      "out_of_office_message": {
        "type": "html",
        "label": "Vacation Responder"
      },
      "is_out_of_office": {
        "type": "boolean",
        "label": "Out of Office"
      },
      "im_status": {
        "type": "char",
        "label": "IM Status"
      },
      "manual_im_status": {
        "type": "selection",
        "label": "manual_im_status"
      },
      "outgoing_mail_server_id": {
        "type": "many2one",
        "label": "outgoing_mail_server_id"
      },
      "outgoing_mail_server_type": {
        "type": "selection",
        "label": "outgoing_mail_server_type"
      },
      "has_external_mail_server": {
        "type": "boolean",
        "label": "_compute_has_external_mail_server"
      }
    },
    "_inherit": "res.users"
  },
  {
    "_name": "resuserssettings",
    "_description": "resuserssettings",
    "_auto": true,
    "_fields": {
      "is_discuss_sidebar_category_channel_open": {
        "type": "boolean",
        "label": "Is discuss sidebar category channel open?",
        "default": true
      },
      "is_discuss_sidebar_category_chat_open": {
        "type": "boolean",
        "label": "Is discuss sidebar category chat open?",
        "default": true
      },
      "push_to_talk_key": {
        "type": "char",
        "label": "Push-To-Talk shortcut"
      },
      "use_push_to_talk": {
        "type": "boolean",
        "label": "Use the push to talk feature",
        "default": false
      },
      "voice_active_duration": {
        "type": "integer",
        "label": "Duration of voice activity in ms"
      },
      "volume_settings_ids": {
        "type": "one2many",
        "label": "res.users.settings.volumes"
      },
      "channel_notifications": {
        "type": "selection",
        "label": "channel_notifications"
      }
    },
    "_inherit": "res.users.settings"
  },
  {
    "_name": "res.users.settings.volumes",
    "_description": "User Settings Volumes",
    "_auto": true,
    "_fields": {
      "user_setting_id": {
        "type": "many2one",
        "label": "res.users.settings",
        "required": true
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "guest_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "volume": {
        "type": "float",
        "label": "Ranges between 0.0 and 1.0, scale depends on the browser implementation"
      }
    }
  },
  {
    "_name": "discuss.call.history",
    "_description": "Keep the call history",
    "_auto": true,
    "_fields": {
      "channel_id": {
        "type": "many2one",
        "label": "discuss.channel",
        "required": true
      },
      "duration_hour": {
        "type": "float",
        "label": "_compute_duration_hour"
      },
      "start_dt": {
        "type": "datetime",
        "label": "start_dt",
        "required": true
      },
      "end_dt": {
        "type": "datetime",
        "label": "end_dt"
      },
      "start_call_message_id": {
        "type": "many2one",
        "label": "mail.message"
      }
    }
  },
  {
    "_name": "discuss.channel",
    "_description": "Discussion Channel",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "Set active to false to hide the channel without removing it.",
        "default": true
      },
      "channel_type": {
        "type": "selection",
        "label": "channel_type"
      },
      "is_editable": {
        "type": "boolean",
        "label": "Is Editable"
      },
      "default_display_mode": {
        "type": "selection",
        "label": "Default Display Mode"
      },
      "description": {
        "type": "text",
        "label": "Description"
      },
      "image_128": {
        "type": "text",
        "label": "Image"
      },
      "avatar_128": {
        "type": "text",
        "label": "Avatar"
      },
      "avatar_cache_key": {
        "type": "char",
        "label": "_compute_avatar_cache_key"
      },
      "channel_partner_ids": {
        "type": "many2many",
        "label": "channel_partner_ids"
      },
      "channel_member_ids": {
        "type": "one2many",
        "label": "discuss.channel.member"
      },
      "parent_channel_id": {
        "type": "many2one",
        "label": "discuss.channel"
      },
      "sub_channel_ids": {
        "type": "one2many",
        "label": "discuss.channel"
      },
      "from_message_id": {
        "type": "many2one",
        "label": "mail.message"
      },
      "pinned_message_ids": {
        "type": "one2many",
        "label": "mail.message"
      },
      "sfu_channel_uuid": {
        "type": "char",
        "label": "base.group_system"
      },
      "sfu_server_url": {
        "type": "char",
        "label": "base.group_system"
      },
      "rtc_session_ids": {
        "type": "one2many",
        "label": "discuss.channel.rtc.session"
      },
      "call_history_ids": {
        "type": "one2many",
        "label": "discuss.call.history"
      },
      "is_member": {
        "type": "boolean",
        "label": "Is Member"
      },
      "self_member_id": {
        "type": "many2one",
        "label": "discuss.channel.member"
      },
      "invited_member_ids": {
        "type": "one2many",
        "label": "discuss.channel.member"
      },
      "member_count": {
        "type": "integer",
        "label": "Member Count"
      },
      "message_count": {
        "type": "integer",
        "label": "# Messages"
      },
      "last_interest_dt": {
        "type": "datetime",
        "label": "last_interest_dt"
      },
      "group_ids": {
        "type": "many2many",
        "label": "group_ids"
      },
      "uuid": {
        "type": "char",
        "label": "UUID"
      },
      "group_public_id": {
        "type": "many2one",
        "label": "res.groups"
      },
      "invitation_url": {
        "type": "char",
        "label": "Invitation URL"
      },
      "channel_name_member_ids": {
        "type": "one2many",
        "label": "channel_name_member_ids"
      }
    }
  },
  {
    "_name": "discuss.channel.member",
    "_description": "Channel Member",
    "_auto": true,
    "_fields": {
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "guest_id": {
        "type": "many2one",
        "label": "mail.guest"
      },
      "is_self": {
        "type": "boolean",
        "label": "_compute_is_self"
      },
      "channel_id": {
        "type": "many2one",
        "label": "discuss.channel",
        "required": true
      },
      "custom_channel_name": {
        "type": "char",
        "label": "Custom channel name"
      },
      "fetched_message_id": {
        "type": "many2one",
        "label": "mail.message"
      },
      "seen_message_id": {
        "type": "many2one",
        "label": "mail.message"
      },
      "new_message_separator": {
        "type": "integer",
        "label": "Message id before which the separator should be displayed",
        "required": true
      },
      "message_unread_counter": {
        "type": "integer",
        "label": "Unread Messages Counter"
      },
      "custom_notifications": {
        "type": "selection",
        "label": "custom_notifications"
      },
      "mute_until_dt": {
        "type": "datetime",
        "label": "Mute notifications until"
      },
      "is_pinned": {
        "type": "boolean",
        "label": "Is pinned on the interface"
      },
      "unpin_dt": {
        "type": "datetime",
        "label": "Unpin date"
      },
      "last_interest_dt": {
        "type": "datetime",
        "label": "last_interest_dt"
      },
      "last_seen_dt": {
        "type": "datetime",
        "label": "Last seen date"
      },
      "rtc_session_ids": {
        "type": "one2many",
        "label": "RTC Sessions"
      },
      "rtc_inviting_session_id": {
        "type": "many2one",
        "label": "discuss.channel.rtc.session"
      }
    }
  },
  {
    "_name": "discuss.channel.rtc.session",
    "_description": "Mail RTC session",
    "_auto": true,
    "_fields": {
      "channel_member_id": {
        "type": "many2one",
        "label": "discuss.channel.member",
        "required": true
      },
      "channel_id": {
        "type": "many2one",
        "label": "discuss.channel"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "guest_id": {
        "type": "many2one",
        "label": "mail.guest"
      },
      "write_date": {
        "type": "datetime",
        "label": "Last Updated On"
      },
      "is_screen_sharing_on": {
        "type": "boolean",
        "label": "Is sharing the screen"
      },
      "is_camera_on": {
        "type": "boolean",
        "label": "Is sending user video"
      },
      "is_muted": {
        "type": "boolean",
        "label": "Is microphone muted"
      },
      "is_deaf": {
        "type": "boolean",
        "label": "Has disabled incoming sound"
      }
    }
  },
  {
    "_name": "discuss.gif.favorite",
    "_description": "Save favorite GIF from Tenor API",
    "_auto": true,
    "_fields": {
      "tenor_gif_id": {
        "type": "char",
        "label": "GIF id from Tenor",
        "required": true
      }
    }
  },
  {
    "_name": "discuss.voice.metadata",
    "_description": "Metadata for voice attachments",
    "_auto": true,
    "_fields": {
      "attachment_id": {
        "type": "many2one",
        "label": "attachment_id"
      }
    }
  },
  {
    "_name": "irattachment",
    "_description": "irattachment",
    "_auto": true,
    "_fields": {
      "voice_ids": {
        "type": "one2many",
        "label": "discuss.voice.metadata"
      }
    },
    "_inherit": "ir.attachment"
  },
  {
    "_name": "mail.guest",
    "_description": "Guest",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "access_token": {
        "type": "char",
        "label": "Access Token",
        "required": true
      },
      "country_id": {
        "type": "many2one",
        "label": "Country"
      },
      "email": {
        "type": "char",
        "label": "email"
      },
      "lang": {
        "type": "selection",
        "label": "Language"
      },
      "timezone": {
        "type": "selection",
        "label": "Timezone"
      },
      "channel_ids": {
        "type": "many2many",
        "label": "Channels",
        "relation": "discuss_channel_member"
      },
      "presence_ids": {
        "type": "one2many",
        "label": "mail.presence"
      },
      "im_status": {
        "type": "char",
        "label": "IM Status"
      },
      "offline_since": {
        "type": "datetime",
        "label": "Offline since"
      }
    }
  },
  {
    "_name": "mailmessage",
    "_description": "mailmessage",
    "_auto": true,
    "_fields": {
      "call_history_ids": {
        "type": "one2many",
        "label": "discuss.call.history"
      },
      "channel_id": {
        "type": "many2one",
        "label": "discuss.channel"
      }
    },
    "_inherit": "mail.message"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "channel_ids": {
        "type": "many2many",
        "label": "channel_ids"
      },
      "channel_member_ids": {
        "type": "one2many",
        "label": "discuss.channel.member"
      },
      "is_in_call": {
        "type": "boolean",
        "label": "_compute_is_in_call"
      },
      "rtc_session_ids": {
        "type": "one2many",
        "label": "discuss.channel.rtc.session"
      }
    },
    "_inherit": "res.partner"
  }
];
