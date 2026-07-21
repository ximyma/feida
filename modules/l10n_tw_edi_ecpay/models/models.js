// Odoo 模块: l10n_tw_edi_ecpay
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "ir.attachment",
    "_description": "ir.attachment",
    "_auto": true,
    "_fields": {
      "l10n_tw_edi_file_id": {
        "type": "many2one",
        "label": "l10n_tw_edi_file_id"
      },
      "l10n_tw_edi_file": {
        "type": "text",
        "label": "l10n_tw_edi_file"
      },
      "l10n_tw_edi_ecpay_invoice_id": {
        "type": "char",
        "label": "Ecpay Invoice Number"
      },
      "l10n_tw_edi_related_number": {
        "type": "char",
        "label": "l10n_tw_edi_related_number"
      },
      "l10n_tw_edi_state": {
        "type": "selection",
        "label": "l10n_tw_edi_state"
      },
      "l10n_tw_edi_love_code": {
        "type": "char",
        "label": "Love Code"
      },
      "l10n_tw_edi_is_print": {
        "type": "boolean",
        "label": "l10n_tw_edi_is_print"
      },
      "l10n_tw_edi_carrier_type": {
        "type": "selection",
        "label": "l10n_tw_edi_carrier_type"
      },
      "l10n_tw_edi_carrier_number": {
        "type": "char",
        "label": "l10n_tw_edi_carrier_number"
      },
      "l10n_tw_edi_carrier_number_2": {
        "type": "char",
        "label": "l10n_tw_edi_carrier_number_2"
      },
      "l10n_tw_edi_invoice_type": {
        "type": "selection",
        "label": "l10n_tw_edi_invoice_type"
      },
      "l10n_tw_edi_clearance_mark": {
        "type": "selection",
        "label": "l10n_tw_edi_clearance_mark"
      },
      "l10n_tw_edi_zero_tax_rate_reason": {
        "type": "selection",
        "label": "l10n_tw_edi_zero_tax_rate_reason"
      },
      "l10n_tw_edi_is_zero_tax_rate": {
        "type": "boolean",
        "label": "l10n_tw_edi_is_zero_tax_rate"
      },
      "l10n_tw_edi_invoice_create_date": {
        "type": "datetime",
        "label": "Creation Date"
      },
      "l10n_tw_edi_refund_state": {
        "type": "selection",
        "label": "l10n_tw_edi_refund_state"
      },
      "l10n_tw_edi_refund_agreement_type": {
        "type": "selection",
        "label": "l10n_tw_edi_refund_agreement_type"
      },
      "l10n_tw_edi_allowance_notify_way": {
        "type": "selection",
        "label": "l10n_tw_edi_allowance_notify_way"
      },
      "l10n_tw_edi_invalidate_reason": {
        "type": "char",
        "label": "Invalidate Reason"
      },
      "l10n_tw_edi_refund_invoice_number": {
        "type": "char",
        "label": "Refund Invoice Number"
      },
      "l10n_tw_edi_is_b2b": {
        "type": "boolean",
        "label": "Is B2B"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accountmoveline",
    "_description": "accountmoveline",
    "_auto": true,
    "_fields": {
      "l10n_tw_edi_ecpay_item_sequence": {
        "type": "integer",
        "label": "Item Sequence"
      }
    },
    "_inherit": "account.move.line"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_tw_edi_tax_type": {
        "type": "selection",
        "label": "l10n_tw_edi_tax_type"
      },
      "l10n_tw_edi_special_tax_type": {
        "type": "selection",
        "label": "l10n_tw_edi_special_tax_type"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_tw_edi_ecpay_staging_mode": {
        "type": "boolean",
        "label": "Staging mode"
      },
      "l10n_tw_edi_ecpay_merchant_id": {
        "type": "char",
        "label": "MerchantID"
      },
      "l10n_tw_edi_ecpay_hashkey": {
        "type": "char",
        "label": "Hashkey"
      },
      "l10n_tw_edi_ecpay_hashIV": {
        "type": "char",
        "label": "HashIV"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "invoice_edi_format": {
        "type": "selection",
        "label": "tw_ecpay"
      }
    },
    "_inherit": "res.partner"
  }
];
