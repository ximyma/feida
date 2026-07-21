// Odoo 模块: l10n_mx
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_mx_factor_type": {
        "type": "selection",
        "label": "l10n_mx_factor_type"
      },
      "l10n_mx_tax_type": {
        "type": "selection",
        "label": "l10n_mx_tax_type"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "resbank",
    "_description": "resbank",
    "_auto": true,
    "_fields": {
      "l10n_mx_edi_code": {
        "type": "char",
        "label": "l10n_mx_edi_code"
      },
      "fiscal_country_codes": {
        "type": "char",
        "label": "fiscal_country_codes"
      }
    },
    "_inherit": "res.bank"
  },
  {
    "_name": "respartnerbank",
    "_description": "respartnerbank",
    "_auto": true,
    "_fields": {
      "l10n_mx_edi_clabe": {
        "type": "char",
        "label": "l10n_mx_edi_clabe"
      },
      "fiscal_country_codes": {
        "type": "char",
        "label": "fiscal_country_codes"
      }
    },
    "_inherit": "res.partner.bank"
  },
  {
    "_name": "account.account",
    "_description": "account.account",
    "_auto": true,
    "_fields": {
      "l10n_mx_income_return_discount_account_id": {
        "type": "many2one",
        "label": "l10n_mx_income_return_discount_account_id"
      },
      "l10n_mx_income_re_invoicing_account_id": {
        "type": "many2one",
        "label": "l10n_mx_income_re_invoicing_account_id"
      }
    },
    "_inherit": "res.company"
  }
];
