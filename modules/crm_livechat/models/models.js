// Odoo 模块: crm_livechat
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "chatbotscript",
    "_description": "chatbotscript",
    "_auto": true,
    "_fields": {
      "lead_count": {
        "type": "integer",
        "label": "lead_count"
      }
    },
    "_inherit": "chatbot.script"
  },
  {
    "_name": "chatbotscriptstep",
    "_description": "chatbotscriptstep",
    "_auto": true,
    "_fields": {
      "step_type": {
        "type": "selection",
        "label": "step_type"
      },
      "crm_team_id": {
        "type": "many2one",
        "label": "crm_team_id"
      }
    },
    "_inherit": "chatbot.script.step"
  },
  {
    "_name": "crmlead",
    "_description": "crmlead",
    "_auto": true,
    "_fields": {
      "origin_channel_id": {
        "type": "many2one",
        "label": "origin_channel_id"
      }
    },
    "_inherit": "crm.lead"
  },
  {
    "_name": "discusschannel",
    "_description": "discusschannel",
    "_auto": true,
    "_fields": {
      "lead_ids": {
        "type": "one2many",
        "label": "lead_ids"
      },
      "has_crm_lead": {
        "type": "boolean",
        "label": "_compute_has_crm_lead"
      }
    },
    "_inherit": "discuss.channel"
  }
];
