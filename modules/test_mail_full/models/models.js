// Odoo 模块: test_mail_full
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mail.test.portal",
    "_description": "Chatter Model for Portal",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      }
    }
  },
  {
    "_name": "mail.test.portal.no.partner",
    "_description": "Chatter Model for Portal (no partner field)",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      }
    }
  },
  {
    "_name": "mail.test.rating",
    "_description": "Rating Model (ticket-like)",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "subject": {
        "type": "char",
        "label": "Subject"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "email_from": {
        "type": "char",
        "label": "From"
      },
      "phone_nbr": {
        "type": "char",
        "label": "Phone Number"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      }
    }
  },
  {
    "_name": "mail.test.rating.thread",
    "_description": "Model for testing rating without the rating mixin",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      }
    }
  }
];
