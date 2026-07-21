// Odoo 模块: l10n_my_edi
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountediproxyclientuser",
    "_description": "accountediproxyclientuser",
    "_auto": true,
    "_fields": {
      "proxy_type": {
        "type": "selection",
        "label": "l10n_my_edi"
      }
    },
    "_inherit": "account_edi_proxy_client.user"
  },
  {
    "_name": "myinvois.document",
    "_description": "myinvois.document",
    "_auto": true,
    "_fields": {
      "l10n_my_edi_document_ids": {
        "type": "many2many",
        "label": "l10n_my_edi_document_ids"
      },
      "l10n_my_edi_display_tax_exemption_reason": {
        "type": "boolean",
        "label": "l10n_my_edi_display_tax_exemption_reason"
      },
      "l10n_my_invoice_need_edi": {
        "type": "boolean",
        "label": "l10n_my_invoice_need_edi"
      },
      "l10n_my_edi_state": {
        "type": "selection",
        "label": "l10n_my_edi_state"
      },
      "l10n_my_edi_exemption_reason": {
        "type": "char",
        "label": "l10n_my_edi_exemption_reason"
      },
      "l10n_my_edi_custom_form_reference": {
        "type": "char",
        "label": "l10n_my_edi_custom_form_reference"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accountmoveline",
    "_description": "accountmoveline",
    "_auto": true,
    "_fields": {
      "l10n_my_edi_classification_code": {
        "type": "selection",
        "label": "l10n_my_edi_classification_code"
      }
    },
    "_inherit": "account.move.line"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_my_tax_type": {
        "type": "selection",
        "label": "l10n_my_tax_type"
      },
      "l10n_my_tax_exemption_reason": {
        "type": "char",
        "label": "l10n_my_tax_exemption_reason"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "l10n_my_edi.industry_classification",
    "_description": "Malaysian Industry Classification",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "code": {
        "type": "char",
        "label": "code",
        "required": true
      }
    }
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "l10n_my_edi_classification_code": {
        "type": "selection",
        "label": "l10n_my_edi_classification_code"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "account_edi_proxy_client.user",
    "_description": "account_edi_proxy_client.user",
    "_auto": true,
    "_fields": {
      "l10n_my_edi_proxy_user_id": {
        "type": "many2one",
        "label": "l10n_my_edi_proxy_user_id"
      },
      "l10n_my_identification_type": {
        "type": "selection",
        "label": "partner_id.l10n_my_identification_type"
      },
      "l10n_my_identification_number": {
        "type": "char",
        "label": "partner_id.l10n_my_identification_number"
      },
      "l10n_my_identification_number_placeholder": {
        "type": "char",
        "label": "_compute_l10n_my_identification_number_placeholder"
      },
      "l10n_my_edi_industrial_classification": {
        "type": "many2one",
        "label": "partner_id.l10n_my_edi_industrial_classification"
      },
      "l10n_my_edi_mode": {
        "type": "selection",
        "label": "l10n_my_edi_mode"
      },
      "l10n_my_edi_default_import_journal_id": {
        "type": "many2one",
        "label": "l10n_my_edi_default_import_journal_id"
      }
    },
    "_inherit": "res.company"
  }
];
