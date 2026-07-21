// Odoo 模块: l10n_ee
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_ee_kmd_inf_code": {
        "type": "selection",
        "label": "l10n_ee_kmd_inf_code"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_ee_rounding_difference_loss_account_id": {
        "type": "many2one",
        "label": "account.account"
      },
      "l10n_ee_rounding_difference_profit_account_id": {
        "type": "many2one",
        "label": "account.account"
      }
    },
    "_inherit": "res.company"
  }
];
