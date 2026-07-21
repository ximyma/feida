// Odoo 模块: l10n_pl_edi
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "ir.attachment",
    "_description": "ir.attachment",
    "_auto": true,
    "_fields": {
      "l10n_pl_edi_status": {
        "type": "selection",
        "label": "l10n_pl_edi_status"
      },
      "l10n_pl_edi_ref": {
        "type": "char",
        "label": "KSeF Reference Number"
      },
      "l10n_pl_edi_register": {
        "type": "boolean",
        "label": "company_id.l10n_pl_edi_register"
      },
      "l10n_pl_edi_header": {
        "type": "html",
        "label": "l10n_pl_edi_header"
      },
      "l10n_pl_edi_number": {
        "type": "char",
        "label": "KSeF Number"
      },
      "l10n_pl_edi_session_id": {
        "type": "char",
        "label": "KSeF Session Number used for sending"
      },
      "l10n_pl_edi_attachment_file": {
        "type": "text",
        "label": "l10n_pl_edi_attachment_file"
      },
      "l10n_pl_edi_attachment_id": {
        "type": "many2one",
        "label": "l10n_pl_edi_attachment_id"
      },
      "l10n_pl_edi_upo_file": {
        "type": "text",
        "label": "l10n_pl_edi_upo_file"
      },
      "l10n_pl_edi_upo_id": {
        "type": "many2one",
        "label": "l10n_pl_edi_upo_id"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_pl_edi_register": {
        "type": "boolean",
        "label": "KSeF Integration Enabled"
      },
      "l10n_pl_edi_certificate": {
        "type": "many2one",
        "label": "certificate.certificate"
      },
      "l10n_pl_edi_access_token": {
        "type": "char",
        "label": "KSeF Token"
      },
      "l10n_pl_edi_refresh_token": {
        "type": "char",
        "label": "KSeF Token Expiration"
      },
      "l10n_pl_edi_session_id": {
        "type": "char",
        "label": "Reference number"
      },
      "l10n_pl_edi_session_key": {
        "type": "text",
        "label": "Session key"
      },
      "l10n_pl_edi_session_iv": {
        "type": "text",
        "label": "Session iv"
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
        "label": "fa3_pl"
      }
    },
    "_inherit": "res.partner"
  }
];
