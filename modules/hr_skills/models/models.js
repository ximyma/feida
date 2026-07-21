// Odoo 模块: hr_skills
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hremployee",
    "_description": "hremployee",
    "_auto": true,
    "_fields": {
      "resume_line_ids": {
        "type": "one2many",
        "label": "hr.resume.line"
      },
      "employee_skill_ids": {
        "type": "one2many",
        "label": "hr.employee.skill"
      },
      "current_employee_skill_ids": {
        "type": "one2many",
        "label": "hr.employee.skill"
      },
      "skill_ids": {
        "type": "many2many",
        "label": "hr.skill"
      },
      "certification_ids": {
        "type": "one2many",
        "label": "hr.employee.skill"
      },
      "display_certification_page": {
        "type": "boolean",
        "label": "_compute_display_certification_page"
      }
    },
    "_inherit": "hr.employee"
  },
  {
    "_name": "hremployeepublic",
    "_description": "hremployeepublic",
    "_auto": true,
    "_fields": {
      "resume_line_ids": {
        "type": "one2many",
        "label": "hr.resume.line"
      },
      "employee_skill_ids": {
        "type": "one2many",
        "label": "hr.employee.skill"
      },
      "current_employee_skill_ids": {
        "type": "one2many",
        "label": "hr.employee.skill"
      },
      "certification_ids": {
        "type": "one2many",
        "label": "hr.employee.skill"
      },
      "display_certification_page": {
        "type": "boolean",
        "label": "employee_id.display_certification_page"
      }
    },
    "_inherit": "hr.employee.public"
  },
  {
    "_name": "hr.employee.skill",
    "_description": "Skill level for employee",
    "_auto": true,
    "_fields": {
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee",
        "required": true
      }
    },
    "_inherit": "hr.individual.skill.mixin"
  },
  {
    "_name": "hr.job.skill",
    "_description": "hr.job.skill",
    "_auto": true,
    "_fields": {
      "job_skill_ids": {
        "type": "one2many",
        "label": "job_skill_ids"
      },
      "current_job_skill_ids": {
        "type": "one2many",
        "label": "current_job_skill_ids"
      },
      "skill_ids": {
        "type": "many2many",
        "label": "skill_ids"
      }
    },
    "_inherit": "hr.job"
  },
  {
    "_name": "hr.resume.line",
    "_description": "Resume line of an employee",
    "_auto": true,
    "_fields": {
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee",
        "required": true
      },
      "avatar_128": {
        "type": "text",
        "label": "employee_id.avatar_128"
      },
      "company_id": {
        "type": "many2one",
        "label": "employee_id.company_id"
      },
      "department_id": {
        "type": "many2one",
        "label": "employee_id.department_id"
      },
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "date_start": {
        "type": "date",
        "label": "date_start",
        "required": true
      },
      "date_end": {
        "type": "date",
        "label": "date_end"
      },
      "duration": {
        "type": "integer",
        "label": "Duration"
      },
      "description": {
        "type": "html",
        "label": "Description"
      },
      "line_type_id": {
        "type": "many2one",
        "label": "hr.resume.line.type"
      },
      "is_course": {
        "type": "boolean",
        "label": "line_type_id.is_course"
      },
      "course_type": {
        "type": "selection",
        "label": "course_type"
      },
      "color": {
        "type": "char",
        "label": "_compute_color",
        "default": "#000000"
      },
      "external_url": {
        "type": "char",
        "label": "External URL"
      },
      "certificate_filename": {
        "type": "char",
        "label": "certificate_filename"
      },
      "certificate_file": {
        "type": "text",
        "label": "Certificate"
      },
      "resume_line_properties": {
        "type": "char",
        "label": "resume_line_properties"
      }
    }
  },
  {
    "_name": "hr.resume.line.type",
    "_description": "Type of a resume line",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "is_course": {
        "type": "boolean",
        "label": "Course",
        "default": false
      },
      "resume_line_type_properties_definition": {
        "type": "char",
        "label": "Sections Properties"
      }
    }
  },
  {
    "_name": "hr.skill",
    "_description": "Skill",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "skill_type_id": {
        "type": "many2one",
        "label": "hr.skill.type",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "skill_type_id.color"
      }
    }
  },
  {
    "_name": "hr.skill.level",
    "_description": "Skill Level",
    "_auto": true,
    "_fields": {
      "skill_type_id": {
        "type": "many2one",
        "label": "hr.skill.type"
      },
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "level_progress": {
        "type": "integer",
        "label": "Progress"
      },
      "default_level": {
        "type": "boolean",
        "label": "If checked, this level will be the default one selected when choosing this skill."
      },
      "technical_is_new_default": {
        "type": "boolean",
        "label": "_compute_technical_is_new_default"
      }
    }
  },
  {
    "_name": "hr.skill.type",
    "_description": "Skill Type",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "skill_ids": {
        "type": "one2many",
        "label": "hr.skill"
      },
      "skill_level_ids": {
        "type": "one2many",
        "label": "hr.skill.level"
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "levels_count": {
        "type": "integer",
        "label": "_compute_levels_count"
      },
      "is_certification": {
        "type": "boolean",
        "label": "Certification"
      }
    }
  },
  {
    "_name": "resourceresource",
    "_description": "resourceresource",
    "_auto": true,
    "_fields": {
      "employee_skill_ids": {
        "type": "one2many",
        "label": "employee_id.employee_skill_ids"
      }
    },
    "_inherit": "resource.resource"
  }
];
