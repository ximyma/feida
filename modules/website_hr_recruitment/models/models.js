// Odoo 模块: website_hr_recruitment
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hrdepartment",
    "_description": "hrdepartment",
    "_auto": true,
    "_fields": {
      "display_name": {
        "type": "char",
        "label": "display_name"
      }
    },
    "_inherit": "hr.department"
  },
  {
    "_name": "hr.job",
    "_description": "hr.job",
    "_auto": true,
    "_fields": {
      "description": {
        "type": "html",
        "label": "description"
      },
      "website_published": {
        "type": "boolean",
        "label": "Set if the application is published on the website of the company."
      },
      "website_description": {
        "type": "html",
        "label": "website_description"
      },
      "job_details": {
        "type": "html",
        "label": "job_details"
      },
      "published_date": {
        "type": "date",
        "label": "_compute_published_date"
      },
      "full_url": {
        "type": "char",
        "label": "job URL"
      }
    }
  },
  {
    "_name": "hrrecruitmentsource",
    "_description": "hrrecruitmentsource",
    "_auto": true,
    "_fields": {
      "url": {
        "type": "char",
        "label": "_compute_url"
      }
    },
    "_inherit": "hr.recruitment.source"
  }
];
