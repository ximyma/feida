// Odoo 模块: stock_sms
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "stock_sms_confirmation_template_id": {
        "type": "many2one",
        "label": "stock_sms_confirmation_template_id"
      },
      "has_received_warning_stock_sms": {
        "type": "boolean",
        "label": "has_received_warning_stock_sms"
      }
    },
    "_inherit": "res.company"
  }
];
