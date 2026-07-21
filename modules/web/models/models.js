// Odoo 模块: web
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "resuserssettings",
    "_description": "resuserssettings",
    "_auto": true,
    "_fields": {
      "embedded_actions_config_ids": {
        "type": "one2many",
        "label": "res.users.settings.embedded.action"
      }
    },
    "_inherit": "res.users.settings"
  },
  {
    "_name": "res.users.settings.embedded.action",
    "_description": "User Settings for Embedded Actions",
    "_auto": true,
    "_fields": {
      "user_setting_id": {
        "type": "many2one",
        "label": "res.users.settings",
        "required": true
      },
      "action_id": {
        "type": "many2one",
        "label": "ir.actions.act_window",
        "required": true
      },
      "res_model": {
        "type": "char",
        "label": "res_model",
        "required": true
      },
      "res_id": {
        "type": "integer",
        "label": "res_id"
      },
      "embedded_actions_order": {
        "type": "char",
        "label": "List order of embedded action ids"
      },
      "embedded_actions_visibility": {
        "type": "char",
        "label": "List visibility of embedded actions ids"
      },
      "embedded_visibility": {
        "type": "boolean",
        "label": "Is top bar visible"
      }
    }
  }
];
