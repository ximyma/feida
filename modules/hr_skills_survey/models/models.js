// Odoo 模块: hr_skills_survey
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hrresumeline",
    "_description": "hrresumeline",
    "_auto": true,
    "_fields": {
      "department_id": {
        "type": "many2one",
        "label": "employee_id.department_id"
      },
      "survey_id": {
        "type": "many2one",
        "label": "survey.survey"
      },
      "expiration_status": {
        "type": "selection",
        "label": "expiration_status"
      }
    },
    "_inherit": "hr.resume.line"
  },
  {
    "_name": "surveysurvey",
    "_description": "surveysurvey",
    "_auto": true,
    "_fields": {
      "certification_validity_months": {
        "type": "integer",
        "label": "certification_validity_months"
      }
    },
    "_inherit": "survey.survey"
  }
];
