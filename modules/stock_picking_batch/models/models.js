// Odoo 模块: stock_picking_batch
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "stockmoveline",
    "_description": "stockmoveline",
    "_auto": true,
    "_fields": {
      "batch_id": {
        "type": "many2one",
        "label": "picking_id.batch_id"
      }
    },
    "_inherit": "stock.move.line"
  },
  {
    "_name": "stockpickingtype",
    "_description": "stockpickingtype",
    "_auto": true,
    "_fields": {
      "count_picking_batch": {
        "type": "integer",
        "label": "_compute_picking_count"
      },
      "count_picking_wave": {
        "type": "integer",
        "label": "_compute_picking_count"
      },
      "auto_batch": {
        "type": "boolean",
        "label": "Automatic Batches"
      },
      "batch_group_by_partner": {
        "type": "boolean",
        "label": "Contact"
      },
      "batch_group_by_destination": {
        "type": "boolean",
        "label": "Destination Country"
      },
      "batch_group_by_src_loc": {
        "type": "boolean",
        "label": "Group by Source Location"
      },
      "batch_group_by_dest_loc": {
        "type": "boolean",
        "label": "Group by Destination Location"
      },
      "wave_group_by_product": {
        "type": "boolean",
        "label": "Product"
      },
      "wave_group_by_category": {
        "type": "boolean",
        "label": "Product Category"
      },
      "wave_category_ids": {
        "type": "many2many",
        "label": "product.category"
      },
      "wave_group_by_location": {
        "type": "boolean",
        "label": "Location"
      },
      "wave_location_ids": {
        "type": "many2many",
        "label": "stock.location"
      },
      "batch_max_lines": {
        "type": "integer",
        "label": "Maximum lines"
      },
      "batch_max_pickings": {
        "type": "integer",
        "label": "Maximum transfers"
      },
      "batch_auto_confirm": {
        "type": "boolean",
        "label": "Auto-confirm",
        "default": true
      },
      "batch_properties_definition": {
        "type": "char",
        "label": "Batch Properties"
      }
    },
    "_inherit": "stock.picking.type"
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "batch_id": {
        "type": "many2one",
        "label": "batch_id"
      },
      "batch_sequence": {
        "type": "integer",
        "label": "Sequence"
      }
    },
    "_inherit": "stock.picking"
  },
  {
    "_name": "stock.picking.batch",
    "_description": "Batch Transfer",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "description": {
        "type": "char",
        "label": "Description"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "picking_ids": {
        "type": "one2many",
        "label": "picking_ids"
      },
      "show_check_availability": {
        "type": "boolean",
        "label": "show_check_availability"
      },
      "show_allocation": {
        "type": "boolean",
        "label": "show_allocation"
      },
      "allowed_picking_ids": {
        "type": "one2many",
        "label": "stock.picking"
      },
      "move_ids": {
        "type": "one2many",
        "label": "move_ids"
      },
      "move_line_ids": {
        "type": "one2many",
        "label": "move_line_ids"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "picking_type_id": {
        "type": "many2one",
        "label": "picking_type_id"
      },
      "warehouse_id": {
        "type": "many2one",
        "label": "warehouse_id"
      },
      "picking_type_code": {
        "type": "selection",
        "label": "picking_type_code"
      },
      "scheduled_date": {
        "type": "datetime",
        "label": "scheduled_date"
      },
      "is_wave": {
        "type": "boolean",
        "label": "This batch is a wave"
      },
      "show_lots_text": {
        "type": "boolean",
        "label": "_compute_show_lots_text"
      },
      "estimated_shipping_weight": {
        "type": "float",
        "label": "estimated_shipping_weight"
      },
      "estimated_shipping_volume": {
        "type": "float",
        "label": "estimated_shipping_volume"
      },
      "properties": {
        "type": "char",
        "label": "Properties"
      }
    }
  }
];
