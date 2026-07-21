// Odoo 模块: pos_sale
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "crmteam",
    "_description": "crmteam",
    "_auto": true,
    "_fields": {
      "pos_config_ids": {
        "type": "one2many",
        "label": "pos.config"
      }
    },
    "_inherit": "crm.team"
  },
  {
    "_name": "posconfig",
    "_description": "posconfig",
    "_auto": true,
    "_fields": {
      "crm_team_id": {
        "type": "many2one",
        "label": "crm_team_id"
      },
      "down_payment_product_id": {
        "type": "many2one",
        "label": "product.product"
      }
    },
    "_inherit": "pos.config"
  },
  {
    "_name": "posorder",
    "_description": "posorder",
    "_auto": true,
    "_fields": {
      "currency_rate": {
        "type": "float",
        "label": "_compute_currency_rate"
      },
      "crm_team_id": {
        "type": "many2one",
        "label": "crm.team"
      },
      "sale_order_count": {
        "type": "integer",
        "label": "Sale Order Count"
      }
    },
    "_inherit": "pos.order"
  },
  {
    "_name": "posorderline",
    "_description": "posorderline",
    "_auto": true,
    "_fields": {
      "sale_order_origin_id": {
        "type": "many2one",
        "label": "sale.order"
      },
      "sale_order_line_id": {
        "type": "many2one",
        "label": "sale.order.line"
      },
      "down_payment_details": {
        "type": "text",
        "label": "Down Payment Details"
      },
      "qty_delivered": {
        "type": "float",
        "label": "qty_delivered"
      }
    },
    "_inherit": "pos.order.line"
  },
  {
    "_name": "possession",
    "_description": "possession",
    "_auto": true,
    "_fields": {
      "crm_team_id": {
        "type": "many2one",
        "label": "crm.team"
      }
    },
    "_inherit": "pos.session"
  },
  {
    "_name": "sale.order",
    "_description": "sale.order",
    "_auto": true,
    "_fields": {
      "pos_order_line_ids": {
        "type": "one2many",
        "label": "pos.order.line"
      },
      "pos_order_count": {
        "type": "integer",
        "label": "Pos Order Count"
      },
      "amount_unpaid": {
        "type": "monetary",
        "label": "amount_unpaid"
      }
    }
  },
  {
    "_name": "sale.order.line",
    "_description": "sale.order.line",
    "_auto": true,
    "_fields": {
      "pos_order_line_ids": {
        "type": "one2many",
        "label": "pos.order.line"
      }
    }
  }
];
