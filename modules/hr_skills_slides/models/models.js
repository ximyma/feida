// Odoo 模块: hr_skills_slides
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hremployee",
    "_description": "hremployee",
    "_auto": true,
    "_fields": {
      "subscribed_courses": {
        "type": "many2many",
        "label": "slide.channel"
      },
      "has_subscribed_courses": {
        "type": "boolean",
        "label": "_compute_courses_completion_text"
      },
      "courses_completion_text": {
        "type": "char",
        "label": "_compute_courses_completion_text"
      }
    },
    "_inherit": "hr.employee"
  },
  {
    "_name": "hremployeepublic",
    "_description": "hremployeepublic",
    "_auto": true,
    "_fields": {
      "has_subscribed_courses": {
        "type": "boolean",
        "label": "employee_id.has_subscribed_courses"
      },
      "courses_completion_text": {
        "type": "char",
        "label": "employee_id.courses_completion_text"
      }
    },
    "_inherit": "hr.employee.public"
  },
  {
    "_name": "hrresumeline",
    "_description": "hrresumeline",
    "_auto": true,
    "_fields": {
      "channel_id": {
        "type": "many2one",
        "label": "channel_id"
      },
      "course_url": {
        "type": "char",
        "label": "channel_id.website_absolute_url"
      },
      "duration": {
        "type": "integer",
        "label": "Duration"
      },
      "course_type": {
        "type": "selection",
        "label": "course_type"
      }
    },
    "_inherit": "hr.resume.line"
  }
];
