// Odoo 模块: l10n_fr_account
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_fr_is_company_french": {
        "type": "boolean",
        "label": "_compute_l10n_fr_is_company_french"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_fr_rounding_difference_loss_account_id": {
        "type": "many2one",
        "label": "account.account"
      },
      "l10n_fr_rounding_difference_profit_account_id": {
        "type": "many2one",
        "label": "account.account"
      }
    },
    "_inherit": "res.company"
  }
];
