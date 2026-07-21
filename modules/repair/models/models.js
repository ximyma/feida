// Odoo 模块: repair
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "product_catalog_product_is_in_repair": {
        "type": "boolean",
        "label": "product_catalog_product_is_in_repair"
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "service_tracking": {
        "type": "selection",
        "label": "repair"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "repair.order",
    "_description": "Repair Order",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "priority": {
        "type": "selection",
        "label": "0",
        "default": "0"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "internal_notes": {
        "type": "html",
        "label": "Internal Notes"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "repair.tags"
      },
      "under_warranty": {
        "type": "boolean",
        "label": "under_warranty"
      },
      "schedule_date": {
        "type": "datetime",
        "label": "Scheduled Date",
        "required": true
      },
      "search_date_category": {
        "type": "selection",
        "label": "search_date_category"
      },
      "repair_properties": {
        "type": "char",
        "label": "Properties"
      },
      "move_id": {
        "type": "many2one",
        "label": "action_repair_done"
      },
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "product_qty": {
        "type": "float",
        "label": "product_qty"
      },
      "allowed_uom_ids": {
        "type": "many2many",
        "label": "uom.uom"
      },
      "product_uom": {
        "type": "many2one",
        "label": "product_uom"
      },
      "lot_id": {
        "type": "many2one",
        "label": "lot_id"
      },
      "tracking": {
        "type": "selection",
        "label": "Product Tracking"
      },
      "picking_type_id": {
        "type": "many2one",
        "label": "picking_type_id"
      },
      "reference_ids": {
        "type": "many2many",
        "label": "reference_ids"
      },
      "location_id": {
        "type": "many2one",
        "label": "location_id"
      },
      "product_location_src_id": {
        "type": "many2one",
        "label": "product_location_src_id"
      },
      "product_location_dest_id": {
        "type": "many2one",
        "label": "product_location_dest_id"
      },
      "location_dest_id": {
        "type": "many2one",
        "label": "location_dest_id"
      },
      "parts_location_id": {
        "type": "many2one",
        "label": "parts_location_id"
      },
      "recycle_location_id": {
        "type": "many2one",
        "label": "recycle_location_id"
      },
      "move_ids": {
        "type": "one2many",
        "label": "move_ids"
      },
      "parts_availability": {
        "type": "char",
        "label": "parts_availability"
      },
      "parts_availability_state": {
        "type": "selection",
        "label": "parts_availability_state"
      },
      "is_parts_available": {
        "type": "boolean",
        "label": "is_parts_available"
      },
      "is_parts_late": {
        "type": "boolean",
        "label": "is_parts_late"
      },
      "sale_order_id": {
        "type": "many2one",
        "label": "sale_order_id"
      },
      "sale_order_line_id": {
        "type": "many2one",
        "label": "sale_order_line_id"
      },
      "repair_request": {
        "type": "text",
        "label": "repair_request"
      },
      "picking_id": {
        "type": "many2one",
        "label": "picking_id"
      },
      "picking_product_ids": {
        "type": "one2many",
        "label": "product.product"
      },
      "picking_product_id": {
        "type": "many2one",
        "label": "picking_id.product_id"
      },
      "allowed_lot_ids": {
        "type": "one2many",
        "label": "stock.lot"
      },
      "has_uncomplete_moves": {
        "type": "boolean",
        "label": "_compute_has_uncomplete_moves"
      },
      "unreserve_visible": {
        "type": "boolean",
        "label": "unreserve_visible"
      },
      "reserve_visible": {
        "type": "boolean",
        "label": "reserve_visible"
      },
      "picking_type_visible": {
        "type": "boolean",
        "label": "_compute_picking_type_visible"
      }
    }
  },
  {
    "_name": "repair.tags",
    "_description": "Repair Tags",
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
    "_name": "stocklot",
    "_description": "stocklot",
    "_auto": true,
    "_fields": {
      "repair_line_ids": {
        "type": "many2many",
        "label": "repair.order"
      },
      "repair_part_count": {
        "type": "integer",
        "label": "Repair part count"
      },
      "in_repair_count": {
        "type": "integer",
        "label": "In repair count"
      },
      "repaired_count": {
        "type": "integer",
        "label": "Repaired count"
      }
    },
    "_inherit": "stock.lot"
  },
  {
    "_name": "stockmove",
    "_description": "stockmove",
    "_auto": true,
    "_fields": {
      "repair_id": {
        "type": "many2one",
        "label": "repair.order"
      },
      "repair_line_type": {
        "type": "selection",
        "label": "repair_line_type"
      }
    },
    "_inherit": "stock.move"
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
      "count_repair_confirmed": {
        "type": "integer",
        "label": "count_repair_confirmed"
      },
      "count_repair_under_repair": {
        "type": "integer",
        "label": "count_repair_under_repair"
      },
      "count_repair_ready": {
        "type": "integer",
        "label": "count_repair_ready"
      },
      "count_repair_late": {
        "type": "integer",
        "label": "count_repair_late"
      },
      "default_product_location_src_id": {
        "type": "many2one",
        "label": "default_product_location_src_id"
      },
      "default_product_location_dest_id": {
        "type": "many2one",
        "label": "default_product_location_dest_id"
      },
      "default_remove_location_dest_id": {
        "type": "many2one",
        "label": "default_remove_location_dest_id"
      },
      "default_recycle_location_dest_id": {
        "type": "many2one",
        "label": "default_recycle_location_dest_id"
      },
      "repair_properties_definition": {
        "type": "char",
        "label": "Repair Properties"
      }
    },
    "_inherit": "stock.picking.type"
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "repair_ids": {
        "type": "one2many",
        "label": "repair.order"
      },
      "nbr_repairs": {
        "type": "integer",
        "label": "Number of repairs linked to this picking"
      }
    },
    "_inherit": "stock.picking"
  },
  {
    "_name": "stockwarehouse",
    "_description": "stockwarehouse",
    "_auto": true,
    "_fields": {
      "repair_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      },
      "repair_mto_pull_id": {
        "type": "many2one",
        "label": "repair_mto_pull_id"
      }
    },
    "_inherit": "stock.warehouse"
  }
];
