// Odoo 模块: website_customer
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "website_tag_ids": {
        "type": "many2many",
        "label": "website_tag_ids"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "res.partner.tag",
    "_description": "Partner Tags - These tags can be used on website to find customers by sector, or ...",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Category Name",
        "required": true
      },
      "partner_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "classname": {
        "type": "selection",
        "label": "get_selection_class",
        "required": true,
        "default": "info"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      }
    }
  }
];
