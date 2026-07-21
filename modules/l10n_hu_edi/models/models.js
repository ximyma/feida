// Odoo 模块: l10n_hu_edi
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_hu_payment_mode": {
        "type": "selection",
        "label": "l10n_hu_payment_mode"
      },
      "l10n_hu_edi_state": {
        "type": "selection",
        "label": "l10n_hu_edi_state"
      },
      "l10n_hu_edi_batch_upload_index": {
        "type": "integer",
        "label": "l10n_hu_edi_batch_upload_index"
      },
      "l10n_hu_edi_attachment": {
        "type": "text",
        "label": "l10n_hu_edi_attachment"
      },
      "l10n_hu_edi_send_time": {
        "type": "datetime",
        "label": "l10n_hu_edi_send_time"
      },
      "l10n_hu_edi_transaction_code": {
        "type": "char",
        "label": "l10n_hu_edi_transaction_code"
      },
      "l10n_hu_edi_messages": {
        "type": "char",
        "label": "l10n_hu_edi_messages"
      },
      "l10n_hu_invoice_chain_index": {
        "type": "integer",
        "label": "l10n_hu_invoice_chain_index"
      },
      "l10n_hu_edi_attachment_filename": {
        "type": "char",
        "label": "l10n_hu_edi_attachment_filename"
      },
      "l10n_hu_edi_message_html": {
        "type": "html",
        "label": "l10n_hu_edi_message_html"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_hu_tax_type": {
        "type": "selection",
        "label": "l10n_hu_tax_type"
      },
      "l10n_hu_tax_reason": {
        "type": "char",
        "label": "l10n_hu_tax_reason"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "l10n_hu_product_code_type": {
        "type": "selection",
        "label": "l10n_hu_product_code_type"
      },
      "l10n_hu_product_code": {
        "type": "char",
        "label": "l10n_hu_product_code"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_hu_group_vat": {
        "type": "char",
        "label": "l10n_hu_group_vat"
      },
      "l10n_hu_tax_regime": {
        "type": "selection",
        "label": "l10n_hu_tax_regime"
      },
      "l10n_hu_edi_server_mode": {
        "type": "selection",
        "label": "l10n_hu_edi_server_mode"
      },
      "l10n_hu_edi_username": {
        "type": "char",
        "label": "l10n_hu_edi_username"
      },
      "l10n_hu_edi_password": {
        "type": "char",
        "label": "l10n_hu_edi_password"
      },
      "l10n_hu_edi_signature_key": {
        "type": "char",
        "label": "l10n_hu_edi_signature_key"
      },
      "l10n_hu_edi_replacement_key": {
        "type": "char",
        "label": "l10n_hu_edi_replacement_key"
      },
      "l10n_hu_edi_last_transaction_recovery": {
        "type": "datetime",
        "label": "l10n_hu_edi_last_transaction_recovery"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_hu_group_vat": {
        "type": "char",
        "label": "l10n_hu_group_vat"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "uomuom",
    "_description": "uomuom",
    "_auto": true,
    "_fields": {
      "l10n_hu_edi_code": {
        "type": "selection",
        "label": "l10n_hu_edi_code"
      }
    },
    "_inherit": "uom.uom"
  }
];
