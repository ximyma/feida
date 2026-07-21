// Odoo 模块: im_livechat
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "chatbot.message",
    "_description": "Chatbot Message",
    "_auto": true,
    "_fields": {
      "mail_message_id": {
        "type": "many2one",
        "label": "mail.message"
      },
      "discuss_channel_id": {
        "type": "many2one",
        "label": "discuss.channel",
        "required": true
      },
      "script_step_id": {
        "type": "many2one",
        "label": "script_step_id"
      },
      "user_script_answer_id": {
        "type": "many2one",
        "label": "chatbot.script.answer"
      },
      "user_raw_script_answer_id": {
        "type": "integer",
        "label": "Id of the script answer. Useful for statistics when answer is deleted."
      },
      "user_raw_answer": {
        "type": "html",
        "label": "User"
      }
    }
  },
  {
    "_name": "chatbot.script",
    "_description": "Chatbot Script",
    "_auto": true,
    "_fields": {
      "title": {
        "type": "char",
        "label": "Title",
        "required": true,
        "default": "Chatbot"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "image_1920": {
        "type": "text",
        "label": "operator_partner_id.image_1920"
      },
      "script_step_ids": {
        "type": "one2many",
        "label": "chatbot.script.step"
      },
      "operator_partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "livechat_channel_count": {
        "type": "integer",
        "label": "Livechat Channel Count"
      },
      "first_step_warning": {
        "type": "selection",
        "label": "first_step_warning"
      }
    }
  },
  {
    "_name": "chatbot.script.answer",
    "_description": "Chatbot Script Answer",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Answer",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "redirect_link": {
        "type": "char",
        "label": "Redirect Link"
      },
      "script_step_id": {
        "type": "many2one",
        "label": "script_step_id"
      },
      "chatbot_script_id": {
        "type": "many2one",
        "label": "script_step_id.chatbot_script_id"
      }
    }
  },
  {
    "_name": "chatbot.script.step",
    "_description": "Chatbot Script Step",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "message": {
        "type": "html",
        "label": "Message"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "chatbot_script_id": {
        "type": "many2one",
        "label": "chatbot_script_id"
      },
      "step_type": {
        "type": "selection",
        "label": "step_type"
      },
      "answer_ids": {
        "type": "one2many",
        "label": "answer_ids"
      },
      "triggering_answer_ids": {
        "type": "many2many",
        "label": "triggering_answer_ids"
      },
      "is_forward_operator": {
        "type": "boolean",
        "label": "_compute_is_forward_operator"
      },
      "is_forward_operator_child": {
        "type": "boolean",
        "label": "_compute_is_forward_operator_child"
      },
      "operator_expertise_ids": {
        "type": "many2many",
        "label": "operator_expertise_ids"
      }
    }
  },
  {
    "_name": "digestdigest",
    "_description": "digestdigest",
    "_auto": true,
    "_fields": {
      "kpi_livechat_rating": {
        "type": "boolean",
        "label": "% of Happiness"
      },
      "kpi_livechat_rating_value": {
        "type": "float",
        "label": "_compute_kpi_livechat_rating_value"
      },
      "kpi_livechat_conversations": {
        "type": "boolean",
        "label": "Conversations handled"
      },
      "kpi_livechat_conversations_value": {
        "type": "integer",
        "label": "_compute_kpi_livechat_conversations_value"
      },
      "kpi_livechat_response": {
        "type": "boolean",
        "label": "Time to answer (sec)"
      },
      "kpi_livechat_response_value": {
        "type": "float",
        "label": "_compute_kpi_livechat_response_value"
      }
    },
    "_inherit": "digest.digest"
  },
  {
    "_name": "discusscallhistory",
    "_description": "discusscallhistory",
    "_auto": true,
    "_fields": {
      "livechat_participant_history_ids": {
        "type": "many2many",
        "label": "im_livechat.channel.member.history"
      }
    },
    "_inherit": "discuss.call.history"
  },
  {
    "_name": "discuss.channel",
    "_description": "discuss.channel",
    "_auto": true,
    "_fields": {
      "channel_type": {
        "type": "selection",
        "label": "livechat"
      },
      "duration": {
        "type": "float",
        "label": "Duration"
      },
      "livechat_lang_id": {
        "type": "many2one",
        "label": "res.lang"
      },
      "livechat_end_dt": {
        "type": "datetime",
        "label": "livechat_end_dt"
      },
      "livechat_channel_id": {
        "type": "many2one",
        "label": "im_livechat.channel"
      },
      "livechat_operator_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "livechat_channel_member_history_ids": {
        "type": "one2many",
        "label": "im_livechat.channel.member.history"
      },
      "livechat_expertise_ids": {
        "type": "many2many",
        "label": "livechat_expertise_ids"
      },
      "livechat_agent_history_ids": {
        "type": "one2many",
        "label": "livechat_agent_history_ids"
      },
      "livechat_bot_history_ids": {
        "type": "one2many",
        "label": "livechat_bot_history_ids"
      },
      "livechat_customer_history_ids": {
        "type": "one2many",
        "label": "livechat_customer_history_ids"
      },
      "livechat_agent_partner_ids": {
        "type": "many2many",
        "label": "livechat_agent_partner_ids"
      },
      "livechat_bot_partner_ids": {
        "type": "many2many",
        "label": "livechat_bot_partner_ids"
      },
      "livechat_customer_partner_ids": {
        "type": "many2many",
        "label": "livechat_customer_partner_ids"
      },
      "livechat_customer_guest_ids": {
        "type": "many2many",
        "label": "livechat_customer_guest_ids"
      },
      "livechat_agent_requesting_help_history": {
        "type": "many2one",
        "label": "livechat_agent_requesting_help_history"
      },
      "livechat_agent_providing_help_history": {
        "type": "many2one",
        "label": "livechat_agent_providing_help_history"
      },
      "livechat_note": {
        "type": "html",
        "label": "livechat_note"
      },
      "livechat_status": {
        "type": "selection",
        "label": "livechat_status"
      },
      "livechat_outcome": {
        "type": "selection",
        "label": "livechat_outcome"
      },
      "livechat_conversation_tag_ids": {
        "type": "many2many",
        "label": "livechat_conversation_tag_ids"
      },
      "livechat_start_hour": {
        "type": "float",
        "label": "livechat_start_hour"
      },
      "livechat_week_day": {
        "type": "selection",
        "label": "livechat_week_day"
      },
      "livechat_matches_self_lang": {
        "type": "boolean",
        "label": "livechat_matches_self_lang"
      },
      "livechat_matches_self_expertise": {
        "type": "boolean",
        "label": "livechat_matches_self_expertise"
      },
      "chatbot_current_step_id": {
        "type": "many2one",
        "label": "chatbot.script.step"
      },
      "chatbot_message_ids": {
        "type": "one2many",
        "label": "chatbot.message"
      },
      "country_id": {
        "type": "many2one",
        "label": "res.country"
      },
      "livechat_failure": {
        "type": "selection",
        "label": "livechat_failure"
      },
      "livechat_is_escalated": {
        "type": "boolean",
        "label": "Is session escalated"
      },
      "rating_last_text": {
        "type": "selection",
        "label": "rating_last_text"
      }
    }
  },
  {
    "_name": "discusschannelmember",
    "_description": "discusschannelmember",
    "_auto": true,
    "_fields": {
      "livechat_member_history_ids": {
        "type": "one2many",
        "label": "im_livechat.channel.member.history"
      },
      "livechat_member_type": {
        "type": "selection",
        "label": "livechat_member_type"
      },
      "chatbot_script_id": {
        "type": "many2one",
        "label": "chatbot_script_id"
      },
      "agent_expertise_ids": {
        "type": "many2many",
        "label": "agent_expertise_ids"
      }
    },
    "_inherit": "discuss.channel.member"
  },
  {
    "_name": "im_livechat.channel",
    "_description": "Livechat Channel",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Channel Name",
        "required": true
      },
      "button_text": {
        "type": "char",
        "label": "Text of the Button"
      },
      "default_message": {
        "type": "char",
        "label": "Welcome Message"
      },
      "header_background_color": {
        "type": "char",
        "label": "#875A7B",
        "default": "#875A7B"
      },
      "title_color": {
        "type": "char",
        "label": "#FFFFFF",
        "default": "#FFFFFF"
      },
      "button_background_color": {
        "type": "char",
        "label": "#875A7B",
        "default": "#875A7B"
      },
      "button_text_color": {
        "type": "char",
        "label": "#FFFFFF",
        "default": "#FFFFFF"
      },
      "max_sessions_mode": {
        "type": "selection",
        "label": "max_sessions_mode"
      },
      "max_sessions": {
        "type": "integer",
        "label": "max_sessions"
      },
      "block_assignment_during_call": {
        "type": "boolean",
        "label": "No Chats During Call"
      },
      "review_link": {
        "type": "char",
        "label": "Review Link"
      },
      "web_page": {
        "type": "char",
        "label": "Web Page"
      },
      "are_you_inside": {
        "type": "boolean",
        "label": "Are you inside the matrix?"
      },
      "available_operator_ids": {
        "type": "many2many",
        "label": "res.users"
      },
      "script_external": {
        "type": "html",
        "label": "Script (external)"
      },
      "nbr_channel": {
        "type": "integer",
        "label": "Number of conversation"
      },
      "user_ids": {
        "type": "many2many",
        "label": "res.users"
      },
      "channel_ids": {
        "type": "one2many",
        "label": "discuss.channel"
      },
      "chatbot_script_count": {
        "type": "integer",
        "label": "Number of Chatbot"
      },
      "rule_ids": {
        "type": "one2many",
        "label": "im_livechat.channel.rule"
      },
      "ongoing_session_count": {
        "type": "integer",
        "label": "ongoing_session_count"
      },
      "remaining_session_capacity": {
        "type": "integer",
        "label": "remaining_session_capacity"
      }
    }
  },
  {
    "_name": "im_livechat.channel.rule",
    "_description": "Livechat Channel Rules",
    "_auto": true,
    "_fields": {
      "regex_url": {
        "type": "char",
        "label": "URL Regex"
      },
      "action": {
        "type": "selection",
        "label": "action"
      },
      "auto_popup_timer": {
        "type": "integer",
        "label": "Time to Open"
      },
      "chatbot_script_id": {
        "type": "many2one",
        "label": "chatbot.script"
      },
      "chatbot_enabled_condition": {
        "type": "selection",
        "label": "chatbot_enabled_condition"
      },
      "channel_id": {
        "type": "many2one",
        "label": "im_livechat.channel"
      },
      "country_ids": {
        "type": "many2many",
        "label": "res.country"
      },
      "sequence": {
        "type": "integer",
        "label": "Matching order"
      }
    }
  },
  {
    "_name": "im_livechat.channel.member.history",
    "_description": "Keep the channel member history",
    "_auto": true,
    "_fields": {
      "member_id": {
        "type": "many2one",
        "label": "discuss.channel.member"
      },
      "livechat_member_type": {
        "type": "selection",
        "label": "livechat_member_type"
      },
      "channel_id": {
        "type": "many2one",
        "label": "channel_id"
      },
      "guest_id": {
        "type": "many2one",
        "label": "guest_id"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "chatbot_script_id": {
        "type": "many2one",
        "label": "chatbot_script_id"
      },
      "agent_expertise_ids": {
        "type": "many2many",
        "label": "agent_expertise_ids"
      },
      "conversation_tag_ids": {
        "type": "many2many",
        "label": "conversation_tag_ids"
      },
      "avatar_128": {
        "type": "text",
        "label": "_compute_avatar_128"
      },
      "session_country_id": {
        "type": "many2one",
        "label": "res.country"
      },
      "session_livechat_channel_id": {
        "type": "many2one",
        "label": "session_livechat_channel_id"
      },
      "session_outcome": {
        "type": "selection",
        "label": "channel_id.livechat_outcome"
      },
      "session_start_hour": {
        "type": "float",
        "label": "channel_id.livechat_start_hour"
      },
      "session_week_day": {
        "type": "selection",
        "label": "channel_id.livechat_week_day"
      },
      "session_duration_hour": {
        "type": "float",
        "label": "session_duration_hour"
      },
      "rating_id": {
        "type": "many2one",
        "label": "rating.rating"
      },
      "rating": {
        "type": "float",
        "label": "rating_id.rating"
      },
      "rating_text": {
        "type": "selection",
        "label": "Rating text"
      },
      "call_history_ids": {
        "type": "many2many",
        "label": "discuss.call.history"
      },
      "has_call": {
        "type": "float",
        "label": "_compute_has_call"
      },
      "call_count": {
        "type": "float",
        "label": "# of Sessions with Calls"
      },
      "call_percentage": {
        "type": "float",
        "label": "Session with Calls (%)"
      },
      "call_duration_hour": {
        "type": "float",
        "label": "call_duration_hour"
      },
      "message_count": {
        "type": "integer",
        "label": "# of Messages per Session"
      },
      "help_status": {
        "type": "selection",
        "label": "help_status"
      },
      "response_time_hour": {
        "type": "float",
        "label": "Response Time"
      }
    }
  },
  {
    "_name": "im_livechat.conversation.tag",
    "_description": "Live Chat Conversation Tags",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "conversation_ids": {
        "type": "many2many",
        "label": "conversation_ids"
      }
    }
  },
  {
    "_name": "im_livechat.expertise",
    "_description": "Live Chat Expertise",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "user_ids": {
        "type": "many2many",
        "label": "user_ids"
      }
    }
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "user_livechat_username": {
        "type": "char",
        "label": "_compute_user_livechat_username"
      },
      "chatbot_script_ids": {
        "type": "one2many",
        "label": "chatbot.script"
      },
      "livechat_channel_count": {
        "type": "integer",
        "label": "_compute_livechat_channel_count"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "livechat_channel_ids": {
        "type": "many2many",
        "label": "livechat_channel_ids"
      },
      "livechat_username": {
        "type": "char",
        "label": "livechat_username"
      },
      "livechat_lang_ids": {
        "type": "many2many",
        "label": "livechat_lang_ids"
      },
      "livechat_expertise_ids": {
        "type": "many2many",
        "label": "livechat_expertise_ids"
      },
      "livechat_ongoing_session_count": {
        "type": "integer",
        "label": "livechat_ongoing_session_count"
      },
      "livechat_is_in_call": {
        "type": "boolean",
        "label": "livechat_is_in_call"
      },
      "has_access_livechat": {
        "type": "boolean",
        "label": "_compute_has_access_livechat"
      }
    },
    "_inherit": "res.users"
  },
  {
    "_name": "res.lang",
    "_description": "res.lang",
    "_auto": true,
    "_fields": {
      "livechat_username": {
        "type": "char",
        "label": "Livechat Username"
      },
      "livechat_lang_ids": {
        "type": "many2many",
        "label": "res.lang"
      },
      "livechat_expertise_ids": {
        "type": "many2many",
        "label": "livechat_expertise_ids"
      }
    },
    "_inherit": "res.users.settings"
  }
];
