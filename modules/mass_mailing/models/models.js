// Odoo 模块: mass_mailing
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mailing.mailing",
    "_description": "mailing.mailing",
    "_auto": true,
    "_fields": {
      "active_mailing_ids": {
        "type": "one2many",
        "label": "active_mailing_ids"
      }
    },
    "_inherit": "ir.mail_server"
  },
  {
    "_name": "irmodel",
    "_description": "irmodel",
    "_auto": true,
    "_fields": {
      "is_mailing_enabled": {
        "type": "boolean",
        "label": "is_mailing_enabled"
      }
    },
    "_inherit": "ir.model"
  },
  {
    "_name": "linktracker",
    "_description": "linktracker",
    "_auto": true,
    "_fields": {
      "mass_mailing_id": {
        "type": "many2one",
        "label": "mailing.mailing"
      }
    },
    "_inherit": "link.tracker"
  },
  {
    "_name": "linktrackerclick",
    "_description": "linktrackerclick",
    "_auto": true,
    "_fields": {
      "mailing_trace_id": {
        "type": "many2one",
        "label": "mailing.trace"
      },
      "mass_mailing_id": {
        "type": "many2one",
        "label": "mailing.mailing"
      }
    },
    "_inherit": "link.tracker.click"
  },
  {
    "_name": "mailing.contact",
    "_description": "Mailing Contact",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "first_name": {
        "type": "char",
        "label": "First Name"
      },
      "last_name": {
        "type": "char",
        "label": "Last Name"
      },
      "company_name": {
        "type": "char",
        "label": "Company Name"
      },
      "email": {
        "type": "char",
        "label": "Email"
      },
      "list_ids": {
        "type": "many2many",
        "label": "list_ids"
      },
      "subscription_ids": {
        "type": "one2many",
        "label": "subscription_ids"
      },
      "country_id": {
        "type": "many2one",
        "label": "res.country"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "res.partner.category"
      },
      "opt_out": {
        "type": "boolean",
        "label": "opt_out"
      }
    }
  },
  {
    "_name": "mailing.filter",
    "_description": "Mailing Favorite Filters",
    "_auto": true,
    "_fields": {
      "create_uid": {
        "type": "many2one",
        "label": "res.users"
      },
      "name": {
        "type": "char",
        "label": "Filter Name",
        "required": true
      },
      "mailing_domain": {
        "type": "char",
        "label": "Filter Domain",
        "required": true
      },
      "mailing_model_id": {
        "type": "many2one",
        "label": "ir.model",
        "required": true
      },
      "mailing_model_name": {
        "type": "char",
        "label": "Recipients Model Name"
      }
    }
  },
  {
    "_name": "mailing.list",
    "_description": "Mailing List",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Mailing List",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "contact_count": {
        "type": "integer",
        "label": "_compute_mailing_list_statistics"
      },
      "contact_count_email": {
        "type": "integer",
        "label": "_compute_mailing_list_statistics"
      },
      "contact_count_opt_out": {
        "type": "integer",
        "label": "_compute_mailing_list_statistics"
      },
      "contact_pct_opt_out": {
        "type": "float",
        "label": "_compute_mailing_list_statistics"
      },
      "contact_count_blacklisted": {
        "type": "integer",
        "label": "_compute_mailing_list_statistics"
      },
      "contact_pct_blacklisted": {
        "type": "float",
        "label": "_compute_mailing_list_statistics"
      },
      "contact_pct_bounce": {
        "type": "float",
        "label": "_compute_mailing_list_statistics"
      },
      "contact_ids": {
        "type": "many2many",
        "label": "contact_ids"
      },
      "mailing_count": {
        "type": "integer",
        "label": "_compute_mailing_count"
      },
      "mailing_ids": {
        "type": "many2many",
        "label": "mailing_ids"
      },
      "subscription_ids": {
        "type": "one2many",
        "label": "subscription_ids"
      },
      "is_public": {
        "type": "boolean",
        "label": "is_public"
      }
    }
  },
  {
    "_name": "mailing.subscription",
    "_description": "Mailing List Subscription",
    "_auto": true,
    "_fields": {
      "contact_id": {
        "type": "many2one",
        "label": "mailing.contact",
        "required": true
      },
      "list_id": {
        "type": "many2one",
        "label": "mailing.list",
        "required": true
      },
      "opt_out": {
        "type": "boolean",
        "label": "opt_out"
      },
      "opt_out_reason_id": {
        "type": "many2one",
        "label": "opt_out_reason_id"
      },
      "opt_out_datetime": {
        "type": "datetime",
        "label": "opt_out_datetime"
      },
      "message_bounce": {
        "type": "integer",
        "label": "contact_id.message_bounce"
      },
      "is_blacklisted": {
        "type": "boolean",
        "label": "contact_id.is_blacklisted"
      }
    }
  },
  {
    "_name": "mailing.subscription.optout",
    "_description": "Mailing Subscription Reason",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Reason"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "is_feedback": {
        "type": "boolean",
        "label": "Ask For Feedback"
      }
    }
  },
  {
    "_name": "mailing.trace",
    "_description": "Mailing Statistics",
    "_auto": true,
    "_fields": {
      "trace_type": {
        "type": "selection",
        "label": "mail",
        "required": true,
        "default": "mail"
      },
      "is_test_trace": {
        "type": "boolean",
        "label": "Generated for testing"
      },
      "mail_mail_id": {
        "type": "many2one",
        "label": "mail.mail"
      },
      "mail_mail_id_int": {
        "type": "integer",
        "label": "mail_mail_id_int"
      },
      "email": {
        "type": "char",
        "label": "Email"
      },
      "message_id": {
        "type": "char",
        "label": "Message-ID"
      },
      "medium_id": {
        "type": "many2one",
        "label": "mass_mailing_id.medium_id"
      },
      "source_id": {
        "type": "many2one",
        "label": "mass_mailing_id.source_id"
      },
      "model": {
        "type": "char",
        "label": "Document model",
        "required": true
      },
      "res_id": {
        "type": "char",
        "label": "Document ID"
      },
      "mass_mailing_id": {
        "type": "many2one",
        "label": "mailing.mailing"
      },
      "campaign_id": {
        "type": "many2one",
        "label": "campaign_id"
      },
      "sent_datetime": {
        "type": "datetime",
        "label": "Sent On"
      },
      "open_datetime": {
        "type": "datetime",
        "label": "Opened On"
      },
      "reply_datetime": {
        "type": "datetime",
        "label": "Replied On"
      },
      "trace_status": {
        "type": "selection",
        "label": "trace_status"
      },
      "failure_type": {
        "type": "selection",
        "label": "failure_type"
      },
      "failure_reason": {
        "type": "text",
        "label": "Failure reason"
      },
      "links_click_ids": {
        "type": "one2many",
        "label": "link.tracker.click"
      },
      "links_click_datetime": {
        "type": "datetime",
        "label": "Clicked On"
      }
    }
  },
  {
    "_name": "mailblacklist",
    "_description": "mailblacklist",
    "_auto": true,
    "_fields": {
      "opt_out_reason_id": {
        "type": "many2one",
        "label": "opt_out_reason_id"
      }
    },
    "_inherit": "mail.blacklist"
  },
  {
    "_name": "mailmail",
    "_description": "mailmail",
    "_auto": true,
    "_fields": {
      "mailing_id": {
        "type": "many2one",
        "label": "mailing.mailing"
      },
      "mailing_trace_ids": {
        "type": "one2many",
        "label": "mailing.trace"
      }
    },
    "_inherit": "mail.mail"
  },
  {
    "_name": "utmcampaign",
    "_description": "utmcampaign",
    "_auto": true,
    "_fields": {
      "mailing_mail_ids": {
        "type": "one2many",
        "label": "mailing_mail_ids"
      },
      "mailing_mail_count": {
        "type": "integer",
        "label": "Number of Mass Mailing"
      },
      "is_mailing_campaign_activated": {
        "type": "boolean",
        "label": "_compute_is_mailing_campaign_activated"
      },
      "ab_testing_mailings_count": {
        "type": "integer",
        "label": "A/B Test Mailings #"
      },
      "ab_testing_completed": {
        "type": "boolean",
        "label": "A/B Testing Campaign Finished"
      },
      "ab_testing_winner_mailing_id": {
        "type": "many2one",
        "label": "mailing.mailing"
      },
      "ab_testing_schedule_datetime": {
        "type": "datetime",
        "label": "Send Final On"
      },
      "ab_testing_winner_selection": {
        "type": "selection",
        "label": "ab_testing_winner_selection"
      },
      "received_ratio": {
        "type": "float",
        "label": "_compute_statistics"
      },
      "opened_ratio": {
        "type": "float",
        "label": "_compute_statistics"
      },
      "replied_ratio": {
        "type": "float",
        "label": "_compute_statistics"
      },
      "bounced_ratio": {
        "type": "float",
        "label": "_compute_statistics"
      }
    },
    "_inherit": "utm.campaign"
  }
];
