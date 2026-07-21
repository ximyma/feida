// Odoo 模块: l10n_sg_ubl_pint
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "ubl_cii_tax_category_code": {
        "type": "selection",
        "label": "ubl_cii_tax_category_code"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "invoice_edi_format": {
        "type": "selection",
        "label": "pint_sg"
      }
    },
    "_inherit": "res.partner"
  }
];
