// Odoo 模块: website_slides
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
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
    "_name": "mailactivity",
    "_description": "mailactivity",
    "_auto": true,
    "_fields": {
      "request_partner_id": {
        "type": "many2one",
        "label": "res.partner"
      }
    },
    "_inherit": "mail.activity"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "slide_channel_ids": {
        "type": "many2many",
        "label": "slide_channel_ids"
      },
      "slide_channel_completed_ids": {
        "type": "one2many",
        "label": "slide_channel_completed_ids"
      },
      "slide_channel_count": {
        "type": "integer",
        "label": "slide_channel_count"
      },
      "slide_channel_company_count": {
        "type": "integer",
        "label": "slide_channel_company_count"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "slide.channel",
    "_description": "Course",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "description": {
        "type": "html",
        "label": "Description"
      },
      "description_short": {
        "type": "html",
        "label": "Short Description"
      },
      "description_html": {
        "type": "html",
        "label": "Detailed Description"
      },
      "channel_type": {
        "type": "selection",
        "label": "channel_type"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "tag_ids"
      },
      "slide_ids": {
        "type": "one2many",
        "label": "slide.slide"
      },
      "slide_content_ids": {
        "type": "one2many",
        "label": "slide.slide"
      },
      "slide_category_ids": {
        "type": "one2many",
        "label": "slide.slide"
      },
      "slide_last_update": {
        "type": "date",
        "label": "Last Update"
      },
      "slide_partner_ids": {
        "type": "one2many",
        "label": "slide_partner_ids"
      },
      "promote_strategy": {
        "type": "selection",
        "label": "promote_strategy"
      },
      "promoted_slide_id": {
        "type": "many2one",
        "label": "slide.slide"
      },
      "access_token": {
        "type": "char",
        "label": "Security Token"
      },
      "nbr_document": {
        "type": "integer",
        "label": "Documents"
      },
      "nbr_video": {
        "type": "integer",
        "label": "Videos"
      },
      "nbr_infographic": {
        "type": "integer",
        "label": "Infographics"
      },
      "nbr_article": {
        "type": "integer",
        "label": "Articles"
      },
      "nbr_quiz": {
        "type": "integer",
        "label": "Number of Quizs"
      },
      "total_slides": {
        "type": "integer",
        "label": "Number of Contents"
      },
      "total_views": {
        "type": "integer",
        "label": "Visits"
      },
      "total_votes": {
        "type": "integer",
        "label": "Votes"
      },
      "total_time": {
        "type": "float",
        "label": "Duration"
      },
      "rating_avg_stars": {
        "type": "float",
        "label": "Rating Average (Stars)"
      },
      "allow_comment": {
        "type": "boolean",
        "label": "allow_comment"
      },
      "publish_template_id": {
        "type": "many2one",
        "label": "publish_template_id"
      },
      "share_channel_template_id": {
        "type": "many2one",
        "label": "share_channel_template_id"
      },
      "share_slide_template_id": {
        "type": "many2one",
        "label": "share_slide_template_id"
      },
      "completed_template_id": {
        "type": "many2one",
        "label": "completed_template_id"
      },
      "enroll": {
        "type": "selection",
        "label": "enroll"
      },
      "enroll_msg": {
        "type": "html",
        "label": "enroll_msg"
      },
      "enroll_group_ids": {
        "type": "many2many",
        "label": "res.groups"
      },
      "visibility": {
        "type": "selection",
        "label": "visibility"
      },
      "upload_group_ids": {
        "type": "many2many",
        "label": "upload_group_ids"
      },
      "website_default_background_image_url": {
        "type": "char",
        "label": "Background image URL"
      },
      "channel_partner_ids": {
        "type": "one2many",
        "label": "channel_partner_ids"
      },
      "channel_partner_all_ids": {
        "type": "one2many",
        "label": "channel_partner_all_ids"
      },
      "members_count": {
        "type": "integer",
        "label": "# Enrolled Attendees"
      },
      "members_all_count": {
        "type": "integer",
        "label": "# Enrolled or Invited Attendees"
      },
      "members_engaged_count": {
        "type": "integer",
        "label": "members_engaged_count"
      },
      "members_completed_count": {
        "type": "integer",
        "label": "# Completed Attendees"
      },
      "members_invited_count": {
        "type": "integer",
        "label": "# Invited Attendees"
      },
      "partner_ids": {
        "type": "many2many",
        "label": "partner_ids"
      },
      "completed": {
        "type": "boolean",
        "label": "Done"
      },
      "completion": {
        "type": "integer",
        "label": "Completion"
      },
      "can_upload": {
        "type": "boolean",
        "label": "Can Upload"
      },
      "has_requested_access": {
        "type": "boolean",
        "label": "Access Requested"
      },
      "is_member": {
        "type": "boolean",
        "label": "is_member"
      },
      "is_member_invited": {
        "type": "boolean",
        "label": "is_member_invited"
      },
      "is_visible": {
        "type": "boolean",
        "label": "is_visible"
      },
      "partner_has_new_content": {
        "type": "boolean",
        "label": "_compute_partner_has_new_content"
      },
      "karma_gen_channel_rank": {
        "type": "integer",
        "label": "Course ranked"
      },
      "karma_gen_channel_finish": {
        "type": "integer",
        "label": "Course finished"
      },
      "karma_review": {
        "type": "integer",
        "label": "Add Review"
      },
      "karma_slide_comment": {
        "type": "integer",
        "label": "Add Comment"
      },
      "karma_slide_vote": {
        "type": "integer",
        "label": "Vote"
      },
      "can_review": {
        "type": "boolean",
        "label": "Can Review"
      },
      "can_comment": {
        "type": "boolean",
        "label": "Can Comment"
      },
      "can_vote": {
        "type": "boolean",
        "label": "Can Vote"
      },
      "prerequisite_channel_ids": {
        "type": "many2many",
        "label": "prerequisite_channel_ids"
      },
      "prerequisite_of_channel_ids": {
        "type": "many2many",
        "label": "prerequisite_of_channel_ids"
      },
      "prerequisite_user_has_completed": {
        "type": "boolean",
        "label": "prerequisite_user_has_completed"
      }
    }
  },
  {
    "_name": "slide.channel.partner",
    "_description": "Channel / Partners (Members)",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "channel_id": {
        "type": "many2one",
        "label": "slide.channel",
        "required": true
      },
      "member_status": {
        "type": "selection",
        "label": "member_status"
      },
      "completion": {
        "type": "integer",
        "label": "% Completed Contents"
      },
      "completed_slides_count": {
        "type": "integer",
        "label": "# Completed Contents"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner",
        "required": true
      },
      "partner_email": {
        "type": "char",
        "label": "partner_id.email"
      },
      "channel_user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "channel_type": {
        "type": "selection",
        "label": "channel_id.channel_type"
      },
      "channel_visibility": {
        "type": "selection",
        "label": "channel_id.visibility"
      },
      "channel_enroll": {
        "type": "selection",
        "label": "channel_id.enroll"
      },
      "channel_website_id": {
        "type": "many2one",
        "label": "website"
      },
      "next_slide_id": {
        "type": "many2one",
        "label": "slide.slide"
      },
      "invitation_link": {
        "type": "char",
        "label": "Invitation Link"
      },
      "last_invitation_date": {
        "type": "datetime",
        "label": "Last Invitation Date"
      }
    }
  },
  {
    "_name": "slide.channel.tag.group",
    "_description": "Channel/Course Groups",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Group Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence",
        "required": true
      },
      "tag_ids": {
        "type": "one2many",
        "label": "slide.channel.tag"
      }
    }
  },
  {
    "_name": "slide.channel.tag",
    "_description": "Channel/Course Tag",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence",
        "required": true
      },
      "group_id": {
        "type": "many2one",
        "label": "slide.channel.tag.group",
        "required": true
      },
      "group_sequence": {
        "type": "integer",
        "label": "group_sequence"
      },
      "channel_ids": {
        "type": "many2many",
        "label": "slide.channel"
      },
      "color": {
        "type": "integer",
        "label": "color"
      }
    }
  },
  {
    "_name": "slide.embed",
    "_description": "Embedded Slides View Counter",
    "_auto": true,
    "_fields": {
      "slide_id": {
        "type": "many2one",
        "label": "slide_id"
      },
      "url": {
        "type": "char",
        "label": "Third Party Website URL"
      },
      "website_name": {
        "type": "char",
        "label": "Website"
      },
      "count_views": {
        "type": "integer",
        "label": "# Views"
      }
    }
  },
  {
    "_name": "slide.question",
    "_description": "Content Quiz Question",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "question": {
        "type": "char",
        "label": "Question Name",
        "required": true
      },
      "slide_id": {
        "type": "many2one",
        "label": "slide.slide",
        "required": true
      },
      "answer_ids": {
        "type": "one2many",
        "label": "slide.answer"
      },
      "answers_validation_error": {
        "type": "char",
        "label": "Error on Answers"
      },
      "attempts_count": {
        "type": "integer",
        "label": "_compute_statistics"
      },
      "attempts_avg": {
        "type": "float",
        "label": "_compute_statistics"
      },
      "done_count": {
        "type": "integer",
        "label": "_compute_statistics"
      }
    }
  },
  {
    "_name": "slide.answer",
    "_description": "Slide Question",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "question_id": {
        "type": "many2one",
        "label": "slide.question",
        "required": true
      },
      "text_value": {
        "type": "char",
        "label": "Answer",
        "required": true
      },
      "is_correct": {
        "type": "boolean",
        "label": "Is correct answer"
      },
      "comment": {
        "type": "text",
        "label": "Comment"
      }
    }
  },
  {
    "_name": "slide.slide",
    "_description": "Slides",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Title",
        "required": true
      },
      "image_1920": {
        "type": "text",
        "label": "_compute_image_1920"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "description": {
        "type": "html",
        "label": "Description"
      },
      "channel_id": {
        "type": "many2one",
        "label": "slide.channel",
        "required": true
      },
      "tag_ids": {
        "type": "many2many",
        "label": "slide.tag"
      },
      "is_preview": {
        "type": "boolean",
        "label": "Allow Preview",
        "default": false
      },
      "is_new_slide": {
        "type": "boolean",
        "label": "Is New Slide"
      },
      "completion_time": {
        "type": "float",
        "label": "Duration"
      },
      "is_category": {
        "type": "boolean",
        "label": "Is a category",
        "default": false
      },
      "category_id": {
        "type": "many2one",
        "label": "slide.slide"
      },
      "slide_ids": {
        "type": "one2many",
        "label": "slide.slide"
      },
      "partner_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "slide_partner_ids": {
        "type": "one2many",
        "label": "slide.slide.partner"
      },
      "user_membership_id": {
        "type": "many2one",
        "label": "user_membership_id"
      },
      "user_vote": {
        "type": "integer",
        "label": "User vote"
      },
      "user_has_completed": {
        "type": "boolean",
        "label": "Is Member"
      },
      "user_has_completed_category": {
        "type": "boolean",
        "label": "Is Category Completed"
      },
      "question_ids": {
        "type": "one2many",
        "label": "slide.question"
      },
      "questions_count": {
        "type": "integer",
        "label": "Numbers of Questions"
      },
      "quiz_first_attempt_reward": {
        "type": "integer",
        "label": "Reward: first attempt"
      },
      "quiz_second_attempt_reward": {
        "type": "integer",
        "label": "Reward: second attempt"
      },
      "quiz_third_attempt_reward": {
        "type": "integer",
        "label": "Reward: third attempt"
      },
      "quiz_fourth_attempt_reward": {
        "type": "integer",
        "label": "Reward: every attempt after the third try"
      },
      "can_self_mark_completed": {
        "type": "boolean",
        "label": "Can Mark Completed"
      },
      "can_self_mark_uncompleted": {
        "type": "boolean",
        "label": "Can Mark Uncompleted"
      },
      "slide_category": {
        "type": "selection",
        "label": "slide_category"
      },
      "source_type": {
        "type": "selection",
        "label": "source_type"
      },
      "url": {
        "type": "char",
        "label": "External URL"
      },
      "binary_content": {
        "type": "text",
        "label": "File"
      },
      "slide_resource_ids": {
        "type": "one2many",
        "label": "slide.slide.resource"
      },
      "slide_resource_downloadable": {
        "type": "boolean",
        "label": "Allow Download",
        "default": false
      },
      "google_drive_id": {
        "type": "char",
        "label": "Google Drive ID of the external URL"
      },
      "html_content": {
        "type": "html",
        "label": "html_content"
      },
      "image_binary_content": {
        "type": "text",
        "label": "Image Content"
      },
      "image_google_url": {
        "type": "char",
        "label": "Image Link"
      },
      "slide_icon_class": {
        "type": "char",
        "label": "Slide Icon fa-class"
      },
      "slide_type": {
        "type": "selection",
        "label": "slide_type"
      },
      "document_google_url": {
        "type": "char",
        "label": "Document Link"
      },
      "document_binary_content": {
        "type": "text",
        "label": "PDF Content"
      },
      "video_url": {
        "type": "char",
        "label": "Video Link"
      },
      "video_source_type": {
        "type": "selection",
        "label": "video_source_type"
      },
      "youtube_id": {
        "type": "char",
        "label": "Video YouTube ID"
      },
      "vimeo_id": {
        "type": "char",
        "label": "Video Vimeo ID"
      },
      "website_id": {
        "type": "many2one",
        "label": "channel_id.website_id"
      },
      "date_published": {
        "type": "datetime",
        "label": "Publish Date"
      },
      "likes": {
        "type": "integer",
        "label": "Likes"
      },
      "dislikes": {
        "type": "integer",
        "label": "Dislikes"
      },
      "embed_code": {
        "type": "html",
        "label": "Embed Code"
      },
      "embed_code_external": {
        "type": "html",
        "label": "External Embed Code"
      },
      "website_share_url": {
        "type": "char",
        "label": "Share URL"
      },
      "embed_ids": {
        "type": "one2many",
        "label": "slide.embed"
      },
      "embed_count": {
        "type": "integer",
        "label": "# of Embeds"
      },
      "slide_views": {
        "type": "integer",
        "label": "# of Website Views"
      },
      "public_views": {
        "type": "integer",
        "label": "# of Public Views"
      },
      "total_views": {
        "type": "integer",
        "label": "# Total Views",
        "default": "0"
      },
      "comments_count": {
        "type": "integer",
        "label": "Number of comments"
      },
      "channel_type": {
        "type": "selection",
        "label": "channel_id.channel_type"
      },
      "channel_allow_comment": {
        "type": "boolean",
        "label": "channel_id.allow_comment"
      },
      "nbr_document": {
        "type": "integer",
        "label": "Number of Documents"
      },
      "nbr_video": {
        "type": "integer",
        "label": "Number of Videos"
      },
      "nbr_infographic": {
        "type": "integer",
        "label": "Number of Images"
      },
      "nbr_article": {
        "type": "integer",
        "label": "Number of Articles"
      },
      "nbr_quiz": {
        "type": "integer",
        "label": "Number of Quizs"
      },
      "total_slides": {
        "type": "integer",
        "label": "_compute_slides_statistics"
      },
      "is_published": {
        "type": "boolean",
        "label": "is_published"
      },
      "website_published": {
        "type": "boolean",
        "label": "website_published"
      }
    }
  },
  {
    "_name": "slide.slide.partner",
    "_description": "Slide / Partner decorated m2m",
    "_auto": true,
    "_fields": {
      "slide_id": {
        "type": "many2one",
        "label": "slide.slide",
        "required": true
      },
      "slide_category": {
        "type": "selection",
        "label": "slide_id.slide_category"
      },
      "channel_id": {
        "type": "many2one",
        "label": "channel_id"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner",
        "required": true
      },
      "vote": {
        "type": "integer",
        "label": "Vote"
      },
      "completed": {
        "type": "boolean",
        "label": "Completed"
      },
      "quiz_attempts_count": {
        "type": "integer",
        "label": "Quiz attempts count"
      }
    }
  },
  {
    "_name": "slide.slide.resource",
    "_description": "Additional resource for a particular slide",
    "_auto": true,
    "_fields": {
      "slide_id": {
        "type": "many2one",
        "label": "slide.slide",
        "required": true
      },
      "resource_type": {
        "type": "selection",
        "label": "file",
        "required": true
      },
      "name": {
        "type": "char",
        "label": "Name"
      },
      "data": {
        "type": "text",
        "label": "Resource"
      },
      "file_name": {
        "type": "char",
        "label": "file_name"
      },
      "link": {
        "type": "char",
        "label": "Link"
      },
      "download_url": {
        "type": "char",
        "label": "Download URL"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      }
    }
  },
  {
    "_name": "slide.tag",
    "_description": "Slide Tag",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      }
    }
  },
  {
    "_name": "website",
    "_description": "website",
    "_auto": true,
    "_fields": {
      "website_slide_google_app_key": {
        "type": "char",
        "label": "Google Doc Key"
      }
    },
    "_inherit": "website"
  }
];
