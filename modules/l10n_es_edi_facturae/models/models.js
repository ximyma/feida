// Odoo 模块: l10n_es_edi_facturae
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "ir.attachment",
    "_description": "[default_code] name",
    "_auto": true,
    "_fields": {
      "l10n_es_edi_facturae_xml_id": {
        "type": "many2one",
        "label": "l10n_es_edi_facturae_xml_id"
      },
      "l10n_es_edi_facturae_xml_file": {
        "type": "text",
        "label": "l10n_es_edi_facturae_xml_file"
      },
      "l10n_es_edi_facturae_reason_code": {
        "type": "selection",
        "label": "l10n_es_edi_facturae_reason_code"
      },
      "l10n_es_invoicing_period_start_date": {
        "type": "date",
        "label": "Invoice Period Start Date"
      },
      "l10n_es_invoicing_period_end_date": {
        "type": "date",
        "label": "Invoice Period End Date"
      },
      "l10n_es_payment_means": {
        "type": "selection",
        "label": "l10n_es_payment_means"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_es_edi_facturae_tax_type": {
        "type": "selection",
        "label": "l10n_es_edi_facturae_tax_type"
      }
    },
    "_inherit": "account.tax"
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
      "l10n_es_edi_facturae_residence_type": {
        "type": "char",
        "label": "Facturae EDI Residency Type Code"
      },
      "l10n_es_edi_facturae_certificate_ids": {
        "type": "one2many",
        "label": "Facturae EDI signing certificate"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "l10n_es_edi_facturae.ac_role_type",
    "_description": "Administrative Center Role Type",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "char",
        "label": "code",
        "required": true
      },
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      }
    }
  },
  {
    "_name": "uomuom",
    "_description": "uomuom",
    "_auto": true,
    "_fields": {
      "l10n_es_edi_facturae_uom_code": {
        "type": "selection",
        "label": "l10n_es_edi_facturae_uom_code"
      }
    },
    "_inherit": "uom.uom"
  }
];
