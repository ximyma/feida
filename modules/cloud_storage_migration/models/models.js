// Odoo 模块: cloud_storage_migration
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "cloud.storage.migration.report",
    "_description": "Cloud Storage Migration Report",
    "_auto": true,
    "_fields": {
      "res_model": {
        "type": "char",
        "label": "Model"
      },
      "res_model_name": {
        "type": "char",
        "label": "Model Name"
      },
      "message_sum_size": {
        "type": "integer",
        "label": "Message Attachments Size (MB)"
      },
      "message_max_size": {
        "type": "integer",
        "label": "Message Largest Attachment (MB)"
      },
      "message_count": {
        "type": "integer",
        "label": "Message Attachments Count"
      },
      "message_to_migrate": {
        "type": "boolean",
        "label": "Message Attachments Migration"
      },
      "all_sum_size": {
        "type": "integer",
        "label": "Total Attachments Size (MB)"
      },
      "all_max_size": {
        "type": "integer",
        "label": "Largest Attachment (MB)"
      },
      "all_count": {
        "type": "integer",
        "label": "Total Attachments Count"
      },
      "all_to_migrate": {
        "type": "boolean",
        "label": "All Attachments Migration"
      },
      "has_attachment_rel": {
        "type": "boolean",
        "label": "Has Attachment Field"
      }
    }
  }
];
