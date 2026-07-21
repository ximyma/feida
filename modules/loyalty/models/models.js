// Odoo 模块: loyalty
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "loyalty.card",
    "_description": "Loyalty Coupon",
    "_auto": true,
    "_fields": {
      "program_id": {
        "type": "many2one",
        "label": "program_id"
      },
      "program_type": {
        "type": "selection",
        "label": "program_id.program_type"
      },
      "company_id": {
        "type": "many2one",
        "label": "program_id.company_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "program_id.currency_id"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "points": {
        "type": "float",
        "label": "points"
      },
      "point_name": {
        "type": "char",
        "label": "program_id.portal_point_name"
      },
      "points_display": {
        "type": "char",
        "label": "_compute_points_display"
      },
      "code": {
        "type": "char",
        "label": "code",
        "required": true
      },
      "expiration_date": {
        "type": "date",
        "label": "expiration_date"
      },
      "use_count": {
        "type": "integer",
        "label": "_compute_use_count"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "history_ids": {
        "type": "one2many",
        "label": "history_ids"
      }
    }
  },
  {
    "_name": "loyalty.history",
    "_description": "History for Loyalty cards and Ewallets",
    "_auto": true,
    "_fields": {
      "card_id": {
        "type": "many2one",
        "label": "loyalty.card",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "card_id.company_id"
      },
      "description": {
        "type": "text",
        "label": "description",
        "required": true
      },
      "issued": {
        "type": "float",
        "label": "issued"
      },
      "used": {
        "type": "float",
        "label": "used"
      },
      "order_model": {
        "type": "char",
        "label": "order_model"
      },
      "order_id": {
        "type": "char",
        "label": "order_model"
      }
    }
  },
  {
    "_name": "loyalty.mail",
    "_description": "Loyalty Communication",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "program_id": {
        "type": "many2one",
        "label": "loyalty.program",
        "required": true
      },
      "trigger": {
        "type": "selection",
        "label": "trigger"
      },
      "points": {
        "type": "float",
        "label": "points"
      },
      "mail_template_id": {
        "type": "many2one",
        "label": "mail_template_id"
      }
    }
  },
  {
    "_name": "loyalty.program",
    "_description": "Loyalty Program",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Program Name",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "currency_id"
      },
      "currency_symbol": {
        "type": "char",
        "label": "currency_id.symbol"
      },
      "pricelist_ids": {
        "type": "many2many",
        "label": "pricelist_ids"
      },
      "total_order_count": {
        "type": "integer",
        "label": "total_order_count"
      },
      "rule_ids": {
        "type": "one2many",
        "label": "rule_ids"
      },
      "reward_ids": {
        "type": "one2many",
        "label": "reward_ids"
      },
      "communication_plan_ids": {
        "type": "one2many",
        "label": "communication_plan_ids"
      },
      "mail_template_id": {
        "type": "many2one",
        "label": "mail_template_id"
      },
      "trigger_product_ids": {
        "type": "many2many",
        "label": "rule_ids.product_ids"
      },
      "coupon_ids": {
        "type": "one2many",
        "label": "loyalty.card"
      },
      "coupon_count": {
        "type": "integer",
        "label": "_compute_coupon_count"
      },
      "coupon_count_display": {
        "type": "char",
        "label": "Items"
      },
      "program_type": {
        "type": "selection",
        "label": "program_type"
      },
      "date_from": {
        "type": "date",
        "label": "date_from"
      },
      "date_to": {
        "type": "date",
        "label": "date_to"
      },
      "limit_usage": {
        "type": "boolean",
        "label": "Limit Usage"
      },
      "max_usage": {
        "type": "integer",
        "label": "max_usage"
      },
      "applies_on": {
        "type": "selection",
        "label": "applies_on"
      },
      "trigger": {
        "type": "selection",
        "label": "trigger"
      },
      "portal_visible": {
        "type": "boolean",
        "label": "portal_visible"
      },
      "portal_point_name": {
        "type": "char",
        "label": "portal_point_name"
      },
      "is_nominative": {
        "type": "boolean",
        "label": "_compute_is_nominative"
      },
      "is_payment_program": {
        "type": "boolean",
        "label": "_compute_is_payment_program"
      },
      "payment_program_discount_product_id": {
        "type": "many2one",
        "label": "payment_program_discount_product_id"
      },
      "available_on": {
        "type": "boolean",
        "label": "available_on"
      }
    }
  },
  {
    "_name": "loyalty.reward",
    "_description": "Loyalty Reward",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "program_id": {
        "type": "many2one",
        "label": "loyalty.program",
        "required": true
      },
      "program_type": {
        "type": "selection",
        "label": "program_id.program_type"
      },
      "company_id": {
        "type": "many2one",
        "label": "program_id.company_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "program_id.currency_id"
      },
      "description": {
        "type": "char",
        "label": "description"
      },
      "reward_type": {
        "type": "selection",
        "label": "reward_type"
      },
      "user_has_debug": {
        "type": "boolean",
        "label": "_compute_user_has_debug"
      },
      "discount": {
        "type": "float",
        "label": "Discount"
      },
      "discount_mode": {
        "type": "selection",
        "label": "discount_mode"
      },
      "discount_applicability": {
        "type": "selection",
        "label": "discount_applicability"
      },
      "discount_product_domain": {
        "type": "char",
        "label": "[]",
        "default": "[]"
      },
      "discount_product_ids": {
        "type": "many2many",
        "label": "discount_product_ids"
      },
      "discount_product_category_id": {
        "type": "many2one",
        "label": "discount_product_category_id"
      },
      "discount_product_tag_id": {
        "type": "many2one",
        "label": "discount_product_tag_id"
      },
      "all_discount_product_ids": {
        "type": "many2many",
        "label": "all_discount_product_ids"
      },
      "reward_product_domain": {
        "type": "char",
        "label": "_compute_reward_product_domain"
      },
      "discount_max_amount": {
        "type": "monetary",
        "label": "discount_max_amount"
      },
      "discount_line_product_id": {
        "type": "many2one",
        "label": "discount_line_product_id"
      },
      "is_global_discount": {
        "type": "boolean",
        "label": "_compute_is_global_discount"
      },
      "reward_product_id": {
        "type": "many2one",
        "label": "reward_product_id"
      },
      "reward_product_tag_id": {
        "type": "many2one",
        "label": "Product Tag"
      },
      "multi_product": {
        "type": "boolean",
        "label": "_compute_multi_product"
      },
      "reward_product_ids": {
        "type": "many2many",
        "label": "reward_product_ids"
      },
      "reward_product_qty": {
        "type": "integer",
        "label": "reward_product_qty"
      },
      "reward_product_uom_id": {
        "type": "many2one",
        "label": "reward_product_uom_id"
      },
      "required_points": {
        "type": "float",
        "label": "Points needed"
      },
      "point_name": {
        "type": "char",
        "label": "program_id.portal_point_name"
      },
      "clear_wallet": {
        "type": "boolean",
        "label": "clear_wallet",
        "default": false
      }
    }
  },
  {
    "_name": "loyalty.rule",
    "_description": "Loyalty Rule",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "program_id": {
        "type": "many2one",
        "label": "loyalty.program",
        "required": true
      },
      "program_type": {
        "type": "selection",
        "label": "program_id.program_type"
      },
      "company_id": {
        "type": "many2one",
        "label": "program_id.company_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "program_id.currency_id"
      },
      "user_has_debug": {
        "type": "boolean",
        "label": "_compute_user_has_debug"
      },
      "product_domain": {
        "type": "char",
        "label": "[]",
        "default": "[]"
      },
      "product_ids": {
        "type": "many2many",
        "label": "Products"
      },
      "product_category_id": {
        "type": "many2one",
        "label": "Categories"
      },
      "product_tag_id": {
        "type": "many2one",
        "label": "Product Tag"
      },
      "reward_point_amount": {
        "type": "float",
        "label": "Reward"
      },
      "reward_point_split": {
        "type": "boolean",
        "label": "reward_point_split"
      },
      "reward_point_name": {
        "type": "char",
        "label": "program_id.portal_point_name"
      },
      "reward_point_mode": {
        "type": "selection",
        "label": "reward_point_mode"
      },
      "minimum_qty": {
        "type": "integer",
        "label": "Minimum Quantity"
      },
      "minimum_amount": {
        "type": "monetary",
        "label": "Minimum Purchase"
      },
      "minimum_amount_tax_mode": {
        "type": "selection",
        "label": "minimum_amount_tax_mode"
      },
      "mode": {
        "type": "selection",
        "label": "mode"
      },
      "code": {
        "type": "char",
        "label": "Discount code"
      }
    }
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "loyalty_card_count": {
        "type": "integer",
        "label": "loyalty_card_count"
      }
    },
    "_inherit": "res.partner"
  }
];
