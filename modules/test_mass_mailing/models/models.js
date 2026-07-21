// Odoo 模块: test_mass_mailing
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mailing.test.customer",
    "_description": "Mailing with partner",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "email_from": {
        "type": "char",
        "label": "_compute_email_from"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      }
    }
  },
  {
    "_name": "mailing.test.simple",
    "_description": "Simple Mailing",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "email_from": {
        "type": "char",
        "label": "email_from"
      }
    }
  },
  {
    "_name": "mailing.test.utm",
    "_description": "Mailing: UTM enabled to test UTM sync with mailing",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      }
    }
  },
  {
    "_name": "mailing.test.blacklist",
    "_description": "Mailing Blacklist Enabled",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "email_from": {
        "type": "char",
        "label": "email_from"
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
  },
  {
    "_name": "mailing.test.optout",
    "_description": "Mailing Blacklist / Optout Enabled",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "email_from": {
        "type": "char",
        "label": "email_from"
      },
      "opt_out": {
        "type": "boolean",
        "label": "opt_out"
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
  },
  {
    "_name": "mailing.test.partner",
    "_description": "Mailing Model with partner_id",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "email_from": {
        "type": "char",
        "label": "email_from"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      }
    }
  },
  {
    "_name": "mailing.performance",
    "_description": "Mailing: base performance",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "email_from": {
        "type": "char",
        "label": "email_from"
      }
    }
  },
  {
    "_name": "mailing.performance.blacklist",
    "_description": "Mailing: blacklist performance",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "email_from": {
        "type": "char",
        "label": "email_from"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "container_id": {
        "type": "many2one",
        "label": "container_id"
      }
    }
  },
  {
    "_name": "mailing.test.partner.unstored",
    "_description": "Mailing Model without stored partner_id",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "email_from": {
        "type": "char",
        "label": "email_from"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      }
    }
  },
  {
    "_name": "utm.test.source.mixin",
    "_description": "UTM Source Mixin Test Model",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "title": {
        "type": "char",
        "label": "title"
      }
    }
  },
  {
    "_name": "utm.test.source.mixin.other",
    "_description": "UTM Source Mixin Test Model (another)",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "title": {
        "type": "char",
        "label": "title"
      }
    }
  }
];
