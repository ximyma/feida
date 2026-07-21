// Odoo 模块: digest
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "digest.digest",
    "_description": "Digest",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "user_ids": {
        "type": "many2many",
        "label": "res.users"
      },
      "periodicity": {
        "type": "selection",
        "label": "daily"
      },
      "next_run_date": {
        "type": "date",
        "label": "Next Mailing Date"
      },
      "currency_id": {
        "type": "many2one",
        "label": "company_id.currency_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "available_fields": {
        "type": "char",
        "label": "_compute_available_fields"
      },
      "is_subscribed": {
        "type": "boolean",
        "label": "Is user subscribed"
      },
      "state": {
        "type": "selection",
        "label": "activated",
        "default": "activated"
      },
      "kpi_res_users_connected": {
        "type": "boolean",
        "label": "Connected Users"
      },
      "kpi_res_users_connected_value": {
        "type": "integer",
        "label": "_compute_kpi_res_users_connected_value"
      },
      "kpi_mail_message_total": {
        "type": "boolean",
        "label": "Messages Sent"
      },
      "kpi_mail_message_total_value": {
        "type": "integer",
        "label": "_compute_kpi_mail_message_total_value"
      }
    }
  },
  {
    "_name": "digest.tip",
    "_description": "Digest Tips",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "name": {
        "type": "char",
        "label": "Name"
      },
      "user_ids": {
        "type": "many2many",
        "label": "user_ids"
      },
      "tip_description": {
        "type": "html",
        "label": "Tip description"
      },
      "group_id": {
        "type": "many2one",
        "label": "group_id"
      }
    }
  }
];
