// Auto-generated from Odoo model: res.partner.category
// Description: Partner Tags

exports.model = {
  "_name": "res_partner_category",
  "_description": "Partner Tags",
  "_fields": {
    "name": {
      "type": "char",
      "label": "Name",
      "required": true
    },
    "color": {
      "type": "integer",
      "label": "Color"
    },
    "ResPartnerCategory": {
      "type": "one2many",
      "label": "res.partner.category"
    },
    "active": {
      "type": "boolean",
      "label": "The active field allows you to hide the category without removing it.",
      "default": true
    },
    "parent_path": {
      "type": "char",
      "index": true
    },
    "ResPartner": {
      "type": "many2many",
      "label": "res.partner"
    }
  }
};
