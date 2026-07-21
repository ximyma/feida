// Odoo 模块: pos_loyalty
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "barcoderule",
    "_description": "barcoderule",
    "_auto": true,
    "_fields": {
      "type": {
        "type": "selection",
        "label": "coupon"
      }
    },
    "_inherit": "barcode.rule"
  },
  {
    "_name": "loyalty.card",
    "_description": "loyalty.card",
    "_auto": true,
    "_fields": {
      "source_pos_order_id": {
        "type": "many2one",
        "label": "pos.order"
      },
      "source_pos_order_partner_id": {
        "type": "many2one",
        "label": "source_pos_order_partner_id"
      }
    }
  },
  {
    "_name": "loyaltymail",
    "_description": "loyaltymail",
    "_auto": true,
    "_fields": {
      "pos_report_print_id": {
        "type": "many2one",
        "label": "ir.actions.report"
      }
    },
    "_inherit": "loyalty.mail"
  },
  {
    "_name": "loyalty.program",
    "_description": "loyalty.program",
    "_auto": true,
    "_fields": {
      "pos_config_ids": {
        "type": "many2many",
        "label": "pos.config"
      },
      "pos_order_count": {
        "type": "integer",
        "label": "PoS Order Count"
      },
      "pos_ok": {
        "type": "boolean",
        "label": "Point of Sale",
        "default": true
      },
      "pos_report_print_id": {
        "type": "many2one",
        "label": "ir.actions.report"
      }
    }
  },
  {
    "_name": "loyalty.rule",
    "_description": "loyalty.rule",
    "_auto": true,
    "_fields": {
      "valid_product_ids": {
        "type": "many2many",
        "label": "valid_product_ids"
      },
      "any_product": {
        "type": "boolean",
        "label": "any_product"
      },
      "promo_barcode": {
        "type": "char",
        "label": "Barcode"
      }
    }
  },
  {
    "_name": "posorderline",
    "_description": "posorderline",
    "_auto": true,
    "_fields": {
      "is_reward_line": {
        "type": "boolean",
        "label": "is_reward_line"
      },
      "reward_id": {
        "type": "many2one",
        "label": "reward_id"
      },
      "coupon_id": {
        "type": "many2one",
        "label": "coupon_id"
      },
      "reward_identifier_code": {
        "type": "char",
        "label": "reward_identifier_code"
      },
      "points_cost": {
        "type": "float",
        "label": "How many point this reward cost on the coupon."
      }
    },
    "_inherit": "pos.order.line"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "loyalty_card_count": {
        "type": "integer",
        "label": "base.group_user,point_of_sale.group_pos_user"
      }
    },
    "_inherit": "res.partner"
  }
];
