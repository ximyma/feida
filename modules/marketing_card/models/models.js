// Odoo 模块: marketing_card
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "card.campaign",
    "_description": "Marketing Card Campaign",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "body_html": {
        "type": "html",
        "label": "card_template_id.body"
      },
      "card_count": {
        "type": "integer",
        "label": "_compute_card_stats"
      },
      "card_click_count": {
        "type": "integer",
        "label": "_compute_card_stats"
      },
      "card_share_count": {
        "type": "integer",
        "label": "_compute_card_stats"
      },
      "mailing_ids": {
        "type": "one2many",
        "label": "mailing.mailing"
      },
      "mailing_count": {
        "type": "integer",
        "label": "_compute_mailing_count"
      },
      "card_ids": {
        "type": "one2many",
        "label": "card.card"
      },
      "card_template_id": {
        "type": "many2one",
        "label": "card.template",
        "required": true
      },
      "image_preview": {
        "type": "text",
        "label": "_compute_image_preview"
      },
      "link_tracker_id": {
        "type": "many2one",
        "label": "link.tracker"
      },
      "res_model": {
        "type": "selection",
        "label": "res_model"
      },
      "post_suggestion": {
        "type": "text",
        "label": "Description below the card and default text when sharing on X"
      },
      "preview_record_ref": {
        "type": "char",
        "label": "Preview On",
        "required": true
      },
      "tag_ids": {
        "type": "many2many",
        "label": "card.campaign.tag"
      },
      "target_url": {
        "type": "char",
        "label": "Post Link"
      },
      "target_url_click_count": {
        "type": "integer",
        "label": "link_tracker_id.count"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "reward_message": {
        "type": "html",
        "label": "Thank You Message"
      },
      "reward_target_url": {
        "type": "char",
        "label": "Reward Link"
      },
      "request_title": {
        "type": "char",
        "label": "Request"
      },
      "request_description": {
        "type": "text",
        "label": "Request Description"
      },
      "content_background": {
        "type": "text",
        "label": "Background"
      },
      "content_button": {
        "type": "char",
        "label": "Button"
      },
      "content_header": {
        "type": "char",
        "label": "Header"
      },
      "content_header_dyn": {
        "type": "boolean",
        "label": "Is Dynamic Header"
      },
      "content_header_path": {
        "type": "char",
        "label": "Header Path"
      },
      "content_header_color": {
        "type": "char",
        "label": "Header Color"
      },
      "content_sub_header": {
        "type": "char",
        "label": "Sub-Header"
      },
      "content_sub_header_dyn": {
        "type": "boolean",
        "label": "Is Dynamic Sub-Header"
      },
      "content_sub_header_path": {
        "type": "char",
        "label": "Sub-Header Path"
      },
      "content_sub_header_color": {
        "type": "char",
        "label": "Sub Header Color"
      },
      "content_section": {
        "type": "char",
        "label": "Section"
      },
      "content_section_dyn": {
        "type": "boolean",
        "label": "Is Dynamic Section"
      },
      "content_section_path": {
        "type": "char",
        "label": "Section Path"
      },
      "content_sub_section1": {
        "type": "char",
        "label": "Sub-Section 1"
      },
      "content_sub_section1_dyn": {
        "type": "boolean",
        "label": "Is Dynamic Sub-Section 1"
      },
      "content_sub_section1_path": {
        "type": "char",
        "label": "Sub-Section 1 Path"
      },
      "content_sub_section2": {
        "type": "char",
        "label": "Sub-Section 2"
      },
      "content_sub_section2_dyn": {
        "type": "boolean",
        "label": "Is Dynamic Sub-Section 2"
      },
      "content_sub_section2_path": {
        "type": "char",
        "label": "Sub-Section 2 Path"
      },
      "content_image1_path": {
        "type": "char",
        "label": "Dynamic Image 1"
      },
      "content_image2_path": {
        "type": "char",
        "label": "Dynamic Image 2"
      }
    }
  },
  {
    "_name": "card.campaign.tag",
    "_description": "Marketing Card Campaign Tag",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "color"
      }
    }
  },
  {
    "_name": "card.card",
    "_description": "Marketing Card",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "campaign_id": {
        "type": "many2one",
        "label": "card.campaign",
        "required": true
      },
      "res_model": {
        "type": "selection",
        "label": "campaign_id.res_model"
      },
      "res_id": {
        "type": "char",
        "label": "Record ID",
        "required": true
      },
      "image": {
        "type": "text",
        "label": "image"
      },
      "requires_sync": {
        "type": "boolean",
        "label": "Whether the image needs to be updated to match the campaign template.",
        "default": true
      },
      "share_status": {
        "type": "selection",
        "label": "share_status"
      }
    }
  },
  {
    "_name": "card.template",
    "_description": "Marketing Card Template",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "default_background": {
        "type": "text",
        "label": "default_background"
      },
      "body": {
        "type": "html",
        "label": "body"
      },
      "primary_color": {
        "type": "char",
        "label": "#f9f9f9",
        "required": true,
        "default": "#f9f9f9"
      },
      "secondary_color": {
        "type": "char",
        "label": "#000000",
        "required": true,
        "default": "#000000"
      },
      "primary_text_color": {
        "type": "char",
        "label": "#000000",
        "required": true,
        "default": "#000000"
      },
      "secondary_text_color": {
        "type": "char",
        "label": "#ffffff",
        "required": true,
        "default": "#ffffff"
      }
    }
  },
  {
    "_name": "mailingmailing",
    "_description": "mailingmailing",
    "_auto": true,
    "_fields": {
      "mailing_model_id": {
        "type": "many2one",
        "label": "_compute_mailing_model_id"
      },
      "card_requires_sync_count": {
        "type": "integer",
        "label": "_compute_card_requires_sync_count"
      },
      "card_campaign_id": {
        "type": "many2one",
        "label": "card.campaign"
      }
    },
    "_inherit": "mailing.mailing"
  }
];
