// Odoo 模块: l10n_es_edi_tbai_pos
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "l10n_es_edi_tbai.document",
    "_description": "l10n_es_edi_tbai.document",
    "_auto": true,
    "_fields": {
      "l10n_es_tbai_state": {
        "type": "selection",
        "label": "l10n_es_tbai_state"
      },
      "l10n_es_tbai_chain_index": {
        "type": "integer",
        "label": "l10n_es_tbai_chain_index"
      },
      "l10n_es_tbai_post_document_id": {
        "type": "many2one",
        "label": "l10n_es_tbai_post_document_id"
      },
      "l10n_es_tbai_post_file": {
        "type": "text",
        "label": "l10n_es_tbai_post_file"
      },
      "l10n_es_tbai_post_file_name": {
        "type": "char",
        "label": "l10n_es_tbai_post_file_name"
      },
      "l10n_es_tbai_is_required": {
        "type": "boolean",
        "label": "l10n_es_tbai_is_required"
      },
      "l10n_es_tbai_refund_reason": {
        "type": "selection",
        "label": "l10n_es_tbai_refund_reason"
      }
    },
    "_inherit": "pos.order"
  }
];
