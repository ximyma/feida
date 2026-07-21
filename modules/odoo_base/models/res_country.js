// Auto-generated from Odoo model: res.country
// Description: Country

exports.model = {
  "_name": "res_country",
  "_description": "Country",
  "_fields": {
    "name": {
      "type": "char",
      "label": "Country Name",
      "required": true
    },
    "code": {
      "type": "char",
      "label": "Country Code",
      "required": true
    },
    "address_format": {
      "type": "text",
      "label": "Layout in Reports"
    },
    "address_view_id": {
      "type": "many2one",
      "label": "ir.ui.view",
      "relation": "ir_ui_view"
    },
    "currency_id": {
      "type": "many2one",
      "label": "res.currency",
      "relation": "res_currency"
    },
    "image_url": {
      "type": "char",
      "label": "_compute_image_url"
    },
    "phone_code": {
      "type": "integer",
      "label": "Country Calling Code"
    },
    "country_group_ids": {
      "type": "many2many",
      "label": "res.country.group"
    },
    "state_ids": {
      "type": "one2many",
      "label": "res.country.state"
    },
    "name_position": {
      "type": "selection",
      "label": "before"
    },
    "vat_label": {
      "type": "char",
      "label": "Vat Label"
    },
    "state_required": {
      "type": "boolean",
      "default": false
    },
    "zip_required": {
      "type": "boolean",
      "default": true
    }
  }
};
