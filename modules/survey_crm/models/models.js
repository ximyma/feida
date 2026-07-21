// Odoo 模块: survey_crm
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "crmlead",
    "_description": "crmlead",
    "_auto": true,
    "_fields": {
      "origin_survey_id": {
        "type": "many2one",
        "label": "survey.survey"
      }
    },
    "_inherit": "crm.lead"
  },
  {
    "_name": "crmteam",
    "_description": "crmteam",
    "_auto": true,
    "_fields": {
      "origin_survey_ids": {
        "type": "one2many",
        "label": "origin_survey_ids"
      }
    },
    "_inherit": "crm.team"
  },
  {
    "_name": "surveyquestion",
    "_description": "surveyquestion",
    "_auto": true,
    "_fields": {
      "survey_type": {
        "type": "selection",
        "label": "survey_id.survey_type"
      },
      "generate_lead": {
        "type": "boolean",
        "label": "generate_lead"
      }
    },
    "_inherit": "survey.question"
  },
  {
    "_name": "surveyquestionanswer",
    "_description": "surveyquestionanswer",
    "_auto": true,
    "_fields": {
      "generate_lead": {
        "type": "boolean",
        "label": "Lead creation"
      }
    },
    "_inherit": "survey.question.answer"
  },
  {
    "_name": "surveysurvey",
    "_description": "surveysurvey",
    "_auto": true,
    "_fields": {
      "generate_lead": {
        "type": "boolean",
        "label": "Lead Generating"
      },
      "lead_count": {
        "type": "integer",
        "label": "Leads"
      },
      "lead_ids": {
        "type": "one2many",
        "label": "crm.lead"
      },
      "team_id": {
        "type": "many2one",
        "label": "team_id"
      }
    },
    "_inherit": "survey.survey"
  },
  {
    "_name": "surveyuser_input",
    "_description": "surveyuser_input",
    "_auto": true,
    "_fields": {
      "lead_id": {
        "type": "many2one",
        "label": "crm.lead"
      }
    },
    "_inherit": "survey.user_input"
  }
];
