// Odoo 模块: mass_mailing_sms
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mailing.contact",
    "_description": "mailing.contact",
    "_auto": true,
    "_fields": {
      "mobile": {
        "type": "char",
        "label": "Mobile"
      }
    }
  },
  {
    "_name": "mailinglist",
    "_description": "mailinglist",
    "_auto": true,
    "_fields": {
      "contact_count_sms": {
        "type": "integer",
        "label": "_compute_mailing_list_statistics"
      }
    },
    "_inherit": "mailing.list"
  },
  {
    "_name": "sms",
    "_description": "sms",
    "_auto": true,
    "_fields": {
      "mailing_type": {
        "type": "selection",
        "label": "mailing_type"
      },
      "sms_subject": {
        "type": "char",
        "label": "sms_subject"
      },
      "body_plaintext": {
        "type": "text",
        "label": "body_plaintext"
      },
      "sms_template_id": {
        "type": "many2one",
        "label": "sms.template"
      },
      "sms_has_insufficient_credit": {
        "type": "boolean",
        "label": "sms_has_insufficient_credit"
      },
      "sms_has_unregistered_account": {
        "type": "boolean",
        "label": "sms_has_unregistered_account"
      },
      "sms_force_send": {
        "type": "boolean",
        "label": "sms_force_send"
      },
      "sms_allow_unsubscribe": {
        "type": "boolean",
        "label": "Include opt-out link",
        "default": false
      },
      "ab_testing_sms_winner_selection": {
        "type": "selection",
        "label": "ab_testing_sms_winner_selection"
      },
      "ab_testing_mailings_sms_count": {
        "type": "integer",
        "label": "campaign_id.ab_testing_mailings_sms_count"
      }
    },
    "_inherit": "mailing.mailing"
  },
  {
    "_name": "mailingtrace",
    "_description": "mailingtrace",
    "_auto": true,
    "_fields": {
      "trace_type": {
        "type": "selection",
        "label": "trace_type"
      },
      "sms_id": {
        "type": "many2one",
        "label": "sms.sms"
      },
      "sms_id_int": {
        "type": "integer",
        "label": "sms_id_int"
      },
      "sms_tracker_ids": {
        "type": "one2many",
        "label": "sms.tracker"
      },
      "sms_number": {
        "type": "char",
        "label": "Number"
      },
      "sms_code": {
        "type": "char",
        "label": "Code"
      },
      "failure_type": {
        "type": "selection",
        "label": "failure_type"
      }
    },
    "_inherit": "mailing.trace"
  },
  {
    "_name": "smssms",
    "_description": "smssms",
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
    "_inherit": "sms.sms"
  },
  {
    "_name": "smstracker",
    "_description": "smstracker",
    "_auto": true,
    "_fields": {
      "mailing_trace_id": {
        "type": "many2one",
        "label": "mailing.trace"
      }
    },
    "_inherit": "sms.tracker"
  },
  {
    "_name": "utmcampaign",
    "_description": "utmcampaign",
    "_auto": true,
    "_fields": {
      "mailing_sms_ids": {
        "type": "one2many",
        "label": "mailing_sms_ids"
      },
      "mailing_sms_count": {
        "type": "integer",
        "label": "Number of Mass SMS"
      },
      "ab_testing_mailings_sms_count": {
        "type": "integer",
        "label": "A/B Test Mailings SMS #"
      },
      "ab_testing_sms_winner_selection": {
        "type": "selection",
        "label": "ab_testing_sms_winner_selection"
      }
    },
    "_inherit": "utm.campaign"
  }
];
