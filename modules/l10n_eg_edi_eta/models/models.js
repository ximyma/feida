// Odoo 模块: l10n_eg_edi_eta
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountjournal",
    "_description": "accountjournal",
    "_auto": true,
    "_fields": {
      "l10n_eg_branch_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "l10n_eg_activity_type_id": {
        "type": "many2one",
        "label": "l10n_eg_edi.activity.type"
      },
      "l10n_eg_branch_identifier": {
        "type": "char",
        "label": "ETA Branch ID"
      }
    },
    "_inherit": "account.journal"
  },
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_eg_long_id": {
        "type": "char",
        "label": "ETA Long ID"
      },
      "l10n_eg_qr_code": {
        "type": "char",
        "label": "ETA QR Code"
      },
      "l10n_eg_submission_number": {
        "type": "char",
        "label": "Submission ID"
      },
      "l10n_eg_uuid": {
        "type": "char",
        "label": "Document UUID"
      },
      "l10n_eg_eta_json_doc_file": {
        "type": "text",
        "label": "l10n_eg_eta_json_doc_file"
      },
      "l10n_eg_signing_time": {
        "type": "datetime",
        "label": "Signing Time"
      },
      "l10n_eg_is_signed": {
        "type": "boolean",
        "label": "l10n_eg_is_signed"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "l10n_eg_edi.activity.type",
    "_description": "ETA code for activity type",
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
    "_name": "l10n_eg_edi.thumb.drive",
    "_description": "Thumb drive used to sign invoices in Egypt",
    "_auto": true,
    "_fields": {
      "user_id": {
        "type": "many2one",
        "label": "res.users",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "certificate": {
        "type": "text",
        "label": "ETA Certificate"
      },
      "pin": {
        "type": "char",
        "label": "ETA USB Pin",
        "required": true
      },
      "access_token": {
        "type": "char",
        "label": "access_token",
        "required": true
      }
    }
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "l10n_eg_eta_code": {
        "type": "char",
        "label": "ETA Item code"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "l10n_eg_eta_code": {
        "type": "char",
        "label": "ETA Code"
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_eg_client_identifier": {
        "type": "char",
        "label": "ETA Client ID"
      },
      "l10n_eg_client_secret": {
        "type": "char",
        "label": "ETA Secret"
      },
      "l10n_eg_production_env": {
        "type": "boolean",
        "label": "In Production Environment"
      },
      "l10n_eg_invoicing_threshold": {
        "type": "float",
        "label": "Invoicing Threshold"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_eg_building_no": {
        "type": "char",
        "label": "Building No."
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "l10n_eg_edi.uom.code",
    "_description": "ETA code for the unit of measures",
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
    "_name": "uomuom",
    "_description": "uomuom",
    "_auto": true,
    "_fields": {
      "l10n_eg_unit_code_id": {
        "type": "many2one",
        "label": "l10n_eg_edi.uom.code"
      }
    },
    "_inherit": "uom.uom"
  }
];
