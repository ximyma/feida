// Odoo 模块: l10n_dk_nemhandel
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountediproxyclientuser",
    "_description": "accountediproxyclientuser",
    "_auto": true,
    "_fields": {
      "nemhandel_verification_code": {
        "type": "char",
        "label": "Nemhandel SMS verification code"
      },
      "proxy_type": {
        "type": "selection",
        "label": "nemhandel"
      }
    },
    "_inherit": "account_edi_proxy_client.user"
  },
  {
    "_name": "accountjournal",
    "_description": "accountjournal",
    "_auto": true,
    "_fields": {
      "l10n_dk_nemhandel_proxy_state": {
        "type": "selection",
        "label": "company_id.l10n_dk_nemhandel_proxy_state"
      },
      "is_nemhandel_journal": {
        "type": "boolean",
        "label": "Journal used for Nemhandel"
      }
    },
    "_inherit": "account.journal"
  },
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "nemhandel_message_uuid": {
        "type": "char",
        "label": "Nemhandel message ID"
      },
      "nemhandel_move_state": {
        "type": "selection",
        "label": "nemhandel_move_state"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "account.journal",
    "_description": "account.journal",
    "_auto": true,
    "_fields": {
      "nemhandel_contact_email": {
        "type": "char",
        "label": "nemhandel_contact_email"
      },
      "nemhandel_phone_number": {
        "type": "char",
        "label": "nemhandel_phone_number"
      },
      "l10n_dk_nemhandel_proxy_state": {
        "type": "selection",
        "label": "l10n_dk_nemhandel_proxy_state"
      },
      "nemhandel_identifier_type": {
        "type": "selection",
        "label": "partner_id.nemhandel_identifier_type"
      },
      "nemhandel_identifier_value": {
        "type": "char",
        "label": "partner_id.nemhandel_identifier_value"
      },
      "nemhandel_purchase_journal_id": {
        "type": "many2one",
        "label": "nemhandel_purchase_journal_id"
      },
      "nemhandel_edi_user": {
        "type": "many2one",
        "label": "nemhandel_edi_user"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "invoice_sending_method": {
        "type": "selection",
        "label": "invoice_sending_method"
      },
      "invoice_edi_format": {
        "type": "selection",
        "label": "oioubl_21"
      },
      "nemhandel_verification_state": {
        "type": "selection",
        "label": "nemhandel_verification_state"
      },
      "nemhandel_identifier_type": {
        "type": "selection",
        "label": "nemhandel_identifier_type"
      },
      "nemhandel_identifier_value": {
        "type": "char",
        "label": "nemhandel_identifier_value"
      },
      "is_using_nemhandel": {
        "type": "boolean",
        "label": "_compute_is_using_nemhandel"
      }
    },
    "_inherit": "res.partner"
  }
];
