// Odoo 模块: stock
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "barcoderule",
    "_description": "barcoderule",
    "_auto": true,
    "_fields": {
      "type": {
        "type": "selection",
        "label": "type"
      }
    },
    "_inherit": "barcode.rule"
  },
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "stock_quant_ids": {
        "type": "one2many",
        "label": "stock.quant"
      },
      "stock_move_ids": {
        "type": "one2many",
        "label": "stock.move"
      },
      "qty_available": {
        "type": "float",
        "label": "qty_available"
      },
      "virtual_available": {
        "type": "float",
        "label": "virtual_available"
      },
      "free_qty": {
        "type": "float",
        "label": "free_qty"
      },
      "incoming_qty": {
        "type": "float",
        "label": "incoming_qty"
      },
      "outgoing_qty": {
        "type": "float",
        "label": "outgoing_qty"
      },
      "orderpoint_ids": {
        "type": "one2many",
        "label": "stock.warehouse.orderpoint"
      },
      "nbr_moves_in": {
        "type": "integer",
        "label": "_compute_nbr_moves"
      },
      "nbr_moves_out": {
        "type": "integer",
        "label": "_compute_nbr_moves"
      },
      "nbr_reordering_rules": {
        "type": "integer",
        "label": "Reordering Rules"
      },
      "reordering_min_qty": {
        "type": "float",
        "label": "reordering_min_qty"
      },
      "reordering_max_qty": {
        "type": "float",
        "label": "reordering_max_qty"
      },
      "putaway_rule_ids": {
        "type": "one2many",
        "label": "stock.putaway.rule"
      },
      "storage_category_capacity_ids": {
        "type": "one2many",
        "label": "stock.storage.category.capacity"
      },
      "show_on_hand_qty_status_button": {
        "type": "boolean",
        "label": "_compute_show_qty_status_button"
      },
      "show_forecasted_qty_status_button": {
        "type": "boolean",
        "label": "_compute_show_qty_status_button"
      },
      "show_qty_update_button": {
        "type": "boolean",
        "label": "_compute_show_qty_update_button"
      },
      "valid_ean": {
        "type": "boolean",
        "label": "Barcode is valid EAN"
      },
      "lot_properties_definition": {
        "type": "char",
        "label": "Lot Properties"
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "is_storable": {
        "type": "boolean",
        "label": "is_storable"
      },
      "responsible_id": {
        "type": "many2one",
        "label": "responsible_id"
      },
      "property_stock_production": {
        "type": "many2one",
        "label": "property_stock_production"
      },
      "property_stock_inventory": {
        "type": "many2one",
        "label": "property_stock_inventory"
      },
      "sale_delay": {
        "type": "integer",
        "label": "sale_delay"
      },
      "tracking": {
        "type": "selection",
        "label": "tracking"
      },
      "lot_sequence_id": {
        "type": "many2one",
        "label": "lot_sequence_id"
      },
      "serial_prefix_format": {
        "type": "char",
        "label": "serial_prefix_format"
      },
      "next_serial": {
        "type": "char",
        "label": "_compute_next_serial"
      },
      "description_picking": {
        "type": "text",
        "label": "Description on Picking"
      },
      "description_pickingout": {
        "type": "text",
        "label": "Description on Delivery Orders"
      },
      "description_pickingin": {
        "type": "text",
        "label": "Description on Receptions"
      },
      "qty_available": {
        "type": "float",
        "label": "qty_available"
      },
      "virtual_available": {
        "type": "float",
        "label": "virtual_available"
      },
      "incoming_qty": {
        "type": "float",
        "label": "incoming_qty"
      },
      "outgoing_qty": {
        "type": "float",
        "label": "outgoing_qty"
      },
      "location_id": {
        "type": "many2one",
        "label": "stock.location"
      },
      "warehouse_id": {
        "type": "many2one",
        "label": "stock.warehouse"
      },
      "has_available_route_ids": {
        "type": "boolean",
        "label": "has_available_route_ids"
      },
      "route_ids": {
        "type": "many2many",
        "label": "route_ids"
      },
      "nbr_moves_in": {
        "type": "integer",
        "label": "_compute_nbr_moves"
      },
      "nbr_moves_out": {
        "type": "integer",
        "label": "_compute_nbr_moves"
      },
      "nbr_reordering_rules": {
        "type": "integer",
        "label": "Reordering Rules"
      },
      "reordering_min_qty": {
        "type": "float",
        "label": "reordering_min_qty"
      },
      "reordering_max_qty": {
        "type": "float",
        "label": "reordering_max_qty"
      },
      "route_from_categ_ids": {
        "type": "many2many",
        "label": "route_from_categ_ids"
      },
      "show_on_hand_qty_status_button": {
        "type": "boolean",
        "label": "_compute_show_qty_status_button"
      },
      "show_forecasted_qty_status_button": {
        "type": "boolean",
        "label": "_compute_show_qty_status_button"
      },
      "show_qty_update_button": {
        "type": "boolean",
        "label": "_compute_show_qty_update_button"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "productcategory",
    "_description": "productcategory",
    "_auto": true,
    "_fields": {
      "route_ids": {
        "type": "many2many",
        "label": "route_ids"
      },
      "removal_strategy_id": {
        "type": "many2one",
        "label": "removal_strategy_id"
      },
      "parent_route_ids": {
        "type": "many2many",
        "label": "parent_route_ids"
      },
      "total_route_ids": {
        "type": "many2many",
        "label": "total_route_ids"
      },
      "putaway_rule_ids": {
        "type": "one2many",
        "label": "stock.putaway.rule"
      },
      "packaging_reserve_method": {
        "type": "selection",
        "label": "packaging_reserve_method"
      },
      "filter_for_stock_putaway_rule": {
        "type": "boolean",
        "label": "stock.putaway.rule"
      }
    },
    "_inherit": "product.category"
  },
  {
    "_name": "uomuom",
    "_description": "uomuom",
    "_auto": true,
    "_fields": {
      "package_type_id": {
        "type": "many2one",
        "label": "stock.package.type"
      },
      "route_ids": {
        "type": "many2many",
        "label": "package_type_id.route_ids"
      }
    },
    "_inherit": "uom.uom"
  },
  {
    "_name": "product.removal",
    "_description": "Removal Strategy",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "method": {
        "type": "char",
        "label": "Method",
        "required": true
      }
    }
  },
  {
    "_name": "stock.putaway.rule",
    "_description": "Putaway Rule",
    "_auto": true,
    "_fields": {
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "category_id": {
        "type": "many2one",
        "label": "product.category"
      },
      "location_in_id": {
        "type": "many2one",
        "label": "location_in_id"
      },
      "location_out_id": {
        "type": "many2one",
        "label": "location_out_id"
      },
      "sequence": {
        "type": "integer",
        "label": "Priority"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "package_type_ids": {
        "type": "many2many",
        "label": "stock.package.type"
      },
      "storage_category_id": {
        "type": "many2one",
        "label": "storage_category_id"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "sublocation": {
        "type": "selection",
        "label": "sublocation"
      }
    }
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "internal_transit_location_id": {
        "type": "many2one",
        "label": "internal_transit_location_id"
      },
      "stock_move_email_validation": {
        "type": "boolean",
        "label": "Email Confirmation picking",
        "default": false
      },
      "stock_mail_confirmation_template_id": {
        "type": "many2one",
        "label": "mail.template"
      },
      "annual_inventory_month": {
        "type": "selection",
        "label": "annual_inventory_month"
      },
      "annual_inventory_day": {
        "type": "integer",
        "label": "annual_inventory_day"
      },
      "horizon_days": {
        "type": "float",
        "label": "Replenishment Horizon",
        "required": true
      },
      "stock_text_confirmation": {
        "type": "boolean",
        "label": "Stock Text Confirmation"
      },
      "stock_confirmation_type": {
        "type": "selection",
        "label": "sms",
        "default": "sms"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "property_stock_customer": {
        "type": "many2one",
        "label": "property_stock_customer"
      },
      "property_stock_supplier": {
        "type": "many2one",
        "label": "property_stock_supplier"
      },
      "picking_warn_msg": {
        "type": "text",
        "label": "Message for Stock Picking"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "stock.location",
    "_description": "Inventory Locations",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Location Name",
        "required": true
      },
      "complete_name": {
        "type": "char",
        "label": "Full Location Name"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "usage": {
        "type": "selection",
        "label": "usage"
      },
      "location_id": {
        "type": "many2one",
        "label": "location_id"
      },
      "child_ids": {
        "type": "one2many",
        "label": "stock.location"
      },
      "child_internal_location_ids": {
        "type": "many2many",
        "label": "child_internal_location_ids"
      },
      "parent_path": {
        "type": "char",
        "label": "parent_path"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "replenish_location": {
        "type": "boolean",
        "label": "Replenishments"
      },
      "removal_strategy_id": {
        "type": "many2one",
        "label": "removal_strategy_id"
      },
      "putaway_rule_ids": {
        "type": "one2many",
        "label": "stock.putaway.rule"
      },
      "barcode": {
        "type": "char",
        "label": "Barcode"
      },
      "quant_ids": {
        "type": "one2many",
        "label": "stock.quant"
      },
      "cyclic_inventory_frequency": {
        "type": "integer",
        "label": "Inventory Frequency"
      },
      "last_inventory_date": {
        "type": "date",
        "label": "Last Inventory"
      },
      "next_inventory_date": {
        "type": "date",
        "label": "Next Expected"
      },
      "warehouse_view_ids": {
        "type": "one2many",
        "label": "stock.warehouse"
      },
      "warehouse_id": {
        "type": "many2one",
        "label": "stock.warehouse"
      },
      "storage_category_id": {
        "type": "many2one",
        "label": "stock.storage.category"
      },
      "outgoing_move_line_ids": {
        "type": "one2many",
        "label": "stock.move.line"
      },
      "incoming_move_line_ids": {
        "type": "one2many",
        "label": "stock.move.line"
      },
      "net_weight": {
        "type": "float",
        "label": "Net Weight"
      },
      "forecast_weight": {
        "type": "float",
        "label": "Forecasted Weight"
      },
      "is_empty": {
        "type": "boolean",
        "label": "Is Empty"
      }
    }
  },
  {
    "_name": "stock.route",
    "_description": "Inventory Routes",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Route",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "rule_ids": {
        "type": "one2many",
        "label": "stock.rule"
      },
      "product_selectable": {
        "type": "boolean",
        "label": "Applicable on Product",
        "default": true
      },
      "product_categ_selectable": {
        "type": "boolean",
        "label": "Applicable on Product Category"
      },
      "warehouse_selectable": {
        "type": "boolean",
        "label": "Applicable on Warehouse"
      },
      "package_type_selectable": {
        "type": "boolean",
        "label": "Applicable on Package Type"
      },
      "supplied_wh_id": {
        "type": "many2one",
        "label": "stock.warehouse"
      },
      "supplier_wh_id": {
        "type": "many2one",
        "label": "stock.warehouse"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "product_ids": {
        "type": "many2many",
        "label": "product_ids"
      },
      "categ_ids": {
        "type": "many2many",
        "label": "product.category"
      },
      "warehouse_domain_ids": {
        "type": "one2many",
        "label": "stock.warehouse"
      },
      "warehouse_ids": {
        "type": "many2many",
        "label": "warehouse_ids"
      }
    }
  },
  {
    "_name": "stock.lot",
    "_description": "Lot/Serial",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Lot/Serial Number",
        "required": true
      },
      "ref": {
        "type": "char",
        "label": "Internal Reference"
      },
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "product_uom_id"
      },
      "quant_ids": {
        "type": "one2many",
        "label": "stock.quant"
      },
      "product_qty": {
        "type": "float",
        "label": "On Hand Quantity"
      },
      "note": {
        "type": "html",
        "label": "Description"
      },
      "display_complete": {
        "type": "boolean",
        "label": "_compute_display_complete"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "delivery_ids": {
        "type": "many2many",
        "label": "stock.picking"
      },
      "delivery_count": {
        "type": "integer",
        "label": "Delivery order count"
      },
      "partner_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "lot_properties": {
        "type": "char",
        "label": "Properties"
      },
      "location_id": {
        "type": "many2one",
        "label": "location_id"
      }
    }
  },
  {
    "_name": "stock.move",
    "_description": "Stock Move",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "priority": {
        "type": "selection",
        "label": "priority"
      },
      "date": {
        "type": "datetime",
        "label": "date"
      },
      "date_deadline": {
        "type": "datetime",
        "label": "date_deadline"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "product_category_id": {
        "type": "many2one",
        "label": "product_category_id"
      },
      "never_product_template_attribute_value_ids": {
        "type": "many2many",
        "label": "never_product_template_attribute_value_ids"
      },
      "description_picking": {
        "type": "text",
        "label": "Description Of Picking"
      },
      "description_picking_manual": {
        "type": "text",
        "label": "description_picking_manual"
      },
      "product_qty": {
        "type": "float",
        "label": "product_qty"
      },
      "product_uom_qty": {
        "type": "float",
        "label": "product_uom_qty"
      },
      "allowed_uom_ids": {
        "type": "many2many",
        "label": "uom.uom"
      },
      "product_uom": {
        "type": "many2one",
        "label": "product_uom"
      },
      "product_tmpl_id": {
        "type": "many2one",
        "label": "product_tmpl_id"
      },
      "location_id": {
        "type": "many2one",
        "label": "location_id"
      },
      "location_dest_id": {
        "type": "many2one",
        "label": "location_dest_id"
      },
      "location_final_id": {
        "type": "many2one",
        "label": "location_final_id"
      },
      "location_usage": {
        "type": "selection",
        "label": "Source Location Type"
      },
      "location_dest_usage": {
        "type": "selection",
        "label": "Destination Location Type"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "move_dest_ids": {
        "type": "many2many",
        "label": "move_dest_ids"
      },
      "move_orig_ids": {
        "type": "many2many",
        "label": "move_orig_ids"
      },
      "picking_id": {
        "type": "many2one",
        "label": "stock.picking"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "picked": {
        "type": "boolean",
        "label": "picked"
      },
      "price_unit": {
        "type": "float",
        "label": "Unit Price"
      },
      "origin": {
        "type": "char",
        "label": "Source Document"
      },
      "procure_method": {
        "type": "selection",
        "label": "procure_method"
      },
      "scrap_id": {
        "type": "many2one",
        "label": "stock.scrap"
      },
      "procurement_values": {
        "type": "char",
        "label": "Dummy field to store procurement values to propagate them to later steps"
      },
      "reference_ids": {
        "type": "many2many",
        "label": "reference_ids"
      },
      "rule_id": {
        "type": "many2one",
        "label": "rule_id"
      },
      "propagate_cancel": {
        "type": "boolean",
        "label": "propagate_cancel"
      },
      "delay_alert_date": {
        "type": "datetime",
        "label": "Delay Alert Date"
      },
      "picking_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      },
      "is_inventory": {
        "type": "boolean",
        "label": "Inventory"
      },
      "inventory_name": {
        "type": "char",
        "label": "inventory_name"
      },
      "move_line_ids": {
        "type": "one2many",
        "label": "stock.move.line"
      },
      "package_ids": {
        "type": "one2many",
        "label": "stock.package"
      },
      "origin_returned_move_id": {
        "type": "many2one",
        "label": "origin_returned_move_id"
      },
      "returned_move_ids": {
        "type": "one2many",
        "label": "stock.move"
      },
      "availability": {
        "type": "float",
        "label": "availability"
      },
      "restrict_partner_id": {
        "type": "many2one",
        "label": "restrict_partner_id"
      },
      "route_ids": {
        "type": "many2many",
        "label": "route_ids"
      },
      "warehouse_id": {
        "type": "many2one",
        "label": "stock.warehouse"
      },
      "has_tracking": {
        "type": "selection",
        "label": "product_id.tracking"
      },
      "has_lines_without_result_package": {
        "type": "boolean",
        "label": "_compute_has_lines_without_result_package"
      },
      "quantity": {
        "type": "float",
        "label": "quantity"
      },
      "show_operations": {
        "type": "boolean",
        "label": "picking_id.picking_type_id.show_operations"
      },
      "picking_code": {
        "type": "selection",
        "label": "picking_id.picking_type_id.code"
      },
      "show_details_visible": {
        "type": "boolean",
        "label": "Details Visible"
      },
      "is_storable": {
        "type": "boolean",
        "label": "product_id.is_storable"
      },
      "additional": {
        "type": "boolean",
        "label": "Whether the move was added after the picking",
        "default": false
      },
      "is_locked": {
        "type": "boolean",
        "label": "_compute_is_locked"
      },
      "is_initial_demand_editable": {
        "type": "boolean",
        "label": "Is initial demand editable"
      },
      "is_date_editable": {
        "type": "boolean",
        "label": "Is Date Editable"
      },
      "is_quantity_done_editable": {
        "type": "boolean",
        "label": "Is quantity done editable"
      },
      "reference": {
        "type": "char",
        "label": "_compute_reference"
      },
      "move_lines_count": {
        "type": "integer",
        "label": "_compute_move_lines_count"
      },
      "display_assign_serial": {
        "type": "boolean",
        "label": "_compute_display_assign_serial"
      },
      "display_import_lot": {
        "type": "boolean",
        "label": "_compute_display_assign_serial"
      },
      "next_serial": {
        "type": "char",
        "label": "First SN/Lot"
      },
      "next_serial_count": {
        "type": "integer",
        "label": "Number of SN/Lots"
      },
      "orderpoint_id": {
        "type": "many2one",
        "label": "stock.warehouse.orderpoint"
      },
      "forecast_availability": {
        "type": "float",
        "label": "Forecast Availability"
      },
      "forecast_expected_date": {
        "type": "datetime",
        "label": "Forecasted Expected date"
      },
      "lot_ids": {
        "type": "many2many",
        "label": "stock.lot"
      },
      "reservation_date": {
        "type": "date",
        "label": "Date to Reserve"
      },
      "packaging_uom_id": {
        "type": "many2one",
        "label": "uom.uom"
      },
      "packaging_uom_qty": {
        "type": "float",
        "label": "Packaging Quantity"
      },
      "show_quant": {
        "type": "boolean",
        "label": "Show Quant"
      },
      "show_lots_m2o": {
        "type": "boolean",
        "label": "Show lot_id"
      },
      "show_lots_text": {
        "type": "boolean",
        "label": "Show lot_name"
      }
    }
  },
  {
    "_name": "stock.move.line",
    "_description": "Product Moves (Stock Move Line)",
    "_auto": true,
    "_fields": {
      "picking_id": {
        "type": "many2one",
        "label": "picking_id"
      },
      "move_id": {
        "type": "many2one",
        "label": "move_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product"
      },
      "allowed_uom_ids": {
        "type": "many2many",
        "label": "uom.uom"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "product_uom_id"
      },
      "product_category_name": {
        "type": "char",
        "label": "product_id.categ_id.complete_name"
      },
      "quantity": {
        "type": "float",
        "label": "quantity"
      },
      "quantity_product_uom": {
        "type": "float",
        "label": "quantity_product_uom"
      },
      "picked": {
        "type": "boolean",
        "label": "Picked"
      },
      "package_id": {
        "type": "many2one",
        "label": "package_id"
      },
      "lot_id": {
        "type": "many2one",
        "label": "lot_id"
      },
      "lot_name": {
        "type": "char",
        "label": "Lot/Serial Number Name"
      },
      "result_package_id": {
        "type": "many2one",
        "label": "result_package_id"
      },
      "result_package_dest_name": {
        "type": "char",
        "label": "Destination Package Name"
      },
      "package_history_id": {
        "type": "many2one",
        "label": "stock.package.history"
      },
      "is_entire_pack": {
        "type": "boolean",
        "label": "Is added through entire package"
      },
      "date": {
        "type": "datetime",
        "label": "date"
      },
      "scheduled_date": {
        "type": "datetime",
        "label": "Scheduled Date"
      },
      "owner_id": {
        "type": "many2one",
        "label": "owner_id"
      },
      "location_id": {
        "type": "many2one",
        "label": "location_id"
      },
      "location_dest_id": {
        "type": "many2one",
        "label": "stock.location",
        "required": true
      },
      "location_usage": {
        "type": "selection",
        "label": "Source Location Type"
      },
      "location_dest_usage": {
        "type": "selection",
        "label": "Destination Location Type"
      },
      "lots_visible": {
        "type": "boolean",
        "label": "_compute_lots_visible"
      },
      "picking_partner_id": {
        "type": "many2one",
        "label": "picking_id.partner_id"
      },
      "move_partner_id": {
        "type": "many2one",
        "label": "move_id.partner_id"
      },
      "picking_code": {
        "type": "selection",
        "label": "picking_type_id.code"
      },
      "picking_type_id": {
        "type": "many2one",
        "label": "picking_type_id"
      },
      "picking_type_use_create_lots": {
        "type": "boolean",
        "label": "picking_type_id.use_create_lots"
      },
      "picking_type_use_existing_lots": {
        "type": "boolean",
        "label": "picking_type_id.use_existing_lots"
      },
      "state": {
        "type": "selection",
        "label": "move_id.state"
      },
      "scrap_id": {
        "type": "many2one",
        "label": "move_id.scrap_id"
      },
      "is_inventory": {
        "type": "boolean",
        "label": "move_id.is_inventory"
      },
      "is_locked": {
        "type": "boolean",
        "label": "move_id.is_locked"
      },
      "consume_line_ids": {
        "type": "many2many",
        "label": "stock.move.line"
      },
      "produce_line_ids": {
        "type": "many2many",
        "label": "stock.move.line"
      },
      "reference": {
        "type": "char",
        "label": "move_id.reference"
      },
      "tracking": {
        "type": "selection",
        "label": "product_id.tracking"
      },
      "origin": {
        "type": "char",
        "label": "move_id.origin"
      },
      "description_picking": {
        "type": "text",
        "label": "move_id.description_picking"
      },
      "quant_id": {
        "type": "many2one",
        "label": "stock.quant"
      },
      "picking_location_id": {
        "type": "many2one",
        "label": "picking_id.location_id"
      },
      "picking_location_dest_id": {
        "type": "many2one",
        "label": "picking_id.location_dest_id"
      }
    }
  },
  {
    "_name": "stock.warehouse.orderpoint",
    "_description": "Minimum Inventory Rule",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "trigger": {
        "type": "selection",
        "label": "trigger"
      },
      "active": {
        "type": "boolean",
        "label": "active"
      },
      "snoozed_until": {
        "type": "date",
        "label": "Snoozed"
      },
      "warehouse_id": {
        "type": "many2one",
        "label": "warehouse_id"
      },
      "location_id": {
        "type": "many2one",
        "label": "location_id"
      },
      "product_tmpl_id": {
        "type": "many2one",
        "label": "product.template"
      },
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "product_category_id": {
        "type": "many2one",
        "label": "product.category"
      },
      "product_uom": {
        "type": "many2one",
        "label": "product_uom"
      },
      "product_uom_name": {
        "type": "char",
        "label": "Product unit of measure label"
      },
      "product_min_qty": {
        "type": "float",
        "label": "product_min_qty"
      },
      "product_max_qty": {
        "type": "float",
        "label": "product_max_qty"
      },
      "allowed_replenishment_uom_ids": {
        "type": "many2many",
        "label": "uom.uom"
      },
      "replenishment_uom_id": {
        "type": "many2one",
        "label": "replenishment_uom_id"
      },
      "replenishment_uom_id_placeholder": {
        "type": "char",
        "label": "_compute_replenishment_uom_id_placeholder"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "allowed_location_ids": {
        "type": "one2many",
        "label": "stock.location"
      },
      "rule_ids": {
        "type": "many2many",
        "label": "stock.rule"
      },
      "lead_horizon_date": {
        "type": "date",
        "label": "_compute_lead_days"
      },
      "lead_days": {
        "type": "float",
        "label": "_compute_lead_days"
      },
      "route_id": {
        "type": "many2one",
        "label": "route_id"
      },
      "route_id_placeholder": {
        "type": "char",
        "label": "_compute_route_id_placeholder"
      },
      "effective_route_id": {
        "type": "many2one",
        "label": "effective_route_id"
      },
      "qty_on_hand": {
        "type": "float",
        "label": "On Hand"
      },
      "qty_forecast": {
        "type": "float",
        "label": "Forecast"
      },
      "qty_to_order": {
        "type": "float",
        "label": "To Order"
      },
      "qty_to_order_computed": {
        "type": "float",
        "label": "To Order Computed"
      },
      "qty_to_order_manual": {
        "type": "float",
        "label": "To Order Manual"
      },
      "days_to_order": {
        "type": "float",
        "label": "_compute_days_to_order"
      },
      "unwanted_replenish": {
        "type": "boolean",
        "label": "Unwanted Replenish"
      },
      "show_supply_warning": {
        "type": "boolean",
        "label": "_compute_show_supply_warning"
      },
      "deadline_date": {
        "type": "date",
        "label": "Deadline"
      }
    }
  },
  {
    "_name": "stock.package",
    "_description": "Package",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Package Reference",
        "required": true
      },
      "complete_name": {
        "type": "char",
        "label": "Full Package Name"
      },
      "dest_complete_name": {
        "type": "char",
        "label": "Package Name At Destination"
      },
      "quant_ids": {
        "type": "one2many",
        "label": "stock.quant"
      },
      "contained_quant_ids": {
        "type": "one2many",
        "label": "stock.quant"
      },
      "content_description": {
        "type": "char",
        "label": "Contents"
      },
      "package_type_id": {
        "type": "many2one",
        "label": "package_type_id"
      },
      "location_id": {
        "type": "many2one",
        "label": "location_id"
      },
      "location_dest_id": {
        "type": "many2one",
        "label": "stock.location"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "owner_id": {
        "type": "many2one",
        "label": "owner_id"
      },
      "parent_package_id": {
        "type": "many2one",
        "label": "stock.package"
      },
      "child_package_ids": {
        "type": "one2many",
        "label": "stock.package"
      },
      "all_children_package_ids": {
        "type": "one2many",
        "label": "stock.package"
      },
      "package_dest_id": {
        "type": "many2one",
        "label": "stock.package"
      },
      "outermost_package_id": {
        "type": "many2one",
        "label": "stock.package"
      },
      "child_package_dest_ids": {
        "type": "one2many",
        "label": "stock.package"
      },
      "move_line_ids": {
        "type": "one2many",
        "label": "stock.move.line"
      },
      "picking_ids": {
        "type": "many2many",
        "label": "stock.picking"
      },
      "shipping_weight": {
        "type": "float",
        "label": "Shipping Weight"
      },
      "valid_sscc": {
        "type": "boolean",
        "label": "Package name is valid SSCC"
      },
      "pack_date": {
        "type": "date",
        "label": "Pack Date"
      },
      "parent_path": {
        "type": "char",
        "label": "parent_path"
      },
      "json_popover": {
        "type": "char",
        "label": "JSON data for popover widget"
      }
    }
  },
  {
    "_name": "stock.package.history",
    "_description": "Stock Package History",
    "_auto": true,
    "_fields": {
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "location_id": {
        "type": "many2one",
        "label": "stock.location"
      },
      "location_dest_id": {
        "type": "many2one",
        "label": "stock.location"
      },
      "move_line_ids": {
        "type": "one2many",
        "label": "stock.move.line",
        "required": true
      },
      "package_id": {
        "type": "many2one",
        "label": "stock.package",
        "required": true
      },
      "package_name": {
        "type": "char",
        "label": "Package Name",
        "required": true
      },
      "package_type_id": {
        "type": "many2one",
        "label": "stock.package.type"
      },
      "parent_orig_id": {
        "type": "many2one",
        "label": "stock.package"
      },
      "parent_orig_name": {
        "type": "char",
        "label": "Origin Container Name"
      },
      "parent_dest_id": {
        "type": "many2one",
        "label": "stock.package"
      },
      "parent_dest_name": {
        "type": "char",
        "label": "Destination Container Name"
      },
      "outermost_dest_id": {
        "type": "many2one",
        "label": "stock.package"
      },
      "picking_ids": {
        "type": "many2many",
        "label": "stock.picking"
      }
    }
  },
  {
    "_name": "stock.package.type",
    "_description": "Stock package type",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Package Type",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "sequence_id": {
        "type": "many2one",
        "label": "ir.sequence"
      },
      "sequence_code": {
        "type": "char",
        "label": "Sequence Prefix"
      },
      "height": {
        "type": "float",
        "label": "Height"
      },
      "width": {
        "type": "float",
        "label": "Width"
      },
      "packaging_length": {
        "type": "float",
        "label": "Length"
      },
      "base_weight": {
        "type": "float",
        "label": "Weight"
      },
      "max_weight": {
        "type": "float",
        "label": "Max Weight"
      },
      "barcode": {
        "type": "char",
        "label": "Barcode"
      },
      "weight_uom_name": {
        "type": "char",
        "label": "Weight unit of measure label"
      },
      "length_uom_name": {
        "type": "char",
        "label": "Length unit of measure label"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "package_use": {
        "type": "selection",
        "label": "package_use"
      },
      "has_quants": {
        "type": "boolean",
        "label": "Has Contents"
      },
      "storage_category_capacity_ids": {
        "type": "one2many",
        "label": "stock.storage.category.capacity"
      },
      "route_ids": {
        "type": "many2many",
        "label": "stock.route"
      }
    }
  },
  {
    "_name": "stock.picking.type",
    "_description": "Picking Type",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Operation Type",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "sequence_id": {
        "type": "many2one",
        "label": "sequence_id"
      },
      "sequence_code": {
        "type": "char",
        "label": "Sequence Prefix",
        "required": true
      },
      "default_location_src_id": {
        "type": "many2one",
        "label": "default_location_src_id"
      },
      "default_location_dest_id": {
        "type": "many2one",
        "label": "default_location_dest_id"
      },
      "code": {
        "type": "selection",
        "label": "incoming",
        "required": true,
        "default": "incoming"
      },
      "return_picking_type_id": {
        "type": "many2one",
        "label": "return_picking_type_id"
      },
      "show_entire_packs": {
        "type": "boolean",
        "label": "Move Entire Packages",
        "default": false
      },
      "set_package_type": {
        "type": "boolean",
        "label": "Set Package Type",
        "default": false
      },
      "warehouse_id": {
        "type": "many2one",
        "label": "warehouse_id"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "use_create_lots": {
        "type": "boolean",
        "label": "use_create_lots"
      },
      "use_existing_lots": {
        "type": "boolean",
        "label": "use_existing_lots"
      },
      "print_label": {
        "type": "boolean",
        "label": "print_label"
      },
      "show_operations": {
        "type": "boolean",
        "label": "show_operations"
      },
      "reservation_method": {
        "type": "selection",
        "label": "reservation_method"
      },
      "reservation_days_before": {
        "type": "integer",
        "label": "Days"
      },
      "reservation_days_before_priority": {
        "type": "integer",
        "label": "Days when starred"
      },
      "auto_show_reception_report": {
        "type": "boolean",
        "label": "auto_show_reception_report"
      },
      "auto_print_delivery_slip": {
        "type": "boolean",
        "label": "auto_print_delivery_slip"
      },
      "auto_print_return_slip": {
        "type": "boolean",
        "label": "auto_print_return_slip"
      },
      "auto_print_product_labels": {
        "type": "boolean",
        "label": "auto_print_product_labels"
      },
      "product_label_format": {
        "type": "selection",
        "label": "product_label_format"
      },
      "auto_print_lot_labels": {
        "type": "boolean",
        "label": "auto_print_lot_labels"
      },
      "lot_label_format": {
        "type": "selection",
        "label": "lot_label_format"
      },
      "auto_print_reception_report": {
        "type": "boolean",
        "label": "auto_print_reception_report"
      },
      "auto_print_reception_report_labels": {
        "type": "boolean",
        "label": "auto_print_reception_report_labels"
      },
      "auto_print_packages": {
        "type": "boolean",
        "label": "auto_print_packages"
      },
      "auto_print_package_label": {
        "type": "boolean",
        "label": "auto_print_package_label"
      },
      "package_label_to_print": {
        "type": "selection",
        "label": "package_label_to_print"
      },
      "count_picking_draft": {
        "type": "integer",
        "label": "_compute_picking_count"
      },
      "count_picking_ready": {
        "type": "integer",
        "label": "_compute_picking_count"
      },
      "count_picking": {
        "type": "integer",
        "label": "_compute_picking_count"
      },
      "count_picking_waiting": {
        "type": "integer",
        "label": "_compute_picking_count"
      },
      "count_picking_late": {
        "type": "integer",
        "label": "_compute_picking_count"
      },
      "count_picking_backorders": {
        "type": "integer",
        "label": "_compute_picking_count"
      },
      "count_move_ready": {
        "type": "integer",
        "label": "_compute_move_count"
      },
      "hide_reservation_method": {
        "type": "boolean",
        "label": "_compute_hide_reservation_method"
      },
      "barcode": {
        "type": "char",
        "label": "Barcode"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "create_backorder": {
        "type": "selection",
        "label": "create_backorder"
      },
      "show_picking_type": {
        "type": "boolean",
        "label": "_compute_show_picking_type"
      },
      "picking_properties_definition": {
        "type": "char",
        "label": "Picking Properties"
      },
      "favorite_user_ids": {
        "type": "many2many",
        "label": "favorite_user_ids"
      },
      "is_favorite": {
        "type": "boolean",
        "label": "is_favorite"
      },
      "kanban_dashboard_graph": {
        "type": "text",
        "label": "_compute_kanban_dashboard_graph"
      },
      "move_type": {
        "type": "selection",
        "label": "move_type"
      }
    }
  },
  {
    "_name": "stock.picking",
    "_description": "Transfer",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "origin": {
        "type": "char",
        "label": "origin"
      },
      "note": {
        "type": "html",
        "label": "Notes"
      },
      "backorder_id": {
        "type": "many2one",
        "label": "backorder_id"
      },
      "backorder_ids": {
        "type": "one2many",
        "label": "stock.picking"
      },
      "return_id": {
        "type": "many2one",
        "label": "stock.picking"
      },
      "return_ids": {
        "type": "one2many",
        "label": "stock.picking"
      },
      "return_count": {
        "type": "integer",
        "label": "# Returns"
      },
      "move_type": {
        "type": "selection",
        "label": "move_type"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "reference_ids": {
        "type": "many2many",
        "label": "reference_ids"
      },
      "priority": {
        "type": "selection",
        "label": "priority"
      },
      "scheduled_date": {
        "type": "datetime",
        "label": "scheduled_date"
      },
      "date_deadline": {
        "type": "datetime",
        "label": "date_deadline"
      },
      "has_deadline_issue": {
        "type": "boolean",
        "label": "has_deadline_issue"
      },
      "date_done": {
        "type": "datetime",
        "label": "Date of Transfer"
      },
      "delay_alert_date": {
        "type": "datetime",
        "label": "Delay Alert Date"
      },
      "json_popover": {
        "type": "char",
        "label": "JSON data for the popover widget"
      },
      "location_id": {
        "type": "many2one",
        "label": "location_id"
      },
      "location_dest_id": {
        "type": "many2one",
        "label": "location_dest_id"
      },
      "move_ids": {
        "type": "one2many",
        "label": "stock.move"
      },
      "has_scrap_move": {
        "type": "boolean",
        "label": "has_scrap_move"
      },
      "picking_type_id": {
        "type": "many2one",
        "label": "picking_type_id"
      },
      "warehouse_address_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "picking_type_code": {
        "type": "selection",
        "label": "picking_type_code"
      },
      "picking_type_entire_packs": {
        "type": "boolean",
        "label": "picking_type_id.show_entire_packs"
      },
      "use_create_lots": {
        "type": "boolean",
        "label": "picking_type_id.use_create_lots"
      },
      "use_existing_lots": {
        "type": "boolean",
        "label": "picking_type_id.use_existing_lots"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "move_line_ids": {
        "type": "one2many",
        "label": "stock.move.line"
      },
      "packages_count": {
        "type": "integer",
        "label": "Packages Count"
      },
      "package_history_ids": {
        "type": "many2many",
        "label": "stock.package.history"
      },
      "show_check_availability": {
        "type": "boolean",
        "label": "show_check_availability"
      },
      "show_allocation": {
        "type": "boolean",
        "label": "show_allocation"
      },
      "owner_id": {
        "type": "many2one",
        "label": "owner_id"
      },
      "printed": {
        "type": "boolean",
        "label": "Printed"
      },
      "signature": {
        "type": "text",
        "label": "Signature"
      },
      "is_signed": {
        "type": "boolean",
        "label": "Is Signed"
      },
      "is_locked": {
        "type": "boolean",
        "label": "When the picking is not done this allows changing the ",
        "default": true
      },
      "is_date_editable": {
        "type": "boolean",
        "label": "is_date_editable"
      },
      "weight_bulk": {
        "type": "float",
        "label": "weight_bulk"
      },
      "shipping_weight": {
        "type": "float",
        "label": "shipping_weight"
      },
      "shipping_volume": {
        "type": "float",
        "label": "shipping_volume"
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product"
      },
      "lot_id": {
        "type": "many2one",
        "label": "stock.lot"
      },
      "show_operations": {
        "type": "boolean",
        "label": "picking_type_id.show_operations"
      },
      "show_lots_text": {
        "type": "boolean",
        "label": "_compute_show_lots_text"
      },
      "has_tracking": {
        "type": "boolean",
        "label": "_compute_has_tracking"
      },
      "products_availability": {
        "type": "char",
        "label": "products_availability"
      },
      "products_availability_state": {
        "type": "selection",
        "label": "products_availability_state"
      },
      "picking_properties": {
        "type": "char",
        "label": "picking_properties"
      },
      "show_next_pickings": {
        "type": "boolean",
        "label": "_compute_show_next_pickings"
      },
      "search_date_category": {
        "type": "selection",
        "label": "search_date_category"
      },
      "partner_country_id": {
        "type": "many2one",
        "label": "res.country"
      },
      "picking_warning_text": {
        "type": "text",
        "label": "picking_warning_text"
      }
    }
  },
  {
    "_name": "stock.quant",
    "_description": "Quants",
    "_auto": true,
    "_fields": {
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "product_tmpl_id": {
        "type": "many2one",
        "label": "product_tmpl_id"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "product_uom_id"
      },
      "is_favorite": {
        "type": "boolean",
        "label": "product_tmpl_id.is_favorite"
      },
      "company_id": {
        "type": "many2one",
        "label": "location_id.company_id"
      },
      "location_id": {
        "type": "many2one",
        "label": "location_id"
      },
      "warehouse_id": {
        "type": "many2one",
        "label": "stock.warehouse"
      },
      "storage_category_id": {
        "type": "many2one",
        "label": "location_id.storage_category_id"
      },
      "cyclic_inventory_frequency": {
        "type": "integer",
        "label": "location_id.cyclic_inventory_frequency"
      },
      "lot_id": {
        "type": "many2one",
        "label": "lot_id"
      },
      "lot_properties": {
        "type": "char",
        "label": "lot_id.lot_properties"
      },
      "sn_duplicated": {
        "type": "boolean",
        "label": "Duplicated Serial Number"
      },
      "package_id": {
        "type": "many2one",
        "label": "package_id"
      },
      "owner_id": {
        "type": "many2one",
        "label": "owner_id"
      },
      "quantity": {
        "type": "float",
        "label": "quantity"
      },
      "reserved_quantity": {
        "type": "float",
        "label": "reserved_quantity"
      },
      "available_quantity": {
        "type": "float",
        "label": "available_quantity"
      },
      "in_date": {
        "type": "datetime",
        "label": "Incoming Date",
        "required": true
      },
      "tracking": {
        "type": "selection",
        "label": "product_id.tracking"
      },
      "on_hand": {
        "type": "boolean",
        "label": "On Hand"
      },
      "product_categ_id": {
        "type": "many2one",
        "label": "product_tmpl_id.categ_id"
      },
      "inventory_quantity": {
        "type": "float",
        "label": "inventory_quantity"
      },
      "inventory_quantity_auto_apply": {
        "type": "float",
        "label": "inventory_quantity_auto_apply"
      },
      "inventory_diff_quantity": {
        "type": "float",
        "label": "inventory_diff_quantity"
      },
      "inventory_date": {
        "type": "date",
        "label": "inventory_date"
      },
      "last_count_date": {
        "type": "date",
        "label": "_compute_last_count_date"
      },
      "inventory_quantity_set": {
        "type": "boolean",
        "label": "_compute_inventory_quantity_set"
      },
      "is_outdated": {
        "type": "boolean",
        "label": "Quantity has been moved since last count"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      }
    }
  },
  {
    "_name": "stock.reference",
    "_description": "Reference between stock documents",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Reference",
        "required": true
      },
      "move_ids": {
        "type": "many2many",
        "label": "move_ids"
      },
      "picking_ids": {
        "type": "many2many",
        "label": "stock.picking"
      }
    }
  },
  {
    "_name": "stock.rule",
    "_description": "Stock Rule",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "active": {
        "type": "boolean",
        "label": "active"
      },
      "action": {
        "type": "selection",
        "label": "action"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "location_dest_id": {
        "type": "many2one",
        "label": "stock.location",
        "required": true
      },
      "location_src_id": {
        "type": "many2one",
        "label": "stock.location"
      },
      "location_dest_from_rule": {
        "type": "boolean",
        "label": "location_dest_from_rule"
      },
      "route_id": {
        "type": "many2one",
        "label": "stock.route",
        "required": true
      },
      "route_company_id": {
        "type": "many2one",
        "label": "route_id.company_id"
      },
      "procure_method": {
        "type": "selection",
        "label": "procure_method"
      },
      "route_sequence": {
        "type": "integer",
        "label": "Route Sequence"
      },
      "picking_type_id": {
        "type": "many2one",
        "label": "picking_type_id"
      },
      "picking_type_code_domain": {
        "type": "char",
        "label": "_compute_picking_type_code_domain"
      },
      "delay": {
        "type": "integer",
        "label": "Lead Time"
      },
      "partner_address_id": {
        "type": "many2one",
        "label": "partner_address_id"
      },
      "propagate_cancel": {
        "type": "boolean",
        "label": "propagate_cancel"
      },
      "propagate_carrier": {
        "type": "boolean",
        "label": "propagate_carrier"
      },
      "warehouse_id": {
        "type": "many2one",
        "label": "stock.warehouse"
      },
      "auto": {
        "type": "selection",
        "label": "auto"
      },
      "rule_message": {
        "type": "html",
        "label": "_compute_action_message"
      },
      "push_domain": {
        "type": "char",
        "label": "Push Applicability"
      }
    }
  },
  {
    "_name": "stock.scrap",
    "_description": "Scrap",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "origin": {
        "type": "char",
        "label": "Source Document"
      },
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "allowed_uom_ids": {
        "type": "many2many",
        "label": "uom.uom"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "product_uom_id"
      },
      "tracking": {
        "type": "selection",
        "label": "Product Tracking"
      },
      "lot_id": {
        "type": "many2one",
        "label": "lot_id"
      },
      "package_id": {
        "type": "many2one",
        "label": "package_id"
      },
      "owner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "move_ids": {
        "type": "one2many",
        "label": "stock.move"
      },
      "picking_id": {
        "type": "many2one",
        "label": "stock.picking"
      },
      "location_id": {
        "type": "many2one",
        "label": "location_id"
      },
      "scrap_location_id": {
        "type": "many2one",
        "label": "scrap_location_id"
      },
      "scrap_qty": {
        "type": "float",
        "label": "scrap_qty"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "date_done": {
        "type": "datetime",
        "label": "Date"
      },
      "should_replenish": {
        "type": "boolean",
        "label": "Replenish Quantities"
      },
      "scrap_reason_tag_ids": {
        "type": "many2many",
        "label": "scrap_reason_tag_ids"
      }
    }
  },
  {
    "_name": "stock.scrap.reason.tag",
    "_description": "Scrap Reason Tag",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "color": {
        "type": "char",
        "label": "Color",
        "default": "#3C3C3C"
      }
    }
  },
  {
    "_name": "stock.storage.category",
    "_description": "Storage Category",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Storage Category",
        "required": true
      },
      "max_weight": {
        "type": "float",
        "label": "Max Weight"
      },
      "capacity_ids": {
        "type": "one2many",
        "label": "stock.storage.category.capacity"
      },
      "product_capacity_ids": {
        "type": "one2many",
        "label": "stock.storage.category.capacity"
      },
      "package_capacity_ids": {
        "type": "one2many",
        "label": "stock.storage.category.capacity"
      },
      "allow_new_product": {
        "type": "selection",
        "label": "allow_new_product"
      },
      "location_ids": {
        "type": "one2many",
        "label": "stock.location"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "weight_uom_name": {
        "type": "char",
        "label": "Weight unit"
      }
    }
  },
  {
    "_name": "stock.storage.category.capacity",
    "_description": "Storage Category Capacity",
    "_auto": true,
    "_fields": {
      "storage_category_id": {
        "type": "many2one",
        "label": "stock.storage.category",
        "required": true
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product"
      },
      "package_type_id": {
        "type": "many2one",
        "label": "stock.package.type"
      },
      "quantity": {
        "type": "float",
        "label": "Quantity",
        "required": true
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "product_id.uom_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      }
    }
  },
  {
    "_name": "stock.warehouse",
    "_description": "Warehouse",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Warehouse",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "view_location_id": {
        "type": "many2one",
        "label": "view_location_id"
      },
      "lot_stock_id": {
        "type": "many2one",
        "label": "lot_stock_id"
      },
      "code": {
        "type": "char",
        "label": "Short Name",
        "required": true
      },
      "route_ids": {
        "type": "many2many",
        "label": "route_ids"
      },
      "reception_steps": {
        "type": "selection",
        "label": "reception_steps"
      },
      "delivery_steps": {
        "type": "selection",
        "label": "delivery_steps"
      },
      "wh_input_stock_loc_id": {
        "type": "many2one",
        "label": "stock.location"
      },
      "wh_qc_stock_loc_id": {
        "type": "many2one",
        "label": "stock.location"
      },
      "wh_output_stock_loc_id": {
        "type": "many2one",
        "label": "stock.location"
      },
      "wh_pack_stock_loc_id": {
        "type": "many2one",
        "label": "stock.location"
      },
      "mto_pull_id": {
        "type": "many2one",
        "label": "stock.rule"
      },
      "pick_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      },
      "pack_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      },
      "out_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      },
      "in_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      },
      "int_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      },
      "qc_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      },
      "store_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      },
      "xdock_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      },
      "reception_route_id": {
        "type": "many2one",
        "label": "stock.route"
      },
      "delivery_route_id": {
        "type": "many2one",
        "label": "stock.route"
      },
      "resupply_wh_ids": {
        "type": "many2many",
        "label": "resupply_wh_ids"
      },
      "resupply_route_ids": {
        "type": "one2many",
        "label": "resupply_route_ids"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      }
    }
  }
];
