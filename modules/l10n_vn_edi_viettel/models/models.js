// Odoo 模块: l10n_vn_edi_viettel
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "l10n_vn_edi_viettel.sinvoice.symbol",
    "_description": "l10n_vn_edi_viettel.sinvoice.symbol",
    "_auto": true,
    "_fields": {
      "l10n_vn_edi_invoice_state": {
        "type": "selection",
        "label": "l10n_vn_edi_invoice_state"
      },
      "l10n_vn_edi_invoice_transaction_id": {
        "type": "char",
        "label": "l10n_vn_edi_invoice_transaction_id"
      },
      "l10n_vn_edi_invoice_symbol": {
        "type": "many2one",
        "label": "l10n_vn_edi_invoice_symbol"
      },
      "l10n_vn_edi_invoice_number": {
        "type": "char",
        "label": "l10n_vn_edi_invoice_number"
      },
      "l10n_vn_edi_reservation_code": {
        "type": "char",
        "label": "l10n_vn_edi_reservation_code"
      },
      "l10n_vn_edi_issue_date": {
        "type": "datetime",
        "label": "l10n_vn_edi_issue_date"
      },
      "l10n_vn_edi_sinvoice_file_id": {
        "type": "many2one",
        "label": "l10n_vn_edi_sinvoice_file_id"
      },
      "l10n_vn_edi_sinvoice_file": {
        "type": "text",
        "label": "l10n_vn_edi_sinvoice_file"
      },
      "l10n_vn_edi_sinvoice_xml_file_id": {
        "type": "many2one",
        "label": "l10n_vn_edi_sinvoice_xml_file_id"
      },
      "l10n_vn_edi_sinvoice_xml_file": {
        "type": "text",
        "label": "l10n_vn_edi_sinvoice_xml_file"
      },
      "l10n_vn_edi_sinvoice_pdf_file_id": {
        "type": "many2one",
        "label": "l10n_vn_edi_sinvoice_pdf_file_id"
      },
      "l10n_vn_edi_sinvoice_pdf_file": {
        "type": "text",
        "label": "l10n_vn_edi_sinvoice_pdf_file"
      },
      "l10n_vn_edi_agreement_document_name": {
        "type": "char",
        "label": "l10n_vn_edi_agreement_document_name"
      },
      "l10n_vn_edi_agreement_document_date": {
        "type": "datetime",
        "label": "l10n_vn_edi_agreement_document_date"
      },
      "l10n_vn_edi_adjustment_type": {
        "type": "selection",
        "label": "l10n_vn_edi_adjustment_type"
      },
      "l10n_vn_edi_replacement_origin_id": {
        "type": "many2one",
        "label": "l10n_vn_edi_replacement_origin_id"
      },
      "l10n_vn_edi_reversed_entry_invoice_number": {
        "type": "char",
        "label": "l10n_vn_edi_reversed_entry_invoice_number"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_vn_edi_username": {
        "type": "char",
        "label": "l10n_vn_edi_username"
      },
      "l10n_vn_edi_password": {
        "type": "char",
        "label": "l10n_vn_edi_password"
      },
      "l10n_vn_edi_token": {
        "type": "char",
        "label": "l10n_vn_edi_token"
      },
      "l10n_vn_edi_token_expiry": {
        "type": "datetime",
        "label": "l10n_vn_edi_token_expiry"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "l10n_vn_edi_viettel.sinvoice.template",
    "_description": "SInvoice template",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "template_invoice_type": {
        "type": "selection",
        "label": "template_invoice_type"
      },
      "invoice_symbols_ids": {
        "type": "one2many",
        "label": "invoice_symbols_ids"
      }
    }
  }
];
