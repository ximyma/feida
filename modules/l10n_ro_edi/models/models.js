// Odoo 模块: l10n_ro_edi
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "l10n_ro_edi.document",
    "_description": "l10n_ro_edi.document",
    "_auto": true,
    "_fields": {
      "l10n_ro_edi_document_ids": {
        "type": "one2many",
        "label": "l10n_ro_edi_document_ids"
      },
      "l10n_ro_edi_state": {
        "type": "selection",
        "label": "l10n_ro_edi_state"
      },
      "l10n_ro_edi_index": {
        "type": "char",
        "label": "E-Factura Index"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "account.journal",
    "_description": "account.journal",
    "_auto": true,
    "_fields": {
      "l10n_ro_edi_client_id": {
        "type": "char",
        "label": "eFactura Client ID"
      },
      "l10n_ro_edi_client_secret": {
        "type": "char",
        "label": "Client Secret"
      },
      "l10n_ro_edi_access_token": {
        "type": "char",
        "label": "Access Token"
      },
      "l10n_ro_edi_refresh_token": {
        "type": "char",
        "label": "Refresh Token"
      },
      "l10n_ro_edi_access_expiry_date": {
        "type": "date",
        "label": "Access Token Expiry Date"
      },
      "l10n_ro_edi_refresh_expiry_date": {
        "type": "date",
        "label": "Refresh Token Expiry Date"
      },
      "l10n_ro_edi_callback_url": {
        "type": "char",
        "label": "_compute_l10n_ro_edi_callback_url"
      },
      "l10n_ro_edi_test_env": {
        "type": "boolean",
        "label": "Use Test Environment",
        "default": true
      },
      "l10n_ro_edi_anaf_imported_inv_journal_id": {
        "type": "many2one",
        "label": "l10n_ro_edi_anaf_imported_inv_journal_id"
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
        "label": "ciusro"
      }
    },
    "_inherit": "res.partner"
  }
];
