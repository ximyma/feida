// Odoo 模块: l10n_fr_hr_holidays
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "hrleave",
    "_description": "hrleave",
    "_auto": true,
    "_fields": {
      "l10n_fr_date_to_changed": {
        "type": "boolean",
        "label": "l10n_fr_date_to_changed"
      }
    },
    "_inherit": "hr.leave"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_fr_reference_leave_type": {
        "type": "many2one",
        "label": "l10n_fr_reference_leave_type"
      }
    },
    "_inherit": "res.company"
  }
];
