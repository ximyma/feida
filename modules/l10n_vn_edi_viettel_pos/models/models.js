// Odoo 模块: l10n_vn_edi_viettel_pos
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "l10n_vn_edi_viettel.sinvoice.symbol",
    "_description": "l10n_vn_edi_viettel.sinvoice.symbol",
    "_auto": true,
    "_fields": {
      "l10n_vn_auto_send_to_sinvoice": {
        "type": "boolean",
        "label": "Auto-send to SInvoice",
        "default": true
      },
      "l10n_vn_pos_symbol": {
        "type": "many2one",
        "label": "l10n_vn_pos_symbol"
      }
    },
    "_inherit": "pos.config"
  },
  {
    "_name": "posorder",
    "_description": "posorder",
    "_auto": true,
    "_fields": {
      "l10n_vn_credit_note_reason": {
        "type": "char",
        "label": "Credit Note Reason"
      },
      "l10n_vn_has_sinvoice_pdf": {
        "type": "boolean",
        "label": "_compute_sinvoice_has_pdf"
      },
      "l10n_vn_sinvoice_state": {
        "type": "selection",
        "label": "account_move.l10n_vn_edi_invoice_state"
      }
    },
    "_inherit": "pos.order"
  }
];
