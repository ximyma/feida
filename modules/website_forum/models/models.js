// Odoo 模块: website_forum
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "forum.forum",
    "_description": "Forum",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Forum Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "mode": {
        "type": "selection",
        "label": "mode"
      },
      "privacy": {
        "type": "selection",
        "label": "privacy"
      },
      "authorized_group_id": {
        "type": "many2one",
        "label": "res.groups"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "faq": {
        "type": "html",
        "label": "faq"
      },
      "description": {
        "type": "text",
        "label": "Description"
      },
      "welcome_message": {
        "type": "html",
        "label": "welcome_message"
      },
      "default_order": {
        "type": "selection",
        "label": "default_order"
      },
      "relevancy_post_vote": {
        "type": "float",
        "label": "First Relevance Parameter"
      },
      "relevancy_time_decay": {
        "type": "float",
        "label": "Second Relevance Parameter"
      },
      "allow_share": {
        "type": "boolean",
        "label": "Sharing Options",
        "default": true
      },
      "post_ids": {
        "type": "one2many",
        "label": "forum.post"
      },
      "last_post_id": {
        "type": "many2one",
        "label": "forum.post"
      },
      "total_posts": {
        "type": "integer",
        "label": "# Posts"
      },
      "total_views": {
        "type": "integer",
        "label": "# Views"
      },
      "total_answers": {
        "type": "integer",
        "label": "# Answers"
      },
      "total_favorites": {
        "type": "integer",
        "label": "# Favorites"
      },
      "count_posts_waiting_validation": {
        "type": "integer",
        "label": "Number of posts waiting for validation"
      },
      "count_flagged_posts": {
        "type": "integer",
        "label": "Number of flagged posts"
      },
      "karma_gen_question_new": {
        "type": "integer",
        "label": "Asking a question"
      },
      "karma_gen_question_upvote": {
        "type": "integer",
        "label": "Question upvoted"
      },
      "karma_gen_question_downvote": {
        "type": "integer",
        "label": "Question downvoted"
      },
      "karma_gen_answer_upvote": {
        "type": "integer",
        "label": "Answer upvoted"
      },
      "karma_gen_answer_downvote": {
        "type": "integer",
        "label": "Answer downvoted"
      },
      "karma_gen_answer_accept": {
        "type": "integer",
        "label": "Accepting an answer"
      },
      "karma_gen_answer_accepted": {
        "type": "integer",
        "label": "Answer accepted"
      },
      "karma_gen_answer_flagged": {
        "type": "integer",
        "label": "Answer flagged"
      },
      "karma_ask": {
        "type": "integer",
        "label": "Ask questions"
      },
      "karma_answer": {
        "type": "integer",
        "label": "Answer questions"
      },
      "karma_edit_own": {
        "type": "integer",
        "label": "Edit own posts"
      },
      "karma_edit_all": {
        "type": "integer",
        "label": "Edit all posts"
      },
      "karma_edit_retag": {
        "type": "integer",
        "label": "Change question tags"
      },
      "karma_close_own": {
        "type": "integer",
        "label": "Close own posts"
      },
      "karma_close_all": {
        "type": "integer",
        "label": "Close all posts"
      },
      "karma_unlink_own": {
        "type": "integer",
        "label": "Delete own posts"
      },
      "karma_unlink_all": {
        "type": "integer",
        "label": "Delete all posts"
      },
      "karma_tag_create": {
        "type": "integer",
        "label": "Create new tags"
      },
      "karma_upvote": {
        "type": "integer",
        "label": "Upvote"
      },
      "karma_downvote": {
        "type": "integer",
        "label": "Downvote"
      },
      "karma_answer_accept_own": {
        "type": "integer",
        "label": "Accept an answer on own questions"
      },
      "karma_answer_accept_all": {
        "type": "integer",
        "label": "Accept an answer to all questions"
      },
      "karma_comment_own": {
        "type": "integer",
        "label": "Comment own posts"
      },
      "karma_comment_all": {
        "type": "integer",
        "label": "Comment all posts"
      },
      "karma_comment_convert_own": {
        "type": "integer",
        "label": "Convert own comments to answers"
      },
      "karma_comment_convert_all": {
        "type": "integer",
        "label": "Convert all comments to answers"
      },
      "karma_comment_unlink_own": {
        "type": "integer",
        "label": "Delete own comments"
      },
      "karma_comment_unlink_all": {
        "type": "integer",
        "label": "Delete all comments"
      },
      "karma_flag": {
        "type": "integer",
        "label": "Flag a post as offensive"
      },
      "karma_dofollow": {
        "type": "integer",
        "label": "Nofollow links"
      },
      "karma_editor": {
        "type": "integer",
        "label": "Editor Features: image and links"
      },
      "karma_user_bio": {
        "type": "integer",
        "label": "Display detailed user biography"
      },
      "karma_post": {
        "type": "integer",
        "label": "Ask questions without validation"
      },
      "karma_moderate": {
        "type": "integer",
        "label": "Moderate posts"
      },
      "has_pending_post": {
        "type": "boolean",
        "label": "Has pending post"
      },
      "can_moderate": {
        "type": "boolean",
        "label": "Is a moderator"
      },
      "tag_ids": {
        "type": "one2many",
        "label": "forum.tag"
      },
      "tag_most_used_ids": {
        "type": "one2many",
        "label": "forum.tag"
      },
      "tag_unused_ids": {
        "type": "one2many",
        "label": "forum.tag"
      }
    }
  },
  {
    "_name": "forum.post",
    "_description": "Forum Post",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Title"
      },
      "forum_id": {
        "type": "many2one",
        "label": "forum.forum",
        "required": true
      },
      "content": {
        "type": "html",
        "label": "Content"
      },
      "plain_content": {
        "type": "text",
        "label": "plain_content"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "forum.tag"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "views": {
        "type": "integer",
        "label": "Views"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "website_message_ids": {
        "type": "one2many",
        "label": "model"
      },
      "website_url": {
        "type": "char",
        "label": "Website URL"
      },
      "website_id": {
        "type": "many2one",
        "label": "forum_id.website_id"
      },
      "create_date": {
        "type": "datetime",
        "label": "Asked on"
      },
      "create_uid": {
        "type": "many2one",
        "label": "res.users"
      },
      "write_date": {
        "type": "datetime",
        "label": "Updated on"
      },
      "last_activity_date": {
        "type": "datetime",
        "label": "last_activity_date"
      },
      "write_uid": {
        "type": "many2one",
        "label": "res.users"
      },
      "relevancy": {
        "type": "float",
        "label": "Relevance"
      },
      "vote_ids": {
        "type": "one2many",
        "label": "forum.post.vote"
      },
      "user_vote": {
        "type": "integer",
        "label": "My Vote"
      },
      "vote_count": {
        "type": "integer",
        "label": "Total Votes"
      },
      "favourite_ids": {
        "type": "many2many",
        "label": "res.users"
      },
      "user_favourite": {
        "type": "boolean",
        "label": "Is Favourite"
      },
      "favourite_count": {
        "type": "integer",
        "label": "Favorite"
      },
      "is_correct": {
        "type": "boolean",
        "label": "Correct"
      },
      "parent_id": {
        "type": "many2one",
        "label": "parent_id"
      },
      "self_reply": {
        "type": "boolean",
        "label": "Reply to own question"
      },
      "child_ids": {
        "type": "one2many",
        "label": "child_ids"
      },
      "child_count": {
        "type": "integer",
        "label": "Answers"
      },
      "uid_has_answered": {
        "type": "boolean",
        "label": "Has Answered"
      },
      "has_validated_answer": {
        "type": "boolean",
        "label": "has_validated_answer"
      },
      "flag_user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "moderator_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "closed_reason_id": {
        "type": "many2one",
        "label": "forum.post.reason"
      },
      "closed_uid": {
        "type": "many2one",
        "label": "res.users"
      },
      "closed_date": {
        "type": "datetime",
        "label": "Closed on"
      },
      "karma_accept": {
        "type": "integer",
        "label": "karma_accept"
      },
      "karma_edit": {
        "type": "integer",
        "label": "karma_edit"
      },
      "karma_close": {
        "type": "integer",
        "label": "karma_close"
      },
      "karma_unlink": {
        "type": "integer",
        "label": "karma_unlink"
      },
      "karma_comment": {
        "type": "integer",
        "label": "karma_comment"
      },
      "karma_comment_convert": {
        "type": "integer",
        "label": "karma_comment_convert"
      },
      "karma_flag": {
        "type": "integer",
        "label": "karma_flag"
      },
      "can_ask": {
        "type": "boolean",
        "label": "can_ask"
      },
      "can_answer": {
        "type": "boolean",
        "label": "can_answer"
      },
      "can_accept": {
        "type": "boolean",
        "label": "can_accept"
      },
      "can_edit": {
        "type": "boolean",
        "label": "can_edit"
      },
      "can_close": {
        "type": "boolean",
        "label": "can_close"
      },
      "can_unlink": {
        "type": "boolean",
        "label": "can_unlink"
      },
      "can_upvote": {
        "type": "boolean",
        "label": "can_upvote"
      },
      "can_downvote": {
        "type": "boolean",
        "label": "can_downvote"
      },
      "can_comment": {
        "type": "boolean",
        "label": "can_comment"
      },
      "can_comment_convert": {
        "type": "boolean",
        "label": "can_comment_convert"
      },
      "can_view": {
        "type": "boolean",
        "label": "can_view"
      },
      "can_display_biography": {
        "type": "boolean",
        "label": "can_display_biography"
      },
      "can_post": {
        "type": "boolean",
        "label": "can_post"
      },
      "can_flag": {
        "type": "boolean",
        "label": "can_flag"
      },
      "can_moderate": {
        "type": "boolean",
        "label": "can_moderate"
      },
      "can_use_full_editor": {
        "type": "boolean",
        "label": "can_use_full_editor"
      }
    }
  },
  {
    "_name": "forum.post.reason",
    "_description": "Post Closing Reason",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Closing Reason",
        "required": true
      },
      "reason_type": {
        "type": "selection",
        "label": "basic",
        "default": "basic"
      }
    }
  },
  {
    "_name": "forum.post.vote",
    "_description": "Post Vote",
    "_auto": true,
    "_fields": {
      "post_id": {
        "type": "many2one",
        "label": "forum.post",
        "required": true
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users",
        "required": true
      },
      "vote": {
        "type": "selection",
        "label": "1",
        "required": true,
        "default": "1"
      },
      "create_date": {
        "type": "datetime",
        "label": "Create Date"
      },
      "forum_id": {
        "type": "many2one",
        "label": "forum.forum"
      },
      "recipient_id": {
        "type": "many2one",
        "label": "res.users"
      }
    }
  },
  {
    "_name": "forum.tag",
    "_description": "Forum Tag",
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
      "forum_id": {
        "type": "many2one",
        "label": "forum.forum",
        "required": true
      },
      "post_ids": {
        "type": "many2many",
        "label": "post_ids"
      },
      "posts_count": {
        "type": "integer",
        "label": "Number of Posts"
      },
      "website_url": {
        "type": "char",
        "label": "Link to questions with the tag"
      }
    }
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
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "create_date": {
        "type": "datetime",
        "label": "Create Date"
      }
    },
    "_inherit": "res.users"
  },
  {
    "_name": "website",
    "_description": "website",
    "_auto": true,
    "_fields": {
      "forum_count": {
        "type": "integer",
        "label": "forum_count"
      }
    },
    "_inherit": "website"
  }
];
