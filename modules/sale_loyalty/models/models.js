// Odoo 模块: sale_loyalty
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "sale.order",
    "_description": "sale.order",
    "_auto": true,
    "_fields": {
      "order_id": {
        "type": "many2one",
        "label": "order_id"
      },
      "order_id_partner_id": {
        "type": "many2one",
        "label": "order_id_partner_id"
      }
    },
    "_inherit": "loyalty.card"
  },
  {
    "_name": "loyaltyprogram",
    "_description": "loyaltyprogram",
    "_auto": true,
    "_fields": {
      "order_count": {
        "type": "integer",
        "label": "_compute_order_count"
      },
      "sale_ok": {
        "type": "boolean",
        "label": "Sales",
        "default": true
      }
    },
    "_inherit": "loyalty.program"
  },
  {
    "_name": "loyalty.card",
    "_description": "loyalty.card",
    "_auto": true,
    "_fields": {
      "applied_coupon_ids": {
        "type": "many2many",
        "label": "applied_coupon_ids"
      },
      "code_enabled_rule_ids": {
        "type": "many2many",
        "label": "code_enabled_rule_ids"
      },
      "coupon_point_ids": {
        "type": "one2many",
        "label": "coupon_point_ids"
      },
      "reward_amount": {
        "type": "float",
        "label": "_compute_reward_total"
      },
      "gift_card_count": {
        "type": "integer",
        "label": "_compute_gift_card_count"
      },
      "loyalty_data": {
        "type": "char",
        "label": "_compute_loyalty_data"
      }
    },
    "_inherit": "sale.order"
  },
  {
    "_name": "sale.order.coupon.points",
    "_description": "Sale Order Coupon Points - Keeps track of how a sale order impacts a coupon",
    "_auto": true,
    "_fields": {
      "order_id": {
        "type": "many2one",
        "label": "sale.order",
        "required": true
      },
      "coupon_id": {
        "type": "many2one",
        "label": "loyalty.card",
        "required": true
      },
      "points": {
        "type": "float",
        "label": "points",
        "required": true
      }
    }
  },
  {
    "_name": "loyalty.reward",
    "_description": "loyalty.reward",
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
        "label": "loyalty.card"
      },
      "reward_identifier_code": {
        "type": "char",
        "label": "reward_identifier_code"
      },
      "points_cost": {
        "type": "float",
        "label": "How much point this reward costs on the loyalty card."
      }
    },
    "_inherit": "sale.order.line"
  }
];
