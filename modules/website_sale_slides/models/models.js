// Odoo 模块: website_sale_slides
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "channel_ids": {
        "type": "one2many",
        "label": "slide.channel"
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "service_tracking": {
        "type": "selection",
        "label": "service_tracking"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "slidechannel",
    "_description": "slidechannel",
    "_auto": true,
    "_fields": {
      "enroll": {
        "type": "selection",
        "label": "enroll"
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product"
      },
      "product_sale_revenues": {
        "type": "monetary",
        "label": "product_sale_revenues"
      },
      "currency_id": {
        "type": "many2one",
        "label": "product_id.currency_id"
      }
    },
    "_inherit": "slide.channel"
  }
];
