// Odoo 模块: website_sale
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "website_id": {
        "type": "many2one",
        "label": "website_id"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "website",
    "_description": "website",
    "_auto": true,
    "_fields": {
      "website_ids": {
        "type": "one2many",
        "label": "website_ids"
      },
      "abandoned_carts_amount": {
        "type": "integer",
        "label": "abandoned_carts_amount"
      },
      "abandoned_carts_count": {
        "type": "integer",
        "label": "abandoned_carts_count"
      }
    },
    "_inherit": "crm.team"
  },
  {
    "_name": "delivery.carrier",
    "_description": "delivery.carrier",
    "_auto": true,
    "_fields": {
      "website_description": {
        "type": "text",
        "label": "website_description"
      }
    }
  },
  {
    "_name": "digestdigest",
    "_description": "digestdigest",
    "_auto": true,
    "_fields": {
      "kpi_website_sale_total": {
        "type": "boolean",
        "label": "eCommerce Sales"
      },
      "kpi_website_sale_total_value": {
        "type": "monetary",
        "label": "_compute_kpi_website_sale_total_value"
      }
    },
    "_inherit": "digest.digest"
  },
  {
    "_name": "productattribute",
    "_description": "productattribute",
    "_auto": true,
    "_fields": {
      "visibility": {
        "type": "selection",
        "label": "visibility"
      },
      "preview_variants": {
        "type": "selection",
        "label": "preview_variants"
      },
      "is_thumbnail_visible": {
        "type": "boolean",
        "label": "is_thumbnail_visible"
      }
    },
    "_inherit": "product.attribute"
  },
  {
    "_name": "productdocument",
    "_description": "productdocument",
    "_auto": true,
    "_fields": {
      "shown_on_product_page": {
        "type": "boolean",
        "label": "Publish on website"
      }
    },
    "_inherit": "product.document"
  },
  {
    "_name": "product.feed",
    "_description": "Product Feed",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "website_id": {
        "type": "many2one",
        "label": "website",
        "required": true
      },
      "pricelist_id": {
        "type": "many2one",
        "label": "pricelist_id"
      },
      "lang_id": {
        "type": "many2one",
        "label": "lang_id"
      },
      "website_lang_ids": {
        "type": "many2many",
        "label": "website_id.language_ids"
      },
      "product_category_ids": {
        "type": "many2many",
        "label": "product.public.category"
      },
      "target": {
        "type": "selection",
        "label": "target"
      },
      "access_token": {
        "type": "char",
        "label": "access_token"
      },
      "url": {
        "type": "char",
        "label": "_compute_url"
      },
      "last_notification_date": {
        "type": "date",
        "label": "last_notification_date"
      },
      "feed_cache": {
        "type": "text",
        "label": "_compute_feed_cache"
      },
      "cache_expiry": {
        "type": "datetime",
        "label": "cache_expiry",
        "required": true
      }
    }
  },
  {
    "_name": "product.image",
    "_description": "Product Image",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "image_1920": {
        "type": "text",
        "label": "image_1920"
      },
      "product_tmpl_id": {
        "type": "many2one",
        "label": "product_tmpl_id"
      },
      "product_variant_id": {
        "type": "many2one",
        "label": "product_variant_id"
      },
      "video_url": {
        "type": "char",
        "label": "video_url"
      },
      "embed_code": {
        "type": "html",
        "label": "_compute_embed_code"
      },
      "can_image_1024_be_zoomed": {
        "type": "boolean",
        "label": "can_image_1024_be_zoomed"
      }
    }
  },
  {
    "_name": "product.ribbon",
    "_description": "product.ribbon",
    "_auto": true,
    "_fields": {
      "variant_ribbon_id": {
        "type": "many2one",
        "label": "Variant Ribbon"
      },
      "website_id": {
        "type": "many2one",
        "label": "product_tmpl_id.website_id"
      },
      "product_variant_image_ids": {
        "type": "one2many",
        "label": "product_variant_image_ids"
      },
      "base_unit_count": {
        "type": "float",
        "label": "base_unit_count"
      },
      "base_unit_id": {
        "type": "many2one",
        "label": "base_unit_id"
      },
      "base_unit_price": {
        "type": "monetary",
        "label": "base_unit_price"
      },
      "base_unit_name": {
        "type": "char",
        "label": "base_unit_name"
      },
      "website_url": {
        "type": "char",
        "label": "website_url"
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "product.public.category",
    "_description": "Website Product Category",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "cover_image": {
        "type": "text",
        "label": "cover_image"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "parent_id": {
        "type": "many2one",
        "label": "parent_id"
      },
      "child_id": {
        "type": "one2many",
        "label": "child_id"
      },
      "parent_path": {
        "type": "char",
        "label": "parent_path"
      },
      "parents_and_self": {
        "type": "many2many",
        "label": "parents_and_self"
      },
      "product_tmpl_ids": {
        "type": "many2many",
        "label": "product_tmpl_ids"
      },
      "has_published_products": {
        "type": "boolean",
        "label": "has_published_products"
      },
      "website_description": {
        "type": "html",
        "label": "website_description"
      },
      "website_footer": {
        "type": "html",
        "label": "website_footer"
      },
      "show_category_title": {
        "type": "boolean",
        "label": "show_category_title"
      },
      "show_category_description": {
        "type": "boolean",
        "label": "show_category_description"
      },
      "align_category_content": {
        "type": "boolean",
        "label": "align_category_content"
      }
    }
  },
  {
    "_name": "product.template",
    "_description": "product.template",
    "_auto": true,
    "_fields": {
      "website_description": {
        "type": "html",
        "label": "website_description"
      },
      "description_ecommerce": {
        "type": "html",
        "label": "description_ecommerce"
      },
      "alternative_product_ids": {
        "type": "many2many",
        "label": "alternative_product_ids"
      },
      "accessory_product_ids": {
        "type": "many2many",
        "label": "accessory_product_ids"
      },
      "website_size_x": {
        "type": "integer",
        "label": "Size X"
      },
      "website_size_y": {
        "type": "integer",
        "label": "Size Y"
      },
      "website_ribbon_id": {
        "type": "many2one",
        "label": "Ribbon"
      },
      "website_sequence": {
        "type": "integer",
        "label": "website_sequence"
      },
      "public_categ_ids": {
        "type": "many2many",
        "label": "public_categ_ids"
      },
      "publish_date": {
        "type": "datetime",
        "label": "publish_date"
      },
      "product_template_image_ids": {
        "type": "one2many",
        "label": "product_template_image_ids"
      },
      "base_unit_count": {
        "type": "float",
        "label": "base_unit_count"
      },
      "base_unit_id": {
        "type": "many2one",
        "label": "base_unit_id"
      },
      "base_unit_price": {
        "type": "monetary",
        "label": "Price Per Unit"
      },
      "base_unit_name": {
        "type": "char",
        "label": "base_unit_name"
      },
      "compare_list_price": {
        "type": "monetary",
        "label": "compare_list_price"
      },
      "variants_default_code": {
        "type": "char",
        "label": "variants_default_code"
      },
      "description": {
        "type": "html",
        "label": "trigram"
      },
      "description_sale": {
        "type": "text",
        "label": "trigram"
      }
    }
  },
  {
    "_name": "saleorderline",
    "_description": "saleorderline",
    "_auto": true,
    "_fields": {
      "name_short": {
        "type": "char",
        "label": "_compute_name_short"
      },
      "shop_warning": {
        "type": "char",
        "label": "Warning"
      }
    },
    "_inherit": "sale.order.line"
  },
  {
    "_name": "res.users",
    "_description": "res.users",
    "_auto": true,
    "_fields": {
      "salesperson_id": {
        "type": "many2one",
        "label": "salesperson_id"
      },
      "salesteam_id": {
        "type": "many2one",
        "label": "salesteam_id"
      },
      "show_line_subtotals_tax_selection": {
        "type": "selection",
        "label": "show_line_subtotals_tax_selection"
      },
      "add_to_cart_action": {
        "type": "selection",
        "label": "add_to_cart_action"
      },
      "auth_signup_uninvited": {
        "type": "selection",
        "label": "b2c",
        "default": "b2c"
      },
      "account_on_checkout": {
        "type": "selection",
        "label": "account_on_checkout"
      },
      "cart_recovery_mail_template_id": {
        "type": "many2one",
        "label": "cart_recovery_mail_template_id"
      },
      "contact_us_button_url": {
        "type": "char",
        "label": "contact_us_button_url"
      },
      "cart_abandoned_delay": {
        "type": "float",
        "label": "Abandoned Delay"
      },
      "send_abandoned_cart_email": {
        "type": "boolean",
        "label": "send_abandoned_cart_email"
      },
      "send_abandoned_cart_email_activation_time": {
        "type": "datetime",
        "label": "send_abandoned_cart_email_activation_time"
      },
      "shop_page_container": {
        "type": "selection",
        "label": "shop_page_container"
      },
      "shop_ppg": {
        "type": "integer",
        "label": "shop_ppg"
      },
      "shop_ppr": {
        "type": "integer",
        "label": "Number of grid columns on the shop"
      },
      "shop_gap": {
        "type": "char",
        "label": "Grid-gap on the shop",
        "default": "16px"
      },
      "shop_opt_products_design_classes": {
        "type": "char",
        "label": "shop_opt_products_design_classes"
      },
      "shop_default_sort": {
        "type": "selection",
        "label": "shop_default_sort"
      },
      "shop_extra_field_ids": {
        "type": "one2many",
        "label": "shop_extra_field_ids"
      },
      "product_page_container": {
        "type": "selection",
        "label": "product_page_container"
      },
      "product_page_cols_order": {
        "type": "selection",
        "label": "product_page_cols_order"
      },
      "product_page_image_layout": {
        "type": "selection",
        "label": "product_page_image_layout"
      },
      "product_page_image_width": {
        "type": "selection",
        "label": "product_page_image_width"
      },
      "product_page_image_spacing": {
        "type": "selection",
        "label": "product_page_image_spacing"
      },
      "product_page_image_roundness": {
        "type": "selection",
        "label": "product_page_image_roundness"
      },
      "product_page_image_ratio": {
        "type": "selection",
        "label": "product_page_image_ratio"
      },
      "product_page_image_ratio_mobile": {
        "type": "selection",
        "label": "product_page_image_ratio_mobile"
      },
      "ecommerce_access": {
        "type": "selection",
        "label": "ecommerce_access"
      },
      "product_page_grid_columns": {
        "type": "integer",
        "label": "product_page_grid_columns"
      },
      "prevent_zero_price_sale": {
        "type": "boolean",
        "label": "Hide "
      },
      "enabled_gmc_src": {
        "type": "boolean",
        "label": "enabled_gmc_src"
      },
      "currency_id": {
        "type": "many2one",
        "label": "currency_id"
      },
      "pricelist_ids": {
        "type": "one2many",
        "label": "pricelist_ids"
      },
      "confirmation_email_template_id": {
        "type": "many2one",
        "label": "confirmation_email_template_id"
      }
    },
    "_inherit": "website"
  },
  {
    "_name": "website.base.unit",
    "_description": "Unit of Measure for price per unit on eCommerce products.",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      }
    }
  },
  {
    "_name": "website.checkout.step",
    "_description": "Website Checkout Step",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "step_href": {
        "type": "char",
        "label": "Href",
        "required": true
      },
      "main_button_label": {
        "type": "char",
        "label": "main_button_label"
      },
      "back_button_label": {
        "type": "char",
        "label": "back_button_label"
      },
      "website_id": {
        "type": "many2one",
        "label": "website"
      }
    }
  },
  {
    "_name": "website.sale.extra.field",
    "_description": "E-Commerce Extra Info Shown on product page",
    "_auto": true,
    "_fields": {
      "website_id": {
        "type": "many2one",
        "label": "website"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "field_id": {
        "type": "many2one",
        "label": "field_id"
      },
      "label": {
        "type": "char",
        "label": "field_id.field_description"
      },
      "name": {
        "type": "char",
        "label": "field_id.name"
      }
    }
  },
  {
    "_name": "websitesnippetfilter",
    "_description": "websitesnippetfilter",
    "_auto": true,
    "_fields": {
      "product_cross_selling": {
        "type": "boolean",
        "label": "product_cross_selling"
      }
    },
    "_inherit": "website.snippet.filter"
  },
  {
    "_name": "product.product",
    "_description": "product.product",
    "_auto": true,
    "_fields": {
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      }
    },
    "_inherit": "website.track"
  }
];
