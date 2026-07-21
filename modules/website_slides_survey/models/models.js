// Odoo 模块: website_slides_survey
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "slidechannelpartner",
    "_description": "slidechannelpartner",
    "_auto": true,
    "_fields": {
      "nbr_certification": {
        "type": "integer",
        "label": "channel_id.nbr_certification"
      },
      "survey_certification_success": {
        "type": "boolean",
        "label": "Certified"
      }
    },
    "_inherit": "slide.channel.partner"
  },
  {
    "_name": "slidechannel",
    "_description": "slidechannel",
    "_auto": true,
    "_fields": {
      "members_certified_count": {
        "type": "integer",
        "label": "# Certified Attendees"
      },
      "nbr_certification": {
        "type": "integer",
        "label": "Number of Certifications"
      }
    },
    "_inherit": "slide.channel"
  },
  {
    "_name": "slideslidepartner",
    "_description": "slideslidepartner",
    "_auto": true,
    "_fields": {
      "user_input_ids": {
        "type": "one2many",
        "label": "survey.user_input"
      },
      "survey_scoring_success": {
        "type": "boolean",
        "label": "Certification Succeeded"
      }
    },
    "_inherit": "slide.slide.partner"
  },
  {
    "_name": "slideslide",
    "_description": "slideslide",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "_compute_name"
      },
      "slide_category": {
        "type": "selection",
        "label": "slide_category"
      },
      "slide_type": {
        "type": "selection",
        "label": "slide_type"
      },
      "survey_id": {
        "type": "many2one",
        "label": "survey.survey"
      },
      "nbr_certification": {
        "type": "integer",
        "label": "Number of Certifications"
      },
      "is_preview": {
        "type": "boolean",
        "label": "_compute_is_preview"
      }
    },
    "_inherit": "slide.slide"
  },
  {
    "_name": "surveysurvey",
    "_description": "surveysurvey",
    "_auto": true,
    "_fields": {
      "slide_ids": {
        "type": "one2many",
        "label": "slide_ids"
      },
      "slide_channel_ids": {
        "type": "one2many",
        "label": "slide_channel_ids"
      },
      "slide_channel_count": {
        "type": "integer",
        "label": "Courses Count"
      }
    },
    "_inherit": "survey.survey"
  },
  {
    "_name": "surveyuser_input",
    "_description": "surveyuser_input",
    "_auto": true,
    "_fields": {
      "slide_id": {
        "type": "many2one",
        "label": "slide.slide"
      },
      "slide_partner_id": {
        "type": "many2one",
        "label": "slide.slide.partner"
      }
    },
    "_inherit": "survey.user_input"
  }
];
