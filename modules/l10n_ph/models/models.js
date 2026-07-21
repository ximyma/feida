// Odoo 模块: l10n_ph
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_ph_atc": {
        "type": "char",
        "label": "Philippines ATC"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "branch_code": {
        "type": "char",
        "label": "Company Branch Code"
      },
      "l10n_ph_rdo": {
        "type": "char",
        "label": "partner_id.l10n_ph_rdo"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "branch_code": {
        "type": "char",
        "label": "Branch Code",
        "default": "000"
      },
      "first_name": {
        "type": "char",
        "label": "First Name"
      },
      "middle_name": {
        "type": "char",
        "label": "Middle Name"
      },
      "last_name": {
        "type": "char",
        "label": "Last Name"
      },
      "l10n_ph_rdo": {
        "type": "char",
        "label": "RDO"
      }
    },
    "_inherit": "res.partner"
  }
];
