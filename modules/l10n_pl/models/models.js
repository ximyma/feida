// Odoo 模块: l10n_pl
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_pl_vat_b_spv": {
        "type": "boolean",
        "label": "l10n_pl_vat_b_spv"
      },
      "l10n_pl_vat_b_spv_dostawa": {
        "type": "boolean",
        "label": "l10n_pl_vat_b_spv_dostawa"
      },
      "l10n_pl_vat_b_mpv_prowizja": {
        "type": "boolean",
        "label": "l10n_pl_vat_b_mpv_prowizja"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "l10n_pl.l10n_pl_tax_office",
    "_description": "Tax Office in Poland",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "char",
        "label": "Code",
        "required": true
      },
      "name": {
        "type": "char",
        "label": "Description",
        "required": true
      }
    }
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "l10n_pl_vat_gtu": {
        "type": "selection",
        "label": "l10n_pl_vat_gtu"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_pl_reports_tax_office_id": {
        "type": "many2one",
        "label": "l10n_pl.l10n_pl_tax_office"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_pl_links_with_customer": {
        "type": "boolean",
        "label": "l10n_pl_links_with_customer"
      }
    },
    "_inherit": "res.partner"
  }
];
