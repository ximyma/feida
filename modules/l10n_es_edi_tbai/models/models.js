// Odoo 模块: l10n_es_edi_tbai
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "l10n_es_edi_tbai.document",
    "_description": "l10n_es_edi_tbai.document",
    "_auto": true,
    "_fields": {
      "l10n_es_tbai_state": {
        "type": "selection",
        "label": "l10n_es_tbai_state"
      },
      "l10n_es_tbai_chain_index": {
        "type": "integer",
        "label": "l10n_es_tbai_chain_index"
      },
      "l10n_es_tbai_post_document_id": {
        "type": "many2one",
        "label": "l10n_es_tbai_post_document_id"
      },
      "l10n_es_tbai_cancel_document_id": {
        "type": "many2one",
        "label": "l10n_es_tbai_cancel_document_id"
      },
      "l10n_es_tbai_post_file": {
        "type": "text",
        "label": "l10n_es_tbai_post_file"
      },
      "l10n_es_tbai_post_file_name": {
        "type": "char",
        "label": "l10n_es_tbai_post_file_name"
      },
      "l10n_es_tbai_cancel_file": {
        "type": "text",
        "label": "l10n_es_tbai_cancel_file"
      },
      "l10n_es_tbai_cancel_file_name": {
        "type": "char",
        "label": "l10n_es_tbai_cancel_file_name"
      },
      "l10n_es_tbai_is_required": {
        "type": "boolean",
        "label": "l10n_es_tbai_is_required"
      },
      "l10n_es_tbai_refund_reason": {
        "type": "selection",
        "label": "l10n_es_tbai_refund_reason"
      },
      "l10n_es_tbai_reversed_ids": {
        "type": "many2many",
        "label": "l10n_es_tbai_reversed_ids"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "certificatecertificate",
    "_description": "certificatecertificate",
    "_auto": true,
    "_fields": {
      "scope": {
        "type": "selection",
        "label": "scope"
      }
    },
    "_inherit": "certificate.certificate"
  },
  {
    "_name": "certificate.certificate",
    "_description": "certificate.certificate",
    "_auto": true,
    "_fields": {
      "l10n_es_tbai_certificate_id": {
        "type": "many2one",
        "label": "l10n_es_tbai_certificate_id"
      },
      "l10n_es_tbai_certificate_ids": {
        "type": "one2many",
        "label": "l10n_es_tbai_certificate_ids"
      },
      "l10n_es_tbai_tax_agency": {
        "type": "selection",
        "label": "l10n_es_tbai_tax_agency"
      },
      "l10n_es_tbai_license_html": {
        "type": "html",
        "label": "l10n_es_tbai_license_html"
      },
      "l10n_es_tbai_chain_sequence_id": {
        "type": "many2one",
        "label": "l10n_es_tbai_chain_sequence_id"
      },
      "l10n_es_tbai_test_env": {
        "type": "boolean",
        "label": "l10n_es_tbai_test_env"
      },
      "l10n_es_tbai_is_enabled": {
        "type": "boolean",
        "label": "_compute_l10n_es_tbai_is_enabled"
      }
    },
    "_inherit": "res.company"
  }
];
