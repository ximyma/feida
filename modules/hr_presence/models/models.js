// Odoo 模块: hr_presence
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mobile_phone",
    "_description": "mobile_phone",
    "_auto": true,
    "_fields": {
      "email_sent": {
        "type": "boolean",
        "label": "email_sent",
        "default": false
      },
      "ip_connected": {
        "type": "boolean",
        "label": "ip_connected",
        "default": false
      },
      "manually_set_present": {
        "type": "boolean",
        "label": "manually_set_present",
        "default": false
      },
      "manually_set_presence": {
        "type": "boolean",
        "label": "manually_set_presence",
        "default": false
      },
      "hr_presence_state_display": {
        "type": "selection",
        "label": "hr_presence_state_display"
      }
    },
    "_inherit": "hr.employee"
  },
  {
    "_name": "hremployeepublic",
    "_description": "hremployeepublic",
    "_auto": true,
    "_fields": {
      "email_sent": {
        "type": "boolean",
        "label": "email_sent",
        "default": false
      },
      "ip_connected": {
        "type": "boolean",
        "label": "ip_connected",
        "default": false
      },
      "manually_set_present": {
        "type": "boolean",
        "label": "manually_set_present",
        "default": false
      },
      "manually_set_presence": {
        "type": "boolean",
        "label": "manually_set_presence",
        "default": false
      },
      "hr_presence_state_display": {
        "type": "selection",
        "label": "hr_presence_state_display"
      }
    },
    "_inherit": "hr.employee.public"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "hr_presence_last_compute_date": {
        "type": "datetime",
        "label": "hr_presence_last_compute_date"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "resuserslog",
    "_description": "resuserslog",
    "_auto": true,
    "_fields": {
      "ip": {
        "type": "char",
        "label": "IP Address"
      }
    },
    "_inherit": "res.users.log"
  }
];
