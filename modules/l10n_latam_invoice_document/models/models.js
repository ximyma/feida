// Odoo 模块: l10n_latam_invoice_document
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountjournal",
    "_description": "accountjournal",
    "_auto": true,
    "_fields": {
      "l10n_latam_use_documents": {
        "type": "boolean",
        "label": "l10n_latam_use_documents"
      },
      "l10n_latam_company_use_documents": {
        "type": "boolean",
        "label": "_compute_l10n_latam_company_use_documents"
      }
    },
    "_inherit": "account.journal"
  },
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_latam_available_document_type_ids": {
        "type": "many2many",
        "label": "l10n_latam.document.type"
      },
      "l10n_latam_document_type_id": {
        "type": "many2one",
        "label": "l10n_latam_document_type_id"
      },
      "l10n_latam_document_number": {
        "type": "char",
        "label": "l10n_latam_document_number"
      },
      "l10n_latam_use_documents": {
        "type": "boolean",
        "label": "_compute_l10n_latam_use_documents"
      },
      "l10n_latam_manual_document_number": {
        "type": "boolean",
        "label": "_compute_l10n_latam_manual_document_number"
      },
      "l10n_latam_document_type_id_code": {
        "type": "char",
        "label": "l10n_latam_document_type_id.code"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accountmoveline",
    "_description": "accountmoveline",
    "_auto": true,
    "_fields": {
      "l10n_latam_document_type_id": {
        "type": "many2one",
        "label": "l10n_latam_document_type_id"
      },
      "l10n_latam_use_documents": {
        "type": "boolean",
        "label": "move_id.l10n_latam_use_documents"
      }
    },
    "_inherit": "account.move.line"
  },
  {
    "_name": "l10n_latam.document.type",
    "_description": "Latam Document Type",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "country_id": {
        "type": "many2one",
        "label": "country_id"
      },
      "name": {
        "type": "char",
        "label": "The document name",
        "required": true
      },
      "doc_code_prefix": {
        "type": "char",
        "label": "doc_code_prefix"
      },
      "code": {
        "type": "char",
        "label": "Code used by different localizations"
      },
      "report_name": {
        "type": "char",
        "label": "Name on Reports"
      },
      "internal_type": {
        "type": "selection",
        "label": "internal_type"
      }
    }
  }
];
