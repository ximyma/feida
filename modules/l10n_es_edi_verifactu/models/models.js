// Odoo 模块: l10n_es_edi_verifactu
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "l10n_es_edi_verifactu.document",
    "_description": "l10n_es_edi_verifactu.document",
    "_auto": true,
    "_fields": {
      "l10n_es_edi_verifactu_required": {
        "type": "boolean",
        "label": "l10n_es_edi_verifactu_required"
      },
      "l10n_es_edi_verifactu_document_ids": {
        "type": "one2many",
        "label": "l10n_es_edi_verifactu_document_ids"
      },
      "l10n_es_edi_verifactu_state": {
        "type": "selection",
        "label": "l10n_es_edi_verifactu_state"
      },
      "l10n_es_edi_verifactu_warning_level": {
        "type": "char",
        "label": "l10n_es_edi_verifactu_warning_level"
      },
      "l10n_es_edi_verifactu_warning": {
        "type": "html",
        "label": "l10n_es_edi_verifactu_warning"
      },
      "l10n_es_edi_verifactu_qr_code": {
        "type": "char",
        "label": "l10n_es_edi_verifactu_qr_code"
      },
      "l10n_es_edi_verifactu_show_cancel_button": {
        "type": "boolean",
        "label": "l10n_es_edi_verifactu_show_cancel_button"
      },
      "l10n_es_edi_verifactu_available_clave_regimens": {
        "type": "char",
        "label": "l10n_es_edi_verifactu_available_clave_regimens"
      },
      "l10n_es_edi_verifactu_clave_regimen": {
        "type": "selection",
        "label": "l10n_es_edi_verifactu_clave_regimen"
      },
      "l10n_es_edi_verifactu_substituted_entry_id": {
        "type": "many2one",
        "label": "l10n_es_edi_verifactu_substituted_entry_id"
      },
      "l10n_es_edi_verifactu_substitution_move_ids": {
        "type": "one2many",
        "label": "l10n_es_edi_verifactu_substitution_move_ids"
      },
      "l10n_es_edi_verifactu_refund_reason": {
        "type": "selection",
        "label": "l10n_es_edi_verifactu_refund_reason"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_es_applicability": {
        "type": "selection",
        "label": "l10n_es_applicability"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "certificate",
    "_description": "certificate",
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
      "l10n_es_edi_verifactu_certificate_ids": {
        "type": "one2many",
        "label": "l10n_es_edi_verifactu_certificate_ids"
      },
      "l10n_es_edi_verifactu_required": {
        "type": "boolean",
        "label": "l10n_es_edi_verifactu_required"
      },
      "l10n_es_edi_verifactu_test_environment": {
        "type": "boolean",
        "label": "l10n_es_edi_verifactu_test_environment"
      },
      "l10n_es_edi_verifactu_chain_sequence_id": {
        "type": "many2one",
        "label": "l10n_es_edi_verifactu_chain_sequence_id"
      },
      "l10n_es_edi_verifactu_next_batch_time": {
        "type": "datetime",
        "label": "l10n_es_edi_verifactu_next_batch_time"
      },
      "l10n_es_edi_verifactu_special_vat_regime": {
        "type": "selection",
        "label": "l10n_es_edi_verifactu_special_vat_regime"
      }
    },
    "_inherit": "res.company"
  }
];
