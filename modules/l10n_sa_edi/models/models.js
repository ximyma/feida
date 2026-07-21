// Odoo 模块: l10n_sa_edi
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "certificate.certificate",
    "_description": "certificate.certificate",
    "_auto": true,
    "_fields": {
      "l10n_sa_csr": {
        "type": "text",
        "label": "base.group_system"
      },
      "l10n_sa_csr_errors": {
        "type": "html",
        "label": "Onboarding Errors"
      },
      "l10n_sa_compliance_csid_json": {
        "type": "char",
        "label": "CCSID JSON"
      },
      "l10n_sa_production_csid_certificate_id": {
        "type": "many2one",
        "label": "PCSID Certificate"
      },
      "l10n_sa_production_csid_json": {
        "type": "char",
        "label": "PCSID JSON"
      },
      "l10n_sa_production_csid_validity": {
        "type": "datetime",
        "label": "l10n_sa_production_csid_certificate_id.date_end"
      },
      "l10n_sa_compliance_csid_certificate_id": {
        "type": "many2one",
        "label": "CCSID certificate"
      },
      "l10n_sa_compliance_checks_passed": {
        "type": "boolean",
        "label": "Compliance Checks Done",
        "default": false
      },
      "l10n_sa_chain_sequence_id": {
        "type": "many2one",
        "label": "ir.sequence"
      },
      "l10n_sa_latest_submission_hash": {
        "type": "char",
        "label": "Latest Submission Hash"
      }
    },
    "_inherit": "account.journal"
  },
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_sa_uuid": {
        "type": "char",
        "label": "Document UUID (SA)"
      },
      "l10n_sa_invoice_signature": {
        "type": "char",
        "label": "Unsigned XML Signature"
      },
      "l10n_sa_chain_index": {
        "type": "integer",
        "label": "l10n_sa_chain_index"
      },
      "l10n_sa_edi_chain_head_id": {
        "type": "many2one",
        "label": "l10n_sa_edi_chain_head_id"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_sa_is_retention": {
        "type": "boolean",
        "label": "Is Retention",
        "default": false
      },
      "l10n_sa_exemption_reason_code": {
        "type": "selection",
        "label": "Exemption Reason Code"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "certificate.key",
    "_description": "certificate.key",
    "_auto": true,
    "_fields": {
      "l10n_sa_private_key_id": {
        "type": "many2one",
        "label": "ZATCA Private key"
      },
      "l10n_sa_api_mode": {
        "type": "selection",
        "label": "l10n_sa_api_mode"
      },
      "l10n_sa_edi_building_number": {
        "type": "char",
        "label": "_compute_address"
      },
      "l10n_sa_edi_plot_identification": {
        "type": "char",
        "label": "_compute_address"
      },
      "l10n_sa_edi_additional_identification_scheme": {
        "type": "selection",
        "label": "l10n_sa_edi_additional_identification_scheme"
      },
      "l10n_sa_edi_additional_identification_number": {
        "type": "char",
        "label": "l10n_sa_edi_additional_identification_number"
      },
      "l10n_sa_edi_is_production": {
        "type": "boolean",
        "label": "Is Production"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_sa_edi_building_number": {
        "type": "char",
        "label": "Building Number"
      },
      "l10n_sa_edi_plot_identification": {
        "type": "char",
        "label": "Plot Identification"
      },
      "l10n_sa_edi_additional_identification_scheme": {
        "type": "selection",
        "label": "l10n_sa_edi_additional_identification_scheme"
      },
      "l10n_sa_edi_additional_identification_number": {
        "type": "char",
        "label": "Identification Number (SA)"
      }
    },
    "_inherit": "res.partner"
  }
];
