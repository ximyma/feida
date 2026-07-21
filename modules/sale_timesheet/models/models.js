// Odoo 模块: sale_timesheet
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "timesheet_ids": {
        "type": "one2many",
        "label": "account.analytic.line"
      },
      "timesheet_count": {
        "type": "integer",
        "label": "Number of timesheets"
      },
      "timesheet_encode_uom_id": {
        "type": "many2one",
        "label": "uom.uom"
      },
      "timesheet_total_duration": {
        "type": "integer",
        "label": "Timesheet Total Duration"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accountanalyticline",
    "_description": "accountanalyticline",
    "_auto": true,
    "_fields": {
      "timesheet_invoice_type": {
        "type": "selection",
        "label": "Billable Type"
      },
      "commercial_partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "timesheet_invoice_id": {
        "type": "many2one",
        "label": "account.move"
      },
      "so_line": {
        "type": "many2one",
        "label": "_compute_so_line"
      },
      "order_id": {
        "type": "many2one",
        "label": "so_line.order_id"
      },
      "is_so_line_edited": {
        "type": "boolean",
        "label": "Is Sales Order Item Manually Edited"
      },
      "allow_billable": {
        "type": "boolean",
        "label": "project_id.allow_billable"
      },
      "sale_order_state": {
        "type": "selection",
        "label": "order_id.state"
      }
    },
    "_inherit": "account.analytic.line"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "service_type": {
        "type": "selection",
        "label": "service_type"
      },
      "project_id": {
        "type": "many2one",
        "label": "["
      },
      "project_template_id": {
        "type": "many2one",
        "label": "["
      },
      "service_upsell_threshold": {
        "type": "float",
        "label": "Threshold"
      },
      "service_upsell_threshold_ratio": {
        "type": "char",
        "label": "_compute_service_upsell_threshold_ratio"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "action_profitability_items",
    "_description": "action_profitability_items",
    "_auto": true,
    "_fields": {
      "pricing_type": {
        "type": "selection",
        "label": "pricing_type"
      },
      "sale_line_employee_ids": {
        "type": "one2many",
        "label": "sale_line_employee_ids"
      },
      "timesheet_product_id": {
        "type": "many2one",
        "label": "timesheet_product_id"
      },
      "warning_employee_rate": {
        "type": "boolean",
        "label": "_compute_warning_employee_rate"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "allocated_hours": {
        "type": "float",
        "label": "allocated_hours"
      },
      "billing_type": {
        "type": "selection",
        "label": "billing_type"
      }
    },
    "_inherit": "project.project"
  },
  {
    "_name": "project.sale.line.employee.map",
    "_description": "Project Sales line, employee mapping",
    "_auto": true,
    "_fields": {
      "project_id": {
        "type": "many2one",
        "label": "project.project",
        "required": true
      },
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee",
        "required": true
      },
      "existing_employee_ids": {
        "type": "many2many",
        "label": "hr.employee"
      },
      "sale_line_id": {
        "type": "many2one",
        "label": "sale_line_id"
      },
      "sale_order_id": {
        "type": "many2one",
        "label": "project_id.sale_order_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "partner_id": {
        "type": "many2one",
        "label": "project_id.partner_id"
      },
      "price_unit": {
        "type": "float",
        "label": "Unit Price"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "cost": {
        "type": "monetary",
        "label": "cost_currency_id"
      },
      "display_cost": {
        "type": "monetary",
        "label": "cost_currency_id"
      },
      "cost_currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "is_cost_changed": {
        "type": "boolean",
        "label": "Is Cost Manually Changed"
      }
    }
  },
  {
    "_name": "projecttask",
    "_description": "projecttask",
    "_auto": true,
    "_fields": {
      "sale_order_id": {
        "type": "many2one",
        "label": "["
      },
      "pricing_type": {
        "type": "selection",
        "label": "project_id.pricing_type"
      },
      "is_project_map_empty": {
        "type": "boolean",
        "label": "Is Project map empty"
      },
      "has_multi_sol": {
        "type": "boolean",
        "label": "_compute_has_multi_sol"
      },
      "timesheet_product_id": {
        "type": "many2one",
        "label": "project_id.timesheet_product_id"
      },
      "remaining_hours_so": {
        "type": "float",
        "label": "Time Remaining on SO"
      },
      "remaining_hours_available": {
        "type": "boolean",
        "label": "sale_line_id.remaining_hours_available"
      },
      "last_sol_of_customer": {
        "type": "many2one",
        "label": "sale.order.line"
      }
    },
    "_inherit": "project.task"
  },
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "timesheet_count": {
        "type": "float",
        "label": "Timesheet activities"
      },
      "timesheet_encode_uom_id": {
        "type": "many2one",
        "label": "uom.uom"
      },
      "timesheet_total_duration": {
        "type": "integer",
        "label": "Timesheet Total Duration"
      },
      "show_hours_recorded_button": {
        "type": "boolean",
        "label": "_compute_show_hours_recorded_button"
      }
    },
    "_inherit": "sale.order"
  },
  {
    "_name": "saleorderline",
    "_description": "saleorderline",
    "_auto": true,
    "_fields": {
      "qty_delivered_method": {
        "type": "selection",
        "label": "timesheet"
      },
      "analytic_line_ids": {
        "type": "one2many",
        "label": "project_id"
      },
      "remaining_hours_available": {
        "type": "boolean",
        "label": "_compute_remaining_hours_available"
      },
      "remaining_hours": {
        "type": "float",
        "label": "Time Remaining on SO"
      },
      "has_displayed_warning_upsell": {
        "type": "boolean",
        "label": "Has Displayed Warning Upsell"
      },
      "timesheet_ids": {
        "type": "one2many",
        "label": "account.analytic.line"
      }
    },
    "_inherit": "sale.order.line"
  }
];
