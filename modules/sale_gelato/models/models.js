// Odoo 模块: sale_gelato
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "providergelato",
    "_description": "providergelato",
    "_auto": true,
    "_fields": {
      "delivery_type": {
        "type": "selection",
        "label": "delivery_type"
      },
      "gelato_shipping_service_type": {
        "type": "selection",
        "label": "gelato_shipping_service_type"
      }
    },
    "_inherit": "delivery.carrier"
  },
  {
    "_name": "productdocument",
    "_description": "productdocument",
    "_auto": true,
    "_fields": {
      "is_gelato": {
        "type": "boolean",
        "label": "is_gelato"
      }
    },
    "_inherit": "product.document"
  },
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "gelato_product_uid": {
        "type": "char",
        "label": "Gelato Product UID"
      }
    },
    "_inherit": "product.product"
  },
  {
    "_name": "product.document",
    "_description": "product.document",
    "_auto": true,
    "_fields": {
      "gelato_template_ref": {
        "type": "char",
        "label": "gelato_template_ref"
      },
      "gelato_product_uid": {
        "type": "char",
        "label": "gelato_product_uid"
      },
      "gelato_image_ids": {
        "type": "one2many",
        "label": "gelato_image_ids"
      },
      "gelato_missing_images": {
        "type": "boolean",
        "label": "gelato_missing_images"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "gelato_api_key": {
        "type": "char",
        "label": "Gelato API Key"
      },
      "gelato_webhook_secret": {
        "type": "char",
        "label": "Gelato Webhook Secret"
      }
    },
    "_inherit": "res.company"
  }
];
