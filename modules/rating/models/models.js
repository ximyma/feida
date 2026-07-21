// Odoo 模块: rating
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mailmessage",
    "_description": "mailmessage",
    "_auto": true,
    "_fields": {
      "rating_ids": {
        "type": "one2many",
        "label": "rating.rating"
      },
      "rating_id": {
        "type": "many2one",
        "label": "rating.rating"
      },
      "rating_value": {
        "type": "float",
        "label": "rating_value"
      }
    },
    "_inherit": "mail.message"
  },
  {
    "_name": "rating.rating",
    "_description": "Rating",
    "_auto": true,
    "_fields": {
      "create_date": {
        "type": "datetime",
        "label": "Submitted on"
      },
      "res_name": {
        "type": "char",
        "label": "Resource name"
      },
      "res_model_id": {
        "type": "many2one",
        "label": "ir.model"
      },
      "res_model": {
        "type": "char",
        "label": "Document Model"
      },
      "res_id": {
        "type": "char",
        "label": "Document",
        "required": true
      },
      "resource_ref": {
        "type": "char",
        "label": "resource_ref"
      },
      "parent_res_name": {
        "type": "char",
        "label": "Parent Document Name"
      },
      "parent_res_model_id": {
        "type": "many2one",
        "label": "ir.model"
      },
      "parent_res_model": {
        "type": "char",
        "label": "Parent Document Model"
      },
      "parent_res_id": {
        "type": "integer",
        "label": "Parent Document"
      },
      "parent_ref": {
        "type": "char",
        "label": "parent_ref"
      },
      "rated_partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "rated_partner_name": {
        "type": "char",
        "label": "rated_partner_id.name"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "rating": {
        "type": "float",
        "label": "Rating Value"
      },
      "rating_image": {
        "type": "text",
        "label": "Image"
      },
      "rating_image_url": {
        "type": "char",
        "label": "Image URL"
      },
      "rating_text": {
        "type": "selection",
        "label": "Rating"
      },
      "feedback": {
        "type": "text",
        "label": "Comment"
      },
      "message_id": {
        "type": "many2one",
        "label": "message_id"
      },
      "is_internal": {
        "type": "boolean",
        "label": "Visible Internally Only"
      },
      "access_token": {
        "type": "char",
        "label": "Security Token"
      },
      "consumed": {
        "type": "boolean",
        "label": "Filled Rating"
      },
      "rated_on": {
        "type": "datetime",
        "label": "Rated On"
      }
    }
  }
];
