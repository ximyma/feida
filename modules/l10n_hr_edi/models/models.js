// Odoo 模块: l10n_hr_edi
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountjournal",
    "_description": "accountjournal",
    "_auto": true,
    "_fields": {
      "l10n_hr_business_premises_label": {
        "type": "char",
        "label": "l10n_hr_business_premises_label"
      },
      "l10n_hr_issuing_device_label": {
        "type": "char",
        "label": "l10n_hr_issuing_device_label"
      },
      "l10n_hr_business_premises_label_refund": {
        "type": "char",
        "label": "l10n_hr_business_premises_label_refund"
      },
      "l10n_hr_issuing_device_label_refund": {
        "type": "char",
        "label": "l10n_hr_issuing_device_label_refund"
      },
      "l10n_hr_mer_connection_state": {
        "type": "selection",
        "label": "company_id.l10n_hr_mer_connection_state"
      },
      "l10n_hr_is_mer_journal": {
        "type": "boolean",
        "label": "Journal used for eRacun via MojEracun"
      }
    },
    "_inherit": "account.journal"
  },
  {
    "_name": "res.partner",
    "_description": "res.partner",
    "_auto": true,
    "_fields": {
      "l10n_hr_process_type": {
        "type": "selection",
        "label": "l10n_hr_process_type"
      },
      "l10n_hr_customer_defined_process_name": {
        "type": "char",
        "label": "l10n_hr_customer_defined_process_name"
      },
      "l10n_hr_fiscal_user_id": {
        "type": "many2one",
        "label": "l10n_hr_fiscal_user_id"
      },
      "l10n_hr_operator_name": {
        "type": "char",
        "label": "Operator Label"
      },
      "l10n_hr_operator_oib": {
        "type": "char",
        "label": "Operator OIB"
      },
      "l10n_hr_edi_addendum_id": {
        "type": "one2many",
        "label": "l10n_hr_edi.addendum"
      },
      "l10n_hr_invoice_sending_time": {
        "type": "datetime",
        "label": "l10n_hr_edi_addendum_id.invoice_sending_time"
      },
      "l10n_hr_business_document_status": {
        "type": "selection",
        "label": "l10n_hr_edi_addendum_id.business_document_status"
      },
      "l10n_hr_business_status_reason": {
        "type": "char",
        "label": "l10n_hr_edi_addendum_id.business_status_reason"
      },
      "l10n_hr_fiscalization_number": {
        "type": "char",
        "label": "l10n_hr_edi_addendum_id.fiscalization_number"
      },
      "l10n_hr_fiscalization_status": {
        "type": "selection",
        "label": "l10n_hr_edi_addendum_id.fiscalization_status"
      },
      "l10n_hr_fiscalization_error": {
        "type": "char",
        "label": "l10n_hr_edi_addendum_id.fiscalization_error"
      },
      "l10n_hr_fiscalization_request": {
        "type": "char",
        "label": "l10n_hr_edi_addendum_id.fiscalization_request"
      },
      "l10n_hr_fiscalization_channel_type": {
        "type": "selection",
        "label": "l10n_hr_edi_addendum_id.fiscalization_channel_type"
      },
      "l10n_hr_payment_reported_amount": {
        "type": "monetary",
        "label": "l10n_hr_payment_reported_amount"
      },
      "l10n_hr_payment_unreported": {
        "type": "boolean",
        "label": "_compute_l10n_hr_payment_unreported"
      },
      "l10n_hr_payment_method_type": {
        "type": "selection",
        "label": "l10n_hr_edi_addendum_id.payment_method_type"
      },
      "l10n_hr_mer_document_eid": {
        "type": "char",
        "label": "l10n_hr_edi_addendum_id.mer_document_eid"
      },
      "l10n_hr_mer_document_status": {
        "type": "selection",
        "label": "l10n_hr_edi_addendum_id.mer_document_status"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "l10n_hr.kpd.category",
    "_description": "l10n_hr.kpd.category",
    "_auto": true,
    "_fields": {
      "l10n_hr_kpd_category_id": {
        "type": "many2one",
        "label": "l10n_hr_kpd_category_id"
      }
    },
    "_inherit": "account.move.line"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_hr_tax_category_id": {
        "type": "many2one",
        "label": "l10n.hr.tax.category"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "l10n.hr.tax.category",
    "_description": "Croatian tax expence categories",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name/Mark",
        "required": true
      },
      "code_untdid": {
        "type": "char",
        "label": "UNTDID code"
      },
      "code_hr": {
        "type": "char",
        "label": "HR tax category code"
      },
      "code_tax_scheme": {
        "type": "char",
        "label": "UNTDID tax scheme code"
      },
      "category_name": {
        "type": "char",
        "label": "Categody code name"
      },
      "description": {
        "type": "char",
        "label": "Description"
      }
    }
  },
  {
    "_name": "l10n_hr_edi.addendum",
    "_description": "EDI and fiscalization information for Croatian electronic invoicing",
    "_auto": true,
    "_fields": {
      "move_id": {
        "type": "many2one",
        "label": "account.move",
        "required": true
      },
      "invoice_sending_time": {
        "type": "datetime",
        "label": "Time of invoicing"
      },
      "business_document_status": {
        "type": "selection",
        "label": "business_document_status"
      },
      "business_status_reason": {
        "type": "char",
        "label": "business_status_reason"
      },
      "fiscalization_number": {
        "type": "char",
        "label": "fiscalization_number"
      },
      "fiscalization_status": {
        "type": "selection",
        "label": "fiscalization_status"
      },
      "fiscalization_error": {
        "type": "char",
        "label": "fiscalization_error"
      },
      "fiscalization_request": {
        "type": "char",
        "label": "fiscalization_request"
      },
      "fiscalization_channel_type": {
        "type": "selection",
        "label": "fiscalization_channel_type"
      },
      "currency_id": {
        "type": "many2one",
        "label": "move_id.currency_id"
      },
      "payment_reported_amount": {
        "type": "monetary",
        "label": "payment_reported_amount"
      },
      "payment_method_type": {
        "type": "selection",
        "label": "payment_method_type"
      },
      "mer_document_eid": {
        "type": "char",
        "label": "MojEracun document ElectronicId"
      },
      "mer_document_status": {
        "type": "selection",
        "label": "mer_document_status"
      },
      "mer_signed_xml_archived": {
        "type": "boolean",
        "label": "Signed XML archived"
      }
    }
  },
  {
    "_name": "account.journal",
    "_description": "account.journal",
    "_auto": true,
    "_fields": {
      "l10n_hr_mer_username": {
        "type": "char",
        "label": "MojEracun username"
      },
      "l10n_hr_mer_password": {
        "type": "char",
        "label": "MojEracun password"
      },
      "l10n_hr_mer_company_ident": {
        "type": "char",
        "label": "MojEracun CompanyId"
      },
      "l10n_hr_mer_software_ident": {
        "type": "char",
        "label": "MojEracun SoftwareId",
        "default": "Saodoo-001"
      },
      "l10n_hr_mer_connection_state": {
        "type": "selection",
        "label": "l10n_hr_mer_connection_state"
      },
      "l10n_hr_mer_connection_mode": {
        "type": "selection",
        "label": "l10n_hr_mer_connection_mode"
      },
      "l10n_hr_mer_purchase_journal_id": {
        "type": "many2one",
        "label": "l10n_hr_mer_purchase_journal_id"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "invoice_sending_method": {
        "type": "selection",
        "label": "invoice_sending_method"
      },
      "invoice_edi_format": {
        "type": "selection",
        "label": "ubl_hr"
      },
      "l10n_hr_personal_oib": {
        "type": "char",
        "label": "Personal OIB"
      },
      "l10n_hr_business_unit_code": {
        "type": "char",
        "label": "Business Unit Code"
      }
    },
    "_inherit": "res.partner"
  }
];
