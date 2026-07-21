// Odoo 模块: l10n_ar_withholding
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_ar_withholding_ids": {
        "type": "one2many",
        "label": "l10n_ar_withholding_ids"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accountpayment",
    "_description": "accountpayment",
    "_auto": true,
    "_fields": {
      "l10n_ar_withholding_ids": {
        "type": "one2many",
        "label": "move_id.l10n_ar_withholding_ids"
      }
    },
    "_inherit": "account.payment"
  },
  {
    "_name": "l10n_ar.earnings.scale",
    "_description": "l10n_ar.earnings.scale",
    "_auto": true,
    "_fields": {
      "l10n_ar_type_tax_use": {
        "type": "selection",
        "label": "l10n_ar_type_tax_use"
      },
      "l10n_ar_withholding_payment_type": {
        "type": "selection",
        "label": "l10n_ar_withholding_payment_type"
      },
      "l10n_ar_tax_type": {
        "type": "selection",
        "label": "l10n_ar_tax_type"
      },
      "l10n_ar_withholding_sequence_id": {
        "type": "many2one",
        "label": "l10n_ar_withholding_sequence_id"
      },
      "l10n_ar_code": {
        "type": "char",
        "label": "ARCA Code"
      },
      "l10n_ar_non_taxable_amount": {
        "type": "float",
        "label": "l10n_ar_non_taxable_amount"
      },
      "l10n_ar_minimum_threshold": {
        "type": "float",
        "label": "l10n_ar_minimum_threshold"
      },
      "l10n_ar_state_id": {
        "type": "many2one",
        "label": "l10n_ar_state_id"
      },
      "l10n_ar_scale_id": {
        "type": "many2one",
        "label": "l10n_ar_scale_id"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "l10n_ar.earnings.scale.line",
    "_description": "l10n_ar.earnings.scale.line",
    "_auto": true,
    "_fields": {
      "scale_id": {
        "type": "many2one",
        "label": "scale_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "currency_id"
      },
      "from_amount": {
        "type": "monetary",
        "label": "from_amount"
      },
      "to_amount": {
        "type": "monetary",
        "label": "to_amount"
      },
      "fixed_amount": {
        "type": "monetary",
        "label": "fixed_amount"
      },
      "percentage": {
        "type": "monetary",
        "label": "percentage"
      },
      "excess_amount": {
        "type": "monetary",
        "label": "excess_amount"
      }
    }
  },
  {
    "_name": "l10n_ar.partner.tax",
    "_description": "Argentinean Partner Taxes",
    "_auto": true,
    "_fields": {
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "tax_id": {
        "type": "many2one",
        "label": "tax_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "from_date": {
        "type": "date",
        "label": "from_date"
      },
      "to_date": {
        "type": "date",
        "label": "to_date"
      },
      "ref": {
        "type": "char",
        "label": "ref"
      }
    }
  },
  {
    "_name": "account.account",
    "_description": "account.account",
    "_auto": true,
    "_fields": {
      "l10n_ar_tax_base_account_id": {
        "type": "many2one",
        "label": "l10n_ar_tax_base_account_id"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_ar_partner_tax_ids": {
        "type": "one2many",
        "label": "l10n_ar_partner_tax_ids"
      }
    },
    "_inherit": "res.partner"
  }
];
