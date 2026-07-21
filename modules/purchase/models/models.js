// Odoo 模块: purchase
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "purchase_vendor_bill_id": {
        "type": "many2one",
        "label": "purchase.bill.union"
      },
      "purchase_id": {
        "type": "many2one",
        "label": "purchase.order"
      },
      "purchase_order_count": {
        "type": "integer",
        "label": "_compute_origin_po_count"
      },
      "purchase_order_name": {
        "type": "char",
        "label": "_compute_purchase_order_name"
      },
      "is_purchase_matched": {
        "type": "boolean",
        "label": "_compute_is_purchase_matched"
      },
      "purchase_warning_text": {
        "type": "text",
        "label": "purchase_warning_text"
      }
    },
    "_inherit": "account.move"
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
      "purchase_line_id": {
        "type": "many2one",
        "label": "purchase.order.line"
      },
      "purchase_order_id": {
        "type": "many2one",
        "label": "purchase.order"
      },
      "purchase_line_warn_msg": {
        "type": "text",
        "label": "_compute_purchase_line_warn_msg"
      }
    },
    "_inherit": "account.move.line"
  },
  {
    "_name": "accountanalyticaccount",
    "_description": "accountanalyticaccount",
    "_auto": true,
    "_fields": {
      "purchase_order_count": {
        "type": "integer",
        "label": "Purchase Order Count"
      }
    },
    "_inherit": "account.analytic.account"
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
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "purchased_product_qty": {
        "type": "float",
        "label": "_compute_purchased_product_qty"
      },
      "purchase_method": {
        "type": "selection",
        "label": "purchase_method"
      },
      "purchase_line_warn_msg": {
        "type": "text",
        "label": "Message for Purchase Order Line"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "purchased_product_qty": {
        "type": "float",
        "label": "_compute_purchased_product_qty"
      },
      "is_in_purchase_order": {
        "type": "boolean",
        "label": "is_in_purchase_order"
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "purchase.bill.line.match",
    "_description": "Purchase Line and Vendor Bill line matching view",
    "_auto": true,
    "_fields": {
      "pol_id": {
        "type": "many2one",
        "label": "purchase.order.line"
      },
      "aml_id": {
        "type": "many2one",
        "label": "account.move.line"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product"
      },
      "line_qty": {
        "type": "float",
        "label": "line_qty"
      },
      "line_uom_id": {
        "type": "many2one",
        "label": "uom.uom"
      },
      "qty_invoiced": {
        "type": "float",
        "label": "qty_invoiced"
      },
      "qty_to_invoice": {
        "type": "float",
        "label": "Qty to invoice"
      },
      "purchase_order_id": {
        "type": "many2one",
        "label": "purchase.order"
      },
      "account_move_id": {
        "type": "many2one",
        "label": "account.move"
      },
      "line_amount_untaxed": {
        "type": "monetary",
        "label": "line_amount_untaxed"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "state": {
        "type": "char",
        "label": "state"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "uom.uom"
      },
      "product_uom_qty": {
        "type": "float",
        "label": "_compute_product_uom_qty"
      },
      "product_uom_price": {
        "type": "float",
        "label": "_compute_product_uom_price"
      },
      "billed_amount_untaxed": {
        "type": "monetary",
        "label": "_compute_amount_untaxed_fields"
      },
      "purchase_amount_untaxed": {
        "type": "monetary",
        "label": "_compute_amount_untaxed_fields"
      },
      "reference": {
        "type": "char",
        "label": "_compute_reference"
      }
    }
  },
  {
    "_name": "purchase.order",
    "_description": "Purchase Order",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Order Reference",
        "required": true
      },
      "priority": {
        "type": "selection",
        "label": "priority"
      },
      "origin": {
        "type": "char",
        "label": "Source"
      },
      "partner_ref": {
        "type": "char",
        "label": "Vendor Reference"
      },
      "date_order": {
        "type": "datetime",
        "label": "Order Deadline",
        "required": true
      },
      "date_approve": {
        "type": "datetime",
        "label": "Confirmation Date"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "dest_address_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "locked": {
        "type": "boolean",
        "label": "locked"
      },
      "lock_confirmed_po": {
        "type": "selection",
        "label": "company_id.po_lock"
      },
      "order_line": {
        "type": "one2many",
        "label": "purchase.order.line"
      },
      "acknowledged": {
        "type": "boolean",
        "label": "acknowledged"
      },
      "note": {
        "type": "html",
        "label": "Terms and Conditions"
      },
      "partner_bill_count": {
        "type": "integer",
        "label": "partner_id.supplier_invoice_count"
      },
      "invoice_count": {
        "type": "integer",
        "label": "_compute_invoice"
      },
      "invoice_ids": {
        "type": "many2many",
        "label": "account.move"
      },
      "invoice_status": {
        "type": "selection",
        "label": "invoice_status"
      },
      "date_planned": {
        "type": "datetime",
        "label": "date_planned"
      },
      "date_calendar_start": {
        "type": "datetime",
        "label": "_compute_date_calendar_start"
      },
      "amount_untaxed": {
        "type": "monetary",
        "label": "Untaxed Amount"
      },
      "tax_totals": {
        "type": "text",
        "label": "_compute_tax_totals"
      },
      "amount_tax": {
        "type": "monetary",
        "label": "Taxes"
      },
      "amount_total": {
        "type": "monetary",
        "label": "Total"
      },
      "amount_total_cc": {
        "type": "monetary",
        "label": "Total in currency"
      },
      "fiscal_position_id": {
        "type": "many2one",
        "label": "account.fiscal.position"
      },
      "tax_country_id": {
        "type": "many2one",
        "label": "tax_country_id"
      },
      "tax_calculation_rounding_method": {
        "type": "selection",
        "label": "tax_calculation_rounding_method"
      },
      "payment_term_id": {
        "type": "many2one",
        "label": "account.payment.term"
      },
      "incoterm_id": {
        "type": "many2one",
        "label": "account.incoterms"
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "company_currency_id": {
        "type": "many2one",
        "label": "company_id.currency_id"
      },
      "country_code": {
        "type": "char",
        "label": "company_id.account_fiscal_country_id.code"
      },
      "company_price_include": {
        "type": "selection",
        "label": "company_id.account_price_include"
      },
      "currency_rate": {
        "type": "float",
        "label": "currency_rate"
      },
      "duplicated_order_ids": {
        "type": "many2many",
        "label": "purchase.order"
      },
      "receipt_reminder_email": {
        "type": "boolean",
        "label": "Receipt Reminder Email"
      },
      "reminder_date_before_receipt": {
        "type": "integer",
        "label": "Days Before Receipt"
      },
      "is_late": {
        "type": "boolean",
        "label": "Is Late"
      },
      "show_comparison": {
        "type": "boolean",
        "label": "Show Comparison"
      },
      "purchase_warning_text": {
        "type": "text",
        "label": "purchase_warning_text"
      }
    }
  },
  {
    "_name": "purchase.order.line",
    "_description": "Purchase Order Line",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "text",
        "label": "name"
      },
      "translated_product_name": {
        "type": "text",
        "label": "_compute_translated_product_name"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "product_qty": {
        "type": "float",
        "label": "Quantity",
        "required": true
      },
      "product_uom_qty": {
        "type": "float",
        "label": "Total Quantity"
      },
      "date_planned": {
        "type": "datetime",
        "label": "date_planned"
      },
      "discount": {
        "type": "float",
        "label": "discount"
      },
      "tax_ids": {
        "type": "many2many",
        "label": "account.tax"
      },
      "allowed_uom_ids": {
        "type": "many2many",
        "label": "uom.uom"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "uom.uom"
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product",
        "default": true
      },
      "product_type": {
        "type": "selection",
        "label": "product_id.type"
      },
      "price_unit": {
        "type": "float",
        "label": "price_unit"
      },
      "price_unit_product_uom": {
        "type": "float",
        "label": "price_unit_product_uom"
      },
      "price_unit_discounted": {
        "type": "float",
        "label": "Unit Price (Discounted)"
      },
      "price_subtotal": {
        "type": "monetary",
        "label": "_compute_amount"
      },
      "price_total": {
        "type": "monetary",
        "label": "_compute_amount"
      },
      "price_tax": {
        "type": "float",
        "label": "_compute_amount"
      },
      "order_id": {
        "type": "many2one",
        "label": "purchase.order",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "state": {
        "type": "selection",
        "label": "order_id.state"
      },
      "invoice_lines": {
        "type": "one2many",
        "label": "account.move.line"
      },
      "qty_invoiced": {
        "type": "float",
        "label": "_compute_qty_invoiced"
      },
      "qty_received_method": {
        "type": "selection",
        "label": "manual"
      },
      "qty_received": {
        "type": "float",
        "label": "Received Qty"
      },
      "qty_received_manual": {
        "type": "float",
        "label": "Manual Received Qty"
      },
      "qty_to_invoice": {
        "type": "float",
        "label": "_compute_qty_invoiced"
      },
      "qty_received_at_date": {
        "type": "float",
        "label": "qty_received_at_date"
      },
      "qty_invoiced_at_date": {
        "type": "float",
        "label": "qty_invoiced_at_date"
      },
      "amount_to_invoice_at_date": {
        "type": "float",
        "label": "Amount"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "currency_id": {
        "type": "many2one",
        "label": "order_id.currency_id"
      },
      "date_order": {
        "type": "datetime",
        "label": "order_id.date_order"
      },
      "date_approve": {
        "type": "datetime",
        "label": "order_id.date_approve"
      },
      "tax_calculation_rounding_method": {
        "type": "selection",
        "label": "tax_calculation_rounding_method"
      },
      "display_type": {
        "type": "selection",
        "label": "display_type"
      },
      "is_downpayment": {
        "type": "boolean",
        "label": "is_downpayment"
      },
      "selected_seller_id": {
        "type": "many2one",
        "label": "product.supplierinfo"
      },
      "product_template_attribute_value_ids": {
        "type": "many2many",
        "label": "product_id.product_template_attribute_value_ids"
      },
      "product_no_variant_attribute_value_ids": {
        "type": "many2many",
        "label": "product.template.attribute.value"
      },
      "purchase_line_warn_msg": {
        "type": "text",
        "label": "_compute_purchase_line_warn_msg"
      },
      "parent_id": {
        "type": "many2one",
        "label": "parent_id"
      },
      "technical_price_unit": {
        "type": "float",
        "label": "Technical field for price computation"
      }
    }
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "po_lock": {
        "type": "selection",
        "label": "po_lock"
      },
      "po_double_validation": {
        "type": "selection",
        "label": "po_double_validation"
      },
      "po_double_validation_amount": {
        "type": "monetary",
        "label": "Double validation amount"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "property_purchase_currency_id": {
        "type": "many2one",
        "label": "property_purchase_currency_id"
      },
      "purchase_order_count": {
        "type": "integer",
        "label": "purchase_order_count"
      },
      "purchase_warn_msg": {
        "type": "text",
        "label": "Message for Purchase Order"
      },
      "receipt_reminder_email": {
        "type": "boolean",
        "label": "Receipt Reminder"
      },
      "reminder_date_before_receipt": {
        "type": "integer",
        "label": "Days Before Receipt"
      },
      "buyer_id": {
        "type": "many2one",
        "label": "res.users"
      }
    },
    "_inherit": "res.partner"
  }
];
