// Odoo 模块: l10n_es_edi_sii
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_es_edi_is_required": {
        "type": "boolean",
        "label": "l10n_es_edi_is_required"
      },
      "l10n_es_edi_csv": {
        "type": "char",
        "label": "CSV return code"
      },
      "l10n_es_registration_date": {
        "type": "date",
        "label": "l10n_es_registration_date"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "certificatecertificate",
    "_description": "certificatecertificate",
    "_auto": true,
    "_fields": {
      "scope": {
        "type": "selection",
        "label": "scope"
      }
    },
    "_inherit": "certificate.certificate"
  },
  {
    "_name": "certificate.certificate",
    "_description": "certificate.certificate",
    "_auto": true,
    "_fields": {
      "l10n_es_sii_certificate_id": {
        "type": "many2one",
        "label": "l10n_es_sii_certificate_id"
      },
      "l10n_es_sii_certificate_ids": {
        "type": "one2many",
        "label": "l10n_es_sii_certificate_ids"
      },
      "l10n_es_sii_tax_agency": {
        "type": "selection",
        "label": "l10n_es_sii_tax_agency"
      },
      "l10n_es_sii_test_env": {
        "type": "boolean",
        "label": "l10n_es_sii_test_env"
      }
    },
    "_inherit": "res.company"
  }
];
