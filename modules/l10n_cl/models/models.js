// Odoo 模块: l10n_cl
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "partner_id_vat": {
        "type": "char",
        "label": "partner_id.vat"
      },
      "l10n_latam_internal_type": {
        "type": "selection",
        "label": "l10n_latam_internal_type"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_cl_sii_code": {
        "type": "integer",
        "label": "SII Code"
      }
    },
    "_inherit": "account.tax"
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
      "l10n_cl_active": {
        "type": "boolean",
        "label": "l10n_cl_active"
      }
    },
    "_inherit": "l10n_latam.document.type"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_cl_activity_description": {
        "type": "char",
        "label": "l10n_cl_activity_description"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "rescountry",
    "_description": "rescountry",
    "_auto": true,
    "_fields": {
      "l10n_cl_customs_code": {
        "type": "char",
        "label": "Customs Code"
      },
      "l10n_cl_customs_name": {
        "type": "char",
        "label": "Customs Name"
      },
      "l10n_cl_customs_abbreviation": {
        "type": "char",
        "label": "Customs Abbreviation"
      }
    },
    "_inherit": "res.country"
  },
  {
    "_name": "rescurrency",
    "_description": "rescurrency",
    "_auto": true,
    "_fields": {
      "l10n_cl_currency_code": {
        "type": "char",
        "label": "Currency Code"
      },
      "l10n_cl_short_name": {
        "type": "char",
        "label": "Short Name"
      }
    },
    "_inherit": "res.currency"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_cl_sii_taxpayer_type": {
        "type": "selection",
        "label": "l10n_cl_sii_taxpayer_type"
      },
      "l10n_cl_activity_description": {
        "type": "char",
        "label": "Activity Description"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "resbank",
    "_description": "resbank",
    "_auto": true,
    "_fields": {
      "l10n_cl_sbif_code": {
        "type": "char",
        "label": "Cod. SBIF"
      },
      "fiscal_country_codes": {
        "type": "char",
        "label": "fiscal_country_codes"
      }
    },
    "_inherit": "res.bank"
  },
  {
    "_name": "uomuom",
    "_description": "uomuom",
    "_auto": true,
    "_fields": {
      "l10n_cl_sii_code": {
        "type": "char",
        "label": "SII Code"
      }
    },
    "_inherit": "uom.uom"
  }
];
