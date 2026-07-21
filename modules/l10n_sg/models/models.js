// Odoo 模块: l10n_sg
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_sg_permit_number": {
        "type": "char",
        "label": "Permit No."
      },
      "l10n_sg_permit_number_date": {
        "type": "date",
        "label": "Date of permit number"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "respartnerbank",
    "_description": "respartnerbank",
    "_auto": true,
    "_fields": {
      "proxy_type": {
        "type": "selection",
        "label": "mobile"
      }
    },
    "_inherit": "res.partner.bank"
  },
  {
    "_name": "res.company",
    "_description": "Companies",
    "_auto": true,
    "_fields": {
      "l10n_sg_unique_entity_number": {
        "type": "char",
        "label": "UEN"
      }
    }
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_sg_unique_entity_number": {
        "type": "char",
        "label": "UEN"
      }
    },
    "_inherit": "res.partner"
  }
];
