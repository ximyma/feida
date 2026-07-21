// Odoo 模块: stock_account
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountaccount",
    "_description": "accountaccount",
    "_auto": true,
    "_fields": {
      "account_stock_variation_id": {
        "type": "many2one",
        "label": "account_stock_variation_id"
      },
      "account_stock_expense_id": {
        "type": "many2one",
        "label": "account_stock_expense_id"
      }
    },
    "_inherit": "account.account"
  },
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "stock_move_ids": {
        "type": "one2many",
        "label": "stock.move"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "account.move.line",
    "_description": "account.move.line",
    "_auto": true,
    "_fields": {
      "cogs_origin_id": {
        "type": "many2one",
        "label": "cogs_origin_id"
      }
    },
    "_inherit": "account.move.line"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "cost_method": {
        "type": "selection",
        "label": "cost_method"
      },
      "valuation": {
        "type": "selection",
        "label": "valuation"
      },
      "lot_valuated": {
        "type": "boolean",
        "label": "lot_valuated"
      },
      "property_price_difference_account_id": {
        "type": "many2one",
        "label": "property_price_difference_account_id"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "avg_cost": {
        "type": "monetary",
        "label": "avg_cost"
      },
      "total_value": {
        "type": "monetary",
        "label": "total_value"
      },
      "company_currency_id": {
        "type": "many2one",
        "label": "company_currency_id"
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "productcategory",
    "_description": "productcategory",
    "_auto": true,
    "_fields": {
      "anglo_saxon_accounting": {
        "type": "boolean",
        "label": "anglo_saxon_accounting"
      },
      "property_valuation": {
        "type": "selection",
        "label": "property_valuation"
      },
      "property_cost_method": {
        "type": "selection",
        "label": "property_cost_method"
      },
      "property_stock_journal": {
        "type": "many2one",
        "label": "property_stock_journal"
      },
      "property_stock_valuation_account_id": {
        "type": "many2one",
        "label": "property_stock_valuation_account_id"
      },
      "property_price_difference_account_id": {
        "type": "many2one",
        "label": "property_price_difference_account_id"
      },
      "account_stock_variation_id": {
        "type": "many2one",
        "label": "account_stock_variation_id"
      }
    },
    "_inherit": "product.category"
  },
  {
    "_name": "product.value",
    "_description": "Product Value",
    "_auto": true,
    "_fields": {
      "product_id": {
        "type": "many2one",
        "label": "product.product"
      },
      "lot_id": {
        "type": "many2one",
        "label": "stock.lot"
      },
      "move_id": {
        "type": "many2one",
        "label": "stock.move"
      },
      "value": {
        "type": "monetary",
        "label": "Value",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "date": {
        "type": "datetime",
        "label": "Date",
        "required": true
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users",
        "required": true
      },
      "description": {
        "type": "char",
        "label": "Description"
      },
      "current_value": {
        "type": "monetary",
        "label": "current_value"
      },
      "current_value_details": {
        "type": "char",
        "label": "Current Value Details"
      },
      "current_value_description": {
        "type": "text",
        "label": "Current Value Description"
      },
      "computed_value_description": {
        "type": "text",
        "label": "Computed Value Description"
      }
    }
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "account_stock_journal_id": {
        "type": "many2one",
        "label": "account.journal"
      },
      "account_stock_valuation_id": {
        "type": "many2one",
        "label": "account.account"
      },
      "account_production_wip_account_id": {
        "type": "many2one",
        "label": "account.account"
      },
      "account_production_wip_overhead_account_id": {
        "type": "many2one",
        "label": "account.account"
      },
      "inventory_period": {
        "type": "selection",
        "label": "inventory_period"
      },
      "inventory_valuation": {
        "type": "selection",
        "label": "inventory_valuation"
      },
      "cost_method": {
        "type": "selection",
        "label": "cost_method"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "stocklocation",
    "_description": "stocklocation",
    "_auto": true,
    "_fields": {
      "valuation_account_id": {
        "type": "many2one",
        "label": "valuation_account_id"
      },
      "is_valued_internal": {
        "type": "boolean",
        "label": "Is valued inside the company"
      },
      "is_valued_external": {
        "type": "boolean",
        "label": "Is valued outside the company"
      }
    },
    "_inherit": "stock.location"
  },
  {
    "_name": "stocklot",
    "_description": "stocklot",
    "_auto": true,
    "_fields": {
      "lot_valuated": {
        "type": "boolean",
        "label": "product_id.lot_valuated"
      },
      "avg_cost": {
        "type": "monetary",
        "label": "Average Cost"
      },
      "total_value": {
        "type": "monetary",
        "label": "Total Value"
      },
      "company_currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "standard_price": {
        "type": "float",
        "label": "standard_price"
      }
    },
    "_inherit": "stock.lot"
  },
  {
    "_name": "stockmove",
    "_description": "stockmove",
    "_auto": true,
    "_fields": {
      "to_refund": {
        "type": "boolean",
        "label": "to_refund"
      },
      "company_currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "value": {
        "type": "monetary",
        "label": "value"
      },
      "value_justification": {
        "type": "text",
        "label": "value_justification"
      },
      "value_computed_justification": {
        "type": "text",
        "label": "value_computed_justification"
      },
      "value_manual": {
        "type": "monetary",
        "label": "value_manual"
      },
      "standard_price": {
        "type": "float",
        "label": "_compute_standard_price"
      },
      "price_unit": {
        "type": "float",
        "label": "Price Unit"
      },
      "is_in": {
        "type": "boolean",
        "label": "Is Incoming (valued)"
      },
      "is_out": {
        "type": "boolean",
        "label": "Is Outgoing (valued)"
      },
      "is_dropship": {
        "type": "boolean",
        "label": "Is Dropship"
      },
      "is_valued": {
        "type": "boolean",
        "label": "Is Valued"
      },
      "remaining_qty": {
        "type": "float",
        "label": "remaining_qty"
      },
      "remaining_value": {
        "type": "monetary",
        "label": "remaining_value"
      },
      "analytic_account_line_ids": {
        "type": "many2many",
        "label": "account.analytic.line"
      },
      "account_move_id": {
        "type": "many2one",
        "label": "account.move"
      }
    },
    "_inherit": "stock.move"
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "country_code": {
        "type": "char",
        "label": "company_id.account_fiscal_country_id.code"
      }
    },
    "_inherit": "stock.picking"
  },
  {
    "_name": "stockpickingtype",
    "_description": "stockpickingtype",
    "_auto": true,
    "_fields": {
      "country_code": {
        "type": "char",
        "label": "company_id.account_fiscal_country_id.code"
      }
    },
    "_inherit": "stock.picking.type"
  },
  {
    "_name": "stockquant",
    "_description": "stockquant",
    "_auto": true,
    "_fields": {
      "value": {
        "type": "monetary",
        "label": "Value"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "accounting_date": {
        "type": "date",
        "label": "accounting_date"
      },
      "cost_method": {
        "type": "selection",
        "label": "cost_method"
      }
    },
    "_inherit": "stock.quant"
  }
];
