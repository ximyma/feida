// Odoo 模块: hr_recruitment_survey
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hrapplicant",
    "_description": "hrapplicant",
    "_auto": true,
    "_fields": {
      "survey_id": {
        "type": "many2one",
        "label": "survey.survey"
      },
      "response_ids": {
        "type": "one2many",
        "label": "survey.user_input"
      }
    },
    "_inherit": "hr.applicant"
  },
  {
    "_name": "hrjob",
    "_description": "hrjob",
    "_auto": true,
    "_fields": {
      "survey_id": {
        "type": "many2one",
        "label": "survey_id"
      }
    },
    "_inherit": "hr.job"
  },
  {
    "_name": "surveysurvey",
    "_description": "surveysurvey",
    "_auto": true,
    "_fields": {
      "survey_type": {
        "type": "selection",
        "label": "recruitment"
      },
      "hr_job_ids": {
        "type": "one2many",
        "label": "hr.job"
      }
    },
    "_inherit": "survey.survey"
  },
  {
    "_name": "surveyuser_input",
    "_description": "surveyuser_input",
    "_auto": true,
    "_fields": {
      "applicant_id": {
        "type": "many2one",
        "label": "hr.applicant"
      }
    },
    "_inherit": "survey.user_input"
  }
];
