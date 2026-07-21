// Odoo 模块: pos_self_order
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "poscategory",
    "_description": "poscategory",
    "_auto": true,
    "_fields": {
      "pos_config_ids": {
        "type": "many2many",
        "label": "pos.config"
      }
    },
    "_inherit": "pos.category"
  },
  {
    "_name": "posconfig",
    "_description": "posconfig",
    "_auto": true,
    "_fields": {
      "status": {
        "type": "selection",
        "label": "status"
      },
      "self_ordering_url": {
        "type": "char",
        "label": "_compute_self_ordering_url"
      },
      "self_ordering_mode": {
        "type": "selection",
        "label": "self_ordering_mode"
      },
      "self_ordering_service_mode": {
        "type": "selection",
        "label": "self_ordering_service_mode"
      },
      "self_ordering_default_language_id": {
        "type": "many2one",
        "label": "self_ordering_default_language_id"
      },
      "self_ordering_available_language_ids": {
        "type": "many2many",
        "label": "self_ordering_available_language_ids"
      },
      "self_ordering_image_home_ids": {
        "type": "many2many",
        "label": "self_ordering_image_home_ids"
      },
      "self_ordering_image_background_ids": {
        "type": "many2many",
        "label": "self_ordering_image_background_ids"
      },
      "self_ordering_default_user_id": {
        "type": "many2one",
        "label": "self_ordering_default_user_id"
      },
      "self_ordering_pay_after": {
        "type": "selection",
        "label": "self_ordering_pay_after"
      },
      "self_ordering_image_brand": {
        "type": "text",
        "label": "self_ordering_image_brand"
      },
      "self_ordering_image_brand_name": {
        "type": "char",
        "label": "self_ordering_image_brand_name"
      },
      "has_paper": {
        "type": "boolean",
        "label": "Has paper",
        "default": true
      }
    },
    "_inherit": "pos.config"
  },
  {
    "_name": "posorderline",
    "_description": "posorderline",
    "_auto": true,
    "_fields": {
      "combo_id": {
        "type": "many2one",
        "label": "product.combo"
      }
    },
    "_inherit": "pos.order.line"
  },
  {
    "_name": "posorder",
    "_description": "posorder",
    "_auto": true,
    "_fields": {
      "table_stand_number": {
        "type": "char",
        "label": "Table Stand Number"
      },
      "self_ordering_table_id": {
        "type": "many2one",
        "label": "restaurant.table"
      },
      "source": {
        "type": "selection",
        "label": "source"
      }
    },
    "_inherit": "pos.order"
  },
  {
    "_name": "mail.template",
    "_description": "mail.template",
    "_auto": true,
    "_fields": {
      "available_in_self": {
        "type": "boolean",
        "label": "Available in self",
        "default": false
      },
      "service_at": {
        "type": "selection",
        "label": "service_at"
      },
      "mail_template_id": {
        "type": "many2one",
        "label": "mail_template_id"
      }
    },
    "_inherit": "pos.preset"
  },
  {
    "_name": "restauranttable",
    "_description": "restauranttable",
    "_auto": true,
    "_fields": {
      "identifier": {
        "type": "char",
        "label": "identifier"
      }
    },
    "_inherit": "restaurant.table"
  },
  {
    "_name": "pos_self_order.custom_link",
    "_description": "pos_self_order.custom_link",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Label",
        "required": true
      },
      "url": {
        "type": "char",
        "label": "URL",
        "required": true
      },
      "pos_config_ids": {
        "type": "many2many",
        "label": "pos_config_ids"
      },
      "style": {
        "type": "selection",
        "label": "style"
      },
      "link_html": {
        "type": "html",
        "label": "Preview"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      }
    }
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "self_order_available": {
        "type": "boolean",
        "label": "self_order_available"
      },
      "self_order_visible": {
        "type": "boolean",
        "label": "_compute_self_order_visible"
      }
    },
    "_inherit": "product.template"
  }
];
