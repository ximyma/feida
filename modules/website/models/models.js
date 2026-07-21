// Odoo 模块: website
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "iractionsserver",
    "_description": "iractionsserver",
    "_auto": true,
    "_fields": {
      "xml_id": {
        "type": "char",
        "label": "External ID"
      },
      "website_path": {
        "type": "char",
        "label": "Website Path"
      },
      "website_url": {
        "type": "char",
        "label": "Website Url"
      },
      "website_published": {
        "type": "boolean",
        "label": "Available on the Website"
      }
    },
    "_inherit": "ir.actions.server"
  },
  {
    "_name": "irasset",
    "_description": "irasset",
    "_auto": true,
    "_fields": {
      "key": {
        "type": "char",
        "label": "key"
      },
      "website_id": {
        "type": "many2one",
        "label": "website"
      }
    },
    "_inherit": "ir.asset"
  },
  {
    "_name": "irattachment",
    "_description": "irattachment",
    "_auto": true,
    "_fields": {
      "key": {
        "type": "char",
        "label": "key"
      },
      "website_id": {
        "type": "many2one",
        "label": "website"
      }
    },
    "_inherit": "ir.attachment"
  },
  {
    "_name": "ir.module.module",
    "_description": "Module",
    "_auto": true,
    "_fields": {
      "image_ids": {
        "type": "one2many",
        "label": "ir.attachment"
      },
      "is_installed_on_current_website": {
        "type": "boolean",
        "label": "_compute_is_installed_on_current_website"
      }
    }
  },
  {
    "_name": "ir.ui.view",
    "_description": "ir.ui.view",
    "_auto": true,
    "_fields": {
      "website_id": {
        "type": "many2one",
        "label": "website"
      },
      "page_ids": {
        "type": "one2many",
        "label": "website.page"
      },
      "controller_page_ids": {
        "type": "one2many",
        "label": "website.controller.page"
      },
      "first_page_id": {
        "type": "many2one",
        "label": "website.page"
      },
      "track": {
        "type": "boolean",
        "label": "Track",
        "default": false
      },
      "visibility": {
        "type": "selection",
        "label": "visibility"
      },
      "visibility_password": {
        "type": "char",
        "label": "base.group_system"
      },
      "visibility_password_display": {
        "type": "char",
        "label": "_get_pwd"
      }
    }
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "website_id": {
        "type": "many2one",
        "label": "website"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "res.partner",
    "_description": "res.partner",
    "_auto": true,
    "_fields": {
      "visitor_ids": {
        "type": "one2many",
        "label": "website.visitor"
      }
    }
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "website_id": {
        "type": "many2one",
        "label": "website"
      }
    },
    "_inherit": "res.users"
  },
  {
    "_name": "theme.ir.asset",
    "_description": "Theme Asset",
    "_auto": true,
    "_fields": {
      "key": {
        "type": "char",
        "label": "key"
      },
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "bundle": {
        "type": "char",
        "label": "bundle",
        "required": true
      },
      "directive": {
        "type": "selection",
        "label": "directive"
      },
      "path": {
        "type": "char",
        "label": "path",
        "required": true
      },
      "target": {
        "type": "char",
        "label": "target"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence",
        "required": true
      },
      "copy_ids": {
        "type": "one2many",
        "label": "ir.asset"
      }
    }
  },
  {
    "_name": "theme.ir.ui.view",
    "_description": "Theme UI View",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "key": {
        "type": "char",
        "label": "key"
      },
      "type": {
        "type": "char",
        "label": "type"
      },
      "priority": {
        "type": "integer",
        "label": "priority",
        "required": true
      },
      "mode": {
        "type": "selection",
        "label": "primary"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "arch": {
        "type": "text",
        "label": "arch"
      },
      "arch_fs": {
        "type": "char",
        "label": "arch_fs"
      },
      "inherit_id": {
        "type": "char",
        "label": "ir.ui.view"
      },
      "copy_ids": {
        "type": "one2many",
        "label": "ir.ui.view"
      },
      "customize_show": {
        "type": "boolean",
        "label": "customize_show"
      }
    }
  },
  {
    "_name": "theme.ir.attachment",
    "_description": "Theme Attachments",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "key": {
        "type": "char",
        "label": "key",
        "required": true
      },
      "url": {
        "type": "char",
        "label": "url"
      },
      "copy_ids": {
        "type": "one2many",
        "label": "ir.attachment"
      }
    }
  },
  {
    "_name": "theme.website.menu",
    "_description": "Website Theme Menu",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "url": {
        "type": "char",
        "label": "url",
        "default": ""
      },
      "page_id": {
        "type": "many2one",
        "label": "theme.website.page"
      },
      "new_window": {
        "type": "boolean",
        "label": "New Window"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "parent_id": {
        "type": "many2one",
        "label": "theme.website.menu"
      },
      "mega_menu_content": {
        "type": "html",
        "label": "mega_menu_content"
      },
      "mega_menu_classes": {
        "type": "char",
        "label": "mega_menu_classes"
      },
      "use_main_menu_as_parent": {
        "type": "boolean",
        "label": "use_main_menu_as_parent",
        "default": true
      },
      "copy_ids": {
        "type": "one2many",
        "label": "website.menu"
      }
    }
  },
  {
    "_name": "theme.website.page",
    "_description": "Website Theme Page",
    "_auto": true,
    "_fields": {
      "url": {
        "type": "char",
        "label": "url"
      },
      "view_id": {
        "type": "many2one",
        "label": "theme.ir.ui.view",
        "required": true
      },
      "website_indexed": {
        "type": "boolean",
        "label": "Page Indexed",
        "default": true
      },
      "is_published": {
        "type": "boolean",
        "label": "is_published"
      },
      "is_new_page_template": {
        "type": "boolean",
        "label": "New Page Template"
      },
      "copy_ids": {
        "type": "one2many",
        "label": "website.page"
      }
    }
  },
  {
    "_name": "iruiview",
    "_description": "iruiview",
    "_auto": true,
    "_fields": {
      "theme_template_id": {
        "type": "many2one",
        "label": "theme.ir.ui.view"
      }
    },
    "_inherit": "ir.ui.view"
  },
  {
    "_name": "websitemenu",
    "_description": "websitemenu",
    "_auto": true,
    "_fields": {
      "theme_template_id": {
        "type": "many2one",
        "label": "theme.website.menu"
      }
    },
    "_inherit": "website.menu"
  },
  {
    "_name": "websitepage",
    "_description": "websitepage",
    "_auto": true,
    "_fields": {
      "theme_template_id": {
        "type": "many2one",
        "label": "theme.website.page"
      }
    },
    "_inherit": "website.page"
  },
  {
    "_name": "website",
    "_description": "Website",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Website Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "domain": {
        "type": "char",
        "label": "Website Domain"
      },
      "domain_punycode": {
        "type": "char",
        "label": "domain_punycode"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "language_ids": {
        "type": "many2many",
        "label": "language_ids"
      },
      "language_count": {
        "type": "integer",
        "label": "Number of languages"
      },
      "default_lang_id": {
        "type": "many2one",
        "label": "res.lang",
        "required": true
      },
      "auto_redirect_lang": {
        "type": "boolean",
        "label": "Autoredirect Language",
        "default": true
      },
      "cookies_bar": {
        "type": "boolean",
        "label": "Cookies Bar"
      },
      "configurator_done": {
        "type": "boolean",
        "label": "True if configurator has been completed or ignored"
      },
      "block_third_party_domains": {
        "type": "boolean",
        "label": "block_third_party_domains"
      },
      "custom_blocked_third_party_domains": {
        "type": "text",
        "label": "custom_blocked_third_party_domains"
      },
      "blocked_third_party_domains": {
        "type": "text",
        "label": "blocked_third_party_domains"
      },
      "logo": {
        "type": "text",
        "label": "Website Logo"
      },
      "social_twitter": {
        "type": "char",
        "label": "X Account"
      },
      "social_facebook": {
        "type": "char",
        "label": "Facebook Account"
      },
      "social_github": {
        "type": "char",
        "label": "GitHub Account"
      },
      "social_linkedin": {
        "type": "char",
        "label": "LinkedIn Account"
      },
      "social_youtube": {
        "type": "char",
        "label": "Youtube Account"
      },
      "social_instagram": {
        "type": "char",
        "label": "Instagram Account"
      },
      "social_tiktok": {
        "type": "char",
        "label": "TikTok Account"
      },
      "social_discord": {
        "type": "char",
        "label": "Discord Account"
      },
      "social_default_image": {
        "type": "text",
        "label": "Default Social Share Image"
      },
      "has_social_default_image": {
        "type": "boolean",
        "label": "_compute_has_social_default_image"
      },
      "google_analytics_key": {
        "type": "char",
        "label": "Google Analytics Key"
      },
      "google_search_console": {
        "type": "char",
        "label": "Google key, or Enable to access first reply"
      },
      "google_maps_api_key": {
        "type": "char",
        "label": "Google Maps API Key"
      },
      "plausible_shared_key": {
        "type": "char",
        "label": "plausible_shared_key"
      },
      "plausible_site": {
        "type": "char",
        "label": "plausible_site"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users",
        "required": true
      },
      "cdn_activated": {
        "type": "boolean",
        "label": "Content Delivery Network (CDN)"
      },
      "cdn_url": {
        "type": "char",
        "label": "CDN Base URL",
        "default": ""
      },
      "cdn_filters": {
        "type": "text",
        "label": "CDN Filters"
      },
      "partner_id": {
        "type": "many2one",
        "label": "user_id.partner_id"
      },
      "menu_id": {
        "type": "many2one",
        "label": "website.menu"
      },
      "homepage_url": {
        "type": "char",
        "label": "E.g. /contactus or /shop"
      },
      "custom_code_head": {
        "type": "html",
        "label": "Custom <head> code"
      },
      "custom_code_footer": {
        "type": "html",
        "label": "Custom end of <body> code"
      },
      "robots_txt": {
        "type": "html",
        "label": "Robots.txt"
      },
      "favicon": {
        "type": "text",
        "label": "Website Favicon"
      },
      "theme_id": {
        "type": "many2one",
        "label": "ir.module.module"
      },
      "specific_user_account": {
        "type": "boolean",
        "label": "Specific User Account"
      },
      "auth_signup_uninvited": {
        "type": "selection",
        "label": "auth_signup_uninvited"
      }
    }
  },
  {
    "_name": "website.configurator.feature",
    "_description": "Website Configurator Feature",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "name": {
        "type": "char",
        "label": "name"
      },
      "description": {
        "type": "char",
        "label": "description"
      },
      "icon": {
        "type": "char",
        "label": "icon"
      },
      "iap_page_code": {
        "type": "char",
        "label": "Page code used to tell IAP website_service for which page a snippet list should be generated"
      },
      "website_config_preselection": {
        "type": "char",
        "label": "Comma-separated list of website type/purpose for which this feature should be pre-selected"
      },
      "page_view_id": {
        "type": "many2one",
        "label": "ir.ui.view"
      },
      "module_id": {
        "type": "many2one",
        "label": "ir.module.module"
      },
      "feature_url": {
        "type": "char",
        "label": "feature_url"
      },
      "menu_sequence": {
        "type": "integer",
        "label": "If set, a website menu will be created for the feature."
      },
      "menu_company": {
        "type": "boolean",
        "label": "If set, add the menu as a second level menu, as a child of "
      }
    }
  },
  {
    "_name": "website.controller.page",
    "_description": "Model Page",
    "_auto": true,
    "_fields": {
      "view_id": {
        "type": "many2one",
        "label": "ir.ui.view",
        "required": true
      },
      "record_view_id": {
        "type": "many2one",
        "label": "ir.ui.view"
      },
      "menu_ids": {
        "type": "one2many",
        "label": "website.menu"
      },
      "website_id": {
        "type": "many2one",
        "label": "view_id.website_id"
      },
      "name": {
        "type": "char",
        "label": "The name is used to generate the URL and is shown in the browser title bar"
      },
      "name_slugified": {
        "type": "char",
        "label": "name_slugified"
      },
      "url_demo": {
        "type": "char",
        "label": "Demo URL"
      },
      "record_domain": {
        "type": "char",
        "label": "Domain"
      },
      "default_layout": {
        "type": "selection",
        "label": "default_layout"
      }
    }
  },
  {
    "_name": "ir.model",
    "_description": "Models",
    "_auto": true,
    "_fields": {
      "website_form_access": {
        "type": "boolean",
        "label": "Allowed to use in forms"
      },
      "website_form_default_field_id": {
        "type": "many2one",
        "label": "ir.model.fields"
      },
      "website_form_label": {
        "type": "char",
        "label": "Label for form action"
      },
      "website_form_key": {
        "type": "char",
        "label": "Used in FormBuilder Registry"
      }
    }
  },
  {
    "_name": "{field.model}",
    "_description": "Fields",
    "_auto": true,
    "_fields": {
      "website_form_blacklisted": {
        "type": "boolean",
        "label": "website_form_blacklisted"
      }
    },
    "_inherit": "ir.model.fields"
  },
  {
    "_name": "website.menu",
    "_description": "Website Menu",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Menu",
        "required": true
      },
      "url": {
        "type": "char",
        "label": "Url",
        "required": true,
        "default": "#"
      },
      "page_id": {
        "type": "many2one",
        "label": "website.page"
      },
      "controller_page_id": {
        "type": "many2one",
        "label": "website.controller.page"
      },
      "new_window": {
        "type": "boolean",
        "label": "New Window"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "website_id": {
        "type": "many2one",
        "label": "website"
      },
      "parent_id": {
        "type": "many2one",
        "label": "website.menu"
      },
      "child_id": {
        "type": "one2many",
        "label": "website.menu"
      },
      "parent_path": {
        "type": "char",
        "label": "parent_path"
      },
      "is_visible": {
        "type": "boolean",
        "label": "_compute_visible"
      },
      "group_ids": {
        "type": "many2many",
        "label": "res.groups"
      },
      "is_mega_menu": {
        "type": "boolean",
        "label": "is_mega_menu"
      },
      "mega_menu_content": {
        "type": "html",
        "label": "mega_menu_content"
      },
      "mega_menu_classes": {
        "type": "char",
        "label": "mega_menu_classes"
      }
    }
  },
  {
    "_name": "website.page",
    "_description": "Page",
    "_auto": true,
    "_fields": {
      "url": {
        "type": "char",
        "label": "Page URL",
        "required": true
      },
      "view_id": {
        "type": "many2one",
        "label": "ir.ui.view",
        "required": true
      },
      "view_write_uid": {
        "type": "many2one",
        "label": "res.users"
      },
      "view_write_date": {
        "type": "datetime",
        "label": "Last Content Update on"
      },
      "website_indexed": {
        "type": "boolean",
        "label": "Is Indexed",
        "default": true
      },
      "date_publish": {
        "type": "datetime",
        "label": "Publishing Date"
      },
      "menu_ids": {
        "type": "one2many",
        "label": "website.menu"
      },
      "is_in_menu": {
        "type": "boolean",
        "label": "_compute_website_menu"
      },
      "is_homepage": {
        "type": "boolean",
        "label": "_compute_is_homepage"
      },
      "is_visible": {
        "type": "boolean",
        "label": "_compute_visible"
      },
      "is_new_page_template": {
        "type": "boolean",
        "label": "New Page Template"
      },
      "website_id": {
        "type": "many2one",
        "label": "view_id.website_id"
      },
      "arch": {
        "type": "text",
        "label": "view_id.arch"
      }
    }
  },
  {
    "_name": "website.route",
    "_description": "All Website Route",
    "_auto": true,
    "_fields": {
      "path": {
        "type": "char",
        "label": "Route"
      }
    }
  },
  {
    "_name": "website.rewrite",
    "_description": "Website rewrite",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "website_id": {
        "type": "many2one",
        "label": "website"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "url_from": {
        "type": "char",
        "label": "URL from"
      },
      "route_id": {
        "type": "many2one",
        "label": "website.route"
      },
      "url_to": {
        "type": "char",
        "label": "URL to"
      },
      "redirect_type": {
        "type": "selection",
        "label": "redirect_type"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      }
    }
  },
  {
    "_name": "website.snippet.filter",
    "_description": "Website Snippet Filter",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "action_server_id": {
        "type": "many2one",
        "label": "ir.actions.server"
      },
      "field_names": {
        "type": "char",
        "label": "A list of comma-separated field names",
        "required": true,
        "default": ""
      },
      "filter_id": {
        "type": "many2one",
        "label": "ir.filters"
      },
      "limit": {
        "type": "integer",
        "label": "The limit is the maximum number of records retrieved",
        "required": true
      },
      "website_id": {
        "type": "many2one",
        "label": "website"
      },
      "model_name": {
        "type": "char",
        "label": "Model name"
      },
      "help": {
        "type": "text",
        "label": "help"
      }
    }
  },
  {
    "_name": "website.technical.page",
    "_description": "Website Technical Page",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Page Name"
      },
      "website_url": {
        "type": "char",
        "label": "Website Page URL"
      }
    }
  },
  {
    "_name": "website.track",
    "_description": "Visited Pages",
    "_auto": true,
    "_fields": {
      "visitor_id": {
        "type": "many2one",
        "label": "website.visitor",
        "required": true
      },
      "page_id": {
        "type": "many2one",
        "label": "website.page"
      },
      "url": {
        "type": "text",
        "label": "Url"
      },
      "visit_datetime": {
        "type": "datetime",
        "label": "Visit Date",
        "required": true
      }
    }
  },
  {
    "_name": "website.visitor",
    "_description": "Website Visitor",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "access_token": {
        "type": "char",
        "label": "access_token",
        "required": true
      },
      "website_id": {
        "type": "many2one",
        "label": "website"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "partner_image": {
        "type": "text",
        "label": "partner_id.image_1920"
      },
      "country_id": {
        "type": "many2one",
        "label": "res.country"
      },
      "country_flag": {
        "type": "char",
        "label": "country_id.image_url"
      },
      "lang_id": {
        "type": "many2one",
        "label": "res.lang"
      },
      "timezone": {
        "type": "selection",
        "label": "Timezone"
      },
      "email": {
        "type": "char",
        "label": "Email"
      },
      "mobile": {
        "type": "char",
        "label": "Mobile"
      },
      "visit_count": {
        "type": "integer",
        "label": "# Visits"
      },
      "website_track_ids": {
        "type": "one2many",
        "label": "website.track"
      },
      "visitor_page_count": {
        "type": "integer",
        "label": "Page Views"
      },
      "page_ids": {
        "type": "many2many",
        "label": "website.page"
      },
      "page_count": {
        "type": "integer",
        "label": "# Visited Pages"
      },
      "last_visited_page_id": {
        "type": "many2one",
        "label": "website.page"
      },
      "create_date": {
        "type": "datetime",
        "label": "First Connection"
      },
      "last_connection_datetime": {
        "type": "datetime",
        "label": "Last Connection"
      },
      "time_since_last_action": {
        "type": "char",
        "label": "Last action"
      },
      "is_connected": {
        "type": "boolean",
        "label": "Is connected?"
      }
    }
  }
];
