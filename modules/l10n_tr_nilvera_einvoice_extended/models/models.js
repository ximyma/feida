// Odoo 模块: l10n_tr_nilvera_einvoice_extended
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_tr_gib_invoice_scenario": {
        "type": "selection",
        "label": "l10n_tr_gib_invoice_scenario"
      },
      "l10n_tr_gib_invoice_type": {
        "type": "selection",
        "label": "l10n_tr_gib_invoice_type"
      },
      "l10n_tr_is_export_invoice": {
        "type": "boolean",
        "label": "Is GIB Export"
      },
      "l10n_tr_shipping_type": {
        "type": "selection",
        "label": "l10n_tr_shipping_type"
      },
      "l10n_tr_exemption_code_id": {
        "type": "many2one",
        "label": "l10n_tr_exemption_code_id"
      },
      "l10n_tr_exemption_code_domain_list": {
        "type": "text",
        "label": "_compute_l10n_tr_exemption_code_domain_list"
      },
      "l10n_tr_nilvera_customer_status": {
        "type": "selection",
        "label": "l10n_tr_nilvera_customer_status"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accountmoveline",
    "_description": "accountmoveline",
    "_auto": true,
    "_fields": {
      "l10n_tr_ctsp_number": {
        "type": "char",
        "label": "l10n_tr_ctsp_number"
      }
    },
    "_inherit": "account.move.line"
  },
  {
    "_name": "l10n_tr_nilvera_einvoice_extended.account.tax.code",
    "_description": "l10n_tr_nilvera_einvoice_extended.account.tax.code",
    "_auto": true,
    "_fields": {
      "l10n_tr_tax_withholding_code_id": {
        "type": "many2one",
        "label": "l10n_tr_tax_withholding_code_id"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "l10n_tr_nilvera_einvoice_extended.tax.office",
    "_description": "Turkish Tax Office",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "code": {
        "type": "integer",
        "label": "code"
      },
      "state_id": {
        "type": "many2one",
        "label": "res.country.state"
      },
      "state_code": {
        "type": "char",
        "label": "state_id.code"
      }
    }
  },
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "l10n_tr_ctsp_number": {
        "type": "char",
        "label": "CTSP Number"
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "l10n_tr_ctsp_number": {
        "type": "char",
        "label": "l10n_tr_ctsp_number"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_tr_tax_office_id": {
        "type": "many2one",
        "label": "partner_id.l10n_tr_tax_office_id"
      },
      "l10n_tr_nilvera_export_alias": {
        "type": "char",
        "label": "l10n_tr_nilvera_export_alias"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_tr_tax_office_id": {
        "type": "many2one",
        "label": "l10n_tr_nilvera_einvoice_extended.tax.office"
      }
    },
    "_inherit": "res.partner"
  }
];
