// Odoo 模块: project_hr_skills
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "projecttask",
    "_description": "projecttask",
    "_auto": true,
    "_fields": {
      "user_skill_ids": {
        "type": "one2many",
        "label": "hr.employee.skill"
      }
    },
    "_inherit": "project.task"
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "employee_skill_ids": {
        "type": "one2many",
        "label": "employee_id.employee_skill_ids"
      }
    },
    "_inherit": "res.users"
  }
];
