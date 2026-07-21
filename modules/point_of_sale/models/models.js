// Odoo 模块: point_of_sale
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountbankstatementline",
    "_description": "accountbankstatementline",
    "_auto": true,
    "_fields": {
      "pos_session_id": {
        "type": "many2one",
        "label": "pos.session"
      }
    },
    "_inherit": "account.bank.statement.line"
  },
  {
    "_name": "accountjournal",
    "_description": "accountjournal",
    "_auto": true,
    "_fields": {
      "pos_payment_method_ids": {
        "type": "one2many",
        "label": "pos.payment.method"
      }
    },
    "_inherit": "account.journal"
  },
  {
    "_name": "account.move",
    "_description": "account.move",
    "_auto": true,
    "_fields": {
      "pos_order_ids": {
        "type": "one2many",
        "label": "pos.order"
      },
      "pos_payment_ids": {
        "type": "one2many",
        "label": "pos.payment"
      },
      "pos_refunded_invoice_ids": {
        "type": "many2many",
        "label": "account.move"
      },
      "reversed_pos_order_id": {
        "type": "many2one",
        "label": "pos.order"
      },
      "pos_session_ids": {
        "type": "one2many",
        "label": "pos.session"
      },
      "pos_order_count": {
        "type": "integer",
        "label": "_compute_origin_pos_count"
      }
    }
  },
  {
    "_name": "accountpayment",
    "_description": "accountpayment",
    "_auto": true,
    "_fields": {
      "pos_payment_method_id": {
        "type": "many2one",
        "label": "pos.payment.method"
      },
      "force_outstanding_account_id": {
        "type": "many2one",
        "label": "account.account"
      },
      "pos_session_id": {
        "type": "many2one",
        "label": "pos.session"
      }
    },
    "_inherit": "account.payment"
  },
  {
    "_name": "barcoderule",
    "_description": "barcoderule",
    "_auto": true,
    "_fields": {
      "type": {
        "type": "selection",
        "label": "type"
      }
    },
    "_inherit": "barcode.rule"
  },
  {
    "_name": "digestdigest",
    "_description": "digestdigest",
    "_auto": true,
    "_fields": {
      "kpi_pos_total": {
        "type": "boolean",
        "label": "POS Sales"
      },
      "kpi_pos_total_value": {
        "type": "monetary",
        "label": "_compute_kpi_pos_total_value"
      }
    },
    "_inherit": "digest.digest"
  },
  {
    "_name": "pos.bill",
    "_description": "Coins/Bills",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "value": {
        "type": "float",
        "label": "Value",
        "required": true
      },
      "pos_config_ids": {
        "type": "many2many",
        "label": "pos.config"
      }
    }
  },
  {
    "_name": "pos.category",
    "_description": "Point of Sale Category",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Category Name",
        "required": true
      },
      "parent_id": {
        "type": "many2one",
        "label": "pos.category"
      },
      "child_ids": {
        "type": "one2many",
        "label": "pos.category"
      },
      "sequence": {
        "type": "integer",
        "label": "Gives the sequence order when displaying a list of product categories."
      },
      "image_512": {
        "type": "text",
        "label": "Image"
      },
      "image_128": {
        "type": "text",
        "label": "Image 128"
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "hour_until": {
        "type": "float",
        "label": "Availability Until"
      },
      "hour_after": {
        "type": "float",
        "label": "Availability After"
      },
      "has_image": {
        "type": "boolean",
        "label": "_compute_has_image"
      }
    }
  },
  {
    "_name": "pos.config",
    "_description": "Point of Sale Configuration",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Point of Sale",
        "required": true
      },
      "printer_ids": {
        "type": "many2many",
        "label": "pos.printer"
      },
      "is_order_printer": {
        "type": "boolean",
        "label": "Order Printer"
      },
      "is_installed_account_accountant": {
        "type": "boolean",
        "label": "Is the Full Accounting Installed"
      },
      "picking_type_id": {
        "type": "many2one",
        "label": "picking_type_id"
      },
      "journal_id": {
        "type": "many2one",
        "label": "journal_id"
      },
      "invoice_journal_id": {
        "type": "many2one",
        "label": "invoice_journal_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "order_seq_id": {
        "type": "many2one",
        "label": "ir.sequence"
      },
      "order_backend_seq_id": {
        "type": "many2one",
        "label": "ir.sequence"
      },
      "order_line_seq_id": {
        "type": "many2one",
        "label": "ir.sequence"
      },
      "device_seq_id": {
        "type": "many2one",
        "label": "ir.sequence"
      },
      "iface_cashdrawer": {
        "type": "boolean",
        "label": "Cashdrawer"
      },
      "iface_electronic_scale": {
        "type": "boolean",
        "label": "Electronic Scale"
      },
      "iface_print_via_proxy": {
        "type": "boolean",
        "label": "Print via Proxy"
      },
      "iface_scan_via_proxy": {
        "type": "boolean",
        "label": "Scan via Proxy"
      },
      "iface_big_scrollbars": {
        "type": "boolean",
        "label": "Large Scrollbars"
      },
      "iface_group_by_categ": {
        "type": "boolean",
        "label": "Group products by categories"
      },
      "iface_print_auto": {
        "type": "boolean",
        "label": "Automatic Receipt Printing",
        "default": false
      },
      "iface_print_skip_screen": {
        "type": "boolean",
        "label": "Skip Preview Screen",
        "default": true
      },
      "iface_tax_included": {
        "type": "selection",
        "label": "subtotal",
        "required": true,
        "default": "total"
      },
      "iface_available_categ_ids": {
        "type": "many2many",
        "label": "pos.category"
      },
      "customer_display_bg_img": {
        "type": "text",
        "label": "Background Image"
      },
      "customer_display_bg_img_name": {
        "type": "char",
        "label": "Background Image Name"
      },
      "restrict_price_control": {
        "type": "boolean",
        "label": "Restrict Price Modifications to Managers"
      },
      "is_margins_costs_accessible_to_every_user": {
        "type": "boolean",
        "label": "Margins & Costs",
        "default": false
      },
      "cash_control": {
        "type": "boolean",
        "label": "Advanced Cash Control"
      },
      "set_maximum_difference": {
        "type": "boolean",
        "label": "Set Maximum Difference"
      },
      "receipt_header": {
        "type": "text",
        "label": "Receipt Header"
      },
      "receipt_footer": {
        "type": "text",
        "label": "Receipt Footer"
      },
      "basic_receipt": {
        "type": "boolean",
        "label": "Basic Receipt"
      },
      "proxy_ip": {
        "type": "char",
        "label": "IP Address"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "uuid": {
        "type": "char",
        "label": "uuid"
      },
      "session_ids": {
        "type": "one2many",
        "label": "pos.session"
      },
      "current_session_id": {
        "type": "many2one",
        "label": "pos.session"
      },
      "current_session_state": {
        "type": "char",
        "label": "_compute_current_session"
      },
      "number_of_rescue_session": {
        "type": "integer",
        "label": "Number of Rescue Session"
      },
      "last_session_closing_cash": {
        "type": "float",
        "label": "_compute_last_session"
      },
      "last_session_closing_date": {
        "type": "date",
        "label": "_compute_last_session"
      },
      "pos_session_username": {
        "type": "char",
        "label": "_compute_current_session_user"
      },
      "pos_session_state": {
        "type": "char",
        "label": "_compute_current_session_user"
      },
      "pos_session_duration": {
        "type": "char",
        "label": "_compute_current_session_user"
      },
      "pricelist_id": {
        "type": "many2one",
        "label": "product.pricelist"
      },
      "available_pricelist_ids": {
        "type": "many2many",
        "label": "product.pricelist"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "group_pos_manager_id": {
        "type": "many2one",
        "label": "res.groups"
      },
      "group_pos_user_id": {
        "type": "many2one",
        "label": "res.groups"
      },
      "iface_tipproduct": {
        "type": "boolean",
        "label": "Product tips"
      },
      "tip_product_id": {
        "type": "many2one",
        "label": "product.product"
      },
      "fiscal_position_ids": {
        "type": "many2many",
        "label": "account.fiscal.position"
      },
      "default_fiscal_position_id": {
        "type": "many2one",
        "label": "account.fiscal.position"
      },
      "default_bill_ids": {
        "type": "many2many",
        "label": "pos.bill"
      },
      "use_pricelist": {
        "type": "boolean",
        "label": "Use a pricelist."
      },
      "use_presets": {
        "type": "boolean",
        "label": "Use Presets"
      },
      "default_preset_id": {
        "type": "many2one",
        "label": "pos.preset"
      },
      "available_preset_ids": {
        "type": "many2many",
        "label": "pos.preset"
      },
      "tax_regime_selection": {
        "type": "boolean",
        "label": "Tax Regime Selection value"
      },
      "limit_categories": {
        "type": "boolean",
        "label": "Restrict Categories"
      },
      "module_pos_restaurant": {
        "type": "boolean",
        "label": "Is a Bar/Restaurant"
      },
      "module_pos_avatax": {
        "type": "boolean",
        "label": "AvaTax PoS Integration"
      },
      "module_pos_discount": {
        "type": "boolean",
        "label": "Global Discounts"
      },
      "module_pos_appointment": {
        "type": "boolean",
        "label": "Online Booking"
      },
      "is_posbox": {
        "type": "boolean",
        "label": "PosBox"
      },
      "is_header_or_footer": {
        "type": "boolean",
        "label": "Custom Header & Footer"
      },
      "module_pos_hr": {
        "type": "boolean",
        "label": "Show employee login screen"
      },
      "amount_authorized_diff": {
        "type": "float",
        "label": "Amount Authorized Difference"
      },
      "payment_method_ids": {
        "type": "many2many",
        "label": "pos.payment.method"
      },
      "company_has_template": {
        "type": "boolean",
        "label": "Company has chart of accounts"
      },
      "current_user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "other_devices": {
        "type": "boolean",
        "label": "Other Devices"
      },
      "rounding_method": {
        "type": "many2one",
        "label": "account.cash.rounding"
      },
      "cash_rounding": {
        "type": "boolean",
        "label": "Cash Rounding"
      },
      "only_round_cash_method": {
        "type": "boolean",
        "label": "Only apply rounding on cash"
      },
      "has_active_session": {
        "type": "boolean",
        "label": "_compute_current_session"
      },
      "manual_discount": {
        "type": "boolean",
        "label": "Line Discounts",
        "default": true
      },
      "ship_later": {
        "type": "boolean",
        "label": "Ship Later"
      },
      "warehouse_id": {
        "type": "many2one",
        "label": "stock.warehouse"
      },
      "route_id": {
        "type": "many2one",
        "label": "stock.route"
      },
      "picking_policy": {
        "type": "selection",
        "label": "picking_policy"
      },
      "auto_validate_terminal_payment": {
        "type": "boolean",
        "label": "Automatically validates orders paid with a payment terminal.",
        "default": true
      },
      "trusted_config_ids": {
        "type": "many2many",
        "label": "pos.config",
        "relation": "pos_config_trust_relation"
      },
      "access_token": {
        "type": "char",
        "label": "Access Token"
      },
      "show_product_images": {
        "type": "boolean",
        "label": "Show Product Images",
        "default": true
      },
      "show_category_images": {
        "type": "boolean",
        "label": "Show Category Images",
        "default": true
      },
      "note_ids": {
        "type": "many2many",
        "label": "pos.note"
      },
      "module_pos_sms": {
        "type": "boolean",
        "label": "SMS Enabled"
      },
      "is_closing_entry_by_product": {
        "type": "boolean",
        "label": "is_closing_entry_by_product"
      },
      "order_edit_tracking": {
        "type": "boolean",
        "label": "Track orders edits",
        "default": false
      },
      "last_data_change": {
        "type": "datetime",
        "label": "Last Write Date"
      },
      "fallback_nomenclature_id": {
        "type": "many2one",
        "label": "barcode.nomenclature"
      },
      "epson_printer_ip": {
        "type": "char",
        "label": "epson_printer_ip"
      },
      "use_fast_payment": {
        "type": "boolean",
        "label": "Fast Payment Validation"
      },
      "fast_payment_method_ids": {
        "type": "many2many",
        "label": "fast_payment_method_ids"
      },
      "statistics_for_current_session": {
        "type": "char",
        "label": "Session Statistics"
      }
    }
  },
  {
    "_name": "pos.note",
    "_description": "PoS Note",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "color": {
        "type": "integer",
        "label": "Color"
      }
    }
  },
  {
    "_name": "pos.order",
    "_description": "Point of Sale Orders",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Order Ref",
        "required": true,
        "default": "/"
      },
      "last_order_preparation_change": {
        "type": "char",
        "label": "Last preparation change"
      },
      "date_order": {
        "type": "datetime",
        "label": "Date"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "amount_difference": {
        "type": "monetary",
        "label": "Difference"
      },
      "amount_tax": {
        "type": "monetary",
        "label": "Taxes",
        "required": true
      },
      "amount_total": {
        "type": "monetary",
        "label": "Total",
        "required": true
      },
      "amount_paid": {
        "type": "monetary",
        "label": "Paid",
        "required": true
      },
      "amount_return": {
        "type": "monetary",
        "label": "Returned",
        "required": true
      },
      "margin": {
        "type": "monetary",
        "label": "Margin"
      },
      "margin_percent": {
        "type": "float",
        "label": "Margin (%)"
      },
      "is_total_cost_computed": {
        "type": "boolean",
        "label": "_compute_is_total_cost_computed"
      },
      "lines": {
        "type": "one2many",
        "label": "pos.order.line"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "country_code": {
        "type": "char",
        "label": "company_id.account_fiscal_country_id.code"
      },
      "pricelist_id": {
        "type": "many2one",
        "label": "product.pricelist"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner",
        "default": true
      },
      "sequence_number": {
        "type": "integer",
        "label": "Sequence Number"
      },
      "session_id": {
        "type": "many2one",
        "label": "pos.session"
      },
      "config_id": {
        "type": "many2one",
        "label": "pos.config"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "currency_rate": {
        "type": "float",
        "label": "Currency Rate"
      },
      "is_refund": {
        "type": "boolean",
        "label": "Is Refund",
        "default": false
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "account_move": {
        "type": "many2one",
        "label": "account.move"
      },
      "picking_ids": {
        "type": "one2many",
        "label": "stock.picking"
      },
      "picking_count": {
        "type": "integer",
        "label": "_compute_picking_count"
      },
      "failed_pickings": {
        "type": "boolean",
        "label": "_compute_picking_count"
      },
      "picking_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      },
      "stock_reference_ids": {
        "type": "many2many",
        "label": "stock.reference"
      },
      "preset_id": {
        "type": "many2one",
        "label": "pos.preset"
      },
      "floating_order_name": {
        "type": "char",
        "label": "Order Name"
      },
      "general_customer_note": {
        "type": "text",
        "label": "General Customer Note"
      },
      "internal_note": {
        "type": "text",
        "label": "Internal Note"
      },
      "nb_print": {
        "type": "integer",
        "label": "Number of Print"
      },
      "pos_reference": {
        "type": "char",
        "label": "Receipt Number"
      },
      "sale_journal": {
        "type": "many2one",
        "label": "account.journal"
      },
      "fiscal_position_id": {
        "type": "many2one",
        "label": "fiscal_position_id"
      },
      "payment_ids": {
        "type": "one2many",
        "label": "pos.payment"
      },
      "session_move_id": {
        "type": "many2one",
        "label": "account.move"
      },
      "to_invoice": {
        "type": "boolean",
        "label": "To invoice"
      },
      "shipping_date": {
        "type": "date",
        "label": "Shipping Date"
      },
      "preset_time": {
        "type": "datetime",
        "label": "Hour"
      },
      "is_invoiced": {
        "type": "boolean",
        "label": "Is Invoiced"
      },
      "is_tipped": {
        "type": "boolean",
        "label": "Is this already tipped?"
      },
      "tip_amount": {
        "type": "monetary",
        "label": "Tip Amount"
      },
      "refund_orders_count": {
        "type": "integer",
        "label": "Number of Refund Orders"
      },
      "refunded_order_id": {
        "type": "many2one",
        "label": "pos.order"
      },
      "has_refundable_lines": {
        "type": "boolean",
        "label": "Has Refundable Lines"
      },
      "ticket_code": {
        "type": "char",
        "label": "5 digits alphanumeric code to be used by portal user to request an invoice"
      },
      "tracking_number": {
        "type": "char",
        "label": "Order Number"
      },
      "uuid": {
        "type": "char",
        "label": "Uuid"
      },
      "email": {
        "type": "char",
        "label": "Email"
      },
      "mobile": {
        "type": "char",
        "label": "Mobile"
      },
      "is_edited": {
        "type": "boolean",
        "label": "Edited"
      },
      "has_deleted_line": {
        "type": "boolean",
        "label": "Has Deleted Line"
      },
      "order_edit_tracking": {
        "type": "boolean",
        "label": "config_id.order_edit_tracking"
      },
      "available_payment_method_ids": {
        "type": "many2many",
        "label": "pos.payment.method"
      },
      "invoice_status": {
        "type": "selection",
        "label": "invoice_status"
      },
      "reversed_move_ids": {
        "type": "one2many",
        "label": "reversed_move_ids"
      },
      "source": {
        "type": "selection",
        "label": "Origin",
        "default": "pos"
      }
    }
  },
  {
    "_name": "pos.order.line",
    "_description": "Point of Sale Order Lines",
    "_auto": true,
    "_fields": {
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "name": {
        "type": "char",
        "label": "Line No",
        "required": true
      },
      "notice": {
        "type": "char",
        "label": "Discount Notice"
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product",
        "required": true,
        "default": true
      },
      "attribute_value_ids": {
        "type": "many2many",
        "label": "product.template.attribute.value"
      },
      "custom_attribute_value_ids": {
        "type": "one2many",
        "label": "custom_attribute_value_ids"
      },
      "price_unit": {
        "type": "float",
        "label": "Unit Price"
      },
      "qty": {
        "type": "float",
        "label": "Quantity"
      },
      "price_subtotal": {
        "type": "monetary",
        "label": "Tax Excl."
      },
      "price_subtotal_incl": {
        "type": "monetary",
        "label": "Tax Incl."
      },
      "price_extra": {
        "type": "float",
        "label": "Price extra"
      },
      "price_type": {
        "type": "selection",
        "label": "price_type"
      },
      "margin": {
        "type": "monetary",
        "label": "Margin"
      },
      "margin_percent": {
        "type": "float",
        "label": "Margin (%)"
      },
      "total_cost": {
        "type": "float",
        "label": "Total cost"
      },
      "is_total_cost_computed": {
        "type": "boolean",
        "label": "Allows to know if the total cost has already been computed or not"
      },
      "discount": {
        "type": "float",
        "label": "Discount (%)"
      },
      "order_id": {
        "type": "many2one",
        "label": "pos.order",
        "required": true
      },
      "tax_ids": {
        "type": "many2many",
        "label": "account.tax"
      },
      "tax_ids_after_fiscal_position": {
        "type": "many2many",
        "label": "account.tax"
      },
      "pack_lot_ids": {
        "type": "one2many",
        "label": "pos.pack.operation.lot"
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "uom.uom"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "full_product_name": {
        "type": "char",
        "label": "Full Product Name"
      },
      "customer_note": {
        "type": "char",
        "label": "Customer Note"
      },
      "refund_orderline_ids": {
        "type": "one2many",
        "label": "pos.order.line"
      },
      "refunded_orderline_id": {
        "type": "many2one",
        "label": "pos.order.line"
      },
      "refunded_qty": {
        "type": "float",
        "label": "Refunded Quantity"
      },
      "uuid": {
        "type": "char",
        "label": "Uuid"
      },
      "note": {
        "type": "char",
        "label": "Product Note"
      },
      "combo_parent_id": {
        "type": "many2one",
        "label": "pos.order.line"
      },
      "combo_line_ids": {
        "type": "one2many",
        "label": "pos.order.line"
      },
      "combo_item_id": {
        "type": "many2one",
        "label": "product.combo.item"
      },
      "is_edited": {
        "type": "boolean",
        "label": "Edited",
        "default": false
      },
      "extra_tax_data": {
        "type": "char",
        "label": "extra_tax_data"
      }
    }
  },
  {
    "_name": "pos.pack.operation.lot",
    "_description": "Specify product lot/serial number in pos order line",
    "_auto": true,
    "_fields": {
      "pos_order_line_id": {
        "type": "many2one",
        "label": "pos.order.line"
      },
      "order_id": {
        "type": "many2one",
        "label": "pos.order"
      },
      "lot_name": {
        "type": "char",
        "label": "Lot Name"
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product"
      }
    }
  },
  {
    "_name": "pos.payment",
    "_description": "Point of Sale Payments",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Label"
      },
      "pos_order_id": {
        "type": "many2one",
        "label": "pos.order",
        "required": true
      },
      "amount": {
        "type": "monetary",
        "label": "Amount",
        "required": true
      },
      "payment_method_id": {
        "type": "many2one",
        "label": "pos.payment.method",
        "required": true
      },
      "payment_date": {
        "type": "datetime",
        "label": "Date",
        "required": true
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "currency_rate": {
        "type": "float",
        "label": "Conversion Rate"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "session_id": {
        "type": "many2one",
        "label": "pos.session"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "card_type": {
        "type": "char",
        "label": "Type of card used"
      },
      "card_brand": {
        "type": "char",
        "label": "Brand of card"
      },
      "card_no": {
        "type": "char",
        "label": "Card Number(Last 4 Digit)"
      },
      "cardholder_name": {
        "type": "char",
        "label": "Card Owner name"
      },
      "payment_ref_no": {
        "type": "char",
        "label": "Payment reference number"
      },
      "payment_method_authcode": {
        "type": "char",
        "label": "Payment APPR Code"
      },
      "payment_method_issuer_bank": {
        "type": "char",
        "label": "Payment Issuer Bank"
      },
      "payment_method_payment_mode": {
        "type": "char",
        "label": "Payment Mode"
      },
      "transaction_id": {
        "type": "char",
        "label": "Payment Transaction ID"
      },
      "payment_status": {
        "type": "char",
        "label": "Payment Status"
      },
      "ticket": {
        "type": "char",
        "label": "Payment Receipt Info"
      },
      "is_change": {
        "type": "boolean",
        "label": "Is this payment change?",
        "default": false
      },
      "account_move_id": {
        "type": "many2one",
        "label": "account.move"
      },
      "uuid": {
        "type": "char",
        "label": "Uuid"
      }
    }
  },
  {
    "_name": "pos.payment.method",
    "_description": "Point of Sale Payment Methods",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Method",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "outstanding_account_id": {
        "type": "many2one",
        "label": "account.account"
      },
      "receivable_account_id": {
        "type": "many2one",
        "label": "account.account"
      },
      "is_cash_count": {
        "type": "boolean",
        "label": "Cash"
      },
      "journal_id": {
        "type": "many2one",
        "label": "account.journal"
      },
      "split_transactions": {
        "type": "boolean",
        "label": "split_transactions"
      },
      "open_session_ids": {
        "type": "many2many",
        "label": "pos.session"
      },
      "config_ids": {
        "type": "many2many",
        "label": "pos.config"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "default_pos_receivable_account_name": {
        "type": "char",
        "label": "company_id.account_default_pos_receivable_account_id.display_name"
      },
      "use_payment_terminal": {
        "type": "selection",
        "label": "Use a Payment Terminal"
      },
      "hide_use_payment_terminal": {
        "type": "boolean",
        "label": "_compute_hide_use_payment_terminal"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "type": {
        "type": "selection",
        "label": "cash"
      },
      "image": {
        "type": "text",
        "label": "Image"
      },
      "payment_method_type": {
        "type": "selection",
        "label": "Integration",
        "required": true,
        "default": "none"
      },
      "default_qr": {
        "type": "char",
        "label": "_compute_qr"
      },
      "qr_code_method": {
        "type": "selection",
        "label": "qr_code_method"
      },
      "hide_qr_code_method": {
        "type": "boolean",
        "label": "_compute_hide_qr_code_method"
      }
    }
  },
  {
    "_name": "pos.preset",
    "_description": "Easily load a set of configuration options",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Label",
        "required": true
      },
      "pricelist_id": {
        "type": "many2one",
        "label": "product.pricelist"
      },
      "fiscal_position_id": {
        "type": "many2one",
        "label": "account.fiscal.position"
      },
      "identification": {
        "type": "selection",
        "label": "none",
        "required": true,
        "default": "none"
      },
      "is_return": {
        "type": "boolean",
        "label": "Return mode",
        "default": false
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "image_512": {
        "type": "text",
        "label": "Image"
      },
      "image_128": {
        "type": "text",
        "label": "Image 128"
      },
      "has_image": {
        "type": "boolean",
        "label": "_compute_has_image"
      },
      "count_linked_orders": {
        "type": "integer",
        "label": "_compute_count_linked_orders"
      },
      "count_linked_config": {
        "type": "integer",
        "label": "_compute_count_linked_config"
      },
      "use_timing": {
        "type": "boolean",
        "label": "Manage orders by time",
        "default": false
      },
      "resource_calendar_id": {
        "type": "many2one",
        "label": "resource.calendar"
      },
      "attendance_ids": {
        "type": "one2many",
        "label": "resource_calendar_id.attendance_ids"
      },
      "slots_per_interval": {
        "type": "integer",
        "label": "Capacity"
      },
      "interval_time": {
        "type": "integer",
        "label": "Interval time (in min)"
      }
    }
  },
  {
    "_name": "pos.printer",
    "_description": "Point of Sale Printer",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Printer Name",
        "required": true,
        "default": "Printer"
      },
      "printer_type": {
        "type": "selection",
        "label": "printer_type"
      },
      "proxy_ip": {
        "type": "char",
        "label": "Proxy IP Address"
      },
      "product_categories_ids": {
        "type": "many2many",
        "label": "pos.category"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "pos_config_ids": {
        "type": "many2many",
        "label": "pos.config"
      },
      "epson_printer_ip": {
        "type": "char",
        "label": "epson_printer_ip"
      }
    }
  },
  {
    "_name": "pos.session",
    "_description": "Point of Sale Session",
    "_auto": true,
    "_fields": {
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "config_id": {
        "type": "many2one",
        "label": "config_id"
      },
      "name": {
        "type": "char",
        "label": "Session ID",
        "default": "/"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "start_at": {
        "type": "datetime",
        "label": "Opening Date"
      },
      "stop_at": {
        "type": "datetime",
        "label": "Closing Date"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "opening_notes": {
        "type": "text",
        "label": "Opening Notes"
      },
      "closing_notes": {
        "type": "text",
        "label": "Closing Notes"
      },
      "cash_control": {
        "type": "boolean",
        "label": "_compute_cash_control"
      },
      "cash_journal_id": {
        "type": "many2one",
        "label": "account.journal"
      },
      "cash_register_balance_end_real": {
        "type": "monetary",
        "label": "cash_register_balance_end_real"
      },
      "cash_register_balance_start": {
        "type": "monetary",
        "label": "cash_register_balance_start"
      },
      "cash_register_balance_end": {
        "type": "monetary",
        "label": "cash_register_balance_end"
      },
      "cash_register_difference": {
        "type": "monetary",
        "label": "cash_register_difference"
      },
      "cash_real_transaction": {
        "type": "monetary",
        "label": "Transaction"
      },
      "order_ids": {
        "type": "one2many",
        "label": "pos.order"
      },
      "order_count": {
        "type": "integer",
        "label": "_compute_order_count"
      },
      "statement_line_ids": {
        "type": "one2many",
        "label": "account.bank.statement.line"
      },
      "failed_pickings": {
        "type": "boolean",
        "label": "_compute_picking_count"
      },
      "picking_count": {
        "type": "integer",
        "label": "_compute_picking_count"
      },
      "picking_ids": {
        "type": "one2many",
        "label": "stock.picking"
      },
      "rescue": {
        "type": "boolean",
        "label": "Recovery Session"
      },
      "move_id": {
        "type": "many2one",
        "label": "account.move"
      },
      "payment_method_ids": {
        "type": "many2many",
        "label": "pos.payment.method"
      },
      "total_payments_amount": {
        "type": "float",
        "label": "_compute_total_payments_amount"
      },
      "is_in_company_currency": {
        "type": "boolean",
        "label": "Is Using Company Currency"
      },
      "update_stock_at_closing": {
        "type": "boolean",
        "label": "Stock should be updated at closing"
      },
      "bank_payment_ids": {
        "type": "one2many",
        "label": "account.payment"
      }
    }
  },
  {
    "_name": "product.attribute.custom.value",
    "_description": "product.attribute.custom.value",
    "_auto": true,
    "_fields": {
      "pos_order_line_id": {
        "type": "many2one",
        "label": "pos.order.line"
      }
    }
  },
  {
    "_name": "product.combo",
    "_description": "product.combo",
    "_auto": true,
    "_fields": {
      "qty_max": {
        "type": "integer",
        "label": "Maximum quantity"
      },
      "qty_free": {
        "type": "integer",
        "label": "Free quantity"
      }
    }
  },
  {
    "_name": "product.tag",
    "_description": "product.tag",
    "_auto": true,
    "_fields": {
      "pos_description": {
        "type": "html",
        "label": "Description"
      },
      "has_image": {
        "type": "boolean",
        "label": "_compute_has_image"
      }
    }
  },
  {
    "_name": "product.template",
    "_description": "product.template",
    "_auto": true,
    "_fields": {
      "available_in_pos": {
        "type": "boolean",
        "label": "Available in POS",
        "default": false
      },
      "to_weight": {
        "type": "boolean",
        "label": "To Weigh With Scale"
      },
      "pos_categ_ids": {
        "type": "many2many",
        "label": "pos_categ_ids"
      },
      "public_description": {
        "type": "html",
        "label": "public_description"
      },
      "pos_optional_product_ids": {
        "type": "many2many",
        "label": "pos_optional_product_ids"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "pos_sequence": {
        "type": "integer",
        "label": "pos_sequence"
      }
    }
  },
  {
    "_name": "res.company",
    "_description": "res.company",
    "_auto": true,
    "_fields": {
      "point_of_sale_update_stock_quantities": {
        "type": "selection",
        "label": "point_of_sale_update_stock_quantities"
      },
      "point_of_sale_use_ticket_qr_code": {
        "type": "boolean",
        "label": "point_of_sale_use_ticket_qr_code"
      },
      "point_of_sale_ticket_unique_code": {
        "type": "boolean",
        "label": "point_of_sale_ticket_unique_code"
      },
      "point_of_sale_ticket_portal_url_display_mode": {
        "type": "selection",
        "label": "point_of_sale_ticket_portal_url_display_mode"
      }
    }
  },
  {
    "_name": "res.partner",
    "_description": "res.partner",
    "_auto": true,
    "_fields": {
      "pos_order_count": {
        "type": "integer",
        "label": "pos_order_count"
      },
      "pos_order_ids": {
        "type": "one2many",
        "label": "pos.order"
      },
      "pos_contact_address": {
        "type": "char",
        "label": "PoS Address"
      },
      "invoice_emails": {
        "type": "char",
        "label": "_compute_invoice_emails"
      },
      "fiscal_position_id": {
        "type": "many2one",
        "label": "fiscal_position_id"
      }
    }
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "pos_session_id": {
        "type": "many2one",
        "label": "pos.session"
      },
      "pos_order_id": {
        "type": "many2one",
        "label": "pos.order"
      }
    },
    "_inherit": "stock.picking"
  },
  {
    "_name": "stockreference",
    "_description": "stockreference",
    "_auto": true,
    "_fields": {
      "pos_order_ids": {
        "type": "many2many",
        "label": "pos_order_ids"
      }
    },
    "_inherit": "stock.reference"
  },
  {
    "_name": "stockwarehouse",
    "_description": "stockwarehouse",
    "_auto": true,
    "_fields": {
      "pos_type_id": {
        "type": "many2one",
        "label": "stock.picking.type"
      }
    },
    "_inherit": "stock.warehouse"
  },
  {
    "_name": "uom.uom",
    "_description": "uom.uom",
    "_auto": true,
    "_fields": {
      "is_pos_groupable": {
        "type": "boolean",
        "label": "Group Products in POS"
      }
    }
  }
];
