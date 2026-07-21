// Odoo 模块: data_recycle
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "data_recycle.model",
    "_description": "Recycling Model",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "name": {
        "type": "char",
        "label": "name"
      },
      "res_model_id": {
        "type": "many2one",
        "label": "ir.model",
        "required": true
      },
      "res_model_name": {
        "type": "char",
        "label": "res_model_name"
      },
      "recycle_record_ids": {
        "type": "one2many",
        "label": "data_recycle.record"
      },
      "recycle_mode": {
        "type": "selection",
        "label": "recycle_mode"
      },
      "recycle_action": {
        "type": "selection",
        "label": "recycle_action"
      },
      "domain": {
        "type": "char",
        "label": "Filter"
      },
      "time_field_id": {
        "type": "many2one",
        "label": "time_field_id"
      },
      "time_field_delta": {
        "type": "integer",
        "label": "Delta"
      },
      "time_field_delta_unit": {
        "type": "selection",
        "label": "time_field_delta_unit"
      },
      "include_archived": {
        "type": "boolean",
        "label": "include_archived"
      },
      "records_to_recycle_count": {
        "type": "integer",
        "label": "records_to_recycle_count"
      },
      "notify_user_ids": {
        "type": "many2many",
        "label": "notify_user_ids"
      },
      "notify_frequency": {
        "type": "integer",
        "label": "Notify"
      },
      "notify_frequency_period": {
        "type": "selection",
        "label": "notify_frequency_period"
      },
      "last_notification": {
        "type": "datetime",
        "label": "last_notification"
      }
    }
  },
  {
    "_name": "data_recycle.record",
    "_description": "Recycling Record",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "name": {
        "type": "char",
        "label": "Record Name"
      },
      "recycle_model_id": {
        "type": "many2one",
        "label": "data_recycle.model"
      },
      "res_id": {
        "type": "integer",
        "label": "Record ID"
      },
      "res_model_id": {
        "type": "many2one",
        "label": "recycle_model_id.res_model_id"
      },
      "res_model_name": {
        "type": "char",
        "label": "recycle_model_id.res_model_name"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      }
    }
  }
];
