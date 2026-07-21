// Odoo 模块: test_mail_sms
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mail.test.sms",
    "_description": "Chatter Model for SMS Gateway",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "subject": {
        "type": "char",
        "label": "subject"
      },
      "email_from": {
        "type": "char",
        "label": "email_from"
      },
      "guest_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "phone_nbr": {
        "type": "char",
        "label": "phone_nbr"
      },
      "mobile_nbr": {
        "type": "char",
        "label": "mobile_nbr"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "country_id": {
        "type": "many2one",
        "label": "res.country"
      }
    }
  },
  {
    "_name": "mail.test.sms.bl",
    "_description": "SMS Mailing Blacklist Enabled",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "subject": {
        "type": "char",
        "label": "subject"
      },
      "email_from": {
        "type": "char",
        "label": "email_from"
      },
      "phone_nbr": {
        "type": "char",
        "label": "_compute_phone_nbr"
      },
      "mobile_nbr": {
        "type": "char",
        "label": "mobile_nbr"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      }
    }
  },
  {
    "_name": "mail.test.sms.bl.optout",
    "_description": "SMS Mailing Blacklist / Optout Enabled",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "subject": {
        "type": "char",
        "label": "subject"
      },
      "email_from": {
        "type": "char",
        "label": "email_from"
      },
      "phone_nbr": {
        "type": "char",
        "label": "phone_nbr"
      },
      "mobile_nbr": {
        "type": "char",
        "label": "mobile_nbr"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "opt_out": {
        "type": "boolean",
        "label": "opt_out"
      }
    }
  },
  {
    "_name": "mail.test.sms.partner",
    "_description": "Chatter Model for SMS Gateway (Partner only)",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "opt_out": {
        "type": "boolean",
        "label": "opt_out"
      }
    }
  },
  {
    "_name": "mail.test.sms.partner.2many",
    "_description": "Chatter Model for SMS Gateway (M2M Partners only)",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "customer_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "opt_out": {
        "type": "boolean",
        "label": "opt_out"
      }
    }
  },
  {
    "_name": "sms.test.nothread",
    "_description": "NoThread Model",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      }
    }
  }
];
