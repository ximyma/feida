// Odoo 模块: mrp_subcontracting
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mrpbom",
    "_description": "mrpbom",
    "_auto": true,
    "_fields": {
      "type": {
        "type": "selection",
        "label": "type"
      },
      "subcontractor_ids": {
        "type": "many2many",
        "label": "res.partner"
      }
    },
    "_inherit": "mrp.bom"
  },
  {
    "_name": "mrpproduction",
    "_description": "mrpproduction",
    "_auto": true,
    "_fields": {
      "move_line_raw_ids": {
        "type": "one2many",
        "label": "move_line_raw_ids"
      },
      "subcontracting_has_been_recorded": {
        "type": "boolean",
        "label": "Has been recorded?"
      },
      "subcontractor_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "bom_product_ids": {
        "type": "many2many",
        "label": "product.product"
      },
      "incoming_picking": {
        "type": "many2one",
        "label": "move_finished_ids.move_dest_ids.picking_id"
      }
    },
    "_inherit": "mrp.production"
  },
  {
    "_name": "productsupplierinfo",
    "_description": "productsupplierinfo",
    "_auto": true,
    "_fields": {
      "is_subcontractor": {
        "type": "boolean",
        "label": "Subcontracted"
      }
    },
    "_inherit": "product.supplierinfo"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "subcontracting_location_id": {
        "type": "many2one",
        "label": "stock.location"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "property_stock_subcontractor": {
        "type": "many2one",
        "label": "property_stock_subcontractor"
      },
      "is_subcontractor": {
        "type": "boolean",
        "label": "is_subcontractor"
      },
      "bom_ids": {
        "type": "many2many",
        "label": "mrp.bom"
      },
      "production_ids": {
        "type": "many2many",
        "label": "mrp.production"
      },
      "picking_ids": {
        "type": "many2many",
        "label": "stock.picking"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "stocklocation",
    "_description": "stocklocation",
    "_auto": true,
    "_fields": {
      "subcontractor_ids": {
        "type": "one2many",
        "label": "res.partner"
      }
    },
    "_inherit": "stock.location"
  },
  {
    "_name": "stockmove",
    "_description": "stockmove",
    "_auto": true,
    "_fields": {
      "is_subcontract": {
        "type": "boolean",
        "label": "The move is a subcontract receipt"
      },
      "show_subcontracting_details_visible": {
        "type": "boolean",
        "label": "show_subcontracting_details_visible"
      }
    },
    "_inherit": "stock.move"
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "show_subcontracting_details_visible": {
        "type": "boolean",
        "label": "_compute_show_subcontracting_details_visible"
      }
    },
    "_inherit": "stock.picking"
  },
  {
    "_name": "stockquant",
    "_description": "stockquant",
    "_auto": true,
    "_fields": {
      "is_subcontract": {
        "type": "boolean",
        "label": "_search_is_subcontract"
      }
    },
    "_inherit": "stock.quant"
  },
  {
    "_name": "stockwarehouse",
    "_description": "stockwarehouse",
    "_auto": true,
    "_fields": {
      "subcontracting_to_resupply": {
        "type": "boolean",
        "label": "subcontracting_to_resupply"
      },
      "subcontracting_mto_pull_id": {
        "type": "many2one",
        "label": "subcontracting_mto_pull_id"
      },
      "subcontracting_pull_id": {
        "type": "many2one",
        "label": "subcontracting_pull_id"
      },
      "subcontracting_route_id": {
        "type": "many2one",
        "label": "stock.route"
      },
      "subcontracting_type_id": {
        "type": "many2one",
        "label": "subcontracting_type_id"
      },
      "subcontracting_resupply_type_id": {
        "type": "many2one",
        "label": "subcontracting_resupply_type_id"
      }
    },
    "_inherit": "stock.warehouse"
  }
];
