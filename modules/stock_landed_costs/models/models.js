// Odoo 模块: stock_landed_costs
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "landed_costs_ids": {
        "type": "one2many",
        "label": "stock.landed.cost"
      },
      "landed_costs_visible": {
        "type": "boolean",
        "label": "_compute_landed_costs_visible"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accountmoveline",
    "_description": "accountmoveline",
    "_auto": true,
    "_fields": {
      "product_type": {
        "type": "selection",
        "label": "product_id.type"
      },
      "is_landed_costs_line": {
        "type": "boolean",
        "label": "is_landed_costs_line"
      }
    },
    "_inherit": "account.move.line"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "landed_cost_ok": {
        "type": "boolean",
        "label": "Is a Landed Cost"
      },
      "split_method_landed_cost": {
        "type": "selection",
        "label": "split_method_landed_cost"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "lc_journal_id": {
        "type": "many2one",
        "label": "account.journal"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "stock.landed.cost",
    "_description": "Stock Landed Cost",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "date": {
        "type": "date",
        "label": "date"
      },
      "target_model": {
        "type": "selection",
        "label": "target_model"
      },
      "picking_ids": {
        "type": "many2many",
        "label": "picking_ids"
      },
      "cost_lines": {
        "type": "one2many",
        "label": "cost_lines"
      },
      "valuation_adjustment_lines": {
        "type": "one2many",
        "label": "valuation_adjustment_lines"
      },
      "description": {
        "type": "text",
        "label": "description"
      },
      "amount_total": {
        "type": "monetary",
        "label": "amount_total"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "account_move_id": {
        "type": "many2one",
        "label": "account_move_id"
      },
      "account_journal_id": {
        "type": "many2one",
        "label": "account_journal_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "vendor_bill_id": {
        "type": "many2one",
        "label": "vendor_bill_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      }
    }
  },
  {
    "_name": "stock.landed.cost.lines",
    "_description": "Stock Landed Cost Line",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Description"
      },
      "cost_id": {
        "type": "many2one",
        "label": "cost_id"
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product",
        "required": true
      },
      "price_unit": {
        "type": "monetary",
        "label": "Cost",
        "required": true
      },
      "split_method": {
        "type": "selection",
        "label": "split_method"
      },
      "account_id": {
        "type": "many2one",
        "label": "account.account"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      }
    }
  },
  {
    "_name": "stock.valuation.adjustment.lines",
    "_description": "Valuation Adjustment Lines",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "cost_id": {
        "type": "many2one",
        "label": "cost_id"
      },
      "cost_line_id": {
        "type": "many2one",
        "label": "cost_line_id"
      },
      "move_id": {
        "type": "many2one",
        "label": "stock.move"
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product",
        "required": true
      },
      "quantity": {
        "type": "float",
        "label": "quantity"
      },
      "weight": {
        "type": "float",
        "label": "weight"
      },
      "volume": {
        "type": "float",
        "label": "volume"
      },
      "former_cost": {
        "type": "monetary",
        "label": "former_cost"
      },
      "additional_landed_cost": {
        "type": "monetary",
        "label": "additional_landed_cost"
      },
      "final_cost": {
        "type": "monetary",
        "label": "final_cost"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      }
    }
  }
];
