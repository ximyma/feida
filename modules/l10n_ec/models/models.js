// Odoo 模块: l10n_ec
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "res.partner",
    "_description": "res.partner",
    "_auto": true,
    "_fields": {
      "l10n_ec_require_emission": {
        "type": "boolean",
        "label": "l10n_ec_require_emission"
      },
      "l10n_ec_entity": {
        "type": "char",
        "label": "l10n_ec_entity"
      },
      "l10n_ec_emission": {
        "type": "char",
        "label": "l10n_ec_emission"
      },
      "l10n_ec_emission_address_id": {
        "type": "many2one",
        "label": "l10n_ec_emission_address_id"
      }
    },
    "_inherit": "account.journal"
  },
  {
    "_name": "l10n_ec.sri.payment",
    "_description": "l10n_ec.sri.payment",
    "_auto": true,
    "_fields": {
      "l10n_ec_sri_payment_id": {
        "type": "many2one",
        "label": "l10n_ec_sri_payment_id"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_ec_code_base": {
        "type": "char",
        "label": "l10n_ec_code_base"
      },
      "l10n_ec_code_applied": {
        "type": "char",
        "label": "l10n_ec_code_applied"
      },
      "l10n_ec_code_ats": {
        "type": "char",
        "label": "l10n_ec_code_ats"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "accounttaxgroup",
    "_description": "accounttaxgroup",
    "_auto": true,
    "_fields": {
      "l10n_ec_type": {
        "type": "selection",
        "label": "l10n_ec_type"
      }
    },
    "_inherit": "account.tax.group"
  },
  {
    "_name": "l10n_latamdocumenttype",
    "_description": "l10n_latamdocumenttype",
    "_auto": true,
    "_fields": {
      "internal_type": {
        "type": "selection",
        "label": "internal_type"
      },
      "l10n_ec_check_format": {
        "type": "boolean",
        "label": "l10n_ec_check_format"
      }
    },
    "_inherit": "l10n_latam.document.type"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_ec_vat_validation": {
        "type": "char",
        "label": "l10n_ec_vat_validation"
      }
    },
    "_inherit": "res.partner"
  }
];
