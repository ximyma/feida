// Odoo 模块: l10n_pl_bank_verification
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "l10n_pl.bank.account.verification",
    "_description": "l10n_pl.bank.account.verification",
    "_auto": true,
    "_fields": {
      "l10n_pl_verification_id": {
        "type": "many2one",
        "label": "l10n_pl_verification_id"
      },
      "l10n_pl_verification_status": {
        "type": "selection",
        "label": "l10n_pl_verification_id.verification_status"
      },
      "l10n_pl_verification_timestamp": {
        "type": "datetime",
        "label": "l10n_pl_verification_id.verification_timestamp"
      },
      "l10n_pl_verification_request_id": {
        "type": "char",
        "label": "l10n_pl_verification_id.verification_request_id"
      }
    },
    "_inherit": "account.payment"
  }
];
