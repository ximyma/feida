// Odoo 模块: survey
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "gamificationbadge",
    "_description": "gamificationbadge",
    "_auto": true,
    "_fields": {
      "survey_ids": {
        "type": "one2many",
        "label": "survey.survey"
      },
      "survey_id": {
        "type": "many2one",
        "label": "survey.survey"
      }
    },
    "_inherit": "gamification.badge"
  },
  {
    "_name": "gamificationchallenge",
    "_description": "gamificationchallenge",
    "_auto": true,
    "_fields": {
      "challenge_category": {
        "type": "selection",
        "label": "challenge_category"
      }
    },
    "_inherit": "gamification.challenge"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "certifications_count": {
        "type": "integer",
        "label": "Certifications Count"
      },
      "certifications_company_count": {
        "type": "integer",
        "label": "Company Certifications Count"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "survey.question",
    "_description": "Survey Question",
    "_auto": true,
    "_fields": {
      "title": {
        "type": "char",
        "label": "Title",
        "required": true
      },
      "description": {
        "type": "html",
        "label": "description"
      },
      "question_placeholder": {
        "type": "char",
        "label": "Placeholder"
      },
      "background_image": {
        "type": "text",
        "label": "Background Image"
      },
      "background_image_url": {
        "type": "char",
        "label": "Background Url"
      },
      "survey_id": {
        "type": "many2one",
        "label": "survey.survey"
      },
      "scoring_type": {
        "type": "selection",
        "label": "survey_id.scoring_type"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "session_available": {
        "type": "boolean",
        "label": "survey_id.session_available"
      },
      "survey_session_speed_rating": {
        "type": "boolean",
        "label": "survey_id.session_speed_rating"
      },
      "survey_session_speed_rating_time_limit": {
        "type": "integer",
        "label": "survey_id.session_speed_rating_time_limit"
      },
      "is_page": {
        "type": "boolean",
        "label": "Is a page?"
      },
      "question_ids": {
        "type": "one2many",
        "label": "survey.question"
      },
      "questions_selection": {
        "type": "selection",
        "label": "questions_selection"
      },
      "random_questions_count": {
        "type": "integer",
        "label": "random_questions_count"
      },
      "page_id": {
        "type": "many2one",
        "label": "survey.question"
      },
      "question_type": {
        "type": "selection",
        "label": "question_type"
      },
      "is_scored_question": {
        "type": "boolean",
        "label": "is_scored_question"
      },
      "has_image_only_suggested_answer": {
        "type": "boolean",
        "label": "has_image_only_suggested_answer"
      },
      "answer_numerical_box": {
        "type": "float",
        "label": "Correct numerical answer"
      },
      "answer_date": {
        "type": "date",
        "label": "Correct date answer"
      },
      "answer_datetime": {
        "type": "datetime",
        "label": "Correct datetime answer"
      },
      "answer_score": {
        "type": "float",
        "label": "Score"
      },
      "save_as_email": {
        "type": "boolean",
        "label": "save_as_email"
      },
      "save_as_nickname": {
        "type": "boolean",
        "label": "save_as_nickname"
      },
      "suggested_answer_ids": {
        "type": "one2many",
        "label": "suggested_answer_ids"
      },
      "matrix_subtype": {
        "type": "selection",
        "label": "matrix_subtype"
      },
      "matrix_row_ids": {
        "type": "one2many",
        "label": "matrix_row_ids"
      },
      "scale_min": {
        "type": "integer",
        "label": "Scale Minimum Value"
      },
      "scale_max": {
        "type": "integer",
        "label": "Scale Maximum Value"
      },
      "scale_min_label": {
        "type": "char",
        "label": "Scale Minimum Label"
      },
      "scale_mid_label": {
        "type": "char",
        "label": "Scale Middle Label"
      },
      "scale_max_label": {
        "type": "char",
        "label": "Scale Maximum Label"
      },
      "is_time_limited": {
        "type": "boolean",
        "label": "The question is limited in time"
      },
      "is_time_customized": {
        "type": "boolean",
        "label": "Customized speed rewards"
      },
      "time_limit": {
        "type": "integer",
        "label": "Time limit (seconds)"
      },
      "comments_allowed": {
        "type": "boolean",
        "label": "Show Comments Field"
      },
      "comments_message": {
        "type": "char",
        "label": "Comment Message"
      },
      "comment_count_as_answer": {
        "type": "boolean",
        "label": "Comment is an answer"
      },
      "validation_required": {
        "type": "boolean",
        "label": "Validate entry"
      },
      "validation_email": {
        "type": "boolean",
        "label": "Input must be an email"
      },
      "validation_length_min": {
        "type": "integer",
        "label": "Minimum Text Length"
      },
      "validation_length_max": {
        "type": "integer",
        "label": "Maximum Text Length"
      },
      "validation_min_float_value": {
        "type": "float",
        "label": "Minimum value"
      },
      "validation_max_float_value": {
        "type": "float",
        "label": "Maximum value"
      },
      "validation_min_date": {
        "type": "date",
        "label": "Minimum Date"
      },
      "validation_max_date": {
        "type": "date",
        "label": "Maximum Date"
      },
      "validation_min_datetime": {
        "type": "datetime",
        "label": "Minimum Datetime"
      },
      "validation_max_datetime": {
        "type": "datetime",
        "label": "Maximum Datetime"
      },
      "validation_error_msg": {
        "type": "char",
        "label": "Validation Error"
      },
      "constr_mandatory": {
        "type": "boolean",
        "label": "Mandatory Answer"
      },
      "constr_error_msg": {
        "type": "char",
        "label": "Error message"
      },
      "user_input_line_ids": {
        "type": "one2many",
        "label": "user_input_line_ids"
      },
      "triggering_question_ids": {
        "type": "many2many",
        "label": "triggering_question_ids"
      },
      "allowed_triggering_question_ids": {
        "type": "many2many",
        "label": "allowed_triggering_question_ids"
      },
      "is_placed_before_trigger": {
        "type": "boolean",
        "label": "is_placed_before_trigger"
      },
      "triggering_answer_ids": {
        "type": "many2many",
        "label": "triggering_answer_ids"
      }
    }
  },
  {
    "_name": "survey.question.answer",
    "_description": "Survey Label",
    "_auto": true,
    "_fields": {
      "question_id": {
        "type": "many2one",
        "label": "survey.question"
      },
      "matrix_question_id": {
        "type": "many2one",
        "label": "survey.question"
      },
      "question_type": {
        "type": "selection",
        "label": "question_id.question_type"
      },
      "sequence": {
        "type": "integer",
        "label": "Label Sequence order"
      },
      "scoring_type": {
        "type": "selection",
        "label": "question_id.scoring_type"
      },
      "value": {
        "type": "char",
        "label": "Suggested value"
      },
      "value_image": {
        "type": "text",
        "label": "Image"
      },
      "value_image_filename": {
        "type": "char",
        "label": "Image Filename"
      },
      "value_label": {
        "type": "char",
        "label": "Value Label"
      },
      "is_correct": {
        "type": "boolean",
        "label": "Correct"
      },
      "answer_score": {
        "type": "float",
        "label": "Score"
      }
    }
  },
  {
    "_name": "survey.survey",
    "_description": "Survey",
    "_auto": true,
    "_fields": {
      "survey_type": {
        "type": "selection",
        "label": "survey_type"
      },
      "lang_ids": {
        "type": "many2many",
        "label": "lang_ids"
      },
      "allowed_survey_types": {
        "type": "char",
        "label": "Allowed survey types"
      },
      "title": {
        "type": "char",
        "label": "Survey Title",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "description": {
        "type": "html",
        "label": "description"
      },
      "description_done": {
        "type": "html",
        "label": "description_done"
      },
      "background_image": {
        "type": "text",
        "label": "Background Image"
      },
      "background_image_url": {
        "type": "char",
        "label": "Background Url"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "restrict_user_ids": {
        "type": "many2many",
        "label": "res.users"
      },
      "question_and_page_ids": {
        "type": "one2many",
        "label": "survey.question"
      },
      "page_ids": {
        "type": "one2many",
        "label": "survey.question"
      },
      "question_ids": {
        "type": "one2many",
        "label": "survey.question"
      },
      "question_count": {
        "type": "integer",
        "label": "# Questions"
      },
      "questions_layout": {
        "type": "selection",
        "label": "questions_layout"
      },
      "questions_selection": {
        "type": "selection",
        "label": "questions_selection"
      },
      "progression_mode": {
        "type": "selection",
        "label": "progression_mode"
      },
      "user_input_ids": {
        "type": "one2many",
        "label": "survey.user_input"
      },
      "access_mode": {
        "type": "selection",
        "label": "access_mode"
      },
      "access_token": {
        "type": "char",
        "label": "Access Token"
      },
      "users_login_required": {
        "type": "boolean",
        "label": "Require Login"
      },
      "users_can_go_back": {
        "type": "boolean",
        "label": "Users can go back"
      },
      "users_can_signup": {
        "type": "boolean",
        "label": "Users can signup"
      },
      "answer_count": {
        "type": "integer",
        "label": "Registered"
      },
      "answer_done_count": {
        "type": "integer",
        "label": "Attempts"
      },
      "answer_score_avg": {
        "type": "float",
        "label": "Avg Score (%)"
      },
      "answer_duration_avg": {
        "type": "float",
        "label": "Average Duration"
      },
      "success_count": {
        "type": "integer",
        "label": "Success"
      },
      "success_ratio": {
        "type": "integer",
        "label": "Success Ratio (%)"
      },
      "scoring_type": {
        "type": "selection",
        "label": "scoring_type"
      },
      "scoring_success_min": {
        "type": "float",
        "label": "Required Score (%)"
      },
      "scoring_max_obtainable": {
        "type": "float",
        "label": "Maximum obtainable score"
      },
      "is_attempts_limited": {
        "type": "boolean",
        "label": "Limited number of attempts"
      },
      "attempts_limit": {
        "type": "integer",
        "label": "Number of attempts"
      },
      "is_time_limited": {
        "type": "boolean",
        "label": "The survey is limited in time"
      },
      "time_limit": {
        "type": "float",
        "label": "Time limit (minutes)"
      },
      "certification": {
        "type": "boolean",
        "label": "Is a Certification"
      },
      "certification_mail_template_id": {
        "type": "many2one",
        "label": "certification_mail_template_id"
      },
      "certification_report_layout": {
        "type": "selection",
        "label": "certification_report_layout"
      },
      "certification_give_badge": {
        "type": "boolean",
        "label": "Give Badge"
      },
      "certification_badge_id": {
        "type": "many2one",
        "label": "gamification.badge"
      },
      "certification_badge_id_dummy": {
        "type": "many2one",
        "label": "certification_badge_id"
      },
      "session_available": {
        "type": "boolean",
        "label": "Live session available"
      },
      "session_state": {
        "type": "selection",
        "label": "session_state"
      },
      "session_code": {
        "type": "char",
        "label": "Session Code"
      },
      "session_link": {
        "type": "char",
        "label": "Session Link"
      },
      "session_question_id": {
        "type": "many2one",
        "label": "survey.question"
      },
      "session_start_time": {
        "type": "datetime",
        "label": "Current Session Start Time"
      },
      "session_question_start_time": {
        "type": "datetime",
        "label": "Current Question Start Time"
      },
      "session_answer_count": {
        "type": "integer",
        "label": "Answers Count"
      },
      "session_question_answer_count": {
        "type": "integer",
        "label": "Question Answers Count"
      },
      "session_show_leaderboard": {
        "type": "boolean",
        "label": "Show Session Leaderboard"
      },
      "session_speed_rating": {
        "type": "boolean",
        "label": "Reward quick answers"
      },
      "session_speed_rating_time_limit": {
        "type": "integer",
        "label": "session_speed_rating_time_limit"
      },
      "has_conditional_questions": {
        "type": "boolean",
        "label": "Contains conditional questions"
      }
    }
  },
  {
    "_name": "survey.user_input",
    "_description": "Survey User Input",
    "_auto": true,
    "_fields": {
      "survey_id": {
        "type": "many2one",
        "label": "survey.survey",
        "required": true
      },
      "scoring_type": {
        "type": "selection",
        "label": "Scoring"
      },
      "start_datetime": {
        "type": "datetime",
        "label": "Start date and time"
      },
      "end_datetime": {
        "type": "datetime",
        "label": "End date and time"
      },
      "deadline": {
        "type": "datetime",
        "label": "Deadline"
      },
      "lang_id": {
        "type": "many2one",
        "label": "res.lang"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "test_entry": {
        "type": "boolean",
        "label": "test_entry"
      },
      "last_displayed_page_id": {
        "type": "many2one",
        "label": "survey.question"
      },
      "is_attempts_limited": {
        "type": "boolean",
        "label": "Limited number of attempts"
      },
      "attempts_limit": {
        "type": "integer",
        "label": "Number of attempts"
      },
      "attempts_count": {
        "type": "integer",
        "label": "Attempts Count"
      },
      "attempts_number": {
        "type": "integer",
        "label": "Attempt n°"
      },
      "survey_time_limit_reached": {
        "type": "boolean",
        "label": "Survey Time Limit Reached"
      },
      "access_token": {
        "type": "char",
        "label": "Identification token",
        "required": true
      },
      "invite_token": {
        "type": "char",
        "label": "Invite token"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "email": {
        "type": "char",
        "label": "Email"
      },
      "nickname": {
        "type": "char",
        "label": "Nickname"
      },
      "user_input_line_ids": {
        "type": "one2many",
        "label": "survey.user_input.line"
      },
      "predefined_question_ids": {
        "type": "many2many",
        "label": "survey.question"
      },
      "scoring_percentage": {
        "type": "float",
        "label": "Score (%)"
      },
      "scoring_total": {
        "type": "float",
        "label": "Total Score"
      },
      "scoring_success": {
        "type": "boolean",
        "label": "Quiz Passed"
      },
      "survey_first_submitted": {
        "type": "boolean",
        "label": "Survey First Submitted"
      },
      "is_session_answer": {
        "type": "boolean",
        "label": "Is in a Session"
      },
      "question_time_limit_reached": {
        "type": "boolean",
        "label": "Question Time Limit Reached"
      }
    }
  },
  {
    "_name": "survey.user_input.line",
    "_description": "Survey User Input Line",
    "_auto": true,
    "_fields": {
      "user_input_id": {
        "type": "many2one",
        "label": "survey.user_input",
        "required": true
      },
      "survey_id": {
        "type": "many2one",
        "label": "user_input_id.survey_id"
      },
      "question_id": {
        "type": "many2one",
        "label": "survey.question",
        "required": true
      },
      "page_id": {
        "type": "many2one",
        "label": "question_id.page_id"
      },
      "question_sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "lang_id": {
        "type": "many2one",
        "label": "res.lang"
      },
      "skipped": {
        "type": "boolean",
        "label": "Skipped"
      },
      "answer_type": {
        "type": "selection",
        "label": "answer_type"
      },
      "value_char_box": {
        "type": "char",
        "label": "Text answer"
      },
      "value_numerical_box": {
        "type": "float",
        "label": "Numerical answer"
      },
      "value_scale": {
        "type": "integer",
        "label": "Scale value"
      },
      "value_date": {
        "type": "date",
        "label": "Date answer"
      },
      "value_datetime": {
        "type": "datetime",
        "label": "Datetime answer"
      },
      "value_text_box": {
        "type": "text",
        "label": "Free Text answer"
      },
      "suggested_answer_id": {
        "type": "many2one",
        "label": "survey.question.answer"
      },
      "matrix_row_id": {
        "type": "many2one",
        "label": "survey.question.answer"
      },
      "answer_score": {
        "type": "float",
        "label": "Score"
      },
      "answer_is_correct": {
        "type": "boolean",
        "label": "Correct"
      }
    }
  }
];
