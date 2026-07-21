// Odoo 模块: base_automation
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "base.automation",
    "_description": "Automation Rule",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Automation Rule Name",
        "required": true
      },
      "description": {
        "type": "html",
        "label": "Description"
      },
      "model_id": {
        "type": "many2one",
        "label": "model_id"
      },
      "model_name": {
        "type": "char",
        "label": "model_id.model"
      },
      "model_is_mail_thread": {
        "type": "boolean",
        "label": "model_id.is_mail_thread"
      },
      "action_server_ids": {
        "type": "one2many",
        "label": "ir.actions.server"
      },
      "url": {
        "type": "char",
        "label": "_compute_url"
      },
      "webhook_uuid": {
        "type": "char",
        "label": "Webhook UUID"
      },
      "record_getter": {
        "type": "char",
        "label": "model.env[payload.get(",
        "default": "model.env[payload.get("
      },
      "log_webhook_calls": {
        "type": "boolean",
        "label": "Log Calls",
        "default": false
      },
      "active": {
        "type": "boolean",
        "label": "When unchecked, the rule is hidden and will not be executed.",
        "default": true
      },
      "trigger": {
        "type": "selection",
        "label": "trigger"
      },
      "trg_selection_field_id": {
        "type": "many2one",
        "label": "trg_selection_field_id"
      },
      "trg_field_ref_model_name": {
        "type": "char",
        "label": "trg_field_ref_model_name"
      },
      "trg_field_ref": {
        "type": "char",
        "label": "trg_field_ref"
      },
      "trg_date_id": {
        "type": "many2one",
        "label": "trg_date_id"
      },
      "trg_date_range": {
        "type": "integer",
        "label": "trg_date_range"
      },
      "trg_date_range_mode": {
        "type": "selection",
        "label": "trg_date_range_mode"
      },
      "trg_date_range_type": {
        "type": "selection",
        "label": "trg_date_range_type"
      },
      "trg_date_calendar_id": {
        "type": "many2one",
        "label": "trg_date_calendar_id"
      },
      "filter_pre_domain": {
        "type": "char",
        "label": "filter_pre_domain"
      },
      "previous_domain": {
        "type": "char",
        "label": "previous_domain"
      },
      "filter_domain": {
        "type": "char",
        "label": "filter_domain"
      },
      "last_run": {
        "type": "datetime",
        "label": "last_run"
      },
      "on_change_field_ids": {
        "type": "many2many",
        "label": "on_change_field_ids"
      },
      "trigger_field_ids": {
        "type": "many2many",
        "label": "trigger_field_ids"
      }
    }
  },
  {
    "_name": "iractionsserver",
    "_description": "iractionsserver",
    "_auto": true,
    "_fields": {
      "usage": {
        "type": "selection",
        "label": "usage"
      },
      "base_automation_id": {
        "type": "many2one",
        "label": "base.automation"
      }
    },
    "_inherit": "ir.actions.server"
  }
];
