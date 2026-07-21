// Odoo 模块: auth_timeout
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "resgroups",
    "_description": "resgroups",
    "_auto": true,
    "_fields": {
      "lock_timeout": {
        "type": "integer",
        "label": "lock_timeout"
      },
      "lock_timeout_mfa": {
        "type": "boolean",
        "label": "lock_timeout_mfa"
      },
      "lock_timeout_inactivity": {
        "type": "integer",
        "label": "lock_timeout_inactivity"
      },
      "lock_timeout_inactivity_mfa": {
        "type": "boolean",
        "label": "lock_timeout_inactivity_mfa"
      },
      "has_lock_timeout": {
        "type": "boolean",
        "label": "has_lock_timeout"
      },
      "lock_timeout_delay_unit": {
        "type": "selection",
        "label": "_compute_lock_timeout_delay_unit"
      },
      "lock_timeout_delay_in_unit": {
        "type": "integer",
        "label": "_compute_lock_timeout_delay_unit"
      },
      "lock_timeout_2fa_selection": {
        "type": "selection",
        "label": "lock_timeout_2fa_selection"
      },
      "has_lock_timeout_inactivity": {
        "type": "boolean",
        "label": "has_lock_timeout_inactivity"
      },
      "lock_timeout_inactivity_delay_unit": {
        "type": "selection",
        "label": "lock_timeout_inactivity_delay_unit"
      },
      "lock_timeout_inactivity_delay_in_unit": {
        "type": "integer",
        "label": "lock_timeout_inactivity_delay_in_unit"
      },
      "lock_timeout_inactivity_2fa_selection": {
        "type": "selection",
        "label": "lock_timeout_inactivity_2fa_selection"
      }
    },
    "_inherit": "res.groups"
  }
];
