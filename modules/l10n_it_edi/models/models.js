// Odoo 模块: l10n_it_edi
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "account_edi_proxy_clientuser",
    "_description": "account_edi_proxy_clientuser",
    "_auto": true,
    "_fields": {
      "proxy_type": {
        "type": "selection",
        "label": "l10n_it_edi"
      }
    },
    "_inherit": "account_edi_proxy_client.user"
  },
  {
    "_name": "l10n_it.document.type",
    "_description": ", ",
    "_auto": true,
    "_fields": {
      "l10n_it_edi_state": {
        "type": "selection",
        "label": "l10n_it_edi_state"
      },
      "l10n_it_edi_header": {
        "type": "html",
        "label": "l10n_it_edi_header"
      },
      "l10n_it_edi_transaction": {
        "type": "char",
        "label": "FatturaPA Transaction"
      },
      "l10n_it_edi_attachment_file": {
        "type": "text",
        "label": "l10n_it_edi_attachment_file"
      },
      "l10n_it_edi_attachment_name": {
        "type": "char",
        "label": "FatturaPA Attachment"
      },
      "l10n_it_edi_proxy_mode": {
        "type": "selection",
        "label": "company_id.l10n_it_edi_proxy_user_id.edi_mode"
      },
      "l10n_it_edi_button_label": {
        "type": "char",
        "label": "_compute_l10n_it_edi_button_label"
      },
      "l10n_it_edi_is_self_invoice": {
        "type": "boolean",
        "label": "_compute_l10n_it_edi_is_self_invoice"
      },
      "l10n_it_stamp_duty": {
        "type": "float",
        "label": "Dati Bollo"
      },
      "l10n_it_ddt_id": {
        "type": "many2one",
        "label": "l10n_it.ddt"
      },
      "l10n_it_origin_document_type": {
        "type": "selection",
        "label": "l10n_it_origin_document_type"
      },
      "l10n_it_origin_document_name": {
        "type": "char",
        "label": "l10n_it_origin_document_name"
      },
      "l10n_it_origin_document_date": {
        "type": "date",
        "label": "l10n_it_origin_document_date"
      },
      "l10n_it_cig": {
        "type": "char",
        "label": "l10n_it_cig"
      },
      "l10n_it_cup": {
        "type": "char",
        "label": "l10n_it_cup"
      },
      "l10n_it_partner_pa": {
        "type": "boolean",
        "label": "_compute_l10n_it_partner_pa"
      },
      "l10n_it_partner_is_public_administration": {
        "type": "boolean",
        "label": "_compute_l10n_it_partner_is_public_administration"
      },
      "l10n_it_payment_method": {
        "type": "selection",
        "label": "l10n_it_payment_method"
      },
      "l10n_it_document_type": {
        "type": "many2one",
        "label": "l10n_it_document_type"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accountpaymentmethodline",
    "_description": "accountpaymentmethodline",
    "_auto": true,
    "_fields": {
      "l10n_it_payment_method": {
        "type": "selection",
        "label": "l10n_it_payment_method"
      }
    },
    "_inherit": "account.payment.method.line"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_it_withholding_type": {
        "type": "selection",
        "label": "Withholding tax type (Italy)"
      },
      "l10n_it_withholding_reason": {
        "type": "selection",
        "label": "Withholding tax reason (Italy)"
      },
      "l10n_it_pension_fund_type": {
        "type": "selection",
        "label": "Pension fund type (Italy)"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "l10n_it.ddt",
    "_description": "Transport Document",
    "_auto": true,
    "_fields": {
      "invoice_id": {
        "type": "one2many",
        "label": "account.move"
      },
      "name": {
        "type": "char",
        "label": "Numero DDT",
        "required": true
      },
      "date": {
        "type": "date",
        "label": "Data DDT",
        "required": true
      }
    }
  },
  {
    "_name": "account_edi_proxy_client.user",
    "_description": "account_edi_proxy_client.user",
    "_auto": true,
    "_fields": {
      "l10n_it_codice_fiscale": {
        "type": "char",
        "label": "Codice Fiscale"
      },
      "l10n_it_tax_system": {
        "type": "selection",
        "label": "Tax System"
      },
      "l10n_it_edi_proxy_user_id": {
        "type": "many2one",
        "label": "l10n_it_edi_proxy_user_id"
      },
      "l10n_it_edi_register": {
        "type": "boolean",
        "label": "l10n_it_edi_register",
        "default": false
      },
      "l10n_it_edi_purchase_journal_id": {
        "type": "many2one",
        "label": "l10n_it_edi_purchase_journal_id"
      },
      "l10n_it_has_eco_index": {
        "type": "boolean",
        "label": "l10n_it_has_eco_index"
      },
      "l10n_it_eco_index_office": {
        "type": "many2one",
        "label": "res.country.state"
      },
      "l10n_it_eco_index_number": {
        "type": "char",
        "label": "Number in register of companies"
      },
      "l10n_it_eco_index_share_capital": {
        "type": "float",
        "label": "Share capital actually paid up"
      },
      "l10n_it_eco_index_sole_shareholder": {
        "type": "selection",
        "label": "l10n_it_eco_index_sole_shareholder"
      },
      "l10n_it_eco_index_liquidation_state": {
        "type": "selection",
        "label": "l10n_it_eco_index_liquidation_state"
      },
      "l10n_it_has_tax_representative": {
        "type": "boolean",
        "label": "l10n_it_has_tax_representative"
      },
      "l10n_it_tax_representative_partner_id": {
        "type": "many2one",
        "label": "res.partner"
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
        "label": "it_edi_xml"
      },
      "l10n_it_pec_email": {
        "type": "char",
        "label": "PEC e-mail"
      },
      "l10n_it_codice_fiscale": {
        "type": "char",
        "label": "Codice Fiscale"
      },
      "l10n_it_pa_index": {
        "type": "char",
        "label": "l10n_it_pa_index"
      }
    },
    "_inherit": "res.partner"
  }
];
