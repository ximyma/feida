// Odoo 模块: website_event_booth_sale_exhibitor
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "eventboothregistration",
    "_description": "eventboothregistration",
    "_auto": true,
    "_fields": {
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
    "_inherit": "event.booth.registration"
  }
];
