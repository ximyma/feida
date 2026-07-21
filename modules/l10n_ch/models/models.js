// Odoo 模块: l10n_ch
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_ch_is_qr_valid": {
        "type": "boolean",
        "label": "_compute_l10n_ch_qr_is_valid"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accountjournal",
    "_description": "accountjournal",
    "_auto": true,
    "_fields": {
      "invoice_reference_model": {
        "type": "selection",
        "label": "invoice_reference_model"
      }
    },
    "_inherit": "account.journal"
  },
  {
    "_name": "accountpayment",
    "_description": "accountpayment",
    "_auto": true,
    "_fields": {
      "l10n_ch_reference_warning_msg": {
        "type": "char",
        "label": "_compute_l10n_ch_reference_warning_msg"
      }
    },
    "_inherit": "account.payment"
  },
  {
    "_name": "respartnerbank",
    "_description": "respartnerbank",
    "_auto": true,
    "_fields": {
      "l10n_ch_qr_iban": {
        "type": "char",
        "label": "QR-IBAN"
      },
      "l10n_ch_display_qr_bank_options": {
        "type": "boolean",
        "label": "_compute_l10n_ch_display_qr_bank_options"
      }
    },
    "_inherit": "res.partner.bank"
  }
];
