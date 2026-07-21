// Odoo 模块: test_mail
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mail.test.access",
    "_description": "Mail Access Test",
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
      "phone": {
        "type": "char",
        "label": "phone"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "access": {
        "type": "selection",
        "label": "access"
      }
    }
  },
  {
    "_name": "mail.test.access.custo",
    "_description": "Mail Access Test with Custo",
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
      "phone": {
        "type": "char",
        "label": "phone"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "is_locked": {
        "type": "boolean",
        "label": "is_locked"
      },
      "is_readonly": {
        "type": "boolean",
        "label": "is_readonly"
      }
    }
  },
  {
    "_name": "mail.test.access.public",
    "_description": "Access Test Public",
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
      "email": {
        "type": "char",
        "label": "Email"
      },
      "mobile": {
        "type": "char",
        "label": "Mobile"
      },
      "is_locked": {
        "type": "boolean",
        "label": "is_locked"
      }
    }
  },
  {
    "_name": "mail.test.lead",
    "_description": "Lead-like model",
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
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "email_from": {
        "type": "char",
        "label": "email_from"
      },
      "customer_name": {
        "type": "char",
        "label": "customer_name"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "lang_code": {
        "type": "char",
        "label": "lang_code"
      },
      "phone": {
        "type": "char",
        "label": "phone"
      }
    }
  },
  {
    "_name": "mail.test.ticket",
    "_description": "Ticket-like model",
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
      "phone_number": {
        "type": "char",
        "label": "phone_number"
      },
      "count": {
        "type": "integer",
        "label": "count"
      },
      "datetime": {
        "type": "datetime",
        "label": "datetime"
      },
      "mail_template": {
        "type": "many2one",
        "label": "mail.template"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "container_id": {
        "type": "many2one",
        "label": "mail.test.container"
      }
    }
  },
  {
    "_name": "mail.test.ticket.el",
    "_description": "Ticket-like model with exclusion list",
    "_auto": true,
    "_fields": {
      "email_from": {
        "type": "char",
        "label": "email_from"
      }
    }
  },
  {
    "_name": "mail.test.ticket.mc",
    "_description": "Ticket-like model",
    "_auto": true,
    "_fields": {
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "container_id": {
        "type": "many2one",
        "label": "mail.test.container.mc"
      }
    }
  },
  {
    "_name": "mail.test.ticket.partner",
    "_description": "MC ticket-like model with partner support",
    "_auto": true,
    "_fields": {
      "state": {
        "type": "selection",
        "label": "state"
      },
      "state_template_id": {
        "type": "many2one",
        "label": "mail.template"
      }
    }
  },
  {
    "_name": "mail.test.container",
    "_description": "Project-like model with alias",
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
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      }
    }
  },
  {
    "_name": "mail.test.container.mc",
    "_description": "Project-like model with alias (MC)",
    "_auto": true,
    "_fields": {
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      }
    }
  },
  {
    "_name": "mail.performance.thread",
    "_description": "Performance: mail.thread",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "value": {
        "type": "integer",
        "label": "value"
      },
      "value_pc": {
        "type": "float",
        "label": "_value_pc"
      },
      "track": {
        "type": "char",
        "label": "test",
        "default": "test"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      }
    }
  },
  {
    "_name": "mail.performance.thread.recipients",
    "_description": "Performance: mail.thread, for recipients",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "value": {
        "type": "integer",
        "label": "value"
      },
      "email_from": {
        "type": "char",
        "label": "Email From"
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
    "_name": "mail.performance.tracking",
    "_description": "Performance: multi tracking",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "field_0": {
        "type": "char",
        "label": "field_0"
      },
      "field_1": {
        "type": "char",
        "label": "field_1"
      },
      "field_2": {
        "type": "char",
        "label": "field_2"
      }
    }
  },
  {
    "_name": "mail.test.field.type",
    "_description": "Test Field Type",
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
      "datetime": {
        "type": "datetime",
        "label": "datetime"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "type": {
        "type": "selection",
        "label": "first"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      }
    }
  },
  {
    "_name": "mail.test.lang",
    "_description": "Lang Chatter Model",
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
      "lang": {
        "type": "char",
        "label": "Lang"
      }
    }
  },
  {
    "_name": "mail.test.track.all.m2m",
    "_description": "Sub-model: pseudo tags for tracking",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      }
    }
  },
  {
    "_name": "mail.test.track.all.o2m",
    "_description": "Sub-model: pseudo tags for tracking",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "mail_track_all_id": {
        "type": "many2one",
        "label": "mail.test.track.all"
      }
    }
  },
  {
    "_name": "mail.test.track.all.properties.parent",
    "_description": "Properties Parent",
    "_auto": true,
    "_fields": {
      "definition_properties": {
        "type": "char",
        "label": "definition_properties"
      }
    }
  },
  {
    "_name": "mail.test.track.all",
    "_description": "Test tracking on all field types",
    "_auto": true,
    "_fields": {
      "boolean_field": {
        "type": "boolean",
        "label": "Boolean"
      },
      "char_field": {
        "type": "char",
        "label": "Char"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "date_field": {
        "type": "date",
        "label": "Date"
      },
      "datetime_field": {
        "type": "datetime",
        "label": "Datetime"
      },
      "float_field": {
        "type": "float",
        "label": "Float"
      },
      "float_field_with_digits": {
        "type": "float",
        "label": "Precise Float"
      },
      "html_field": {
        "type": "html",
        "label": "Html"
      },
      "integer_field": {
        "type": "integer",
        "label": "Integer"
      },
      "many2many_field": {
        "type": "many2many",
        "label": "many2many_field"
      },
      "many2one_field_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "monetary_field": {
        "type": "monetary",
        "label": "Monetary"
      },
      "one2many_field": {
        "type": "one2many",
        "label": "one2many_field"
      },
      "properties_parent_id": {
        "type": "many2one",
        "label": "mail.test.track.all.properties.parent"
      },
      "properties": {
        "type": "char",
        "label": "Properties"
      },
      "selection_field": {
        "type": "selection",
        "label": "selection_field"
      },
      "text_field": {
        "type": "text",
        "label": "Text"
      },
      "name": {
        "type": "char",
        "label": "Name"
      }
    }
  },
  {
    "_name": "mail.test.track.compute",
    "_description": "Test tracking with computed fields",
    "_auto": true,
    "_fields": {
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "partner_name": {
        "type": "char",
        "label": "partner_id.name"
      },
      "partner_email": {
        "type": "char",
        "label": "partner_id.email"
      },
      "partner_phone": {
        "type": "char",
        "label": "partner_id.phone"
      }
    }
  },
  {
    "_name": "mail.test.track.duration.mixin",
    "_description": "Fake model to test the mixin mail.tracking.duration.mixin",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      }
    }
  },
  {
    "_name": "mail.test.track.groups",
    "_description": "Test tracking with groups",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "secret": {
        "type": "char",
        "label": "base.group_user"
      }
    }
  },
  {
    "_name": "mail.test.track.monetary",
    "_description": "Test tracking monetary field",
    "_auto": true,
    "_fields": {
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "company_currency": {
        "type": "many2one",
        "label": "res.currency"
      },
      "revenue": {
        "type": "monetary",
        "label": "Revenue"
      }
    }
  },
  {
    "_name": "mail.test.track.selection",
    "_description": "Test Selection Tracking",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "selection_type": {
        "type": "selection",
        "label": "first"
      }
    }
  },
  {
    "_name": "mail.test.multi.company",
    "_description": "Test Multi Company Mail",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      }
    }
  },
  {
    "_name": "mail.test.multi.company.with.activity",
    "_description": "Test Multi Company Mail With Activity",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      }
    }
  },
  {
    "_name": "mail.test.nothread",
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
  },
  {
    "_name": "mail.test.recipients",
    "_description": "Test Recipients Computation",
    "_auto": true,
    "_fields": {
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "contact_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "customer_email": {
        "type": "char",
        "label": "Customer Email"
      },
      "customer_phone": {
        "type": "char",
        "label": "Customer Phone"
      },
      "name": {
        "type": "char",
        "label": "name"
      }
    }
  },
  {
    "_name": "mail.test.properties",
    "_description": "Mail Test Properties",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "parent_id": {
        "type": "many2one",
        "label": "mail.test.properties"
      },
      "properties": {
        "type": "char",
        "label": "Properties"
      },
      "definition_properties": {
        "type": "char",
        "label": "Definitions"
      }
    }
  },
  {
    "_name": "mail.test.rotting.stage",
    "_description": "Fake model to be a stage to help test rotting implementation",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "rotting_threshold_days": {
        "type": "integer",
        "label": "rotting_threshold_days"
      },
      "no_rot": {
        "type": "boolean",
        "label": "no_rot",
        "default": false
      }
    }
  },
  {
    "_name": "mail.test.rotting.resource",
    "_description": "Fake model to test the rotting part of the mixin mail.thread.tracking.duration.mixin",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "date_last_stage_update": {
        "type": "datetime",
        "label": "date_last_stage_update"
      },
      "stage_id": {
        "type": "many2one",
        "label": "mail.test.rotting.stage"
      },
      "done": {
        "type": "boolean",
        "label": "done",
        "default": false
      }
    }
  },
  {
    "_name": "mail.test.simple",
    "_description": "Simple Chatter Model",
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
    "_name": "mail.test.simple.unnamed",
    "_description": "Simple Chatter Model without ",
    "_auto": true,
    "_fields": {
      "description": {
        "type": "char",
        "label": "description"
      }
    }
  },
  {
    "_name": "mail.test.simple.unfollow",
    "_description": "Simple Chatter Model",
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
      "email_from": {
        "type": "char",
        "label": "email_from"
      }
    }
  },
  {
    "_name": "mail.test.alias.optional",
    "_description": "Chatter Model using Optional Alias Mixin",
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
      "email_from": {
        "type": "char",
        "label": "email_from"
      }
    }
  },
  {
    "_name": "mail.test.gateway",
    "_description": "Simple Chatter Model for Mail Gateway",
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
      "custom_field": {
        "type": "char",
        "label": "custom_field"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      }
    }
  },
  {
    "_name": "mail.test.gateway.company",
    "_description": "Simple Chatter Model for Mail Gateway with company",
    "_auto": true,
    "_fields": {
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      }
    }
  },
  {
    "_name": "mail.test.gateway.main.attachment",
    "_description": "Simple Chatter Model for Mail Gateway with company",
    "_auto": true,
    "_fields": {
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      }
    }
  },
  {
    "_name": "mail.test.gateway.groups",
    "_description": "Channel/Group-like Chatter Model for Mail Gateway",
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
      "custom_field": {
        "type": "char",
        "label": "custom_field"
      },
      "customer_id": {
        "type": "many2one",
        "label": "res.partner"
      }
    }
  },
  {
    "_name": "mail.test.track",
    "_description": "Standard Chatter Model",
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
        "label": "res.users"
      },
      "container_id": {
        "type": "many2one",
        "label": "mail.test.container"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "track_fields_tofilter": {
        "type": "char",
        "label": "track_fields_tofilter"
      },
      "track_enable_default_log": {
        "type": "boolean",
        "label": "track_enable_default_log",
        "default": false
      },
      "parent_id": {
        "type": "many2one",
        "label": "mail.test.track"
      }
    }
  },
  {
    "_name": "mail.test.activity",
    "_description": "Activity Model",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "date": {
        "type": "date",
        "label": "date"
      },
      "email_from": {
        "type": "char",
        "label": "email_from"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      }
    }
  },
  {
    "_name": "mail.test.composer.mixin",
    "_description": "Invite-like Wizard",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "author_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "description": {
        "type": "html",
        "label": "Description"
      },
      "source_ids": {
        "type": "many2many",
        "label": "mail.test.composer.source"
      }
    }
  },
  {
    "_name": "mail.test.composer.source",
    "_description": "Invite-like Source",
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
      "email_from": {
        "type": "char",
        "label": "email_from"
      }
    }
  },
  {
    "_name": "mail.test.cc",
    "_description": "Test Email CC Thread",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      }
    }
  }
];
