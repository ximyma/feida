// Odoo 模块: account_tax_python
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "amount_type": {
        "type": "selection",
        "label": "amount_type"
      },
      "formula": {
        "type": "text",
        "label": "formula"
      },
      "formula_decoded_info": {
        "type": "char",
        "label": "_compute_formula_decoded_info"
      }
    },
    "_inherit": "account.tax"
  }
];
