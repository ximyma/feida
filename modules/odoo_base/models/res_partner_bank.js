// Auto-generated from Odoo model: res.partner.bank
// Description: Bank Accounts

exports.model = {
  "_name": "res_partner_bank",
  "_description": "Bank Accounts",
  "_fields": {
    "active": {
      "type": "boolean",
      "default": true
    },
    "acc_type": {
      "type": "selection",
      "label": "res.partner.bank"
    },
    "acc_number": {
      "type": "char",
      "label": "Account Number",
      "required": true
    },
    "clearing_number": {
      "type": "char",
      "label": "Clearing Number"
    },
    "sanitized_acc_number": {
      "type": "char",
      "label": "_compute_sanitized_acc_number"
    },
    "acc_holder_name": {
      "type": "char",
      "label": "Account Holder Name"
    },
    "partner_id": {
      "type": "many2one",
      "label": "res.partner",
      "index": true,
      "relation": "res_partner"
    },
    "allow_out_payment": {
      "type": "boolean",
      "label": "Send Money",
      "default": false
    },
    "bank_id": {
      "type": "many2one",
      "label": "res.bank",
      "relation": "res_bank"
    },
    "bank_name": {
      "type": "char",
      "label": "bank_id.name"
    },
    "bank_bic": {
      "type": "char",
      "label": "bank_id.bic"
    },
    "sequence": {
      "type": "integer",
      "default": 10
    },
    "currency_id": {
      "type": "many2one",
      "label": "res.currency",
      "relation": "res_currency"
    },
    "company_id": {
      "type": "many2one",
      "label": "res.company",
      "relation": "res_company"
    },
    "country_code": {
      "type": "char",
      "label": "partner_id.country_code"
    },
    "note": {
      "type": "text",
      "label": "Notes"
    },
    "color": {
      "type": "integer",
      "label": "_compute_color"
    }
  }
};
