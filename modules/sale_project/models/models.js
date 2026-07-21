// Odoo 模块: sale_project
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "service_tracking": {
        "type": "selection",
        "label": "service_tracking"
      },
      "project_id": {
        "type": "many2one",
        "label": "project_id"
      },
      "project_template_id": {
        "type": "many2one",
        "label": "project_template_id"
      },
      "task_template_id": {
        "type": "many2one",
        "label": "project.task"
      },
      "service_policy": {
        "type": "selection",
        "label": "_selection_service_policy"
      },
      "service_type": {
        "type": "selection",
        "label": "service_type"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "projectmilestone",
    "_description": "projectmilestone",
    "_auto": true,
    "_fields": {
      "allow_billable": {
        "type": "boolean",
        "label": "project_id.allow_billable"
      },
      "project_partner_id": {
        "type": "many2one",
        "label": "project_id.partner_id"
      },
      "sale_line_id": {
        "type": "many2one",
        "label": "sale.order.line"
      },
      "quantity_percentage": {
        "type": "float",
        "label": "Quantity (%)"
      },
      "sale_line_display_name": {
        "type": "char",
        "label": "Sale Line Display Name"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "sale_line_id.product_uom_id"
      },
      "product_uom_qty": {
        "type": "float",
        "label": "Quantity"
      }
    },
    "_inherit": "project.milestone"
  },
  {
    "_name": "materials",
    "_description": "materials",
    "_auto": true,
    "_fields": {
      "allow_billable": {
        "type": "boolean",
        "label": "Billable"
      },
      "sale_line_id": {
        "type": "many2one",
        "label": "sale_line_id"
      },
      "sale_order_id": {
        "type": "many2one",
        "label": "sale_line_id.order_id"
      },
      "has_any_so_to_invoice": {
        "type": "boolean",
        "label": "Has SO to Invoice"
      },
      "sale_order_line_count": {
        "type": "integer",
        "label": "_compute_sale_order_count"
      },
      "sale_order_count": {
        "type": "integer",
        "label": "_compute_sale_order_count"
      },
      "has_any_so_with_nothing_to_invoice": {
        "type": "boolean",
        "label": "Has a SO with an invoice status of No"
      },
      "invoice_count": {
        "type": "integer",
        "label": "_compute_invoice_count"
      },
      "vendor_bill_count": {
        "type": "integer",
        "label": "account_id.vendor_bill_count"
      },
      "partner_id": {
        "type": "many2one",
        "label": "_compute_partner_id"
      },
      "display_sales_stat_buttons": {
        "type": "boolean",
        "label": "_compute_display_sales_stat_buttons"
      },
      "sale_order_state": {
        "type": "selection",
        "label": "sale_order_id.state"
      },
      "reinvoiced_sale_order_id": {
        "type": "many2one",
        "label": "sale.order"
      }
    },
    "_inherit": "project.project"
  },
  {
    "_name": "projecttask",
    "_description": "projecttask",
    "_auto": true,
    "_fields": {
      "sale_order_id": {
        "type": "many2one",
        "label": "sale.order"
      },
      "sale_line_id": {
        "type": "many2one",
        "label": "sale_line_id"
      },
      "project_sale_order_id": {
        "type": "many2one",
        "label": "sale.order"
      },
      "sale_order_state": {
        "type": "selection",
        "label": "sale_order_id.state"
      },
      "task_to_invoice": {
        "type": "boolean",
        "label": "To invoice"
      },
      "allow_billable": {
        "type": "boolean",
        "label": "project_id.allow_billable"
      },
      "partner_id": {
        "type": "many2one",
        "label": "_inverse_partner_id"
      },
      "display_sale_order_button": {
        "type": "boolean",
        "label": "Display Sales Order"
      }
    },
    "_inherit": "project.task"
  },
  {
    "_name": "projecttasktype",
    "_description": "projecttasktype",
    "_auto": true,
    "_fields": {
      "show_rating_active": {
        "type": "boolean",
        "label": "_compute_show_rating_active"
      }
    },
    "_inherit": "project.task.type"
  },
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "tasks_ids": {
        "type": "many2many",
        "label": "project.task"
      },
      "tasks_count": {
        "type": "integer",
        "label": "Tasks"
      },
      "visible_project": {
        "type": "boolean",
        "label": "Display project"
      },
      "project_ids": {
        "type": "many2many",
        "label": "project.project"
      },
      "project_count": {
        "type": "integer",
        "label": "Number of Projects"
      },
      "milestone_count": {
        "type": "integer",
        "label": "_compute_milestone_count"
      },
      "is_product_milestone": {
        "type": "boolean",
        "label": "_compute_is_product_milestone"
      },
      "show_create_project_button": {
        "type": "boolean",
        "label": "_compute_show_project_and_task_button"
      },
      "show_project_button": {
        "type": "boolean",
        "label": "_compute_show_project_and_task_button"
      },
      "closed_task_count": {
        "type": "integer",
        "label": "_compute_tasks_ids"
      },
      "completed_task_percentage": {
        "type": "float",
        "label": "_compute_completed_task_percentage"
      },
      "project_id": {
        "type": "many2one",
        "label": "project.project"
      },
      "project_account_id": {
        "type": "many2one",
        "label": "account.analytic.account"
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
        "label": "milestones"
      },
      "project_id": {
        "type": "many2one",
        "label": "project_id"
      },
      "task_id": {
        "type": "many2one",
        "label": "task_id"
      },
      "reached_milestones_ids": {
        "type": "one2many",
        "label": "project.milestone"
      }
    },
    "_inherit": "sale.order.line"
  }
];
