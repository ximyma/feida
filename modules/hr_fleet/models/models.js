// Odoo 模块: hr_fleet
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hremployee",
    "_description": "hremployee",
    "_auto": true,
    "_fields": {
      "employee_cars_count": {
        "type": "integer",
        "label": "_compute_employee_cars_count"
      },
      "car_ids": {
        "type": "one2many",
        "label": "car_ids"
      },
      "license_plate": {
        "type": "char",
        "label": "_compute_license_plate"
      },
      "mobility_card": {
        "type": "char",
        "label": "fleet.fleet_group_user"
      }
    },
    "_inherit": "hr.employee"
  },
  {
    "_name": "hremployeepublic",
    "_description": "hremployeepublic",
    "_auto": true,
    "_fields": {
      "mobility_card": {
        "type": "char",
        "label": "mobility_card"
      }
    },
    "_inherit": "hr.employee.public"
  },
  {
    "_name": "fleetvehicle",
    "_description": "fleetvehicle",
    "_auto": true,
    "_fields": {
      "mobility_card": {
        "type": "char",
        "label": "_compute_mobility_card"
      },
      "driver_employee_id": {
        "type": "many2one",
        "label": "driver_employee_id"
      },
      "driver_employee_name": {
        "type": "char",
        "label": "driver_employee_id.name"
      },
      "future_driver_employee_id": {
        "type": "many2one",
        "label": "future_driver_employee_id"
      }
    },
    "_inherit": "fleet.vehicle"
  },
  {
    "_name": "fleetvehicleassignationlog",
    "_description": "fleetvehicleassignationlog",
    "_auto": true,
    "_fields": {
      "driver_employee_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "attachment_number": {
        "type": "integer",
        "label": "Number of Attachments"
      }
    },
    "_inherit": "fleet.vehicle.assignation.log"
  },
  {
    "_name": "fleetvehiclelogcontract",
    "_description": "fleetvehiclelogcontract",
    "_auto": true,
    "_fields": {
      "purchaser_employee_id": {
        "type": "many2one",
        "label": "purchaser_employee_id"
      }
    },
    "_inherit": "fleet.vehicle.log.contract"
  },
  {
    "_name": "fleetvehiclelogservices",
    "_description": "fleetvehiclelogservices",
    "_auto": true,
    "_fields": {
      "purchaser_employee_id": {
        "type": "many2one",
        "label": "purchaser_employee_id"
      }
    },
    "_inherit": "fleet.vehicle.log.services"
  },
  {
    "_name": "fleetvehicleodometer",
    "_description": "fleetvehicleodometer",
    "_auto": true,
    "_fields": {
      "driver_employee_id": {
        "type": "many2one",
        "label": "driver_employee_id"
      }
    },
    "_inherit": "fleet.vehicle.odometer"
  },
  {
    "_name": "mailactivityplantemplate",
    "_description": "mailactivityplantemplate",
    "_auto": true,
    "_fields": {
      "responsible_type": {
        "type": "selection",
        "label": "responsible_type"
      }
    },
    "_inherit": "mail.activity.plan.template"
  }
];
