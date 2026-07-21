// Odoo 模块: mrp
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mrp.bom",
    "_description": "Bill of Material",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "char",
        "label": "Reference"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "type": {
        "type": "selection",
        "label": "type"
      },
      "product_tmpl_id": {
        "type": "many2one",
        "label": "product_tmpl_id"
      },
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "bom_line_ids": {
        "type": "one2many",
        "label": "mrp.bom.line"
      },
      "byproduct_ids": {
        "type": "one2many",
        "label": "mrp.bom.byproduct"
      },
      "product_qty": {
        "type": "float",
        "label": "product_qty"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "product_uom_id"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "operation_ids": {
        "type": "one2many",
        "label": "mrp.routing.workcenter"
      },
      "operation_count": {
        "type": "integer",
        "label": "Operations Count"
      },
      "show_copy_operations_button": {
        "type": "boolean",
        "label": "show_copy_operations_button"
      },
      "ready_to_produce": {
        "type": "selection",
        "label": "ready_to_produce"
      },
      "picking_type_id": {
        "type": "many2one",
        "label": "picking_type_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "consumption": {
        "type": "selection",
        "label": "consumption"
      },
      "possible_product_template_attribute_value_ids": {
        "type": "many2many",
        "label": "possible_product_template_attribute_value_ids"
      },
      "allow_operation_dependencies": {
        "type": "boolean",
        "label": "Operation Dependencies"
      },
      "produce_delay": {
        "type": "integer",
        "label": "produce_delay"
      },
      "days_to_prepare_mo": {
        "type": "integer",
        "label": "days_to_prepare_mo"
      },
      "show_set_bom_button": {
        "type": "boolean",
        "label": "_compute_show_set_bom_button"
      },
      "batch_size": {
        "type": "float",
        "label": "Batch Size"
      },
      "enable_batch_size": {
        "type": "boolean",
        "label": "enable_batch_size",
        "default": false
      }
    }
  },
  {
    "_name": "mrp.bom.line",
    "_description": "Bill of Material Line",
    "_auto": true,
    "_fields": {
      "product_id": {
        "type": "many2one",
        "label": "product.product",
        "required": true
      },
      "product_tmpl_id": {
        "type": "many2one",
        "label": "product.template"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "product_qty": {
        "type": "float",
        "label": "product_qty"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "product_uom_id"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "bom_id": {
        "type": "many2one",
        "label": "bom_id"
      },
      "parent_product_tmpl_id": {
        "type": "many2one",
        "label": "product.template"
      },
      "possible_bom_product_template_attribute_value_ids": {
        "type": "many2many",
        "label": "bom_id.possible_product_template_attribute_value_ids"
      },
      "bom_product_template_attribute_value_ids": {
        "type": "many2many",
        "label": "bom_product_template_attribute_value_ids"
      },
      "allowed_operation_ids": {
        "type": "one2many",
        "label": "mrp.routing.workcenter"
      },
      "operation_id": {
        "type": "many2one",
        "label": "operation_id"
      },
      "child_bom_id": {
        "type": "many2one",
        "label": "child_bom_id"
      },
      "child_line_ids": {
        "type": "one2many",
        "label": "child_line_ids"
      },
      "attachments_count": {
        "type": "integer",
        "label": "Attachments Count"
      },
      "tracking": {
        "type": "selection",
        "label": "product_id.tracking"
      }
    }
  },
  {
    "_name": "mrp.bom.byproduct",
    "_description": "Byproduct",
    "_auto": true,
    "_fields": {
      "product_id": {
        "type": "many2one",
        "label": "product.product",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "bom_id.company_id"
      },
      "product_qty": {
        "type": "float",
        "label": "product_qty"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "uom.uom",
        "required": true
      },
      "bom_id": {
        "type": "many2one",
        "label": "mrp.bom"
      },
      "allowed_operation_ids": {
        "type": "one2many",
        "label": "mrp.routing.workcenter"
      },
      "operation_id": {
        "type": "many2one",
        "label": "operation_id"
      },
      "possible_bom_product_template_attribute_value_ids": {
        "type": "many2many",
        "label": "bom_id.possible_product_template_attribute_value_ids"
      },
      "bom_product_template_attribute_value_ids": {
        "type": "many2many",
        "label": "bom_product_template_attribute_value_ids"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "cost_share": {
        "type": "float",
        "label": "cost_share"
      }
    }
  },
  {
    "_name": "mrp.production.group",
    "_description": "Production Group",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "production_ids": {
        "type": "one2many",
        "label": "mrp.production"
      },
      "child_ids": {
        "type": "many2many",
        "label": "child_ids"
      },
      "parent_ids": {
        "type": "many2many",
        "label": "parent_ids"
      }
    }
  },
  {
    "_name": "mrp.production",
    "_description": "Manufacturing Order",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Reference"
      },
      "priority": {
        "type": "selection",
        "label": "priority"
      },
      "backorder_sequence": {
        "type": "integer",
        "label": "Backorder Sequence"
      },
      "origin": {
        "type": "char",
        "label": "origin"
      },
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "production_group_id": {
        "type": "many2one",
        "label": "mrp.production.group"
      },
      "product_variant_attributes": {
        "type": "many2many",
        "label": "product.template.attribute.value"
      },
      "valid_product_template_attribute_line_ids": {
        "type": "many2many",
        "label": "product_tmpl_id.valid_product_template_attribute_line_ids"
      },
      "never_product_template_attribute_value_ids": {
        "type": "many2many",
        "label": "never_product_template_attribute_value_ids"
      },
      "workcenter_id": {
        "type": "many2one",
        "label": "mrp.workcenter"
      },
      "product_tracking": {
        "type": "selection",
        "label": "product_id.tracking"
      },
      "product_tmpl_id": {
        "type": "many2one",
        "label": "product.template"
      },
      "product_qty": {
        "type": "float",
        "label": "product_qty"
      },
      "allowed_uom_ids": {
        "type": "many2many",
        "label": "uom.uom"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "product_uom_id"
      },
      "lot_producing_ids": {
        "type": "many2many",
        "label": "lot_producing_ids"
      },
      "qty_producing": {
        "type": "float",
        "label": "Quantity Producing"
      },
      "product_uom_qty": {
        "type": "float",
        "label": "Total Quantity"
      },
      "picking_type_id": {
        "type": "many2one",
        "label": "picking_type_id"
      },
      "use_create_components_lots": {
        "type": "boolean",
        "label": "picking_type_id.use_create_components_lots"
      },
      "location_src_id": {
        "type": "many2one",
        "label": "location_src_id"
      },
      "warehouse_id": {
        "type": "many2one",
        "label": "location_src_id.warehouse_id"
      },
      "location_dest_id": {
        "type": "many2one",
        "label": "location_dest_id"
      },
      "location_final_id": {
        "type": "many2one",
        "label": "stock.location"
      },
      "date_deadline": {
        "type": "datetime",
        "label": "date_deadline"
      },
      "date_start": {
        "type": "datetime",
        "label": "date_start"
      },
      "date_finished": {
        "type": "datetime",
        "label": "date_finished"
      },
      "duration_expected": {
        "type": "float",
        "label": "Expected Duration"
      },
      "duration": {
        "type": "float",
        "label": "Real Duration"
      },
      "bom_id": {
        "type": "many2one",
        "label": "bom_id"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "reservation_state": {
        "type": "selection",
        "label": "reservation_state"
      },
      "move_raw_ids": {
        "type": "one2many",
        "label": "move_raw_ids"
      },
      "move_finished_ids": {
        "type": "one2many",
        "label": "move_finished_ids"
      },
      "all_move_raw_ids": {
        "type": "one2many",
        "label": "stock.move"
      },
      "all_move_ids": {
        "type": "one2many",
        "label": "stock.move"
      },
      "move_byproduct_ids": {
        "type": "one2many",
        "label": "stock.move"
      },
      "finished_move_line_ids": {
        "type": "one2many",
        "label": "finished_move_line_ids"
      },
      "workorder_ids": {
        "type": "one2many",
        "label": "workorder_ids"
      },
      "move_dest_ids": {
        "type": "one2many",
        "label": "stock.move"
      },
      "unreserve_visible": {
        "type": "boolean",
        "label": "unreserve_visible"
      },
      "reserve_visible": {
        "type": "boolean",
        "label": "reserve_visible"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "qty_produced": {
        "type": "float",
        "label": "_get_produced_qty"
      },
      "reference_ids": {
        "type": "many2many",
        "label": "reference_ids"
      },
      "product_description_variants": {
        "type": "char",
        "label": "Custom Description"
      },
      "orderpoint_id": {
        "type": "many2one",
        "label": "stock.warehouse.orderpoint"
      },
      "propagate_cancel": {
        "type": "boolean",
        "label": "propagate_cancel"
      },
      "delay_alert_date": {
        "type": "datetime",
        "label": "Delay Alert Date"
      },
      "json_popover": {
        "type": "char",
        "label": "JSON data for the popover widget"
      },
      "scrap_ids": {
        "type": "one2many",
        "label": "stock.scrap"
      },
      "scrap_count": {
        "type": "integer",
        "label": "_compute_scrap_move_count"
      },
      "unbuild_ids": {
        "type": "one2many",
        "label": "mrp.unbuild"
      },
      "unbuild_count": {
        "type": "integer",
        "label": "_compute_unbuild_count"
      },
      "is_locked": {
        "type": "boolean",
        "label": "Is Locked"
      },
      "is_planned": {
        "type": "boolean",
        "label": "Its Operations are Planned"
      },
      "show_final_lots": {
        "type": "boolean",
        "label": "Show Final Lots"
      },
      "production_location_id": {
        "type": "many2one",
        "label": "stock.location"
      },
      "picking_ids": {
        "type": "many2many",
        "label": "stock.picking"
      },
      "delivery_count": {
        "type": "integer",
        "label": "Delivery Orders"
      },
      "consumption": {
        "type": "selection",
        "label": "consumption"
      },
      "mrp_production_child_count": {
        "type": "integer",
        "label": "Number of generated MO"
      },
      "mrp_production_source_count": {
        "type": "integer",
        "label": "Number of source MO"
      },
      "mrp_production_backorder_count": {
        "type": "integer",
        "label": "Count of linked backorder"
      },
      "show_lock": {
        "type": "boolean",
        "label": "Show Lock/unlock buttons"
      },
      "components_availability": {
        "type": "char",
        "label": "components_availability"
      },
      "components_availability_state": {
        "type": "selection",
        "label": "components_availability_state"
      },
      "production_capacity": {
        "type": "float",
        "label": "_compute_production_capacity"
      },
      "show_lot_ids": {
        "type": "boolean",
        "label": "Display the serial number shortcut on the moves"
      },
      "forecasted_issue": {
        "type": "boolean",
        "label": "_compute_forecasted_issue"
      },
      "show_allocation": {
        "type": "boolean",
        "label": "show_allocation"
      },
      "allow_workorder_dependencies": {
        "type": "boolean",
        "label": "Allow Work Order Dependencies"
      },
      "show_produce": {
        "type": "boolean",
        "label": "_compute_show_produce"
      },
      "show_generate_bom": {
        "type": "boolean",
        "label": "Show Generate BOM"
      },
      "show_produce_all": {
        "type": "boolean",
        "label": "_compute_show_produce"
      },
      "is_outdated_bom": {
        "type": "boolean",
        "label": "Outdated BoM"
      },
      "is_delayed": {
        "type": "boolean",
        "label": "_compute_is_delayed"
      },
      "search_date_category": {
        "type": "selection",
        "label": "search_date_category"
      },
      "serial_numbers_count": {
        "type": "integer",
        "label": "Count of serial numbers"
      }
    }
  },
  {
    "_name": "mrp.routing.workcenter",
    "_description": "Work Center Usage",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Operation",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "workcenter_id": {
        "type": "many2one",
        "label": "mrp.workcenter",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "bom_id": {
        "type": "many2one",
        "label": "bom_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "time_mode": {
        "type": "selection",
        "label": "time_mode"
      },
      "time_mode_batch": {
        "type": "integer",
        "label": "Based on"
      },
      "time_computed_on": {
        "type": "char",
        "label": "Computed on last"
      },
      "time_cycle_manual": {
        "type": "float",
        "label": "time_cycle_manual"
      },
      "time_cycle": {
        "type": "float",
        "label": "Cycles"
      },
      "workorder_count": {
        "type": "integer",
        "label": "# Work Orders"
      },
      "workorder_ids": {
        "type": "one2many",
        "label": "mrp.workorder"
      },
      "possible_bom_product_template_attribute_value_ids": {
        "type": "many2many",
        "label": "bom_id.possible_product_template_attribute_value_ids"
      },
      "bom_product_template_attribute_value_ids": {
        "type": "many2many",
        "label": "bom_product_template_attribute_value_ids"
      },
      "allow_operation_dependencies": {
        "type": "boolean",
        "label": "bom_id.allow_operation_dependencies"
      },
      "blocked_by_operation_ids": {
        "type": "many2many",
        "label": "mrp.routing.workcenter",
        "relation": "mrp_routing_workcenter_dependencies_rel"
      },
      "needed_by_operation_ids": {
        "type": "many2many",
        "label": "mrp.routing.workcenter",
        "relation": "mrp_routing_workcenter_dependencies_rel"
      },
      "cycle_number": {
        "type": "integer",
        "label": "Repetitions"
      },
      "time_total": {
        "type": "float",
        "label": "Total Duration"
      },
      "show_time_total": {
        "type": "boolean",
        "label": "Show Total Duration?"
      },
      "cost_mode": {
        "type": "selection",
        "label": "actual"
      },
      "cost": {
        "type": "float",
        "label": "Cost"
      }
    }
  },
  {
    "_name": "mrp.unbuild",
    "_description": "Unbuild Order",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Reference"
      },
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "product_qty": {
        "type": "float",
        "label": "product_qty"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "product_uom_id"
      },
      "bom_id": {
        "type": "many2one",
        "label": "bom_id"
      },
      "mo_id": {
        "type": "many2one",
        "label": "mo_id"
      },
      "mo_bom_id": {
        "type": "many2one",
        "label": "mrp.bom"
      },
      "lot_producing_ids": {
        "type": "many2many",
        "label": "stock.lot"
      },
      "lot_id": {
        "type": "many2one",
        "label": "lot_id"
      },
      "has_tracking": {
        "type": "selection",
        "label": "product_id.tracking"
      },
      "location_id": {
        "type": "many2one",
        "label": "location_id"
      },
      "location_dest_id": {
        "type": "many2one",
        "label": "location_dest_id"
      },
      "consume_line_ids": {
        "type": "one2many",
        "label": "consume_line_ids"
      },
      "produce_line_ids": {
        "type": "one2many",
        "label": "produce_line_ids"
      },
      "state": {
        "type": "selection",
        "label": "state"
      }
    }
  },
  {
    "_name": "mrp.workcenter",
    "_description": "Work Center",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Work Center"
      },
      "time_efficiency": {
        "type": "float",
        "label": "Time Efficiency"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "code": {
        "type": "char",
        "label": "Code"
      },
      "note": {
        "type": "html",
        "label": "note"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency",
        "required": true
      },
      "costs_hour": {
        "type": "float",
        "label": "Cost per hour"
      },
      "time_start": {
        "type": "float",
        "label": "Setup Time"
      },
      "time_stop": {
        "type": "float",
        "label": "Cleanup Time"
      },
      "routing_line_ids": {
        "type": "one2many",
        "label": "mrp.routing.workcenter"
      },
      "has_routing_lines": {
        "type": "boolean",
        "label": "_compute_has_routing_lines"
      },
      "order_ids": {
        "type": "one2many",
        "label": "mrp.workorder"
      },
      "workorder_count": {
        "type": "integer",
        "label": "# Work Orders"
      },
      "workorder_ready_count": {
        "type": "integer",
        "label": "# To Do Work Orders"
      },
      "workorder_progress_count": {
        "type": "integer",
        "label": "Total Running Orders"
      },
      "workorder_blocked_count": {
        "type": "integer",
        "label": "Total Pending Orders"
      },
      "workorder_late_count": {
        "type": "integer",
        "label": "Total Late Orders"
      },
      "time_ids": {
        "type": "one2many",
        "label": "mrp.workcenter.productivity"
      },
      "working_state": {
        "type": "selection",
        "label": "working_state"
      },
      "blocked_time": {
        "type": "float",
        "label": "blocked_time"
      },
      "productive_time": {
        "type": "float",
        "label": "productive_time"
      },
      "oee": {
        "type": "float",
        "label": "_compute_oee"
      },
      "oee_target": {
        "type": "float",
        "label": "OEE Target"
      },
      "performance": {
        "type": "integer",
        "label": "Performance"
      },
      "workcenter_load": {
        "type": "float",
        "label": "Work Center Load"
      },
      "alternative_workcenter_ids": {
        "type": "many2many",
        "label": "alternative_workcenter_ids"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "mrp.workcenter.tag"
      },
      "capacity_ids": {
        "type": "one2many",
        "label": "mrp.workcenter.capacity"
      },
      "kanban_dashboard_graph": {
        "type": "text",
        "label": "_compute_kanban_dashboard_graph"
      },
      "resource_calendar_id": {
        "type": "many2one",
        "label": "resource_calendar_id"
      }
    }
  },
  {
    "_name": "mrp.workcenter.tag",
    "_description": "Add tag for the workcenter",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Tag Name",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      }
    }
  },
  {
    "_name": "mrp.workcenter.productivity.loss.type",
    "_description": "MRP Workorder productivity losses",
    "_auto": true,
    "_fields": {
      "loss_type": {
        "type": "selection",
        "label": "loss_type"
      }
    }
  },
  {
    "_name": "mrp.workcenter.productivity.loss",
    "_description": "Workcenter Productivity Losses",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Blocking Reason",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "manual": {
        "type": "boolean",
        "label": "Is a Blocking Reason",
        "default": true
      },
      "loss_id": {
        "type": "many2one",
        "label": "mrp.workcenter.productivity.loss.type"
      },
      "loss_type": {
        "type": "selection",
        "label": "Effectiveness Category"
      }
    }
  },
  {
    "_name": "mrp.workcenter.productivity",
    "_description": "Workcenter Productivity Log",
    "_auto": true,
    "_fields": {
      "production_id": {
        "type": "many2one",
        "label": "mrp.production"
      },
      "workcenter_id": {
        "type": "many2one",
        "label": "mrp.workcenter",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "workorder_id": {
        "type": "many2one",
        "label": "mrp.workorder"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "loss_id": {
        "type": "many2one",
        "label": "loss_id"
      },
      "loss_type": {
        "type": "selection",
        "label": "loss_type"
      },
      "description": {
        "type": "text",
        "label": "Description"
      },
      "date_start": {
        "type": "datetime",
        "label": "Start Date",
        "required": true
      },
      "date_end": {
        "type": "datetime",
        "label": "End Date"
      },
      "duration": {
        "type": "float",
        "label": "Duration"
      }
    }
  },
  {
    "_name": "mrp.workcenter.capacity",
    "_description": "Work Center Capacity",
    "_auto": true,
    "_fields": {
      "workcenter_id": {
        "type": "many2one",
        "label": "mrp.workcenter",
        "required": true
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "uom.uom"
      },
      "capacity": {
        "type": "float",
        "label": "Capacity"
      },
      "time_start": {
        "type": "float",
        "label": "Setup Time (minutes)"
      },
      "time_stop": {
        "type": "float",
        "label": "Cleanup Time (minutes)"
      }
    }
  },
  {
    "_name": "mrp.workorder",
    "_description": "Work Order",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "barcode": {
        "type": "char",
        "label": "_compute_barcode"
      },
      "workcenter_id": {
        "type": "many2one",
        "label": "workcenter_id"
      },
      "working_state": {
        "type": "selection",
        "label": "working_state"
      },
      "product_id": {
        "type": "many2one",
        "label": "production_id.product_id"
      },
      "product_tracking": {
        "type": "selection",
        "label": "product_id.tracking"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "production_id.product_uom_id"
      },
      "product_variant_attributes": {
        "type": "many2many",
        "label": "product.template.attribute.value"
      },
      "production_id": {
        "type": "many2one",
        "label": "mrp.production",
        "required": true
      },
      "production_availability": {
        "type": "selection",
        "label": "production_availability"
      },
      "production_state": {
        "type": "selection",
        "label": "production_state"
      },
      "production_bom_id": {
        "type": "many2one",
        "label": "mrp.bom"
      },
      "qty_production": {
        "type": "float",
        "label": "Original Production Quantity"
      },
      "company_id": {
        "type": "many2one",
        "label": "production_id.company_id"
      },
      "qty_producing": {
        "type": "float",
        "label": "qty_producing"
      },
      "qty_remaining": {
        "type": "float",
        "label": "Quantity To Be Produced"
      },
      "qty_produced": {
        "type": "float",
        "label": "qty_produced"
      },
      "qty_ready": {
        "type": "float",
        "label": "Quantity Ready"
      },
      "is_produced": {
        "type": "boolean",
        "label": "Has Been Produced"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "leave_id": {
        "type": "many2one",
        "label": "leave_id"
      },
      "date_start": {
        "type": "datetime",
        "label": "date_start"
      },
      "date_finished": {
        "type": "datetime",
        "label": "date_finished"
      },
      "duration_expected": {
        "type": "float",
        "label": "duration_expected"
      },
      "duration": {
        "type": "float",
        "label": "duration"
      },
      "duration_unit": {
        "type": "float",
        "label": "duration_unit"
      },
      "duration_percent": {
        "type": "integer",
        "label": "duration_percent"
      },
      "progress": {
        "type": "float",
        "label": "Progress Done (%)"
      },
      "operation_id": {
        "type": "many2one",
        "label": "operation_id"
      },
      "move_raw_ids": {
        "type": "one2many",
        "label": "move_raw_ids"
      },
      "move_finished_ids": {
        "type": "one2many",
        "label": "move_finished_ids"
      },
      "move_line_ids": {
        "type": "one2many",
        "label": "move_line_ids"
      },
      "finished_lot_ids": {
        "type": "many2many",
        "label": "finished_lot_ids"
      },
      "time_ids": {
        "type": "one2many",
        "label": "time_ids"
      },
      "is_user_working": {
        "type": "boolean",
        "label": "is_user_working"
      },
      "working_user_ids": {
        "type": "one2many",
        "label": "res.users"
      },
      "last_working_user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "costs_hour": {
        "type": "float",
        "label": "costs_hour"
      },
      "cost_mode": {
        "type": "selection",
        "label": "actual",
        "default": "actual"
      },
      "scrap_ids": {
        "type": "one2many",
        "label": "stock.scrap"
      },
      "scrap_count": {
        "type": "integer",
        "label": "_compute_scrap_move_count"
      },
      "production_date": {
        "type": "datetime",
        "label": "Production Date"
      },
      "json_popover": {
        "type": "char",
        "label": "Popover Data JSON"
      },
      "show_json_popover": {
        "type": "boolean",
        "label": "Show Popover?"
      },
      "consumption": {
        "type": "selection",
        "label": "production_id.consumption"
      },
      "qty_reported_from_previous_wo": {
        "type": "float",
        "label": "Carried Quantity"
      },
      "is_planned": {
        "type": "boolean",
        "label": "production_id.is_planned"
      },
      "allow_workorder_dependencies": {
        "type": "boolean",
        "label": "production_id.allow_workorder_dependencies"
      },
      "blocked_by_workorder_ids": {
        "type": "many2many",
        "label": "mrp.workorder",
        "relation": "mrp_workorder_dependencies_rel"
      },
      "needed_by_workorder_ids": {
        "type": "many2many",
        "label": "mrp.workorder",
        "relation": "mrp_workorder_dependencies_rel"
      }
    }
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "bom_line_ids": {
        "type": "one2many",
        "label": "mrp.bom.line"
      },
      "bom_ids": {
        "type": "one2many",
        "label": "mrp.bom"
      },
      "bom_count": {
        "type": "integer",
        "label": "# Bill of Material"
      },
      "used_in_bom_count": {
        "type": "integer",
        "label": "# of BoM Where is Used"
      },
      "mrp_product_qty": {
        "type": "float",
        "label": "Manufactured"
      },
      "is_kits": {
        "type": "boolean",
        "label": "_compute_is_kits"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "variant_bom_ids": {
        "type": "one2many",
        "label": "mrp.bom"
      },
      "bom_line_ids": {
        "type": "one2many",
        "label": "mrp.bom.line"
      },
      "bom_count": {
        "type": "integer",
        "label": "# Bill of Material"
      },
      "used_in_bom_count": {
        "type": "integer",
        "label": "# BoM Where Used"
      },
      "mrp_product_qty": {
        "type": "float",
        "label": "Manufactured"
      },
      "is_kits": {
        "type": "boolean",
        "label": "_compute_is_kits"
      },
      "product_catalog_product_is_in_bom": {
        "type": "boolean",
        "label": "product_catalog_product_is_in_bom"
      },
      "product_catalog_product_is_in_mo": {
        "type": "boolean",
        "label": "product_catalog_product_is_in_mo"
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "productdocument",
    "_description": "productdocument",
    "_auto": true,
    "_fields": {
      "attached_on_mrp": {
        "type": "selection",
        "label": "attached_on_mrp"
      }
    },
    "_inherit": "product.document"
  },
  {
    "_name": "stockmove",
    "_description": "stockmove",
    "_auto": true,
    "_fields": {
      "created_production_id": {
        "type": "many2one",
        "label": "mrp.production"
      },
      "production_id": {
        "type": "many2one",
        "label": "production_id"
      },
      "raw_material_production_id": {
        "type": "many2one",
        "label": "raw_material_production_id"
      },
      "production_group_id": {
        "type": "many2one",
        "label": "production_group_id"
      },
      "unbuild_id": {
        "type": "many2one",
        "label": "unbuild_id"
      },
      "consume_unbuild_id": {
        "type": "many2one",
        "label": "consume_unbuild_id"
      },
      "allowed_operation_ids": {
        "type": "one2many",
        "label": "allowed_operation_ids"
      },
      "operation_id": {
        "type": "many2one",
        "label": "operation_id"
      },
      "workorder_id": {
        "type": "many2one",
        "label": "workorder_id"
      },
      "bom_line_id": {
        "type": "many2one",
        "label": "mrp.bom.line"
      },
      "byproduct_id": {
        "type": "many2one",
        "label": "byproduct_id"
      },
      "unit_factor": {
        "type": "float",
        "label": "Unit Factor"
      },
      "order_finished_lot_ids": {
        "type": "many2many",
        "label": "stock.lot"
      },
      "should_consume_qty": {
        "type": "float",
        "label": "Quantity To Consume"
      },
      "cost_share": {
        "type": "float",
        "label": "cost_share"
      },
      "product_qty_available": {
        "type": "float",
        "label": "Product On Hand Quantity"
      },
      "product_virtual_available": {
        "type": "float",
        "label": "Product Forecasted Quantity"
      },
      "manual_consumption": {
        "type": "boolean",
        "label": "manual_consumption"
      }
    },
    "_inherit": "stock.move"
  },
  {
    "_name": "stockmoveline",
    "_description": "stockmoveline",
    "_auto": true,
    "_fields": {
      "workorder_id": {
        "type": "many2one",
        "label": "mrp.workorder"
      },
      "production_id": {
        "type": "many2one",
        "label": "mrp.production"
      }
    },
    "_inherit": "stock.move.line"
  },
  {
    "_name": "stockwarehouseorderpoint",
    "_description": "stockwarehouseorderpoint",
    "_auto": true,
    "_fields": {
      "show_bom": {
        "type": "boolean",
        "label": "Show BoM column"
      },
      "bom_id": {
        "type": "many2one",
        "label": "bom_id"
      },
      "bom_id_placeholder": {
        "type": "char",
        "label": "_compute_bom_id_placeholder"
      },
      "effective_bom_id": {
        "type": "many2one",
        "label": "effective_bom_id"
      }
    },
    "_inherit": "stock.warehouse.orderpoint"
  },
  {
    "_name": "stockpickingtype",
    "_description": "stockpickingtype",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "selection",
        "label": "code"
      },
      "count_mo_todo": {
        "type": "integer",
        "label": "Number of Manufacturing Orders to Process"
      },
      "count_mo_waiting": {
        "type": "integer",
        "label": "Number of Manufacturing Orders Waiting"
      },
      "count_mo_late": {
        "type": "integer",
        "label": "Number of Manufacturing Orders Late"
      },
      "count_mo_in_progress": {
        "type": "integer",
        "label": "Number of Manufacturing Orders In Progress"
      },
      "count_mo_to_close": {
        "type": "integer",
        "label": "Number of Manufacturing Orders To Close"
      },
      "use_create_components_lots": {
        "type": "boolean",
        "label": "use_create_components_lots"
      },
      "auto_print_done_production_order": {
        "type": "boolean",
        "label": "auto_print_done_production_order"
      },
      "auto_print_done_mrp_product_labels": {
        "type": "boolean",
        "label": "auto_print_done_mrp_product_labels"
      },
      "mrp_product_label_to_print": {
        "type": "selection",
        "label": "mrp_product_label_to_print"
      },
      "auto_print_done_mrp_lot": {
        "type": "boolean",
        "label": "auto_print_done_mrp_lot"
      },
      "done_mrp_lot_label_to_print": {
        "type": "selection",
        "label": "done_mrp_lot_label_to_print"
      },
      "auto_print_mrp_reception_report": {
        "type": "boolean",
        "label": "auto_print_mrp_reception_report"
      },
      "auto_print_mrp_reception_report_labels": {
        "type": "boolean",
        "label": "auto_print_mrp_reception_report_labels"
      },
      "auto_print_generated_mrp_lot": {
        "type": "boolean",
        "label": "auto_print_generated_mrp_lot"
      },
      "generated_mrp_lot_label_to_print": {
        "type": "selection",
        "label": "generated_mrp_lot_label_to_print"
      }
    },
    "_inherit": "stock.picking.type"
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "has_kits": {
        "type": "boolean",
        "label": "_compute_has_kits"
      },
      "production_count": {
        "type": "integer",
        "label": "production_count"
      },
      "production_ids": {
        "type": "one2many",
        "label": "production_ids"
      },
      "production_group_id": {
        "type": "many2one",
        "label": "production_group_id"
      }
    },
    "_inherit": "stock.picking"
  },
  {
    "_name": "stockreference",
    "_description": "stockreference",
    "_auto": true,
    "_fields": {
      "production_ids": {
        "type": "many2many",
        "label": "production_ids"
      }
    },
    "_inherit": "stock.reference"
  },
  {
    "_name": "stockrule",
    "_description": "stockrule",
    "_auto": true,
    "_fields": {
      "action": {
        "type": "selection",
        "label": "action"
      }
    },
    "_inherit": "stock.rule"
  },
  {
    "_name": "stockscrap",
    "_description": "stockscrap",
    "_auto": true,
    "_fields": {
      "production_id": {
        "type": "many2one",
        "label": "production_id"
      },
      "workorder_id": {
        "type": "many2one",
        "label": "workorder_id"
      },
      "product_is_kit": {
        "type": "boolean",
        "label": "product_id.is_kits"
      },
      "product_template": {
        "type": "many2one",
        "label": "product_id.product_tmpl_id"
      },
      "bom_id": {
        "type": "many2one",
        "label": "bom_id"
      }
    },
    "_inherit": "stock.scrap"
  },
  {
    "_name": "stockwarehouse",
    "_description": "stockwarehouse",
    "_auto": true,
    "_fields": {
      "manufacture_to_resupply": {
        "type": "boolean",
        "label": "manufacture_to_resupply"
      },
      "manufacture_pull_id": {
        "type": "many2one",
        "label": "manufacture_pull_id"
      },
      "manufacture_mto_pull_id": {
        "type": "many2one",
        "label": "manufacture_mto_pull_id"
      },
      "pbm_mto_pull_id": {
        "type": "many2one",
        "label": "pbm_mto_pull_id"
      },
      "sam_rule_id": {
        "type": "many2one",
        "label": "sam_rule_id"
      },
      "manu_type_id": {
        "type": "many2one",
        "label": "manu_type_id"
      },
      "pbm_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      },
      "sam_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      },
      "manufacture_steps": {
        "type": "selection",
        "label": "manufacture_steps"
      },
      "pbm_route_id": {
        "type": "many2one",
        "label": "stock.route"
      },
      "pbm_loc_id": {
        "type": "many2one",
        "label": "stock.location"
      },
      "sam_loc_id": {
        "type": "many2one",
        "label": "stock.location"
      }
    },
    "_inherit": "stock.warehouse"
  }
];
