// Odoo 模块: l10n_es_edi_verifactu_pos
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "posconfig",
    "_description": "posconfig",
    "_auto": true,
    "_fields": {
      "l10n_es_edi_verifactu_required": {
        "type": "boolean",
        "label": "l10n_es_edi_verifactu_required"
      }
    },
    "_inherit": "pos.config"
  },
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
      "l10n_es_edi_verifactu_refund_reason": {
        "type": "selection",
        "label": "l10n_es_edi_verifactu_refund_reason"
      }
    },
    "_inherit": "pos.order"
  },
  {
    "_name": "pos.order",
    "_description": "pos.order",
    "_auto": true,
    "_fields": {
      "pos_order_id": {
        "type": "many2one",
        "label": "pos_order_id"
      }
    },
    "_inherit": "l10n_es_edi_verifactu.document"
  }
];
