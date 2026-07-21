// Odoo 模块: sms_twilio
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mailnotification",
    "_description": "mailnotification",
    "_auto": true,
    "_fields": {
      "failure_type": {
        "type": "selection",
        "label": "failure_type"
      }
    },
    "_inherit": "mail.notification"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "sms_provider": {
        "type": "selection",
        "label": "sms_provider"
      },
      "sms_twilio_account_sid": {
        "type": "char",
        "label": "Account SID"
      },
      "sms_twilio_auth_token": {
        "type": "char",
        "label": "Auth Token"
      },
      "sms_twilio_number_ids": {
        "type": "one2many",
        "label": "sms.twilio.number"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "smssms",
    "_description": "smssms",
    "_auto": true,
    "_fields": {
      "sms_twilio_sid": {
        "type": "char",
        "label": "sms_tracker_id.sms_twilio_sid"
      },
      "record_company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "failure_type": {
        "type": "selection",
        "label": "failure_type"
      }
    },
    "_inherit": "sms.sms"
  },
  {
    "_name": "smstracker",
    "_description": "smstracker",
    "_auto": true,
    "_fields": {
      "sms_twilio_sid": {
        "type": "char",
        "label": "Twilio SMS SID"
      }
    },
    "_inherit": "sms.tracker"
  },
  {
    "_name": "sms.twilio.number",
    "_description": "Twilio Number",
    "_auto": true,
    "_fields": {
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "number": {
        "type": "char",
        "label": "Twilio Number",
        "required": true
      },
      "country_id": {
        "type": "many2one",
        "label": "res.country",
        "required": true
      },
      "country_code": {
        "type": "char",
        "label": "country_id.code"
      }
    }
  }
];
