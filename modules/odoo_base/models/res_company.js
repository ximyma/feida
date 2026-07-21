// Auto-generated from Odoo model: res.company
// Description: Companies

exports.model = {
  "_name": "res_company",
  "_description": "Companies",
  "_fields": {
    "name": {
      "type": "char",
      "label": "partner_id.name",
      "required": true
    },
    "active": {
      "type": "boolean",
      "default": true
    },
    "sequence": {
      "type": "integer",
      "label": "Used to order Companies in the company switcher",
      "default": 10
    },
    "parent_id": {
      "type": "many2one",
      "label": "res.company",
      "index": true,
      "relation": "res_company"
    },
    "child_ids": {
      "type": "one2many",
      "label": "res.company"
    },
    "all_child_ids": {
      "type": "one2many",
      "label": "res.company"
    },
    "parent_path": {
      "type": "char",
      "index": true
    },
    "parent_ids": {
      "type": "many2many",
      "label": "res.company"
    },
    "root_id": {
      "type": "many2one",
      "label": "res.company",
      "relation": "res_company"
    },
    "partner_id": {
      "type": "many2one",
      "label": "res.partner",
      "required": true,
      "index": true,
      "relation": "res_partner"
    },
    "report_header": {
      "type": "text",
      "label": "Company Tagline"
    },
    "report_footer": {
      "type": "text",
      "label": "Report Footer"
    },
    "company_details": {
      "type": "text",
      "label": "Company Details"
    },
    "is_company_details_empty": {
      "type": "boolean",
      "label": "_compute_empty_company_details"
    },
    "logo": {
      "type": "text",
      "label": "partner_id.image_1920"
    },
    "logo_web": {
      "type": "text",
      "label": "_compute_logo_web"
    },
    "uses_default_logo": {
      "type": "boolean",
      "label": "_compute_uses_default_logo"
    },
    "currency_id": {
      "type": "many2one",
      "label": "res.currency",
      "required": true,
      "relation": "res_currency"
    },
    "user_ids": {
      "type": "many2many",
      "label": "res.users"
    },
    "street": {
      "type": "char",
      "label": "_compute_address"
    },
    "street2": {
      "type": "char",
      "label": "_compute_address"
    },
    "zip": {
      "type": "char",
      "label": "_compute_address"
    },
    "city": {
      "type": "char",
      "label": "_compute_address"
    },
    "state_id": {
      "type": "many2one",
      "label": "res.country.state",
      "relation": "res_country_state"
    },
    "bank_ids": {
      "type": "one2many",
      "label": "partner_id.bank_ids"
    },
    "country_id": {
      "type": "many2one",
      "label": "res.country",
      "relation": "res_country"
    },
    "country_code": {
      "type": "char",
      "label": "country_id.code"
    },
    "email": {
      "type": "char",
      "label": "partner_id.email"
    },
    "phone": {
      "type": "char",
      "label": "partner_id.phone"
    },
    "website": {
      "type": "char",
      "label": "partner_id.website"
    },
    "vat": {
      "type": "char",
      "label": "partner_id.vat"
    },
    "company_registry": {
      "type": "char",
      "label": "partner_id.company_registry"
    },
    "company_registry_placeholder": {
      "type": "char",
      "label": "partner_id.company_registry_placeholder"
    },
    "paperformat_id": {
      "type": "many2one",
      "label": "report.paperformat",
      "relation": "report_paperformat"
    },
    "external_report_layout_id": {
      "type": "many2one",
      "label": "ir.ui.view",
      "relation": "ir_ui_view"
    },
    "font": {
      "type": "selection",
      "label": "Lato"
    },
    "primary_color": {
      "type": "char"
    },
    "secondary_color": {
      "type": "char"
    },
    "color": {
      "type": "integer",
      "label": "_compute_color"
    },
    "layout_background": {
      "type": "selection",
      "label": "Blank"
    },
    "layout_background_image": {
      "type": "text",
      "label": "Background Image"
    },
    "uninstalled_l10n_module_ids": {
      "type": "many2many",
      "label": "ir.module.module"
    }
  }
};
