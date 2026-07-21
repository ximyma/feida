// Odoo 模块: pos_sms
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "posconfig",
    "_description": "posconfig",
    "_auto": true,
    "_fields": {
      "sms_receipt_template_id": {
        "type": "many2one",
        "label": "sms.template"
      }
    },
    "_inherit": "pos.config"
  }
];
