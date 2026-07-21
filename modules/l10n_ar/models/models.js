// Odoo 模块: l10n_ar
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountfiscalposition",
    "_description": "accountfiscalposition",
    "_auto": true,
    "_fields": {
      "l10n_ar_afip_responsibility_type_ids": {
        "type": "many2many",
        "label": "l10n_ar_afip_responsibility_type_ids"
      }
    },
    "_inherit": "account.fiscal.position"
  },
  {
    "_name": "accountjournal",
    "_description": "accountjournal",
    "_auto": true,
    "_fields": {
      "l10n_ar_afip_pos_system": {
        "type": "selection",
        "label": "l10n_ar_afip_pos_system"
      },
      "l10n_ar_afip_pos_number": {
        "type": "integer",
        "label": "l10n_ar_afip_pos_number"
      },
      "company_partner": {
        "type": "many2one",
        "label": "res.partner"
      },
      "l10n_ar_afip_pos_partner_id": {
        "type": "many2one",
        "label": "l10n_ar_afip_pos_partner_id"
      },
      "l10n_ar_is_pos": {
        "type": "boolean",
        "label": "l10n_ar_is_pos"
      }
    },
    "_inherit": "account.journal"
  },
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_ar_afip_responsibility_type_id": {
        "type": "many2one",
        "label": "l10n_ar_afip_responsibility_type_id"
      },
      "l10n_ar_afip_concept": {
        "type": "selection",
        "label": "l10n_ar_afip_concept"
      },
      "l10n_ar_afip_service_start": {
        "type": "date",
        "label": "ARCA Service Start Date"
      },
      "l10n_ar_afip_service_end": {
        "type": "date",
        "label": "ARCA Service End Date"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accounttaxgroup",
    "_description": "accounttaxgroup",
    "_auto": true,
    "_fields": {
      "l10n_ar_tribute_afip_code": {
        "type": "selection",
        "label": "l10n_ar_tribute_afip_code"
      },
      "l10n_ar_vat_afip_code": {
        "type": "selection",
        "label": "l10n_ar_vat_afip_code"
      }
    },
    "_inherit": "account.tax.group"
  },
  {
    "_name": "l10n_ar.afip.responsibility.type",
    "_description": "ARCA Responsibility Type",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "trigram",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "code": {
        "type": "char",
        "label": "code",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      }
    }
  },
  {
    "_name": "l10n_latamdocumenttype",
    "_description": "l10n_latamdocumenttype",
    "_auto": true,
    "_fields": {
      "l10n_ar_letter": {
        "type": "selection",
        "label": "l10n_ar_letter"
      },
      "purchase_aliquots": {
        "type": "selection",
        "label": "purchase_aliquots"
      }
    },
    "_inherit": "l10n_latam.document.type"
  },
  {
    "_name": "l10n_latamidentificationtype",
    "_description": "l10n_latamidentificationtype",
    "_auto": true,
    "_fields": {
      "l10n_ar_afip_code": {
        "type": "char",
        "label": "ARCA Code"
      }
    },
    "_inherit": "l10n_latam.identification.type"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_ar_gross_income_number": {
        "type": "char",
        "label": "l10n_ar_gross_income_number"
      },
      "l10n_ar_gross_income_type": {
        "type": "selection",
        "label": "l10n_ar_gross_income_type"
      },
      "l10n_ar_afip_responsibility_type_id": {
        "type": "many2one",
        "label": "l10n_ar_afip_responsibility_type_id"
      },
      "l10n_ar_company_requires_vat": {
        "type": "boolean",
        "label": "_compute_l10n_ar_company_requires_vat"
      },
      "l10n_ar_afip_start_date": {
        "type": "date",
        "label": "Activities Start"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "rescountry",
    "_description": "rescountry",
    "_auto": true,
    "_fields": {
      "l10n_ar_afip_code": {
        "type": "char",
        "label": "ARCA Code"
      },
      "l10n_ar_natural_vat": {
        "type": "char",
        "label": "l10n_ar_natural_vat"
      },
      "l10n_ar_legal_entity_vat": {
        "type": "char",
        "label": "l10n_ar_legal_entity_vat"
      },
      "l10n_ar_other_vat": {
        "type": "char",
        "label": "l10n_ar_other_vat"
      }
    },
    "_inherit": "res.country"
  },
  {
    "_name": "rescurrency",
    "_description": "rescurrency",
    "_auto": true,
    "_fields": {
      "l10n_ar_afip_code": {
        "type": "char",
        "label": "ARCA Code"
      }
    },
    "_inherit": "res.currency"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_ar_vat": {
        "type": "char",
        "label": "l10n_ar_vat"
      },
      "l10n_ar_formatted_vat": {
        "type": "char",
        "label": "l10n_ar_formatted_vat"
      },
      "l10n_ar_gross_income_number": {
        "type": "char",
        "label": "Gross Income Number"
      },
      "l10n_ar_gross_income_type": {
        "type": "selection",
        "label": "l10n_ar_gross_income_type"
      },
      "l10n_ar_afip_responsibility_type_id": {
        "type": "many2one",
        "label": "l10n_ar_afip_responsibility_type_id"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "uomuom",
    "_description": "uomuom",
    "_auto": true,
    "_fields": {
      "l10n_ar_afip_code": {
        "type": "char",
        "label": "Code"
      }
    },
    "_inherit": "uom.uom"
  }
];
