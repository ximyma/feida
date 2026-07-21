// Odoo 模块: hr_maintenance
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "maintenanceequipment",
    "_description": "maintenanceequipment",
    "_auto": true,
    "_fields": {
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "department_id": {
        "type": "many2one",
        "label": "hr.department"
      },
      "equipment_assign_to": {
        "type": "selection",
        "label": "equipment_assign_to"
      },
      "owner_user_id": {
        "type": "many2one",
        "label": "_compute_owner"
      },
      "assign_date": {
        "type": "date",
        "label": "_compute_equipment_assign"
      }
    },
    "_inherit": "maintenance.equipment"
  },
  {
    "_name": "maintenancerequest",
    "_description": "maintenancerequest",
    "_auto": true,
    "_fields": {
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "owner_user_id": {
        "type": "many2one",
        "label": "_compute_owner"
      },
      "equipment_id": {
        "type": "many2one",
        "label": "["
      }
    },
    "_inherit": "maintenance.request"
  },
  {
    "_name": "hremployee",
    "_description": "hremployee",
    "_auto": true,
    "_fields": {
      "equipment_ids": {
        "type": "one2many",
        "label": "maintenance.equipment"
      },
      "equipment_count": {
        "type": "integer",
        "label": "Equipment Count"
      }
    },
    "_inherit": "hr.employee"
  },
  {
    "_name": "hremployeepublic",
    "_description": "hremployeepublic",
    "_auto": true,
    "_fields": {
      "equipment_count": {
        "type": "integer",
        "label": "employee_id.equipment_count"
      }
    },
    "_inherit": "hr.employee.public"
  }
];
