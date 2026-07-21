// Odoo 模块: mrp_subcontracting_dropshipping
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "purchaseorder",
    "_description": "purchaseorder",
    "_auto": true,
    "_fields": {
      "default_location_dest_id_is_subcontracting_loc": {
        "type": "boolean",
        "label": "_compute_default_location_dest_id_is_subcontracting_loc"
      }
    },
    "_inherit": "purchase.order"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "dropship_subcontractor_pick_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "stockwarehouse",
    "_description": "stockwarehouse",
    "_auto": true,
    "_fields": {
      "subcontracting_dropshipping_pull_id": {
        "type": "many2one",
        "label": "subcontracting_dropshipping_pull_id"
      }
    },
    "_inherit": "stock.warehouse"
  }
];
