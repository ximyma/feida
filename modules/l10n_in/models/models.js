// Odoo 模块: l10n_in
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountaccount",
    "_description": "accountaccount",
    "_auto": true,
    "_fields": {
      "l10n_in_tds_tcs_section_id": {
        "type": "many2one",
        "label": "l10n_in.section.alert"
      },
      "l10n_in_tds_feature_enabled": {
        "type": "boolean",
        "label": "_compute_tds_tcs_features"
      },
      "l10n_in_tcs_feature_enabled": {
        "type": "boolean",
        "label": "_compute_tds_tcs_features"
      }
    },
    "_inherit": "account.account"
  },
  {
    "_name": "res.country.state",
    "_description": "res.country.state",
    "_auto": true,
    "_fields": {
      "l10n_in_gst_treatment": {
        "type": "selection",
        "label": "l10n_in_gst_treatment"
      },
      "l10n_in_state_id": {
        "type": "many2one",
        "label": "l10n_in_state_id"
      },
      "l10n_in_gstin": {
        "type": "char",
        "label": "GSTIN"
      },
      "l10n_in_shipping_bill_number": {
        "type": "char",
        "label": "Shipping bill number"
      },
      "l10n_in_shipping_bill_date": {
        "type": "date",
        "label": "Shipping bill date"
      },
      "l10n_in_shipping_port_code_id": {
        "type": "many2one",
        "label": "l10n_in.port.code"
      },
      "l10n_in_reseller_partner_id": {
        "type": "many2one",
        "label": "l10n_in_reseller_partner_id"
      },
      "l10n_in_journal_type": {
        "type": "selection",
        "label": "Journal Type"
      },
      "l10n_in_warning": {
        "type": "char",
        "label": "_compute_l10n_in_warning"
      },
      "l10n_in_is_gst_registered_enabled": {
        "type": "boolean",
        "label": "company_id.l10n_in_is_gst_registered"
      },
      "l10n_in_tds_deduction": {
        "type": "selection",
        "label": "commercial_partner_id.l10n_in_pan_entity_id.tds_deduction"
      },
      "l10n_in_is_withholding": {
        "type": "boolean",
        "label": "l10n_in_is_withholding"
      },
      "l10n_in_withholding_ref_move_id": {
        "type": "many2one",
        "label": "l10n_in_withholding_ref_move_id"
      },
      "l10n_in_withholding_ref_payment_id": {
        "type": "many2one",
        "label": "l10n_in_withholding_ref_payment_id"
      },
      "l10n_in_withhold_move_ids": {
        "type": "one2many",
        "label": "l10n_in_withhold_move_ids"
      },
      "l10n_in_withholding_line_ids": {
        "type": "one2many",
        "label": "l10n_in_withholding_line_ids"
      },
      "l10n_in_total_withholding_amount": {
        "type": "monetary",
        "label": "l10n_in_total_withholding_amount"
      },
      "l10n_in_display_higher_tcs_button": {
        "type": "boolean",
        "label": "Display higher TCS button"
      },
      "l10n_in_tds_feature_enabled": {
        "type": "boolean",
        "label": "company_id.l10n_in_tds_feature"
      },
      "l10n_in_tcs_feature_enabled": {
        "type": "boolean",
        "label": "company_id.l10n_in_tcs_feature"
      },
      "l10n_in_partner_gstin_status": {
        "type": "boolean",
        "label": "l10n_in_partner_gstin_status"
      },
      "l10n_in_show_gstin_status": {
        "type": "boolean",
        "label": "_compute_l10n_in_show_gstin_status"
      },
      "l10n_in_gstin_verified_date": {
        "type": "date",
        "label": "_compute_l10n_in_partner_gstin_status_and_date"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accountmoveline",
    "_description": "accountmoveline",
    "_auto": true,
    "_fields": {
      "l10n_in_hsn_code": {
        "type": "char",
        "label": "HSN/SAC Code"
      },
      "l10n_in_gstr_section": {
        "type": "selection",
        "label": "l10n_in_gstr_section"
      },
      "l10n_in_withhold_tax_amount": {
        "type": "monetary",
        "label": "TDS Tax Amount"
      },
      "l10n_in_tds_tcs_section_id": {
        "type": "many2one",
        "label": "account_id.l10n_in_tds_tcs_section_id"
      }
    },
    "_inherit": "account.move.line"
  },
  {
    "_name": "accountpayment",
    "_description": "accountpayment",
    "_auto": true,
    "_fields": {
      "l10n_in_withhold_move_ids": {
        "type": "one2many",
        "label": "l10n_in_withhold_move_ids"
      },
      "l10n_in_total_withholding_amount": {
        "type": "monetary",
        "label": "_compute_l10n_in_total_withholding_amount"
      },
      "l10n_in_tds_feature_enabled": {
        "type": "boolean",
        "label": "company_id.l10n_in_tds_feature"
      }
    },
    "_inherit": "account.payment"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_in_reverse_charge": {
        "type": "boolean",
        "label": "Reverse charge"
      },
      "l10n_in_gst_tax_type": {
        "type": "selection",
        "label": "l10n_in_gst_tax_type"
      },
      "l10n_in_is_lut": {
        "type": "boolean",
        "label": "l10n_in_is_lut"
      },
      "l10n_in_tax_type": {
        "type": "selection",
        "label": "l10n_in_tax_type"
      },
      "l10n_in_section_id": {
        "type": "many2one",
        "label": "l10n_in.section.alert"
      },
      "l10n_in_tds_feature_enabled": {
        "type": "boolean",
        "label": "company_id.l10n_in_tds_feature"
      },
      "l10n_in_tcs_feature_enabled": {
        "type": "boolean",
        "label": "company_id.l10n_in_tcs_feature"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "account.account",
    "_description": "account.account",
    "_auto": true,
    "_fields": {
      "l10n_in_upi_id": {
        "type": "char",
        "label": "UPI Id"
      },
      "l10n_in_hsn_code_digit": {
        "type": "selection",
        "label": "l10n_in_hsn_code_digit"
      },
      "l10n_in_edi_production_env": {
        "type": "boolean",
        "label": "l10n_in_edi_production_env"
      },
      "l10n_in_pan_entity_id": {
        "type": "many2one",
        "label": "l10n_in_pan_entity_id"
      },
      "l10n_in_pan_type": {
        "type": "selection",
        "label": "l10n_in_pan_entity_id.type"
      },
      "l10n_in_tan": {
        "type": "char",
        "label": "partner_id.l10n_in_tan"
      },
      "l10n_in_gst_state_warning": {
        "type": "char",
        "label": "partner_id.l10n_in_gst_state_warning"
      },
      "l10n_in_tds_feature": {
        "type": "boolean",
        "label": "l10n_in_tds_feature"
      },
      "l10n_in_tcs_feature": {
        "type": "boolean",
        "label": "l10n_in_tcs_feature"
      },
      "l10n_in_withholding_account_id": {
        "type": "many2one",
        "label": "l10n_in_withholding_account_id"
      },
      "l10n_in_withholding_journal_id": {
        "type": "many2one",
        "label": "l10n_in_withholding_journal_id"
      },
      "l10n_in_is_gst_registered": {
        "type": "boolean",
        "label": "l10n_in_is_gst_registered"
      },
      "l10n_in_gstin_status_feature": {
        "type": "boolean",
        "label": "Check GST Number Status"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "l10n_in.pan.entity",
    "_description": "Indian PAN Entity",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "PAN",
        "required": true
      },
      "type": {
        "type": "selection",
        "label": "type"
      },
      "partner_ids": {
        "type": "one2many",
        "label": "partner_ids"
      },
      "tds_deduction": {
        "type": "selection",
        "label": "tds_deduction"
      },
      "tds_certificate": {
        "type": "text",
        "label": "TDS Certificate"
      },
      "tds_certificate_filename": {
        "type": "char",
        "label": "TDS Certificate Filename"
      },
      "msme_type": {
        "type": "selection",
        "label": "msme_type"
      },
      "msme_number": {
        "type": "char",
        "label": "MSME/Udyam Registration Number"
      }
    }
  },
  {
    "_name": "l10n_in.section.alert",
    "_description": "indian section alert",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Section Name"
      },
      "tax_source_type": {
        "type": "selection",
        "label": "tax_source_type"
      },
      "consider_amount": {
        "type": "selection",
        "label": "consider_amount"
      },
      "is_per_transaction_limit": {
        "type": "boolean",
        "label": "Per Transaction"
      },
      "per_transaction_limit": {
        "type": "float",
        "label": "Per Transaction limit"
      },
      "is_aggregate_limit": {
        "type": "boolean",
        "label": "Aggregate"
      },
      "aggregate_limit": {
        "type": "float",
        "label": "Aggregate limit"
      },
      "aggregate_period": {
        "type": "selection",
        "label": "aggregate_period"
      },
      "l10n_in_section_tax_ids": {
        "type": "one2many",
        "label": "account.tax"
      },
      "tax_report_line_id": {
        "type": "many2one",
        "label": "Tax Report Line"
      }
    }
  },
  {
    "_name": "l10n_in.port.code",
    "_description": "Indian port code",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "char",
        "label": "Port Code",
        "required": true
      },
      "name": {
        "type": "char",
        "label": "Port",
        "required": true
      },
      "state_id": {
        "type": "many2one",
        "label": "res.country.state"
      }
    }
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "l10n_in_hsn_code": {
        "type": "char",
        "label": "HSN/SAC Code"
      },
      "l10n_in_hsn_warning": {
        "type": "text",
        "label": "HSC/SAC warning"
      },
      "l10n_in_is_gst_registered_enabled": {
        "type": "boolean",
        "label": "_compute_l10n_in_is_gst_registered_enabled"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "rescountrystate",
    "_description": "rescountrystate",
    "_auto": true,
    "_fields": {
      "l10n_in_tin": {
        "type": "char",
        "label": "TIN Number"
      }
    },
    "_inherit": "res.country.state"
  },
  {
    "_name": "uomuom",
    "_description": "uomuom",
    "_auto": true,
    "_fields": {
      "l10n_in_code": {
        "type": "char",
        "label": "Indian GST UQC"
      }
    },
    "_inherit": "uom.uom"
  }
];
