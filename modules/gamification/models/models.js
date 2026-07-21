// Odoo 模块: gamification
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "gamification.badge",
    "_description": "Gamification Badge",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Badge",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "description": {
        "type": "html",
        "label": "Description"
      },
      "level": {
        "type": "selection",
        "label": "level"
      },
      "rule_auth": {
        "type": "selection",
        "label": "rule_auth"
      },
      "rule_auth_user_ids": {
        "type": "many2many",
        "label": "rule_auth_user_ids"
      },
      "rule_auth_badge_ids": {
        "type": "many2many",
        "label": "rule_auth_badge_ids"
      },
      "rule_max": {
        "type": "boolean",
        "label": "Monthly Limited Sending"
      },
      "rule_max_number": {
        "type": "integer",
        "label": "Limitation Number"
      },
      "challenge_ids": {
        "type": "one2many",
        "label": "gamification.challenge"
      },
      "goal_definition_ids": {
        "type": "many2many",
        "label": "goal_definition_ids"
      },
      "owner_ids": {
        "type": "one2many",
        "label": "owner_ids"
      },
      "granted_count": {
        "type": "integer",
        "label": "Total"
      },
      "granted_users_count": {
        "type": "integer",
        "label": "Number of users"
      },
      "unique_owner_ids": {
        "type": "many2many",
        "label": "unique_owner_ids"
      },
      "stat_this_month": {
        "type": "integer",
        "label": "stat_this_month"
      },
      "stat_my": {
        "type": "integer",
        "label": "stat_my"
      },
      "stat_my_this_month": {
        "type": "integer",
        "label": "stat_my_this_month"
      },
      "stat_my_monthly_sending": {
        "type": "integer",
        "label": "stat_my_monthly_sending"
      },
      "remaining_sending": {
        "type": "integer",
        "label": "remaining_sending"
      }
    }
  },
  {
    "_name": "gamification.badge.user",
    "_description": "Gamification User Badge",
    "_auto": true,
    "_fields": {
      "user_id": {
        "type": "many2one",
        "label": "res.users",
        "required": true
      },
      "user_partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "sender_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "badge_id": {
        "type": "many2one",
        "label": "gamification.badge",
        "required": true
      },
      "challenge_id": {
        "type": "many2one",
        "label": "gamification.challenge"
      },
      "comment": {
        "type": "text",
        "label": "Comment"
      },
      "badge_name": {
        "type": "char",
        "label": "badge_id.name"
      },
      "level": {
        "type": "selection",
        "label": "level"
      }
    }
  },
  {
    "_name": "gamification.challenge",
    "_description": "Gamification Challenge",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Challenge Name",
        "required": true
      },
      "description": {
        "type": "text",
        "label": "Description"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "manager_id": {
        "type": "many2one",
        "label": "manager_id"
      },
      "user_ids": {
        "type": "many2many",
        "label": "res.users"
      },
      "user_domain": {
        "type": "char",
        "label": "User domain"
      },
      "user_count": {
        "type": "integer",
        "label": "# Users"
      },
      "period": {
        "type": "selection",
        "label": "period"
      },
      "start_date": {
        "type": "date",
        "label": "Start Date"
      },
      "end_date": {
        "type": "date",
        "label": "End Date"
      },
      "invited_user_ids": {
        "type": "many2many",
        "label": "res.users"
      },
      "line_ids": {
        "type": "one2many",
        "label": "gamification.challenge.line"
      },
      "reward_id": {
        "type": "many2one",
        "label": "gamification.badge"
      },
      "reward_first_id": {
        "type": "many2one",
        "label": "gamification.badge"
      },
      "reward_second_id": {
        "type": "many2one",
        "label": "gamification.badge"
      },
      "reward_third_id": {
        "type": "many2one",
        "label": "gamification.badge"
      },
      "reward_failure": {
        "type": "boolean",
        "label": "Reward Bests if not Succeeded?"
      },
      "reward_realtime": {
        "type": "boolean",
        "label": "Reward as soon as every goal is reached",
        "default": true
      },
      "visibility_mode": {
        "type": "selection",
        "label": "visibility_mode"
      },
      "report_message_frequency": {
        "type": "selection",
        "label": "report_message_frequency"
      },
      "report_message_group_id": {
        "type": "many2one",
        "label": "discuss.channel"
      },
      "report_template_id": {
        "type": "many2one",
        "label": "mail.template",
        "required": true
      },
      "remind_update_delay": {
        "type": "integer",
        "label": "Non-updated manual goals will be reminded after"
      },
      "last_report_date": {
        "type": "date",
        "label": "Last Report Date"
      },
      "next_report_date": {
        "type": "date",
        "label": "Next Report Date"
      },
      "challenge_category": {
        "type": "selection",
        "label": "challenge_category"
      }
    }
  },
  {
    "_name": "gamification.challenge.line",
    "_description": "Gamification generic goal for challenge",
    "_auto": true,
    "_fields": {
      "challenge_id": {
        "type": "many2one",
        "label": "gamification.challenge",
        "required": true
      },
      "definition_id": {
        "type": "many2one",
        "label": "gamification.goal.definition",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "target_goal": {
        "type": "float",
        "label": "Target Value to Reach",
        "required": true
      },
      "name": {
        "type": "char",
        "label": "Name"
      },
      "condition": {
        "type": "selection",
        "label": "Condition"
      },
      "definition_suffix": {
        "type": "char",
        "label": "Unit"
      },
      "definition_monetary": {
        "type": "boolean",
        "label": "Monetary"
      },
      "definition_full_suffix": {
        "type": "char",
        "label": "Suffix"
      }
    }
  },
  {
    "_name": "gamification.goal",
    "_description": "Gamification Goal",
    "_auto": true,
    "_fields": {
      "definition_id": {
        "type": "many2one",
        "label": "gamification.goal.definition",
        "required": true
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users",
        "required": true
      },
      "user_partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "line_id": {
        "type": "many2one",
        "label": "gamification.challenge.line"
      },
      "challenge_id": {
        "type": "many2one",
        "label": "challenge_id"
      },
      "start_date": {
        "type": "date",
        "label": "Start Date"
      },
      "end_date": {
        "type": "date",
        "label": "End Date"
      },
      "target_goal": {
        "type": "float",
        "label": "To Reach",
        "required": true
      },
      "current": {
        "type": "float",
        "label": "Current Value",
        "required": true
      },
      "completeness": {
        "type": "float",
        "label": "Completeness"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "to_update": {
        "type": "boolean",
        "label": "To update"
      },
      "closed": {
        "type": "boolean",
        "label": "Closed goal"
      },
      "computation_mode": {
        "type": "selection",
        "label": "definition_id.computation_mode"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "remind_update_delay": {
        "type": "integer",
        "label": "remind_update_delay"
      },
      "last_update": {
        "type": "date",
        "label": "last_update"
      },
      "definition_description": {
        "type": "text",
        "label": "Definition Description"
      },
      "definition_condition": {
        "type": "selection",
        "label": "Definition Condition"
      },
      "definition_suffix": {
        "type": "char",
        "label": "Suffix"
      },
      "definition_display": {
        "type": "selection",
        "label": "Display Mode"
      }
    }
  },
  {
    "_name": "gamification.goal.definition",
    "_description": "Gamification Goal Definition",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Goal Definition",
        "required": true
      },
      "description": {
        "type": "text",
        "label": "Goal Description"
      },
      "monetary": {
        "type": "boolean",
        "label": "Monetary Value",
        "default": false
      },
      "suffix": {
        "type": "char",
        "label": "Suffix"
      },
      "full_suffix": {
        "type": "char",
        "label": "Full Suffix"
      },
      "computation_mode": {
        "type": "selection",
        "label": "computation_mode"
      },
      "display_mode": {
        "type": "selection",
        "label": "display_mode"
      },
      "model_id": {
        "type": "many2one",
        "label": "ir.model"
      },
      "model_inherited_ids": {
        "type": "many2many",
        "label": "ir.model"
      },
      "field_id": {
        "type": "many2one",
        "label": "field_id"
      },
      "field_date_id": {
        "type": "many2one",
        "label": "field_date_id"
      },
      "domain": {
        "type": "char",
        "label": "domain"
      },
      "batch_mode": {
        "type": "boolean",
        "label": "Batch Mode"
      },
      "batch_distinctive_field": {
        "type": "many2one",
        "label": "ir.model.fields"
      },
      "batch_user_expression": {
        "type": "char",
        "label": "Evaluated expression for batch mode"
      },
      "compute_code": {
        "type": "text",
        "label": "Python Code"
      },
      "condition": {
        "type": "selection",
        "label": "condition"
      },
      "action_id": {
        "type": "many2one",
        "label": "ir.actions.act_window"
      },
      "res_id_field": {
        "type": "char",
        "label": "ID Field of user"
      }
    }
  },
  {
    "_name": "gamification.karma.rank",
    "_description": "Rank based on karma",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "text",
        "label": "Rank Name",
        "required": true
      },
      "description": {
        "type": "html",
        "label": "Description"
      },
      "description_motivational": {
        "type": "html",
        "label": "description_motivational"
      },
      "karma_min": {
        "type": "integer",
        "label": "karma_min"
      },
      "user_ids": {
        "type": "one2many",
        "label": "res.users"
      },
      "rank_users_count": {
        "type": "integer",
        "label": "# Users"
      }
    }
  },
  {
    "_name": "gamification.karma.tracking",
    "_description": "Track Karma Changes",
    "_auto": true,
    "_fields": {
      "user_id": {
        "type": "many2one",
        "label": "res.users",
        "required": true
      },
      "old_value": {
        "type": "integer",
        "label": "Old Karma Value"
      },
      "new_value": {
        "type": "integer",
        "label": "New Karma Value",
        "required": true
      },
      "gain": {
        "type": "integer",
        "label": "Gain"
      },
      "consolidated": {
        "type": "boolean",
        "label": "Consolidated"
      },
      "tracking_date": {
        "type": "datetime",
        "label": "tracking_date"
      },
      "reason": {
        "type": "text",
        "label": "Add Manually"
      },
      "origin_ref": {
        "type": "char",
        "label": "origin_ref"
      },
      "origin_ref_model_name": {
        "type": "selection",
        "label": "origin_ref_model_name"
      }
    }
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "karma": {
        "type": "integer",
        "label": "Karma"
      },
      "karma_tracking_ids": {
        "type": "one2many",
        "label": "gamification.karma.tracking"
      },
      "badge_ids": {
        "type": "one2many",
        "label": "gamification.badge.user"
      },
      "gold_badge": {
        "type": "integer",
        "label": "Gold badges count"
      },
      "silver_badge": {
        "type": "integer",
        "label": "Silver badges count"
      },
      "bronze_badge": {
        "type": "integer",
        "label": "Bronze badges count"
      },
      "rank_id": {
        "type": "many2one",
        "label": "gamification.karma.rank"
      },
      "next_rank_id": {
        "type": "many2one",
        "label": "gamification.karma.rank"
      }
    },
    "_inherit": "res.users"
  }
];
