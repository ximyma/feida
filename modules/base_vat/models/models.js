// Odoo 模块: base_vat
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "vat_check_vies": {
        "type": "boolean",
        "label": "Verify VAT Numbers"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "rescountry",
    "_description": "rescountry",
    "_auto": true,
    "_fields": {
      "has_foreign_fiscal_position": {
        "type": "boolean",
        "label": "_compute_has_foreign_fiscal_position"
      }
    },
    "_inherit": "res.country"
  },
  {
    "_name": "check_vat_",
    "_description": "check_vat_",
    "_auto": true,
    "_fields": {
      "vies_valid": {
        "type": "boolean",
        "label": "vies_valid"
      },
      "perform_vies_validation": {
        "type": "boolean",
        "label": "_compute_perform_vies_validation"
      },
      "country_id": {
        "type": "many2one",
        "label": "_inverse_vat"
      },
      "vat": {
        "type": "char",
        "label": "_inverse_vat"
      }
    },
    "_inherit": "res.partner"
  }
];
