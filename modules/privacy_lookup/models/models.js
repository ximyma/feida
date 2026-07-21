// Odoo 模块: privacy_lookup
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "privacy.log",
    "_description": "Privacy Log",
    "_auto": true,
    "_fields": {
      "date": {
        "type": "datetime",
        "label": "date",
        "required": true
      },
      "anonymized_name": {
        "type": "char",
        "label": "anonymized_name",
        "required": true
      },
      "anonymized_email": {
        "type": "char",
        "label": "anonymized_email",
        "required": true
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "execution_details": {
        "type": "text",
        "label": "execution_details"
      },
      "records_description": {
        "type": "text",
        "label": "Found Records"
      },
      "additional_note": {
        "type": "text",
        "label": "additional_note"
      }
    }
  }
];
