// Auto-generated from Odoo model: res.lang
// Description: Languages

exports.model = {
  "_name": "res_lang",
  "_description": "Languages",
  "_fields": {
    "name": {
      "type": "char",
      "required": true
    },
    "code": {
      "type": "char",
      "label": "Locale Code",
      "required": true
    },
    "iso_code": {
      "type": "char",
      "label": "ISO code"
    },
    "url_code": {
      "type": "char",
      "label": "URL Code",
      "required": true
    },
    "active": {
      "type": "boolean"
    },
    "direction": {
      "type": "selection",
      "label": "ltr"
    },
    "date_format": {
      "type": "selection",
      "label": "Date Format",
      "required": true,
      "default": "%m/%d/%Y"
    },
    "time_format": {
      "type": "selection",
      "label": "%H:%M:%S"
    },
    "week_start": {
      "type": "selection",
      "label": "1"
    },
    "grouping": {
      "type": "selection",
      "label": "[3,0]"
    },
    "decimal_point": {
      "type": "char",
      "label": "Decimal Separator",
      "required": true,
      "default": "."
    },
    "thousands_sep": {
      "type": "char",
      "label": "Thousands Separator",
      "default": ""
    },
    "flag_image": {
      "type": "text",
      "label": "Image"
    },
    "flag_image_url": {
      "type": "char"
    }
  }
};
