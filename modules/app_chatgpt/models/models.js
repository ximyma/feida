// Odoo 模块: app_chatgpt
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "ai.robot",
    "_description": "Ai Robot",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "provider": {
        "type": "selection",
        "label": "AI Provider Name"
      },
      "ai_model": {
        "type": "char",
        "label": "Ai Model",
        "required": true,
        "default": "auto"
      },
      "set_ai_model": {
        "type": "selection",
        "label": "Quick Set Model"
      },
      "openapi_api_key": {
        "type": "char",
        "label": "API Key"
      },
      "max_tokens": {
        "type": "integer",
        "label": "Max Response"
      },
      "temperature": {
        "type": "float",
        "label": "Temperature"
      },
      "top_p": {
        "type": "float",
        "label": "Top Probabilities"
      },
      "frequency_penalty": {
        "type": "float",
        "label": "Frequency Penalty"
      },
      "presence_penalty": {
        "type": "float",
        "label": "Presence penalty"
      },
      "stop": {
        "type": "char",
        "label": "Stop sequences"
      },
      "sys_content": {
        "type": "char",
        "label": "System message"
      },
      "endpoint": {
        "type": "char",
        "label": "End Point",
        "default": "https://api.openai.com/v1/chat/completions"
      },
      "engine": {
        "type": "char",
        "label": "Engine"
      },
      "api_version": {
        "type": "char",
        "label": "API Version",
        "default": "gpt-4o"
      },
      "ai_timeout": {
        "type": "integer",
        "label": "Timeout(seconds)"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "sensitive_words": {
        "type": "text",
        "label": "Sensitive Words Plus"
      },
      "is_filtering": {
        "type": "boolean",
        "label": "Filter Sensitive Words",
        "default": false
      },
      "max_send_char": {
        "type": "integer",
        "label": "Max Send Char"
      },
      "image_avatar": {
        "type": "text",
        "label": "Avatar"
      },
      "partner_ids": {
        "type": "one2many",
        "label": "res.partner"
      },
      "partner_count": {
        "type": "integer",
        "label": "#Partner"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      }
    }
  },
  {
    "_name": "res.partner",
    "_description": "res.partner",
    "_auto": true,
    "_fields": {
      "is_private": {
        "type": "boolean",
        "label": "Private",
        "default": false
      },
      "ai_partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "ext_ai_partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "description": {
        "type": "text",
        "label": "Ai Character"
      },
      "set_max_tokens": {
        "type": "selection",
        "label": "set_max_tokens"
      },
      "set_chat_count": {
        "type": "selection",
        "label": "set_chat_count"
      },
      "set_temperature": {
        "type": "selection",
        "label": "set_temperature"
      },
      "set_top_p": {
        "type": "selection",
        "label": "set_top_p"
      },
      "set_frequency_penalty": {
        "type": "selection",
        "label": "set_frequency_penalty"
      },
      "set_presence_penalty": {
        "type": "selection",
        "label": "set_presence_penalty"
      },
      "max_tokens": {
        "type": "integer",
        "label": "Max Response Tokens"
      },
      "chat_count": {
        "type": "integer",
        "label": "Context Count"
      },
      "temperature": {
        "type": "float",
        "label": "Creativity Value"
      },
      "top_p": {
        "type": "float",
        "label": "Coherence Value"
      },
      "frequency_penalty": {
        "type": "float",
        "label": "Avoid Common Words Value"
      },
      "presence_penalty": {
        "type": "float",
        "label": "Avoid Repeated Words Value"
      },
      "is_current_channel": {
        "type": "boolean",
        "label": "Is Current User Default Channel"
      },
      "is_ai_conversation": {
        "type": "boolean",
        "label": "Ai Conversation",
        "default": false
      },
      "ai_sys_content": {
        "type": "char",
        "label": "Main Robot Role",
        "default": true
      },
      "ext_ai_sys_content": {
        "type": "char",
        "label": "Extend Robot Role",
        "default": true
      }
    },
    "_inherit": "discuss.channel"
  },
  {
    "_name": "message",
    "_description": "message",
    "_auto": true,
    "_fields": {
      "human_prompt_tokens": {
        "type": "integer",
        "label": "Human Prompt Tokens"
      },
      "ai_completion_tokens": {
        "type": "integer",
        "label": "AI Completion Tokens"
      },
      "cost_tokens": {
        "type": "integer",
        "label": "Cost Tokens"
      },
      "is_ai": {
        "type": "boolean",
        "label": "Is Ai",
        "default": false
      },
      "ai2model": {
        "type": "char",
        "label": "Ai Response model"
      },
      "ai2id": {
        "type": "integer",
        "label": "Ai Response id"
      }
    },
    "_inherit": "mail.message"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "gpt_id": {
        "type": "many2one",
        "label": "ai.robot"
      },
      "is_chat_private": {
        "type": "boolean",
        "label": "Allow Chat Private",
        "default": false
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "res.partner.ai.use",
    "_description": "Consumer AI Usage",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "many2one",
        "label": "res.partner"
      },
      "ai_user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "first_ask_time": {
        "type": "datetime",
        "label": "First Ask Time"
      },
      "latest_ask_time": {
        "type": "datetime",
        "label": "Latest Ask Time"
      },
      "service_start_date": {
        "type": "datetime",
        "label": "Service Start Date"
      },
      "service_end_date": {
        "type": "datetime",
        "label": "Service End Date"
      },
      "used_number": {
        "type": "integer",
        "label": "Number of Used"
      },
      "max_number": {
        "type": "integer",
        "label": "Max Number of Call"
      },
      "human_prompt_tokens": {
        "type": "integer",
        "label": "Human Prompt Tokens"
      },
      "ai_completion_tokens": {
        "type": "integer",
        "label": "AI Completion Tokens"
      },
      "tokens_total": {
        "type": "integer",
        "label": "Total Tokens"
      },
      "token_balance": {
        "type": "integer",
        "label": "Token Balance"
      },
      "token_allow": {
        "type": "integer",
        "label": "Token Allow"
      }
    }
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "gpt_id": {
        "type": "many2one",
        "label": "ai.robot"
      },
      "gpt_policy": {
        "type": "selection",
        "label": "gpt_policy"
      },
      "gpt_wl_partners": {
        "type": "many2many",
        "label": "res.partner"
      },
      "gpt_demo_time": {
        "type": "integer",
        "label": "Default Demo Time"
      },
      "is_chat_private": {
        "type": "boolean",
        "label": "Allow Chat Private",
        "default": false
      }
    },
    "_inherit": "res.users"
  }
];
