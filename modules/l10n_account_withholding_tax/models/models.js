// Odoo 模块: l10n_account_withholding_tax
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "account.payment.withholding.line",
    "_description": "account.payment.withholding.line",
    "_auto": true,
    "_fields": {
      "display_withholding": {
        "type": "boolean",
        "label": "_compute_display_withholding"
      },
      "should_withhold_tax": {
        "type": "boolean",
        "label": "should_withhold_tax"
      },
      "withholding_line_ids": {
        "type": "one2many",
        "label": "withholding_line_ids"
      },
      "withholding_payment_account_id": {
        "type": "many2one",
        "label": "payment_method_line_id.payment_account_id"
      },
      "outstanding_account_id": {
        "type": "many2one",
        "label": "outstanding_account_id"
      },
      "withholding_hide_tax_base_account": {
        "type": "boolean",
        "label": "_compute_withholding_hide_tax_base_account"
      }
    },
    "_inherit": "account.payment"
  },
  {
    "_name": "ir.sequence",
    "_description": "ir.sequence",
    "_auto": true,
    "_fields": {
      "is_withholding_tax_on_payment": {
        "type": "boolean",
        "label": "is_withholding_tax_on_payment"
      },
      "withholding_sequence_id": {
        "type": "many2one",
        "label": "withholding_sequence_id"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "account.account",
    "_description": "account.account",
    "_auto": true,
    "_fields": {
      "withholding_tax_base_account_id": {
        "type": "many2one",
        "label": "withholding_tax_base_account_id"
      }
    },
    "_inherit": "res.company"
  }
];
