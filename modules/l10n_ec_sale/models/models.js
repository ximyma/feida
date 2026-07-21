// Odoo 模块: l10n_ec_sale
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "l10n_ec.sri.payment",
    "_description": "l10n_ec.sri.payment",
    "_auto": true,
    "_fields": {
      "l10n_ec_sri_payment_id": {
        "type": "many2one",
        "label": "l10n_ec_sri_payment_id"
      },
      "fiscal_country_codes": {
        "type": "char",
        "label": "fiscal_country_codes"
      }
    },
    "_inherit": "payment.method"
  }
];
