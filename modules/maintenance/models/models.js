// Odoo 模块: maintenance
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "maintenance.stage",
    "_description": "Maintenance Stage",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "fold": {
        "type": "boolean",
        "label": "Folded in Maintenance Pipe"
      },
      "done": {
        "type": "boolean",
        "label": "Request Done"
      }
    }
  },
  {
    "_name": "maintenance.equipment.category",
    "_description": "Maintenance Equipment Category",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Category Name",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "technician_user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "note": {
        "type": "html",
        "label": "Comments"
      },
      "equipment_ids": {
        "type": "one2many",
        "label": "maintenance.equipment"
      },
      "equipment_count": {
        "type": "integer",
        "label": "Equipment Count"
      },
      "maintenance_ids": {
        "type": "one2many",
        "label": "maintenance.request"
      },
      "maintenance_count": {
        "type": "integer",
        "label": "Maintenance Count"
      },
      "maintenance_open_count": {
        "type": "integer",
        "label": "Current Maintenance"
      },
      "fold": {
        "type": "boolean",
        "label": "Folded in Maintenance Pipe"
      },
      "equipment_properties_definition": {
        "type": "char",
        "label": "Equipment Properties"
      }
    }
  },
  {
    "_name": "maintenance.equipment",
    "_description": "Maintenance Equipment",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Equipment Name",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "owner_user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "category_id": {
        "type": "many2one",
        "label": "maintenance.equipment.category"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "partner_ref": {
        "type": "char",
        "label": "Vendor Reference"
      },
      "model": {
        "type": "char",
        "label": "Model"
      },
      "serial_no": {
        "type": "char",
        "label": "Serial Number"
      },
      "assign_date": {
        "type": "date",
        "label": "Assigned Date"
      },
      "cost": {
        "type": "float",
        "label": "Cost"
      },
      "note": {
        "type": "html",
        "label": "Note"
      },
      "warranty_date": {
        "type": "date",
        "label": "Warranty Expiration Date"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "scrap_date": {
        "type": "date",
        "label": "Scrap Date"
      },
      "maintenance_ids": {
        "type": "one2many",
        "label": "maintenance.request"
      },
      "equipment_properties": {
        "type": "char",
        "label": "Properties"
      }
    }
  },
  {
    "_name": "maintenance.request",
    "_description": "Maintenance Request",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Subjects",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "description": {
        "type": "html",
        "label": "Description"
      },
      "request_date": {
        "type": "date",
        "label": "Request Date"
      },
      "owner_user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "category_id": {
        "type": "many2one",
        "label": "maintenance.equipment.category"
      },
      "equipment_id": {
        "type": "many2one",
        "label": "maintenance.equipment"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "stage_id": {
        "type": "many2one",
        "label": "maintenance.stage"
      },
      "priority": {
        "type": "selection",
        "label": "0"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "close_date": {
        "type": "date",
        "label": "Close Date"
      },
      "kanban_state": {
        "type": "selection",
        "label": "normal"
      },
      "archive": {
        "type": "boolean",
        "label": "Set archive to true to hide the maintenance request without deleting it.",
        "default": false
      },
      "maintenance_type": {
        "type": "selection",
        "label": "corrective",
        "default": "corrective"
      },
      "schedule_date": {
        "type": "datetime",
        "label": "Scheduled Date"
      },
      "schedule_end": {
        "type": "datetime",
        "label": "schedule_end"
      },
      "maintenance_team_id": {
        "type": "many2one",
        "label": "maintenance.team",
        "required": true
      },
      "duration": {
        "type": "float",
        "label": "Duration in hours."
      },
      "done": {
        "type": "boolean",
        "label": "stage_id.done"
      },
      "instruction_type": {
        "type": "selection",
        "label": "instruction_type"
      },
      "instruction_pdf": {
        "type": "text",
        "label": "PDF"
      },
      "instruction_google_slide": {
        "type": "char",
        "label": "Google Slide"
      },
      "instruction_text": {
        "type": "html",
        "label": "Text"
      },
      "recurring_maintenance": {
        "type": "boolean",
        "label": "Recurrent"
      },
      "repeat_interval": {
        "type": "integer",
        "label": "Repeat Every"
      },
      "repeat_unit": {
        "type": "selection",
        "label": "repeat_unit"
      },
      "repeat_type": {
        "type": "selection",
        "label": "repeat_type"
      },
      "repeat_until": {
        "type": "date",
        "label": "End Date"
      }
    }
  },
  {
    "_name": "maintenance.team",
    "_description": "Maintenance Teams",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Team Name",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "member_ids": {
        "type": "many2many",
        "label": "member_ids"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "request_ids": {
        "type": "one2many",
        "label": "maintenance.request"
      },
      "equipment_ids": {
        "type": "one2many",
        "label": "maintenance.equipment"
      },
      "todo_request_ids": {
        "type": "one2many",
        "label": "maintenance.request"
      },
      "todo_request_count": {
        "type": "integer",
        "label": "Number of Requests"
      },
      "todo_request_count_date": {
        "type": "integer",
        "label": "Number of Requests Scheduled"
      },
      "todo_request_count_high_priority": {
        "type": "integer",
        "label": "Number of Requests in High Priority"
      },
      "todo_request_count_block": {
        "type": "integer",
        "label": "Number of Requests Blocked"
      },
      "todo_request_count_unscheduled": {
        "type": "integer",
        "label": "Number of Requests Unscheduled"
      },
      "alias_id": {
        "type": "many2one",
        "label": "Email alias for this maintenance team."
      }
    }
  }
];
