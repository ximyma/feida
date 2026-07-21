// Odoo 模块: app_base_chinese
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accounttaxgroup",
    "_description": "accounttaxgroup",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "Set active to false to hide the tax without removing it.",
        "default": true
      }
    },
    "_inherit": "account.tax.group"
  },
  {
    "_name": "module",
    "_description": "module",
    "_auto": true,
    "_fields": {
      "description_html_cn": {
        "type": "html",
        "label": "Description HTML CN"
      }
    },
    "_inherit": "ir.module.module"
  },
  {
    "_name": "country",
    "_description": "country",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      }
    },
    "_inherit": "res.country"
  },
  {
    "_name": "rescurrency",
    "_description": "rescurrency",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      }
    },
    "_inherit": "res.currency"
  },
  {
    "_name": "reslang",
    "_description": "reslang",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "time_format": {
        "type": "selection",
        "label": "%H:%M"
      }
    },
    "_inherit": "res.lang"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "short_name": {
        "type": "char",
        "label": "Short Name"
      },
      "fax": {
        "type": "char",
        "label": "Fax"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "location",
    "_description": "location",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "complete_name": {
        "type": "char",
        "label": "complete_name"
      }
    },
    "_inherit": "stock.location"
  }
];
