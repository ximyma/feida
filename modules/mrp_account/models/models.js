// Odoo 模块: mrp_account
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "wip_production_ids": {
        "type": "many2many",
        "label": "wip_production_ids"
      },
      "wip_production_count": {
        "type": "integer",
        "label": "Manufacturing Orders Count"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accountanalyticaccount",
    "_description": "Analytic Account",
    "_auto": true,
    "_fields": {
      "production_ids": {
        "type": "many2many",
        "label": "mrp.production"
      },
      "production_count": {
        "type": "integer",
        "label": "Manufacturing Orders Count"
      },
      "bom_ids": {
        "type": "many2many",
        "label": "mrp.bom"
      },
      "bom_count": {
        "type": "integer",
        "label": "BoM Count"
      },
      "workcenter_ids": {
        "type": "many2many",
        "label": "mrp.workcenter"
      },
      "workorder_count": {
        "type": "integer",
        "label": "Work Order Count"
      }
    },
    "_inherit": "account.analytic.account"
  },
  {
    "_name": "accountanalyticline",
    "_description": "accountanalyticline",
    "_auto": true,
    "_fields": {
      "category": {
        "type": "selection",
        "label": "manufacturing_order"
      }
    },
    "_inherit": "account.analytic.line"
  },
  {
    "_name": "accountanalyticapplicability",
    "_description": "Analytic Plan",
    "_auto": true,
    "_fields": {
      "business_domain": {
        "type": "selection",
        "label": "business_domain"
      }
    },
    "_inherit": "account.analytic.applicability"
  },
  {
    "_name": "mrpproduction",
    "_description": "mrpproduction",
    "_auto": true,
    "_fields": {
      "extra_cost": {
        "type": "float",
        "label": "Extra Unit Cost"
      },
      "show_valuation": {
        "type": "boolean",
        "label": "_compute_show_valuation"
      },
      "wip_move_ids": {
        "type": "many2many",
        "label": "account.move"
      },
      "wip_move_count": {
        "type": "integer",
        "label": "WIP Journal Entry Count"
      }
    },
    "_inherit": "mrp.production"
  },
  {
    "_name": "mrp.workcenter",
    "_description": "mrp.workcenter",
    "_auto": true,
    "_fields": {
      "costs_hour_account_ids": {
        "type": "many2many",
        "label": "account.analytic.account"
      },
      "expense_account_id": {
        "type": "many2one",
        "label": "account.account"
      }
    }
  },
  {
    "_name": "mrpworkcenterproductivity",
    "_description": "mrpworkcenterproductivity",
    "_auto": true,
    "_fields": {
      "account_move_line_id": {
        "type": "many2one",
        "label": "account.move.line"
      }
    },
    "_inherit": "mrp.workcenter.productivity"
  },
  {
    "_name": "mrpworkorder",
    "_description": "mrpworkorder",
    "_auto": true,
    "_fields": {
      "mo_analytic_account_line_ids": {
        "type": "many2many",
        "label": "account.analytic.line"
      },
      "wc_analytic_account_line_ids": {
        "type": "many2many",
        "label": "account.analytic.line"
      }
    },
    "_inherit": "mrp.workorder"
  },
  {
    "_name": "productcategory",
    "_description": "productcategory",
    "_auto": true,
    "_fields": {
      "property_stock_account_production_cost_id": {
        "type": "many2one",
        "label": "property_stock_account_production_cost_id"
      }
    },
    "_inherit": "product.category"
  }
];
