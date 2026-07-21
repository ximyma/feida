// Odoo 模块: l10n_latam_check
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmoveline",
    "_description": "accountmoveline",
    "_auto": true,
    "_fields": {
      "l10n_latam_check_ids": {
        "type": "one2many",
        "label": "l10n_latam.check"
      }
    },
    "_inherit": "account.move.line"
  },
  {
    "_name": "l10n_latam.check",
    "_description": "l10n_latam.check",
    "_auto": true,
    "_fields": {
      "l10n_latam_new_check_ids": {
        "type": "one2many",
        "label": "l10n_latam.check"
      },
      "l10n_latam_move_check_ids": {
        "type": "many2many",
        "label": "l10n_latam_move_check_ids"
      },
      "l10n_latam_check_warning_msg": {
        "type": "text",
        "label": "_compute_l10n_latam_check_warning_msg"
      },
      "amount": {
        "type": "monetary",
        "label": "_compute_amount"
      }
    },
    "_inherit": "account.payment"
  }
];
