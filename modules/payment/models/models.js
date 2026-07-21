// Odoo 模块: payment
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "payment.method",
    "_description": "Payment Method",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "code": {
        "type": "char",
        "label": "code"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "primary_payment_method_id": {
        "type": "many2one",
        "label": "primary_payment_method_id"
      },
      "brand_ids": {
        "type": "one2many",
        "label": "brand_ids"
      },
      "is_primary": {
        "type": "boolean",
        "label": "is_primary"
      },
      "provider_ids": {
        "type": "many2many",
        "label": "provider_ids"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "image": {
        "type": "text",
        "label": "image"
      },
      "image_payment_form": {
        "type": "text",
        "label": "image_payment_form"
      },
      "support_tokenization": {
        "type": "boolean",
        "label": "support_tokenization"
      },
      "support_express_checkout": {
        "type": "boolean",
        "label": "support_express_checkout"
      },
      "support_manual_capture": {
        "type": "selection",
        "label": "support_manual_capture"
      },
      "support_refund": {
        "type": "selection",
        "label": "support_refund"
      },
      "supported_country_ids": {
        "type": "many2many",
        "label": "supported_country_ids"
      },
      "supported_currency_ids": {
        "type": "many2many",
        "label": "supported_currency_ids"
      }
    }
  },
  {
    "_name": "payment.provider",
    "_description": "Payment Provider",
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
      "code": {
        "type": "selection",
        "label": "code"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "is_published": {
        "type": "boolean",
        "label": "is_published"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "main_currency_id": {
        "type": "many2one",
        "label": "main_currency_id"
      },
      "payment_method_ids": {
        "type": "many2many",
        "label": "payment_method_ids"
      },
      "allow_tokenization": {
        "type": "boolean",
        "label": "allow_tokenization"
      },
      "capture_manually": {
        "type": "boolean",
        "label": "capture_manually"
      },
      "allow_express_checkout": {
        "type": "boolean",
        "label": "allow_express_checkout"
      },
      "redirect_form_view_id": {
        "type": "many2one",
        "label": "redirect_form_view_id"
      },
      "inline_form_view_id": {
        "type": "many2one",
        "label": "inline_form_view_id"
      },
      "token_inline_form_view_id": {
        "type": "many2one",
        "label": "token_inline_form_view_id"
      },
      "express_checkout_form_view_id": {
        "type": "many2one",
        "label": "express_checkout_form_view_id"
      },
      "available_country_ids": {
        "type": "many2many",
        "label": "available_country_ids"
      },
      "available_currency_ids": {
        "type": "many2many",
        "label": "available_currency_ids"
      },
      "maximum_amount": {
        "type": "monetary",
        "label": "maximum_amount"
      },
      "pre_msg": {
        "type": "html",
        "label": "pre_msg"
      },
      "pending_msg": {
        "type": "html",
        "label": "pending_msg"
      },
      "auth_msg": {
        "type": "html",
        "label": "auth_msg"
      },
      "done_msg": {
        "type": "html",
        "label": "done_msg"
      },
      "cancel_msg": {
        "type": "html",
        "label": "cancel_msg"
      },
      "support_tokenization": {
        "type": "boolean",
        "label": "support_tokenization"
      },
      "support_manual_capture": {
        "type": "selection",
        "label": "support_manual_capture"
      },
      "support_express_checkout": {
        "type": "boolean",
        "label": "support_express_checkout"
      },
      "support_refund": {
        "type": "selection",
        "label": "support_refund"
      },
      "image_128": {
        "type": "text",
        "label": "Image"
      },
      "color": {
        "type": "integer",
        "label": "color"
      },
      "module_id": {
        "type": "many2one",
        "label": "Corresponding Module"
      },
      "module_state": {
        "type": "selection",
        "label": "Installation State"
      },
      "module_to_buy": {
        "type": "boolean",
        "label": "Odoo Enterprise Module"
      }
    }
  },
  {
    "_name": "payment.token",
    "_description": "Payment Token",
    "_auto": true,
    "_fields": {
      "provider_id": {
        "type": "many2one",
        "label": "Provider",
        "required": true
      },
      "provider_code": {
        "type": "selection",
        "label": "Provider Code"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "payment_method_id": {
        "type": "many2one",
        "label": "payment_method_id"
      },
      "payment_method_code": {
        "type": "char",
        "label": "payment_method_code"
      },
      "payment_details": {
        "type": "char",
        "label": "payment_details"
      },
      "partner_id": {
        "type": "many2one",
        "label": "Partner",
        "required": true
      },
      "provider_ref": {
        "type": "char",
        "label": "provider_ref"
      },
      "transaction_ids": {
        "type": "one2many",
        "label": "transaction_ids"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      }
    }
  },
  {
    "_name": "payment.transaction",
    "_description": "Payment Transaction",
    "_auto": true,
    "_fields": {
      "provider_id": {
        "type": "many2one",
        "label": "provider_id"
      },
      "provider_code": {
        "type": "selection",
        "label": "Provider Code"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "payment_method_id": {
        "type": "many2one",
        "label": "payment_method_id"
      },
      "payment_method_code": {
        "type": "char",
        "label": "payment_method_code"
      },
      "primary_payment_method_id": {
        "type": "many2one",
        "label": "primary_payment_method_id"
      },
      "reference": {
        "type": "char",
        "label": "reference"
      },
      "provider_reference": {
        "type": "char",
        "label": "provider_reference"
      },
      "amount": {
        "type": "monetary",
        "label": "amount"
      },
      "currency_id": {
        "type": "many2one",
        "label": "currency_id"
      },
      "token_id": {
        "type": "many2one",
        "label": "token_id"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "state_message": {
        "type": "text",
        "label": "state_message"
      },
      "last_state_change": {
        "type": "datetime",
        "label": "last_state_change"
      },
      "operation": {
        "type": "selection",
        "label": "operation"
      },
      "is_live": {
        "type": "boolean",
        "label": "is_live"
      },
      "source_transaction_id": {
        "type": "many2one",
        "label": "source_transaction_id"
      },
      "child_transaction_ids": {
        "type": "one2many",
        "label": "child_transaction_ids"
      },
      "refunds_count": {
        "type": "integer",
        "label": "Refunds Count"
      },
      "is_post_processed": {
        "type": "boolean",
        "label": "is_post_processed"
      },
      "tokenize": {
        "type": "boolean",
        "label": "tokenize"
      },
      "landing_route": {
        "type": "char",
        "label": "landing_route"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "partner_name": {
        "type": "char",
        "label": "Partner Name"
      },
      "partner_lang": {
        "type": "selection",
        "label": "Language"
      },
      "partner_email": {
        "type": "char",
        "label": "Email"
      },
      "partner_address": {
        "type": "char",
        "label": "Address"
      },
      "partner_zip": {
        "type": "char",
        "label": "Zip"
      },
      "partner_city": {
        "type": "char",
        "label": "City"
      },
      "partner_state_id": {
        "type": "many2one",
        "label": "State"
      },
      "partner_country_id": {
        "type": "many2one",
        "label": "Country"
      },
      "partner_phone": {
        "type": "char",
        "label": "Phone"
      }
    }
  },
  {
    "_name": "rescountry",
    "_description": "rescountry",
    "_auto": true,
    "_fields": {
      "is_mercado_pago_supported_country": {
        "type": "boolean",
        "label": "_compute_provider_support"
      },
      "is_stripe_supported_country": {
        "type": "boolean",
        "label": "_compute_provider_support"
      }
    },
    "_inherit": "res.country"
  }
];
