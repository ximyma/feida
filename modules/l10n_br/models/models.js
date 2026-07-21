// Odoo 模块: l10n_br
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "tax_discount": {
        "type": "boolean",
        "label": "Discount this Tax in Price"
      },
      "base_reduction": {
        "type": "float",
        "label": "Redution",
        "required": true
      },
      "amount_mva": {
        "type": "float",
        "label": "MVA Percent",
        "required": true
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "accountfiscalposition",
    "_description": "accountfiscalposition",
    "_auto": true,
    "_fields": {
      "l10n_br_fp_type": {
        "type": "selection",
        "label": "l10n_br_fp_type"
      }
    },
    "_inherit": "account.fiscal.position"
  },
  {
    "_name": "accountjournal",
    "_description": "accountjournal",
    "_auto": true,
    "_fields": {
      "l10n_br_invoice_serial": {
        "type": "char",
        "label": "l10n_br_invoice_serial"
      }
    },
    "_inherit": "account.journal"
  },
  {
    "_name": "l10n_br.zip.range",
    "_description": "Brazilian city zip range",
    "_auto": true,
    "_fields": {
      "city_id": {
        "type": "many2one",
        "label": "res.city",
        "required": true
      },
      "start": {
        "type": "char",
        "label": "From",
        "required": true
      },
      "end": {
        "type": "char",
        "label": "To",
        "required": true
      }
    }
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_br_ie_code": {
        "type": "char",
        "label": "IE"
      },
      "l10n_br_im_code": {
        "type": "char",
        "label": "IM"
      },
      "l10n_br_nire_code": {
        "type": "char",
        "label": "NIRE"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_br_ie_code": {
        "type": "char",
        "label": "IE"
      },
      "l10n_br_im_code": {
        "type": "char",
        "label": "IM"
      },
      "l10n_br_isuf_code": {
        "type": "char",
        "label": "SUFRAMA code"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "respartnerbank",
    "_description": "respartnerbank",
    "_auto": true,
    "_fields": {
      "proxy_type": {
        "type": "selection",
        "label": "proxy_type"
      }
    },
    "_inherit": "res.partner.bank"
  }
];
