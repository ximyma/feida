// Odoo 模块: website_event_booth_exhibitor
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "eventbooth",
    "_description": "eventbooth",
    "_auto": true,
    "_fields": {
      "use_sponsor": {
        "type": "boolean",
        "label": "booth_category_id.use_sponsor"
      },
      "sponsor_type_id": {
        "type": "many2one",
        "label": "booth_category_id.sponsor_type_id"
      },
      "sponsor_id": {
        "type": "many2one",
        "label": "event.sponsor"
      },
      "sponsor_name": {
        "type": "char",
        "label": "Sponsor Name"
      },
      "sponsor_email": {
        "type": "char",
        "label": "Sponsor Email"
      },
      "sponsor_phone": {
        "type": "char",
        "label": "Sponsor Phone"
      },
      "sponsor_subtitle": {
        "type": "char",
        "label": "Sponsor Slogan"
      },
      "sponsor_website_description": {
        "type": "html",
        "label": "Sponsor Description"
      },
      "sponsor_image_512": {
        "type": "text",
        "label": "Sponsor Logo"
      }
    },
    "_inherit": "event.booth"
  },
  {
    "_name": "eventboothcategory",
    "_description": "eventboothcategory",
    "_auto": true,
    "_fields": {
      "use_sponsor": {
        "type": "boolean",
        "label": "Create Sponsor"
      },
      "sponsor_type_id": {
        "type": "many2one",
        "label": "event.sponsor.type"
      },
      "exhibitor_type": {
        "type": "selection",
        "label": "Sponsor Type"
      }
    },
    "_inherit": "event.booth.category"
  }
];
