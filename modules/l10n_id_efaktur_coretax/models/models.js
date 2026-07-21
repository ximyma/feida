// Odoo 模块: l10n_id_efaktur_coretax
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_id_coretax_add_info_07": {
        "type": "selection",
        "label": "l10n_id_coretax_add_info_07"
      },
      "l10n_id_coretax_facility_info_07": {
        "type": "selection",
        "label": "l10n_id_coretax_facility_info_07"
      },
      "l10n_id_coretax_add_info_08": {
        "type": "selection",
        "label": "l10n_id_coretax_add_info_08"
      },
      "l10n_id_coretax_facility_info_08": {
        "type": "selection",
        "label": "l10n_id_coretax_facility_info_08"
      },
      "l10n_id_coretax_efaktur_available": {
        "type": "boolean",
        "label": "_compute_l10n_id_coretax_efaktur_available"
      },
      "l10n_id_coretax_document": {
        "type": "many2one",
        "label": "l10n_id_efaktur_coretax.document"
      },
      "l10n_id_coretax_custom_doc": {
        "type": "char",
        "label": "Additional documentation when choosing kode 07 or 08"
      },
      "l10n_id_coretax_custom_doc_month_year": {
        "type": "date",
        "label": "Custom Document Month and Year"
      },
      "l10n_id_kode_transaksi": {
        "type": "selection",
        "label": "l10n_id_kode_transaksi"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "l10n_id_efaktur_coretax.document",
    "_description": "E-Faktur Document",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "_compute_name"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active"
      },
      "invoice_ids": {
        "type": "one2many",
        "label": "invoice_ids"
      },
      "attachment_id": {
        "type": "many2one",
        "label": "ir.attachment"
      }
    }
  },
  {
    "_name": "l10n_id_efaktur_coretax.product.code",
    "_description": "Product categorization according to E-Faktur",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "char",
        "label": "code"
      },
      "description": {
        "type": "text",
        "label": "description"
      }
    }
  },
  {
    "_name": "partner",
    "_description": "partner",
    "_auto": true,
    "_fields": {
      "l10n_id_tku": {
        "type": "char",
        "label": "l10n_id_tku"
      },
      "l10n_id_buyer_document_type": {
        "type": "selection",
        "label": "l10n_id_buyer_document_type"
      },
      "l10n_id_buyer_document_number": {
        "type": "char",
        "label": "Document Number"
      },
      "l10n_id_nik": {
        "type": "char",
        "label": "NIK"
      },
      "l10n_id_pkp": {
        "type": "boolean",
        "label": "Is PKP"
      },
      "l10n_id_kode_transaksi": {
        "type": "selection",
        "label": "l10n_id_kode_transaksi"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "l10n_id_efaktur_coretax.uom.code",
    "_description": "UOM categorization according to E-Faktur",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "char",
        "label": "code"
      },
      "name": {
        "type": "char",
        "label": "name"
      }
    }
  },
  {
    "_name": "uom",
    "_description": "uom",
    "_auto": true,
    "_fields": {
      "l10n_id_uom_code": {
        "type": "many2one",
        "label": "l10n_id_efaktur_coretax.uom.code"
      }
    },
    "_inherit": "uom.uom"
  }
];
