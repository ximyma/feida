// Odoo 模块: l10n_tw_edi_ecpay_website_sale
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_tw_edi_require_paper_format": {
        "type": "boolean",
        "label": "l10n_tw_edi_require_paper_format"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "l10n_tw_edi_is_print": {
        "type": "boolean",
        "label": "Print"
      },
      "l10n_tw_edi_love_code": {
        "type": "char",
        "label": "Love Code"
      },
      "l10n_tw_edi_carrier_type": {
        "type": "selection",
        "label": "l10n_tw_edi_carrier_type"
      },
      "l10n_tw_edi_carrier_number": {
        "type": "char",
        "label": "Carrier Number"
      },
      "l10n_tw_edi_carrier_number_2": {
        "type": "char",
        "label": "Carrier Number 2"
      }
    },
    "_inherit": "sale.order"
  }
];
