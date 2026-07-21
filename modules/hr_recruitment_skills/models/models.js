// Odoo 模块: hr_recruitment_skills
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hr.applicant.skill",
    "_description": "hr.applicant.skill",
    "_auto": true,
    "_fields": {
      "applicant_skill_ids": {
        "type": "one2many",
        "label": "applicant_skill_ids"
      },
      "current_applicant_skill_ids": {
        "type": "one2many",
        "label": "current_applicant_skill_ids"
      },
      "skill_ids": {
        "type": "many2many",
        "label": "hr.skill"
      },
      "matching_skill_ids": {
        "type": "many2many",
        "label": "matching_skill_ids"
      },
      "missing_skill_ids": {
        "type": "many2many",
        "label": "missing_skill_ids"
      },
      "matching_score": {
        "type": "integer",
        "label": "Matching Score"
      }
    },
    "_inherit": "hr.applicant"
  },
  {
    "_name": "hrjob",
    "_description": "hrjob",
    "_auto": true,
    "_fields": {
      "applicant_matching_score": {
        "type": "float",
        "label": "Matching Score(%)"
      }
    },
    "_inherit": "hr.job"
  }
];
