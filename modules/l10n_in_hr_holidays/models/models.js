// Odoo 模块: l10n_in_hr_holidays
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hrleave",
    "_description": "hrleave",
    "_auto": true,
    "_fields": {
      "l10n_in_contains_sandwich_leaves": {
        "type": "boolean",
        "label": "l10n_in_contains_sandwich_leaves"
      }
    },
    "_inherit": "hr.leave"
  },
  {
    "_name": "hrleavetype",
    "_description": "hrleavetype",
    "_auto": true,
    "_fields": {
      "l10n_in_is_sandwich_leave": {
        "type": "boolean",
        "label": "l10n_in_is_sandwich_leave"
      },
      "l10n_in_is_limited_to_optional_days": {
        "type": "boolean",
        "label": "l10n_in_is_limited_to_optional_days"
      }
    },
    "_inherit": "hr.leave.type"
  },
  {
    "_name": "l10n.in.hr.leave.optional.holiday",
    "_description": "Optional Holidays",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "date": {
        "type": "date",
        "label": "date",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      }
    }
  }
];
