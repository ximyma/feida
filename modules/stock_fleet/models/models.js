// Odoo 模块: stock_fleet
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "fleetvehiclemodelcategory",
    "_description": "fleetvehiclemodelcategory",
    "_auto": true,
    "_fields": {
      "weight_capacity": {
        "type": "float",
        "label": "Max Weight"
      },
      "weight_capacity_uom_name": {
        "type": "char",
        "label": "Weight unit of measure label"
      },
      "volume_capacity": {
        "type": "float",
        "label": "Max Volume"
      },
      "volume_capacity_uom_name": {
        "type": "char",
        "label": "Volume unit of measure label"
      }
    },
    "_inherit": "fleet.vehicle.model.category"
  },
  {
    "_name": "stockpickingtype",
    "_description": "stockpickingtype",
    "_auto": true,
    "_fields": {
      "dispatch_management": {
        "type": "boolean",
        "label": "dispatch_management"
      },
      "dock_ids": {
        "type": "many2many",
        "label": "dock_ids"
      }
    },
    "_inherit": "stock.picking.type"
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "zip": {
        "type": "char",
        "label": "partner_id.zip"
      }
    },
    "_inherit": "stock.picking"
  },
  {
    "_name": "stockpickingbatch",
    "_description": "stockpickingbatch",
    "_auto": true,
    "_fields": {
      "vehicle_id": {
        "type": "many2one",
        "label": "fleet.vehicle"
      },
      "vehicle_category_id": {
        "type": "many2one",
        "label": "vehicle_category_id"
      },
      "allowed_dock_ids": {
        "type": "many2many",
        "label": "picking_type_id.dock_ids"
      },
      "dock_id": {
        "type": "many2one",
        "label": "stock.location"
      },
      "vehicle_weight_capacity": {
        "type": "float",
        "label": "Vehcilce Payload Capacity"
      },
      "weight_uom_name": {
        "type": "char",
        "label": "Weight unit of measure label"
      },
      "vehicle_volume_capacity": {
        "type": "float",
        "label": "Max Volume (m³)"
      },
      "volume_uom_name": {
        "type": "char",
        "label": "Volume unit of measure label"
      },
      "driver_id": {
        "type": "many2one",
        "label": "driver_id"
      },
      "used_weight_percentage": {
        "type": "float",
        "label": "used_weight_percentage"
      },
      "used_volume_percentage": {
        "type": "float",
        "label": "used_volume_percentage"
      },
      "end_date": {
        "type": "datetime",
        "label": "End Date"
      },
      "has_dispatch_management": {
        "type": "boolean",
        "label": "Dispatch Management"
      }
    },
    "_inherit": "stock.picking.batch"
  }
];
