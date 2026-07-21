// Odoo 模块: l10n_in_edi
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "ir.attachment",
    "_description": "ir.attachment",
    "_auto": true,
    "_fields": {
      "l10n_in_edi_status": {
        "type": "selection",
        "label": "l10n_in_edi_status"
      },
      "l10n_in_edi_attachment_id": {
        "type": "many2one",
        "label": "l10n_in_edi_attachment_id"
      },
      "l10n_in_edi_attachment_file": {
        "type": "text",
        "label": "l10n_in_edi_attachment_file"
      },
      "l10n_in_edi_cancel_reason": {
        "type": "selection",
        "label": "l10n_in_edi_cancel_reason"
      },
      "l10n_in_edi_cancel_remarks": {
        "type": "char",
        "label": "l10n_in_edi_cancel_remarks"
      },
      "l10n_in_edi_content": {
        "type": "text",
        "label": "l10n_in_edi_content"
      },
      "l10n_in_edi_error": {
        "type": "html",
        "label": "l10n_in_edi_error"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_in_edi_feature": {
        "type": "boolean",
        "label": "Indian E-Invoicing"
      },
      "l10n_in_edi_username": {
        "type": "char",
        "label": "l10n_in_edi_username"
      },
      "l10n_in_edi_password": {
        "type": "char",
        "label": "l10n_in_edi_password"
      },
      "l10n_in_edi_token": {
        "type": "char",
        "label": "l10n_in_edi_token"
      },
      "l10n_in_edi_token_validity": {
        "type": "datetime",
        "label": "l10n_in_edi_token_validity"
      }
    },
    "_inherit": "res.company"
  }
];
