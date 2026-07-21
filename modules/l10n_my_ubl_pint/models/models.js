// Odoo 模块: l10n_my_ubl_pint
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "sst_registration_number": {
        "type": "char",
        "label": "partner_id.sst_registration_number"
      },
      "ttx_registration_number": {
        "type": "char",
        "label": "partner_id.ttx_registration_number"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "invoice_edi_format": {
        "type": "selection",
        "label": "pint_my"
      },
      "sst_registration_number": {
        "type": "char",
        "label": "sst_registration_number"
      },
      "ttx_registration_number": {
        "type": "char",
        "label": "ttx_registration_number"
      }
    },
    "_inherit": "res.partner"
  }
];
