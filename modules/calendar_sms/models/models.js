// Odoo 模块: calendar_sms
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "calendaralarm",
    "_description": "calendaralarm",
    "_auto": true,
    "_fields": {
      "alarm_type": {
        "type": "selection",
        "label": "alarm_type"
      },
      "sms_template_id": {
        "type": "many2one",
        "label": "sms_template_id"
      }
    },
    "_inherit": "calendar.alarm"
  }
];
