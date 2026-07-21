// Odoo 模块: stock_maintenance
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "maintenanceequipment",
    "_description": "maintenanceequipment",
    "_auto": true,
    "_fields": {
      "location_id": {
        "type": "many2one",
        "label": "stock.location"
      },
      "match_serial": {
        "type": "boolean",
        "label": "_compute_match_serial"
      }
    },
    "_inherit": "maintenance.equipment"
  },
  {
    "_name": "stocklocation",
    "_description": "stocklocation",
    "_auto": true,
    "_fields": {
      "equipment_count": {
        "type": "integer",
        "label": "Equipment Count"
      }
    },
    "_inherit": "stock.location"
  }
];
