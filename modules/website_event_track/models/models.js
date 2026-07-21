// Odoo 模块: website_event_track
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "eventevent",
    "_description": "eventevent",
    "_auto": true,
    "_fields": {
      "track_ids": {
        "type": "one2many",
        "label": "event.track"
      },
      "track_count": {
        "type": "integer",
        "label": "Track Count"
      },
      "website_track": {
        "type": "boolean",
        "label": "website_track"
      },
      "website_track_proposal": {
        "type": "boolean",
        "label": "website_track_proposal"
      },
      "track_menu_ids": {
        "type": "one2many",
        "label": "website.event.menu"
      },
      "track_proposal_menu_ids": {
        "type": "one2many",
        "label": "website.event.menu"
      },
      "allowed_track_tag_ids": {
        "type": "many2many",
        "label": "event.track.tag",
        "relation": "event_allowed_track_tags_rel"
      },
      "tracks_tag_ids": {
        "type": "many2many",
        "label": "tracks_tag_ids"
      }
    },
    "_inherit": "event.event"
  },
  {
    "_name": "event.track",
    "_description": "Event Track",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Title",
        "required": true
      },
      "event_id": {
        "type": "many2one",
        "label": "event.event",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "event.track.tag"
      },
      "description": {
        "type": "html",
        "label": "description"
      },
      "color": {
        "type": "integer",
        "label": "Agenda Color"
      },
      "priority": {
        "type": "selection",
        "label": "priority"
      },
      "stage_id": {
        "type": "many2one",
        "label": "stage_id"
      },
      "legend_blocked": {
        "type": "char",
        "label": "stage_id.legend_blocked"
      },
      "legend_done": {
        "type": "char",
        "label": "stage_id.legend_done"
      },
      "legend_normal": {
        "type": "char",
        "label": "stage_id.legend_normal"
      },
      "kanban_state": {
        "type": "selection",
        "label": "kanban_state"
      },
      "kanban_state_label": {
        "type": "char",
        "label": "kanban_state_label"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "partner_name": {
        "type": "char",
        "label": "partner_name"
      },
      "partner_email": {
        "type": "char",
        "label": "partner_email"
      },
      "partner_phone": {
        "type": "char",
        "label": "partner_phone"
      },
      "partner_biography": {
        "type": "html",
        "label": "partner_biography"
      },
      "partner_function": {
        "type": "char",
        "label": "partner_function"
      },
      "partner_company_name": {
        "type": "char",
        "label": "partner_company_name"
      },
      "partner_tag_line": {
        "type": "char",
        "label": "partner_tag_line"
      },
      "image": {
        "type": "text",
        "label": "image"
      },
      "contact_email": {
        "type": "char",
        "label": "contact_email"
      },
      "contact_phone": {
        "type": "char",
        "label": "contact_phone"
      },
      "location_id": {
        "type": "many2one",
        "label": "event.track.location"
      },
      "date": {
        "type": "datetime",
        "label": "Track Date"
      },
      "date_end": {
        "type": "datetime",
        "label": "Track End Date"
      },
      "duration": {
        "type": "float",
        "label": "Duration"
      },
      "is_track_live": {
        "type": "boolean",
        "label": "is_track_live"
      },
      "is_track_soon": {
        "type": "boolean",
        "label": "is_track_soon"
      },
      "is_track_today": {
        "type": "boolean",
        "label": "is_track_today"
      },
      "is_track_upcoming": {
        "type": "boolean",
        "label": "is_track_upcoming"
      },
      "is_track_done": {
        "type": "boolean",
        "label": "is_track_done"
      },
      "is_one_day": {
        "type": "boolean",
        "label": "_compute_field_is_one_day"
      },
      "track_start_remaining": {
        "type": "integer",
        "label": "track_start_remaining"
      },
      "track_start_relative": {
        "type": "integer",
        "label": "track_start_relative"
      },
      "website_image": {
        "type": "text",
        "label": "Website Image"
      },
      "website_image_url": {
        "type": "char",
        "label": "website_image_url"
      },
      "header_visible": {
        "type": "boolean",
        "label": "event_id.header_visible"
      },
      "footer_visible": {
        "type": "boolean",
        "label": "event_id.footer_visible"
      },
      "event_track_visitor_ids": {
        "type": "one2many",
        "label": "event_track_visitor_ids"
      },
      "is_reminder_on": {
        "type": "boolean",
        "label": "Is Reminder On"
      },
      "wishlist_visitor_ids": {
        "type": "many2many",
        "label": "wishlist_visitor_ids"
      },
      "wishlist_visitor_count": {
        "type": "integer",
        "label": "wishlist_visitor_count"
      },
      "wishlisted_by_default": {
        "type": "boolean",
        "label": "wishlisted_by_default"
      },
      "website_cta": {
        "type": "boolean",
        "label": "Magic Button"
      },
      "website_cta_title": {
        "type": "char",
        "label": "Button Title"
      },
      "website_cta_url": {
        "type": "char",
        "label": "Button Target URL"
      },
      "website_cta_delay": {
        "type": "integer",
        "label": "Show Button"
      },
      "is_website_cta_live": {
        "type": "boolean",
        "label": "is_website_cta_live"
      },
      "website_cta_start_remaining": {
        "type": "integer",
        "label": "website_cta_start_remaining"
      }
    }
  },
  {
    "_name": "event.track.location",
    "_description": "Event Track Location",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Location",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Define the order in which the location will appear on "
      }
    }
  },
  {
    "_name": "event.track.stage",
    "_description": "Event Track Stage",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Stage Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "mail_template_id": {
        "type": "many2one",
        "label": "mail_template_id"
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "description": {
        "type": "text",
        "label": "Description"
      },
      "legend_blocked": {
        "type": "char",
        "label": "Red Kanban Label"
      },
      "legend_done": {
        "type": "char",
        "label": "Green Kanban Label"
      },
      "legend_normal": {
        "type": "char",
        "label": "Grey Kanban Label"
      },
      "fold": {
        "type": "boolean",
        "label": "fold"
      },
      "is_visible_in_agenda": {
        "type": "boolean",
        "label": "is_visible_in_agenda"
      },
      "is_fully_accessible": {
        "type": "boolean",
        "label": "is_fully_accessible"
      },
      "is_cancel": {
        "type": "boolean",
        "label": "Cancelled Stage"
      }
    }
  },
  {
    "_name": "event.track.tag",
    "_description": "Event Track Tag",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Tag Name",
        "required": true
      },
      "track_ids": {
        "type": "many2many",
        "label": "event.track"
      },
      "color": {
        "type": "integer",
        "label": "color"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "category_id": {
        "type": "many2one",
        "label": "event.track.tag.category"
      }
    }
  },
  {
    "_name": "event.track.tag.category",
    "_description": "Event Track Tag Category",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "tag_ids": {
        "type": "one2many",
        "label": "event.track.tag"
      }
    }
  },
  {
    "_name": "event.track.visitor",
    "_description": "Track / Visitor Link",
    "_auto": true,
    "_fields": {
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "visitor_id": {
        "type": "many2one",
        "label": "visitor_id"
      },
      "track_id": {
        "type": "many2one",
        "label": "track_id"
      },
      "is_wishlisted": {
        "type": "boolean",
        "label": "Is Wishlisted"
      },
      "is_blacklisted": {
        "type": "boolean",
        "label": "Is reminder off"
      }
    }
  },
  {
    "_name": "eventtype",
    "_description": "eventtype",
    "_auto": true,
    "_fields": {
      "website_track": {
        "type": "boolean",
        "label": "website_track"
      },
      "website_track_proposal": {
        "type": "boolean",
        "label": "website_track_proposal"
      }
    },
    "_inherit": "event.type"
  },
  {
    "_name": "website",
    "_description": "website",
    "_auto": true,
    "_fields": {
      "app_icon": {
        "type": "text",
        "label": "app_icon"
      },
      "events_app_name": {
        "type": "char",
        "label": "events_app_name"
      }
    },
    "_inherit": "website"
  },
  {
    "_name": "websiteeventmenu",
    "_description": "websiteeventmenu",
    "_auto": true,
    "_fields": {
      "menu_type": {
        "type": "selection",
        "label": "menu_type"
      }
    },
    "_inherit": "website.event.menu"
  },
  {
    "_name": "websitevisitor",
    "_description": "websitevisitor",
    "_auto": true,
    "_fields": {
      "event_track_visitor_ids": {
        "type": "one2many",
        "label": "event_track_visitor_ids"
      },
      "event_track_wishlisted_ids": {
        "type": "many2many",
        "label": "event_track_wishlisted_ids"
      },
      "event_track_wishlisted_count": {
        "type": "integer",
        "label": "event_track_wishlisted_count"
      }
    },
    "_inherit": "website.visitor"
  }
];
