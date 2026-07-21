// Odoo 模块: hr_skills_event
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hrresumeline",
    "_description": "hrresumeline",
    "_auto": true,
    "_fields": {
      "event_id": {
        "type": "many2one",
        "label": "event_id"
      },
      "course_type": {
        "type": "selection",
        "label": "course_type"
      }
    },
    "_inherit": "hr.resume.line"
  }
];
