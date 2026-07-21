// Odoo 模块: hr_homeworking
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hremployee",
    "_description": "hremployee",
    "_auto": true,
    "_fields": {
      "monday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "tuesday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "wednesday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "thursday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "friday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "saturday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "sunday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "exceptional_location_id": {
        "type": "many2one",
        "label": "exceptional_location_id"
      },
      "hr_icon_display": {
        "type": "selection",
        "label": "presence_home"
      },
      "today_location_name": {
        "type": "char",
        "label": "today_location_name"
      }
    },
    "_inherit": "hr.employee"
  },
  {
    "_name": "hremployeepublic",
    "_description": "hremployeepublic",
    "_auto": true,
    "_fields": {
      "monday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "tuesday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "wednesday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "thursday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "friday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "saturday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "sunday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "today_location_name": {
        "type": "char",
        "label": "today_location_name"
      }
    },
    "_inherit": "hr.employee.public"
  },
  {
    "_name": "hr.employee.location",
    "_description": "Employee Location",
    "_auto": true,
    "_fields": {
      "work_location_id": {
        "type": "many2one",
        "label": "hr.work.location",
        "required": true
      },
      "work_location_name": {
        "type": "char",
        "label": "work_location_id.name"
      },
      "work_location_type": {
        "type": "selection",
        "label": "work_location_id.location_type"
      },
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee",
        "required": true
      },
      "employee_name": {
        "type": "char",
        "label": "employee_id.name"
      },
      "date": {
        "type": "date",
        "label": "Date"
      },
      "day_week_string": {
        "type": "char",
        "label": "_compute_day_week_string"
      }
    }
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "monday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "tuesday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "wednesday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "thursday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "friday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "saturday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      },
      "sunday_location_id": {
        "type": "many2one",
        "label": "hr.work.location"
      }
    },
    "_inherit": "res.users"
  }
];
