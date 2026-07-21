// Odoo 模块: l10n_ar_stock
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "l10n_ar_delivery_guide_number": {
        "type": "char",
        "label": "l10n_ar_delivery_guide_number"
      },
      "l10n_ar_cai_data": {
        "type": "char",
        "label": "CAI Data"
      },
      "l10n_ar_allow_generate_delivery_guide": {
        "type": "boolean",
        "label": "l10n_ar_allow_generate_delivery_guide"
      },
      "l10n_ar_allow_send_delivery_guide": {
        "type": "boolean",
        "label": "l10n_ar_allow_send_delivery_guide"
      }
    },
    "_inherit": "stock.picking"
  },
  {
    "_name": "l10n_latam.document.type",
    "_description": "l10n_latam.document.type",
    "_auto": true,
    "_fields": {
      "l10n_ar_document_type_id": {
        "type": "many2one",
        "label": "l10n_ar_document_type_id"
      },
      "l10n_ar_cai_authorization_code": {
        "type": "char",
        "label": "l10n_ar_cai_authorization_code"
      },
      "l10n_ar_cai_expiration_date": {
        "type": "date",
        "label": "l10n_ar_cai_expiration_date"
      },
      "l10n_ar_sequence_number_start": {
        "type": "char",
        "label": "l10n_ar_sequence_number_start"
      },
      "l10n_ar_sequence_number_end": {
        "type": "char",
        "label": "l10n_ar_sequence_number_end"
      },
      "l10n_ar_delivery_sequence_prefix": {
        "type": "char",
        "label": "l10n_ar_delivery_sequence_prefix"
      },
      "l10n_ar_next_delivery_number": {
        "type": "integer",
        "label": "l10n_ar_next_delivery_number"
      },
      "l10n_ar_sequence_id": {
        "type": "many2one",
        "label": "l10n_ar_sequence_id"
      }
    },
    "_inherit": "stock.picking.type"
  }
];
