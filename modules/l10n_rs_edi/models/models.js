// Odoo 模块: l10n_rs_edi
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "ir.attachment",
    "_description": "ir.attachment",
    "_auto": true,
    "_fields": {
      "l10n_rs_edi_uuid": {
        "type": "char",
        "label": "l10n_rs_edi_uuid"
      },
      "l10n_rs_edi_is_eligible": {
        "type": "boolean",
        "label": "l10n_rs_edi_is_eligible"
      },
      "l10n_rs_edi_attachment_file": {
        "type": "text",
        "label": "l10n_rs_edi_attachment_file"
      },
      "l10n_rs_edi_attachment_id": {
        "type": "many2one",
        "label": "l10n_rs_edi_attachment_id"
      },
      "l10n_rs_edi_state": {
        "type": "selection",
        "label": "l10n_rs_edi_state"
      },
      "l10n_rs_edi_error": {
        "type": "text",
        "label": "l10n_rs_edi_error"
      },
      "l10n_rs_tax_date_obligations_code": {
        "type": "selection",
        "label": "l10n_rs_tax_date_obligations_code"
      },
      "l10n_rs_edi_invoice": {
        "type": "char",
        "label": "Invoice Id"
      },
      "l10n_rs_edi_sales_invoice": {
        "type": "char",
        "label": "Sales Invoice Id"
      },
      "l10n_rs_edi_purchase_invoice": {
        "type": "char",
        "label": "Purchase Invoice Id"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_rs_edi_api_key": {
        "type": "char",
        "label": "eFaktura API Key"
      },
      "l10n_rs_edi_demo_env": {
        "type": "boolean",
        "label": "Use Demo Environment",
        "default": true
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_rs_edi_registration_number": {
        "type": "char",
        "label": "l10n_rs_edi_registration_number"
      },
      "l10n_rs_edi_public_funds": {
        "type": "char",
        "label": "l10n_rs_edi_public_funds"
      }
    },
    "_inherit": "res.partner"
  }
];
