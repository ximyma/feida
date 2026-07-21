// Odoo 模块: project_sms
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "projectprojectstage",
    "_description": "projectprojectstage",
    "_auto": true,
    "_fields": {
      "sms_template_id": {
        "type": "many2one",
        "label": "sms.template"
      }
    },
    "_inherit": "project.project.stage"
  },
  {
    "_name": "projecttasktype",
    "_description": "projecttasktype",
    "_auto": true,
    "_fields": {
      "sms_template_id": {
        "type": "many2one",
        "label": "sms.template"
      }
    },
    "_inherit": "project.task.type"
  }
];
