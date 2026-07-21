// Odoo 模块: l10n_jo_edi
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "ir.attachment",
    "_description": "ir.attachment",
    "_auto": true,
    "_fields": {
      "l10n_jo_edi_uuid": {
        "type": "char",
        "label": "Invoice UUID"
      },
      "l10n_jo_edi_qr": {
        "type": "char",
        "label": "QR"
      },
      "l10n_jo_edi_is_needed": {
        "type": "boolean",
        "label": "l10n_jo_edi_is_needed"
      },
      "l10n_jo_edi_state": {
        "type": "selection",
        "label": "l10n_jo_edi_state"
      },
      "l10n_jo_edi_error": {
        "type": "text",
        "label": "l10n_jo_edi_error"
      },
      "l10n_jo_edi_computed_xml": {
        "type": "text",
        "label": "l10n_jo_edi_computed_xml"
      },
      "l10n_jo_edi_xml_attachment_file": {
        "type": "text",
        "label": "l10n_jo_edi_xml_attachment_file"
      },
      "l10n_jo_edi_xml_attachment_id": {
        "type": "many2one",
        "label": "l10n_jo_edi_xml_attachment_id"
      },
      "reversed_entry_id": {
        "type": "many2one",
        "label": "reversed_entry_id"
      },
      "l10n_jo_edi_invoice_type": {
        "type": "selection",
        "label": "l10n_jo_edi_invoice_type"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_jo_edi_sequence_income_source": {
        "type": "char",
        "label": "JoFotara Sequence of Income Source"
      },
      "l10n_jo_edi_secret_key": {
        "type": "char",
        "label": "JoFotara Secret Key"
      },
      "l10n_jo_edi_client_identifier": {
        "type": "char",
        "label": "JoFotara Client ID"
      },
      "l10n_jo_edi_taxpayer_type": {
        "type": "selection",
        "label": "JoFotara Taxpayer Type"
      },
      "l10n_jo_edi_demo_mode": {
        "type": "boolean",
        "label": "JoFotara Demo Mode"
      }
    },
    "_inherit": "res.company"
  }
];
