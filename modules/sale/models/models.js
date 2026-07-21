// Odoo 模块: sale
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "account.move",
    "_description": "account.move",
    "_auto": true,
    "_fields": {
      "team_id": {
        "type": "many2one",
        "label": "team_id"
      },
      "campaign_id": {
        "type": "many2one",
        "label": "set null"
      },
      "medium_id": {
        "type": "many2one",
        "label": "set null"
      },
      "source_id": {
        "type": "many2one",
        "label": "set null"
      },
      "sale_order_count": {
        "type": "integer",
        "label": "_compute_origin_so_count"
      },
      "sale_warning_text": {
        "type": "text",
        "label": "sale_warning_text"
      }
    }
  },
  {
    "_name": "accountmoveline",
    "_description": "accountmoveline",
    "_auto": true,
    "_fields": {
      "is_downpayment": {
        "type": "boolean",
        "label": "is_downpayment"
      },
      "sale_line_ids": {
        "type": "many2many",
        "label": "sale_line_ids"
      },
      "sale_line_warn_msg": {
        "type": "text",
        "label": "_compute_sale_line_warn_msg"
      }
    },
    "_inherit": "account.move.line"
  },
  {
    "_name": "accountanalyticline",
    "_description": "accountanalyticline",
    "_auto": true,
    "_fields": {
      "so_line": {
        "type": "many2one",
        "label": "sale.order.line"
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
    "_name": "crmteam",
    "_description": "crmteam",
    "_auto": true,
    "_fields": {
      "invoiced": {
        "type": "float",
        "label": "invoiced"
      },
      "invoiced_target": {
        "type": "float",
        "label": "invoiced_target"
      },
      "sale_order_count": {
        "type": "integer",
        "label": "_compute_sale_order_count"
      }
    },
    "_inherit": "crm.team"
  },
  {
    "_name": "paymentprovider",
    "_description": "paymentprovider",
    "_auto": true,
    "_fields": {
      "so_reference_type": {
        "type": "selection",
        "label": "Communication"
      }
    },
    "_inherit": "payment.provider"
  },
  {
    "_name": "paymenttransaction",
    "_description": "paymenttransaction",
    "_auto": true,
    "_fields": {
      "sale_order_ids": {
        "type": "many2many",
        "label": "sale.order"
      },
      "sale_order_ids_nbr": {
        "type": "integer",
        "label": "_compute_sale_order_ids_nbr"
      }
    },
    "_inherit": "payment.transaction"
  },
  {
    "_name": "productdocument",
    "_description": "productdocument",
    "_auto": true,
    "_fields": {
      "attached_on_sale": {
        "type": "selection",
        "label": "attached_on_sale"
      }
    },
    "_inherit": "product.document"
  },
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "sales_count": {
        "type": "float",
        "label": "_compute_sales_count"
      },
      "product_catalog_product_is_in_sale_order": {
        "type": "boolean",
        "label": "product_catalog_product_is_in_sale_order"
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "productattributecustomvalue",
    "_description": "productattributecustomvalue",
    "_auto": true,
    "_fields": {
      "sale_order_line_id": {
        "type": "many2one",
        "label": "sale.order.line"
      }
    },
    "_inherit": "product.attribute.custom.value"
  },
  {
    "_name": "product.template",
    "_description": "product.template",
    "_auto": true,
    "_fields": {
      "service_type": {
        "type": "selection",
        "label": "service_type"
      },
      "sale_line_warn_msg": {
        "type": "text",
        "label": "Sales Order Line Warning"
      },
      "expense_policy": {
        "type": "selection",
        "label": "expense_policy"
      },
      "visible_expense_policy": {
        "type": "boolean",
        "label": "visible_expense_policy"
      },
      "sales_count": {
        "type": "float",
        "label": "sales_count"
      },
      "invoice_policy": {
        "type": "selection",
        "label": "invoice_policy"
      },
      "optional_product_ids": {
        "type": "many2many",
        "label": "optional_product_ids"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "product.product",
    "_description": "product.product",
    "_auto": true,
    "_fields": {
      "portal_confirmation_sign": {
        "type": "boolean",
        "label": "Online Signature",
        "default": true
      },
      "portal_confirmation_pay": {
        "type": "boolean",
        "label": "Online Payment"
      },
      "prepayment_percent": {
        "type": "float",
        "label": "prepayment_percent"
      },
      "quotation_validity_days": {
        "type": "integer",
        "label": "quotation_validity_days"
      },
      "sale_discount_product_id": {
        "type": "many2one",
        "label": "sale_discount_product_id"
      },
      "sale_onboarding_payment_method": {
        "type": "selection",
        "label": "sale_onboarding_payment_method"
      },
      "downpayment_account_id": {
        "type": "many2one",
        "label": "downpayment_account_id"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "sale_order_count": {
        "type": "integer",
        "label": "sale_order_count"
      },
      "sale_order_ids": {
        "type": "one2many",
        "label": "sale.order"
      },
      "sale_warn_msg": {
        "type": "text",
        "label": "Message for Sales Order"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "sale.order",
    "_description": "Sales Order",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "locked": {
        "type": "boolean",
        "label": "locked"
      },
      "has_archived_products": {
        "type": "boolean",
        "label": "_compute_has_archived_products"
      },
      "client_order_ref": {
        "type": "char",
        "label": "Customer Reference"
      },
      "create_date": {
        "type": "datetime",
        "label": "create_date"
      },
      "commitment_date": {
        "type": "datetime",
        "label": "commitment_date"
      },
      "date_order": {
        "type": "datetime",
        "label": "date_order"
      },
      "origin": {
        "type": "char",
        "label": "origin"
      },
      "reference": {
        "type": "char",
        "label": "reference"
      },
      "pending_email_template_id": {
        "type": "many2one",
        "label": "pending_email_template_id"
      },
      "require_signature": {
        "type": "boolean",
        "label": "require_signature"
      },
      "require_payment": {
        "type": "boolean",
        "label": "require_payment"
      },
      "prepayment_percent": {
        "type": "float",
        "label": "prepayment_percent"
      },
      "signature": {
        "type": "text",
        "label": "signature"
      },
      "signed_by": {
        "type": "char",
        "label": "signed_by"
      },
      "signed_on": {
        "type": "datetime",
        "label": "signed_on"
      },
      "validity_date": {
        "type": "date",
        "label": "validity_date"
      },
      "journal_id": {
        "type": "many2one",
        "label": "journal_id"
      },
      "note": {
        "type": "html",
        "label": "note"
      },
      "partner_invoice_id": {
        "type": "many2one",
        "label": "partner_invoice_id"
      },
      "partner_shipping_id": {
        "type": "many2one",
        "label": "partner_shipping_id"
      },
      "fiscal_position_id": {
        "type": "many2one",
        "label": "fiscal_position_id"
      },
      "payment_term_id": {
        "type": "many2one",
        "label": "payment_term_id"
      },
      "preferred_payment_method_line_id": {
        "type": "many2one",
        "label": "preferred_payment_method_line_id"
      },
      "pricelist_id": {
        "type": "many2one",
        "label": "pricelist_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "currency_id"
      },
      "currency_rate": {
        "type": "float",
        "label": "currency_rate"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "team_id": {
        "type": "many2one",
        "label": "team_id"
      },
      "order_line": {
        "type": "one2many",
        "label": "order_line"
      },
      "amount_untaxed": {
        "type": "monetary",
        "label": "Untaxed Amount"
      },
      "amount_tax": {
        "type": "monetary",
        "label": "Taxes"
      },
      "amount_total": {
        "type": "monetary",
        "label": "Total"
      },
      "amount_to_invoice": {
        "type": "monetary",
        "label": "Un-invoiced Balance"
      },
      "amount_invoiced": {
        "type": "monetary",
        "label": "Already invoiced"
      },
      "invoice_count": {
        "type": "integer",
        "label": "Invoice Count"
      },
      "invoice_ids": {
        "type": "many2many",
        "label": "invoice_ids"
      },
      "invoice_status": {
        "type": "selection",
        "label": "invoice_status"
      },
      "sale_warning_text": {
        "type": "text",
        "label": "sale_warning_text"
      },
      "transaction_ids": {
        "type": "many2many",
        "label": "transaction_ids"
      },
      "authorized_transaction_ids": {
        "type": "many2many",
        "label": "authorized_transaction_ids"
      },
      "has_authorized_transaction_ids": {
        "type": "boolean",
        "label": "has_authorized_transaction_ids"
      },
      "amount_paid": {
        "type": "float",
        "label": "amount_paid"
      },
      "campaign_id": {
        "type": "many2one",
        "label": "set null"
      },
      "medium_id": {
        "type": "many2one",
        "label": "set null"
      },
      "source_id": {
        "type": "many2one",
        "label": "set null"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "tag_ids"
      },
      "amount_undiscounted": {
        "type": "float",
        "label": "amount_undiscounted"
      },
      "country_code": {
        "type": "char",
        "label": "company_id.account_fiscal_country_id.code"
      },
      "company_price_include": {
        "type": "selection",
        "label": "company_id.account_price_include"
      },
      "duplicated_order_ids": {
        "type": "many2many",
        "label": "sale.order"
      },
      "expected_date": {
        "type": "datetime",
        "label": "expected_date"
      },
      "is_expired": {
        "type": "boolean",
        "label": "Is Expired"
      },
      "partner_credit_warning": {
        "type": "text",
        "label": "partner_credit_warning"
      },
      "tax_calculation_rounding_method": {
        "type": "selection",
        "label": "tax_calculation_rounding_method"
      },
      "tax_country_id": {
        "type": "many2one",
        "label": "tax_country_id"
      },
      "tax_totals": {
        "type": "text",
        "label": "_compute_tax_totals"
      },
      "terms_type": {
        "type": "selection",
        "label": "company_id.terms_type"
      },
      "type_name": {
        "type": "char",
        "label": "Type Name"
      },
      "show_update_fpos": {
        "type": "boolean",
        "label": "show_update_fpos"
      },
      "has_active_pricelist": {
        "type": "boolean",
        "label": "has_active_pricelist"
      },
      "show_update_pricelist": {
        "type": "boolean",
        "label": "show_update_pricelist"
      }
    }
  },
  {
    "_name": "sale.order.line",
    "_description": "Sales Order Line",
    "_auto": true,
    "_fields": {
      "order_id": {
        "type": "many2one",
        "label": "order_id"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "currency_id"
      },
      "order_partner_id": {
        "type": "many2one",
        "label": "order_partner_id"
      },
      "salesman_id": {
        "type": "many2one",
        "label": "salesman_id"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "tax_country_id": {
        "type": "many2one",
        "label": "order_id.tax_country_id"
      },
      "display_type": {
        "type": "selection",
        "label": "display_type"
      },
      "is_configurable_product": {
        "type": "boolean",
        "label": "is_configurable_product"
      },
      "is_downpayment": {
        "type": "boolean",
        "label": "is_downpayment"
      },
      "is_expense": {
        "type": "boolean",
        "label": "is_expense"
      },
      "product_id": {
        "type": "many2one",
        "label": "product_id"
      },
      "product_template_id": {
        "type": "many2one",
        "label": "product_template_id"
      },
      "product_template_attribute_value_ids": {
        "type": "many2many",
        "label": "product_template_attribute_value_ids"
      },
      "product_custom_attribute_value_ids": {
        "type": "one2many",
        "label": "product_custom_attribute_value_ids"
      },
      "product_no_variant_attribute_value_ids": {
        "type": "many2many",
        "label": "product_no_variant_attribute_value_ids"
      },
      "is_product_archived": {
        "type": "boolean",
        "label": "_compute_is_product_archived"
      },
      "name": {
        "type": "text",
        "label": "name"
      },
      "translated_product_name": {
        "type": "text",
        "label": "_compute_translated_product_name"
      },
      "product_uom_qty": {
        "type": "float",
        "label": "product_uom_qty"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "product_uom_id"
      },
      "allowed_uom_ids": {
        "type": "many2many",
        "label": "uom.uom"
      },
      "linked_line_id": {
        "type": "many2one",
        "label": "linked_line_id"
      },
      "linked_line_ids": {
        "type": "one2many",
        "label": "linked_line_ids"
      },
      "categ_id": {
        "type": "many2one",
        "label": "product_id.categ_id"
      },
      "virtual_id": {
        "type": "char",
        "label": "virtual_id"
      },
      "linked_virtual_id": {
        "type": "char",
        "label": "linked_virtual_id"
      },
      "selected_combo_items": {
        "type": "char",
        "label": "selected_combo_items"
      },
      "combo_item_id": {
        "type": "many2one",
        "label": "product.combo.item"
      },
      "tax_ids": {
        "type": "many2many",
        "label": "tax_ids"
      },
      "pricelist_item_id": {
        "type": "many2one",
        "label": "pricelist_item_id"
      },
      "price_unit": {
        "type": "float",
        "label": "price_unit"
      },
      "technical_price_unit": {
        "type": "float",
        "label": "technical_price_unit"
      },
      "discount": {
        "type": "float",
        "label": "discount"
      },
      "price_subtotal": {
        "type": "monetary",
        "label": "price_subtotal"
      },
      "price_tax": {
        "type": "float",
        "label": "price_tax"
      },
      "price_total": {
        "type": "monetary",
        "label": "price_total"
      },
      "price_reduce_taxexcl": {
        "type": "monetary",
        "label": "price_reduce_taxexcl"
      },
      "price_reduce_taxinc": {
        "type": "monetary",
        "label": "price_reduce_taxinc"
      },
      "customer_lead": {
        "type": "float",
        "label": "customer_lead"
      },
      "qty_delivered_method": {
        "type": "selection",
        "label": "qty_delivered_method"
      },
      "qty_delivered": {
        "type": "float",
        "label": "qty_delivered"
      },
      "qty_invoiced": {
        "type": "float",
        "label": "qty_invoiced"
      },
      "qty_invoiced_posted": {
        "type": "float",
        "label": "qty_invoiced_posted"
      },
      "qty_to_invoice": {
        "type": "float",
        "label": "qty_to_invoice"
      },
      "analytic_line_ids": {
        "type": "one2many",
        "label": "analytic_line_ids"
      },
      "invoice_lines": {
        "type": "many2many",
        "label": "invoice_lines"
      },
      "invoice_status": {
        "type": "selection",
        "label": "invoice_status"
      },
      "untaxed_amount_invoiced": {
        "type": "monetary",
        "label": "untaxed_amount_invoiced"
      },
      "amount_invoiced": {
        "type": "monetary",
        "label": "amount_invoiced"
      },
      "untaxed_amount_to_invoice": {
        "type": "monetary",
        "label": "untaxed_amount_to_invoice"
      },
      "amount_to_invoice": {
        "type": "monetary",
        "label": "amount_to_invoice"
      },
      "amount_to_invoice_at_date": {
        "type": "float",
        "label": "Amount"
      },
      "qty_delivered_at_date": {
        "type": "float",
        "label": "qty_delivered_at_date"
      },
      "qty_invoiced_at_date": {
        "type": "float",
        "label": "qty_invoiced_at_date"
      },
      "extra_tax_data": {
        "type": "char",
        "label": "extra_tax_data"
      },
      "product_type": {
        "type": "selection",
        "label": "product_id.type"
      },
      "service_tracking": {
        "type": "selection",
        "label": "product_id.service_tracking"
      },
      "product_updatable": {
        "type": "boolean",
        "label": "product_updatable"
      },
      "product_uom_readonly": {
        "type": "boolean",
        "label": "product_uom_readonly"
      },
      "tax_calculation_rounding_method": {
        "type": "selection",
        "label": "tax_calculation_rounding_method"
      },
      "company_price_include": {
        "type": "selection",
        "label": "company_id.account_price_include"
      },
      "sale_line_warn_msg": {
        "type": "text",
        "label": "_compute_sale_line_warn_msg"
      },
      "parent_id": {
        "type": "many2one",
        "label": "parent_id"
      },
      "collapse_prices": {
        "type": "boolean",
        "label": "collapse_prices"
      },
      "collapse_composition": {
        "type": "boolean",
        "label": "collapse_composition"
      }
    }
  },
  {
    "_name": "utmcampaign",
    "_description": "UTM Campaign",
    "_auto": true,
    "_fields": {
      "quotation_count": {
        "type": "integer",
        "label": "Quotation Count"
      },
      "invoiced_amount": {
        "type": "integer",
        "label": "Revenues generated by the campaign"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      }
    },
    "_inherit": "utm.campaign"
  }
];
