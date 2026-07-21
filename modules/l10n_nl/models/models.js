// Odoo 模块: l10n_nl
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_nl_rounding_difference_loss_account_id": {
        "type": "many2one",
        "label": "account.account"
      },
      "l10n_nl_rounding_difference_profit_account_id": {
        "type": "many2one",
        "label": "account.account"
      }
    },
    "_inherit": "res.company"
  }
];
