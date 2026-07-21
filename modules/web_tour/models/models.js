// Odoo 模块: web_tour
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "tour_enabled": {
        "type": "boolean",
        "label": "_compute_tour_enabled"
      }
    },
    "_inherit": "res.users"
  },
  {
    "_name": "web_tour.tour",
    "_description": "Tours",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "step_ids": {
        "type": "one2many",
        "label": "web_tour.tour.step"
      },
      "url": {
        "type": "char",
        "label": "Starting URL",
        "default": "/odoo"
      },
      "sharing_url": {
        "type": "char",
        "label": "_compute_sharing_url"
      },
      "rainbow_man_message": {
        "type": "html",
        "label": "<b>Good job!</b> You went through all steps of this tour.",
        "default": "<b>Good job!</b> You went through all steps of this tour."
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "custom": {
        "type": "boolean",
        "label": "Custom"
      },
      "user_consumed_ids": {
        "type": "many2many",
        "label": "res.users"
      }
    }
  },
  {
    "_name": "web_tour.tour.step",
    "_description": "Tour",
    "_auto": true,
    "_fields": {
      "trigger": {
        "type": "char",
        "label": "trigger",
        "required": true
      },
      "content": {
        "type": "char",
        "label": "content"
      },
      "tooltip_position": {
        "type": "selection",
        "label": "tooltip_position"
      },
      "tour_id": {
        "type": "many2one",
        "label": "web_tour.tour",
        "required": true
      },
      "run": {
        "type": "char",
        "label": "run"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      }
    }
  }
];
