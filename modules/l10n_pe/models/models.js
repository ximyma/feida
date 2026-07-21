// Odoo 模块: l10n_pe
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_pe_edi_tax_code": {
        "type": "selection",
        "label": "l10n_pe_edi_tax_code"
      },
      "l10n_pe_edi_unece_category": {
        "type": "selection",
        "label": "l10n_pe_edi_unece_category"
      },
      "l10n_pe_edi_isc_type": {
        "type": "selection",
        "label": "l10n_pe_edi_isc_type"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "l10n_latamidentificationtype",
    "_description": "l10n_latamidentificationtype",
    "_auto": true,
    "_fields": {
      "l10n_pe_vat_code": {
        "type": "char",
        "label": "l10n_pe_vat_code"
      }
    },
    "_inherit": "l10n_latam.identification.type"
  },
  {
    "_name": "resbank",
    "_description": "resbank",
    "_auto": true,
    "_fields": {
      "l10n_pe_edi_code": {
        "type": "char",
        "label": "l10n_pe_edi_code"
      }
    },
    "_inherit": "res.bank"
  },
  {
    "_name": "rescity",
    "_description": "rescity",
    "_auto": true,
    "_fields": {
      "l10n_pe_code": {
        "type": "char",
        "label": "Code"
      }
    },
    "_inherit": "res.city"
  },
  {
    "_name": "l10n_pe.res.city.district",
    "_description": "District",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "city_id": {
        "type": "many2one",
        "label": "res.city"
      },
      "code": {
        "type": "char",
        "label": "code"
      }
    }
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_pe_district": {
        "type": "many2one",
        "label": "l10n_pe_district"
      },
      "l10n_pe_district_name": {
        "type": "char",
        "label": "District name"
      }
    },
    "_inherit": "res.partner"
  }
];
