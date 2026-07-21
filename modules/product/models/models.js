// Odoo 模块: product
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "product.attribute",
    "_description": "Product Attribute",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Attribute",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active"
      },
      "create_variant": {
        "type": "selection",
        "label": "create_variant"
      },
      "display_type": {
        "type": "selection",
        "label": "display_type"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "value_ids": {
        "type": "one2many",
        "label": "value_ids"
      },
      "template_value_ids": {
        "type": "one2many",
        "label": "template_value_ids"
      },
      "attribute_line_ids": {
        "type": "one2many",
        "label": "attribute_line_ids"
      },
      "product_tmpl_ids": {
        "type": "many2many",
        "label": "product_tmpl_ids"
      },
      "number_related_products": {
        "type": "integer",
        "label": "_compute_number_related_products"
      }
    }
  },
  {
    "_name": "product.attribute.custom.value",
    "_description": "Product Attribute Custom Value",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "custom_product_template_attribute_value_id": {
        "type": "many2one",
        "label": "custom_product_template_attribute_value_id"
      },
      "custom_value": {
        "type": "char",
        "label": "Custom Value"
      }
    }
  },
  {
    "_name": "product.attribute.value",
    "_description": "Attribute Value",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Value",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "attribute_id": {
        "type": "many2one",
        "label": "attribute_id"
      },
      "pav_attribute_line_ids": {
        "type": "many2many",
        "label": "pav_attribute_line_ids"
      },
      "default_extra_price": {
        "type": "float",
        "label": "default_extra_price"
      },
      "is_custom": {
        "type": "boolean",
        "label": "is_custom"
      },
      "html_color": {
        "type": "char",
        "label": "html_color"
      },
      "display_type": {
        "type": "selection",
        "label": "attribute_id.display_type"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "image": {
        "type": "text",
        "label": "image"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "is_used_on_products": {
        "type": "boolean",
        "label": "is_used_on_products"
      },
      "default_extra_price_changed": {
        "type": "boolean",
        "label": "_compute_default_extra_price_changed"
      }
    }
  },
  {
    "_name": "product.category",
    "_description": "Product Category",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "complete_name": {
        "type": "char",
        "label": "complete_name"
      },
      "parent_id": {
        "type": "many2one",
        "label": "product.category"
      },
      "parent_path": {
        "type": "char",
        "label": "parent_path"
      },
      "child_id": {
        "type": "one2many",
        "label": "product.category"
      },
      "product_count": {
        "type": "integer",
        "label": "product_count"
      },
      "product_properties_definition": {
        "type": "char",
        "label": "Product Properties"
      }
    }
  },
  {
    "_name": "product.combo",
    "_description": "Product Combo",
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
      "company_id": {
        "type": "many2one",
        "label": "Company"
      },
      "combo_item_ids": {
        "type": "one2many",
        "label": "combo_item_ids"
      },
      "combo_item_count": {
        "type": "integer",
        "label": "Product Count"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "base_price": {
        "type": "float",
        "label": "base_price"
      }
    }
  },
  {
    "_name": "product.combo.item",
    "_description": "Product Combo Item",
    "_auto": true,
    "_fields": {
      "company_id": {
        "type": "many2one",
        "label": "combo_id.company_id"
      },
      "combo_id": {
        "type": "many2one",
        "label": "product.combo",
        "required": true
      },
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "lst_price": {
        "type": "float",
        "label": "lst_price"
      },
      "extra_price": {
        "type": "float",
        "label": "Extra Price"
      }
    }
  },
  {
    "_name": "product.document",
    "_description": "Product Document",
    "_auto": true,
    "_fields": {
      "ir_attachment_id": {
        "type": "many2one",
        "label": "ir_attachment_id"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      }
    }
  },
  {
    "_name": "product.pricelist",
    "_description": "Pricelist",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Pricelist Name",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "currency_id": {
        "type": "many2one",
        "label": "currency_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "country_group_ids": {
        "type": "many2many",
        "label": "country_group_ids"
      },
      "item_ids": {
        "type": "one2many",
        "label": "item_ids"
      }
    }
  },
  {
    "_name": "product.pricelist.item",
    "_description": "Pricelist Rule",
    "_auto": true,
    "_fields": {
      "pricelist_id": {
        "type": "many2one",
        "label": "pricelist_id"
      },
      "is_pricelist_required": {
        "type": "boolean",
        "label": "_compute_is_pricelist_required"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "date_start": {
        "type": "datetime",
        "label": "date_start"
      },
      "date_end": {
        "type": "datetime",
        "label": "date_end"
      },
      "min_quantity": {
        "type": "float",
        "label": "min_quantity"
      },
      "applied_on": {
        "type": "selection",
        "label": "applied_on"
      },
      "display_applied_on": {
        "type": "selection",
        "label": "display_applied_on"
      },
      "categ_id": {
        "type": "many2one",
        "label": "categ_id"
      },
      "product_tmpl_id": {
        "type": "many2one",
        "label": "product_tmpl_id"
      },
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "product_uom_name": {
        "type": "char",
        "label": "product_tmpl_id.uom_name"
      },
      "product_variant_count": {
        "type": "integer",
        "label": "product_tmpl_id.product_variant_count"
      },
      "base": {
        "type": "selection",
        "label": "base"
      },
      "base_pricelist_id": {
        "type": "many2one",
        "label": "product.pricelist"
      },
      "compute_price": {
        "type": "selection",
        "label": "compute_price"
      },
      "fixed_price": {
        "type": "float",
        "label": "Fixed Price"
      },
      "percent_price": {
        "type": "float",
        "label": "percent_price"
      },
      "price_discount": {
        "type": "float",
        "label": "price_discount"
      },
      "price_round": {
        "type": "float",
        "label": "price_round"
      },
      "price_surcharge": {
        "type": "float",
        "label": "price_surcharge"
      },
      "price_markup": {
        "type": "float",
        "label": "price_markup"
      },
      "price_min_margin": {
        "type": "float",
        "label": "price_min_margin"
      },
      "price_max_margin": {
        "type": "float",
        "label": "price_max_margin"
      },
      "name": {
        "type": "char",
        "label": "name"
      },
      "price": {
        "type": "char",
        "label": "price"
      },
      "rule_tip": {
        "type": "char",
        "label": "_compute_rule_tip"
      }
    }
  },
  {
    "_name": "product.product",
    "_description": "Product Variant",
    "_auto": true,
    "_fields": {
      "price_extra": {
        "type": "float",
        "label": "price_extra"
      },
      "lst_price": {
        "type": "float",
        "label": "lst_price"
      },
      "default_code": {
        "type": "char",
        "label": "Internal Reference"
      },
      "code": {
        "type": "char",
        "label": "Reference"
      },
      "partner_ref": {
        "type": "char",
        "label": "Customer Ref"
      },
      "active": {
        "type": "boolean",
        "label": "active"
      },
      "product_tmpl_id": {
        "type": "many2one",
        "label": "product_tmpl_id"
      },
      "barcode": {
        "type": "char",
        "label": "barcode"
      },
      "product_uom_ids": {
        "type": "one2many",
        "label": "product.uom"
      },
      "product_template_attribute_value_ids": {
        "type": "many2many",
        "label": "product.template.attribute.value",
        "relation": "product_variant_combination"
      },
      "product_template_variant_value_ids": {
        "type": "many2many",
        "label": "product.template.attribute.value",
        "relation": "product_variant_combination"
      },
      "import_attribute_values": {
        "type": "char",
        "label": "import_attribute_values"
      },
      "combination_indices": {
        "type": "char",
        "label": "_compute_combination_indices"
      },
      "is_product_variant": {
        "type": "boolean",
        "label": "_compute_is_product_variant"
      },
      "standard_price": {
        "type": "float",
        "label": "standard_price"
      },
      "volume": {
        "type": "float",
        "label": "Volume"
      },
      "weight": {
        "type": "float",
        "label": "Weight"
      },
      "pricelist_rule_ids": {
        "type": "one2many",
        "label": "pricelist_rule_ids"
      },
      "product_document_ids": {
        "type": "one2many",
        "label": "product_document_ids"
      },
      "product_document_count": {
        "type": "integer",
        "label": "product_document_count"
      },
      "additional_product_tag_ids": {
        "type": "many2many",
        "label": "additional_product_tag_ids"
      },
      "all_product_tag_ids": {
        "type": "many2many",
        "label": "product.tag"
      },
      "image_variant_1920": {
        "type": "text",
        "label": "Variant Image"
      },
      "image_variant_1024": {
        "type": "text",
        "label": "Variant Image 1024"
      },
      "image_variant_512": {
        "type": "text",
        "label": "Variant Image 512"
      },
      "image_variant_256": {
        "type": "text",
        "label": "Variant Image 256"
      },
      "image_variant_128": {
        "type": "text",
        "label": "Variant Image 128"
      },
      "can_image_variant_1024_be_zoomed": {
        "type": "boolean",
        "label": "Can Variant Image 1024 be zoomed"
      },
      "image_1920": {
        "type": "text",
        "label": "Image"
      },
      "image_1024": {
        "type": "text",
        "label": "Image 1024"
      },
      "image_512": {
        "type": "text",
        "label": "Image 512"
      },
      "image_256": {
        "type": "text",
        "label": "Image 256"
      },
      "image_128": {
        "type": "text",
        "label": "Image 128"
      },
      "can_image_1024_be_zoomed": {
        "type": "boolean",
        "label": "Can Image 1024 be zoomed"
      },
      "write_date": {
        "type": "datetime",
        "label": "_compute_write_date"
      },
      "is_favorite": {
        "type": "boolean",
        "label": "product_tmpl_id.is_favorite"
      },
      "is_in_selected_section_of_order": {
        "type": "boolean",
        "label": "_search_is_in_selected_section_of_order"
      }
    }
  },
  {
    "_name": "product.supplierinfo",
    "_description": "Supplier Pricelist",
    "_auto": true,
    "_fields": {
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "product_name": {
        "type": "char",
        "label": "product_name"
      },
      "product_code": {
        "type": "char",
        "label": "product_code"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "product_uom_id"
      },
      "min_qty": {
        "type": "float",
        "label": "min_qty"
      },
      "price": {
        "type": "float",
        "label": "price"
      },
      "price_discounted": {
        "type": "float",
        "label": "Discounted Price"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "currency_id"
      },
      "date_start": {
        "type": "date",
        "label": "Start Date"
      },
      "date_end": {
        "type": "date",
        "label": "End Date"
      },
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "product_tmpl_id": {
        "type": "many2one",
        "label": "product_tmpl_id"
      },
      "product_variant_count": {
        "type": "integer",
        "label": "Variant Count"
      },
      "delay": {
        "type": "integer",
        "label": "delay"
      },
      "discount": {
        "type": "float",
        "label": "discount"
      }
    }
  },
  {
    "_name": "product.tag",
    "_description": "Product Tag",
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
      "color": {
        "type": "char",
        "label": "Color",
        "default": "#3C3C3C"
      },
      "product_template_ids": {
        "type": "many2many",
        "label": "product_template_ids"
      },
      "product_product_ids": {
        "type": "many2many",
        "label": "product_product_ids"
      },
      "product_ids": {
        "type": "many2many",
        "label": "product_ids"
      },
      "visible_to_customers": {
        "type": "boolean",
        "label": "visible_to_customers"
      },
      "image": {
        "type": "text",
        "label": "Image"
      }
    }
  },
  {
    "_name": "product.template",
    "_description": "Product",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "description": {
        "type": "html",
        "label": "description"
      },
      "description_purchase": {
        "type": "text",
        "label": "description_purchase"
      },
      "description_sale": {
        "type": "text",
        "label": "description_sale"
      },
      "type": {
        "type": "selection",
        "label": "type"
      },
      "combo_ids": {
        "type": "many2many",
        "label": "combo_ids"
      },
      "service_tracking": {
        "type": "selection",
        "label": "service_tracking"
      },
      "categ_id": {
        "type": "many2one",
        "label": "categ_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "currency_id"
      },
      "cost_currency_id": {
        "type": "many2one",
        "label": "cost_currency_id"
      },
      "list_price": {
        "type": "float",
        "label": "list_price"
      },
      "standard_price": {
        "type": "float",
        "label": "standard_price"
      },
      "volume": {
        "type": "float",
        "label": "volume"
      },
      "volume_uom_name": {
        "type": "char",
        "label": "Volume unit of measure label"
      },
      "weight": {
        "type": "float",
        "label": "weight"
      },
      "weight_uom_name": {
        "type": "char",
        "label": "Weight unit of measure label"
      },
      "sale_ok": {
        "type": "boolean",
        "label": "Sales",
        "default": true
      },
      "purchase_ok": {
        "type": "boolean",
        "label": "Purchase",
        "default": true
      },
      "uom_id": {
        "type": "many2one",
        "label": "uom_id"
      },
      "uom_ids": {
        "type": "many2many",
        "label": "uom.uom"
      },
      "uom_name": {
        "type": "char",
        "label": "Unit Name"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "seller_ids": {
        "type": "one2many",
        "label": "product.supplierinfo"
      },
      "variant_seller_ids": {
        "type": "one2many",
        "label": "product.supplierinfo"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "is_product_variant": {
        "type": "boolean",
        "label": "Is a product variant"
      },
      "attribute_line_ids": {
        "type": "one2many",
        "label": "product.template.attribute.line"
      },
      "valid_product_template_attribute_line_ids": {
        "type": "many2many",
        "label": "product.template.attribute.line"
      },
      "import_attribute_values": {
        "type": "char",
        "label": "import_attribute_values"
      },
      "product_variant_ids": {
        "type": "one2many",
        "label": "product.product",
        "required": true
      },
      "product_variant_id": {
        "type": "many2one",
        "label": "product.product"
      },
      "product_variant_count": {
        "type": "integer",
        "label": "product_variant_count"
      },
      "barcode": {
        "type": "char",
        "label": "Barcode"
      },
      "default_code": {
        "type": "char",
        "label": "default_code"
      },
      "pricelist_rule_ids": {
        "type": "one2many",
        "label": "pricelist_rule_ids"
      },
      "product_document_ids": {
        "type": "one2many",
        "label": "product_document_ids"
      },
      "product_document_count": {
        "type": "integer",
        "label": "product_document_count"
      },
      "can_image_1024_be_zoomed": {
        "type": "boolean",
        "label": "Can Image 1024 be zoomed"
      },
      "has_configurable_attributes": {
        "type": "boolean",
        "label": "Is a configurable product"
      },
      "is_dynamically_created": {
        "type": "boolean",
        "label": "Is Dynamically Created"
      },
      "product_tooltip": {
        "type": "char",
        "label": "_compute_product_tooltip"
      },
      "is_favorite": {
        "type": "boolean",
        "label": "Favorite"
      },
      "product_tag_ids": {
        "type": "many2many",
        "label": "product_tag_ids"
      },
      "product_properties": {
        "type": "char",
        "label": "Properties"
      },
      "column_no": {
        "type": "char",
        "label": "import_attribute_values"
      }
    }
  },
  {
    "_name": "product.template.attribute.exclusion",
    "_description": "Product Template Attribute Exclusion",
    "_auto": true,
    "_fields": {
      "product_template_attribute_value_id": {
        "type": "many2one",
        "label": "product_template_attribute_value_id"
      },
      "product_tmpl_id": {
        "type": "many2one",
        "label": "product_tmpl_id"
      },
      "value_ids": {
        "type": "many2many",
        "label": "value_ids"
      }
    }
  },
  {
    "_name": "product.template.attribute.line",
    "_description": "Product Template Attribute Line",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "product_tmpl_id": {
        "type": "many2one",
        "label": "product_tmpl_id"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "attribute_id": {
        "type": "many2one",
        "label": "attribute_id"
      },
      "value_ids": {
        "type": "many2many",
        "label": "value_ids"
      },
      "value_count": {
        "type": "integer",
        "label": "_compute_value_count"
      },
      "product_template_value_ids": {
        "type": "one2many",
        "label": "product_template_value_ids"
      }
    }
  },
  {
    "_name": "product.template.attribute.value",
    "_description": "Product Template Attribute Value",
    "_auto": true,
    "_fields": {
      "ptav_active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "name": {
        "type": "char",
        "label": "Value"
      },
      "product_attribute_value_id": {
        "type": "many2one",
        "label": "product_attribute_value_id"
      },
      "attribute_line_id": {
        "type": "many2one",
        "label": "attribute_line_id"
      },
      "price_extra": {
        "type": "float",
        "label": "price_extra"
      },
      "currency_id": {
        "type": "many2one",
        "label": "attribute_line_id.product_tmpl_id.currency_id"
      },
      "exclude_for": {
        "type": "one2many",
        "label": "exclude_for"
      },
      "product_tmpl_id": {
        "type": "many2one",
        "label": "product_tmpl_id"
      },
      "attribute_id": {
        "type": "many2one",
        "label": "attribute_id"
      },
      "ptav_product_variant_ids": {
        "type": "many2many",
        "label": "ptav_product_variant_ids"
      },
      "html_color": {
        "type": "char",
        "label": "HTML Color Index"
      },
      "is_custom": {
        "type": "boolean",
        "label": "product_attribute_value_id.is_custom"
      },
      "display_type": {
        "type": "selection",
        "label": "product_attribute_value_id.display_type"
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "image": {
        "type": "text",
        "label": "product_attribute_value_id.image"
      }
    }
  },
  {
    "_name": "product.uom",
    "_description": "Link between products and their UoMs",
    "_auto": true,
    "_fields": {
      "uom_id": {
        "type": "many2one",
        "label": "uom.uom",
        "required": true
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product",
        "required": true
      },
      "barcode": {
        "type": "char",
        "label": "btree_not_null",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      }
    }
  },
  {
    "_name": "uomuom",
    "_description": "uomuom",
    "_auto": true,
    "_fields": {
      "product_uom_ids": {
        "type": "one2many",
        "label": "product.uom"
      }
    },
    "_inherit": "uom.uom"
  }
];
