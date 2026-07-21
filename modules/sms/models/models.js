// Odoo 模块: sms
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "iapaccount",
    "_description": "iapaccount",
    "_auto": true,
    "_fields": {
      "sender_name": {
        "type": "char",
        "label": "This is the name that will be displayed as the sender of the SMS."
      }
    },
    "_inherit": "iap.account"
  },
  {
    "_name": "iractionsserver",
    "_description": "iractionsserver",
    "_auto": true,
    "_fields": {
      "state": {
        "type": "selection",
        "label": "state"
      },
      "sms_template_id": {
        "type": "many2one",
        "label": "sms_template_id"
      },
      "sms_method": {
        "type": "selection",
        "label": "sms_method"
      }
    },
    "_inherit": "ir.actions.server"
  },
  {
    "_name": "irmodel",
    "_description": "irmodel",
    "_auto": true,
    "_fields": {
      "is_mail_thread_sms": {
        "type": "boolean",
        "label": "is_mail_thread_sms"
      }
    },
    "_inherit": "ir.model"
  },
  {
    "_name": "mailmessage",
    "_description": "mailmessage",
    "_auto": true,
    "_fields": {
      "message_type": {
        "type": "selection",
        "label": "message_type"
      },
      "has_sms_error": {
        "type": "boolean",
        "label": "has_sms_error"
      }
    },
    "_inherit": "mail.message"
  },
  {
    "_name": "mailnotification",
    "_description": "mailnotification",
    "_auto": true,
    "_fields": {
      "notification_type": {
        "type": "selection",
        "label": "notification_type"
      },
      "sms_id_int": {
        "type": "integer",
        "label": "SMS ID"
      },
      "sms_id": {
        "type": "many2one",
        "label": "sms.sms"
      },
      "sms_tracker_ids": {
        "type": "one2many",
        "label": "sms.tracker"
      },
      "sms_number": {
        "type": "char",
        "label": "SMS Number"
      },
      "failure_type": {
        "type": "selection",
        "label": "failure_type"
      }
    },
    "_inherit": "mail.notification"
  },
  {
    "_name": "sms.sms",
    "_description": "Outgoing SMS",
    "_auto": true,
    "_fields": {
      "uuid": {
        "type": "char",
        "label": "UUID"
      },
      "number": {
        "type": "char",
        "label": "Number"
      },
      "body": {
        "type": "text",
        "label": "body"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "mail_message_id": {
        "type": "many2one",
        "label": "mail.message"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "failure_type": {
        "type": "selection",
        "label": "failure_type"
      },
      "sms_tracker_id": {
        "type": "many2one",
        "label": "sms.tracker"
      },
      "to_delete": {
        "type": "boolean",
        "label": "to_delete"
      }
    }
  },
  {
    "_name": "sms.template",
    "_description": "SMS Templates",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "model_id": {
        "type": "many2one",
        "label": "model_id"
      },
      "model": {
        "type": "char",
        "label": "Related Document Model"
      },
      "body": {
        "type": "char",
        "label": "Body",
        "required": true
      },
      "sidebar_action_id": {
        "type": "many2one",
        "label": "ir.actions.act_window"
      }
    }
  },
  {
    "_name": "sms.tracker",
    "_description": "Link SMS to mailing/sms tracking models",
    "_auto": true,
    "_fields": {
      "sms_uuid": {
        "type": "char",
        "label": "SMS uuid",
        "required": true
      },
      "mail_notification_id": {
        "type": "many2one",
        "label": "mail.notification"
      }
    }
  }
];
