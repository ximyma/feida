// Auto-generated from Odoo model: res.partner
// Description: Contact

exports.model = {
  "_name": "res_partner",
  "_description": "Contact",
  "_fields": {
    "name": {
      "type": "char",
      "index": true
    },
    "complete_name": {
      "type": "char",
      "label": "_compute_complete_name",
      "index": true
    },
    "ResPartner": {
      "type": "many2one",
      "label": "res.partner",
      "relation": "res_partner"
    },
    "parent_name": {
      "type": "char",
      "label": "parent_id.name"
    },
    "ref": {
      "type": "char",
      "label": "Reference",
      "index": true
    },
    "lang": {
      "type": "selection",
      "label": "Language"
    },
    "active_lang_count": {
      "type": "integer",
      "label": "_compute_active_lang_count"
    },
    "tz": {
      "type": "selection",
      "label": "Timezone"
    },
    "tz_offset": {
      "type": "char",
      "label": "_compute_tz_offset"
    },
    "ResUsers": {
      "type": "many2one",
      "label": "res.users",
      "relation": "res_users"
    },
    "vat": {
      "type": "char",
      "label": "Tax ID",
      "index": true
    },
    "vat_label": {
      "type": "char",
      "label": "Tax ID Label"
    },
    "company_registry": {
      "type": "char",
      "label": "Company ID"
    },
    "company_registry_label": {
      "type": "char",
      "label": "Company ID Label"
    },
    "company_registry_placeholder": {
      "type": "char",
      "label": "_compute_company_registry_placeholder"
    },
    "ResPartnerBank": {
      "type": "one2many",
      "label": "res.partner.bank"
    },
    "website": {
      "type": "char",
      "label": "Website Link"
    },
    "comment": {
      "type": "text",
      "label": "Notes"
    },
    "ResPartnerCategory": {
      "type": "many2many",
      "label": "res.partner.category"
    },
    "active": {
      "type": "boolean",
      "default": true
    },
    "employee": {
      "type": "boolean",
      "label": "Check this box if this contact is an Employee."
    },
    "function": {
      "type": "char",
      "label": "Job Position"
    },
    "type": {
      "type": "selection",
      "label": "contact"
    },
    "type_address_label": {
      "type": "char",
      "label": "Address Type Description"
    },
    "street": {
      "type": "char"
    },
    "street2": {
      "type": "char"
    },
    "zip": {
      "type": "char",
      "default": true
    },
    "city": {
      "type": "char"
    },
    "ResCountryState": {
      "type": "many2one",
      "label": "res.country.state",
      "relation": "res_country_state"
    },
    "ResCountry": {
      "type": "many2one",
      "label": "res.country",
      "relation": "res_country"
    },
    "country_code": {
      "type": "char",
      "label": "country_id.code"
    },
    "partner_latitude": {
      "type": "float",
      "label": "Geo Latitude"
    },
    "partner_longitude": {
      "type": "float",
      "label": "Geo Longitude"
    },
    "email": {
      "type": "char"
    },
    "email_formatted": {
      "type": "char",
      "label": "Formatted Email"
    },
    "phone": {
      "type": "char"
    },
    "is_company": {
      "type": "boolean",
      "label": "Is a Company",
      "default": false
    },
    "is_public": {
      "type": "boolean",
      "label": "_compute_is_public"
    },
    "ResPartnerIndustry": {
      "type": "many2one",
      "label": "res.partner.industry",
      "relation": "res_partner_industry"
    },
    "company_type": {
      "type": "selection",
      "label": "Company Type"
    },
    "ResCompany": {
      "type": "many2one",
      "label": "res.company",
      "index": true,
      "relation": "res_company"
    },
    "color": {
      "type": "integer",
      "label": "Color Index",
      "default": 0
    },
    "partner_share": {
      "type": "boolean",
      "label": "Share Partner"
    },
    "contact_address": {
      "type": "char",
      "label": "_compute_contact_address"
    },
    "commercial_company_name": {
      "type": "char",
      "label": "Company Name Entity"
    },
    "company_name": {
      "type": "char",
      "label": "Company Name"
    },
    "barcode": {
      "type": "char",
      "label": "Use a barcode to identify this contact."
    }
  }
};
