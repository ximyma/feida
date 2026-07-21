// Odoo 模块: l10n_gr_edi
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "l10n_gr_edi.preferred_classification",
    "_description": "l10n_gr_edi.preferred_classification",
    "_auto": true,
    "_fields": {
      "l10n_gr_edi_preferred_classification_ids": {
        "type": "one2many",
        "label": "l10n_gr_edi_preferred_classification_ids"
      }
    },
    "_inherit": "account.fiscal.position"
  },
  {
    "_name": "l10n_gr_edi.document",
    "_description": "l10n_gr_edi.document",
    "_auto": true,
    "_fields": {
      "l10n_gr_edi_mark": {
        "type": "char",
        "label": "l10n_gr_edi_mark"
      },
      "l10n_gr_edi_cls_mark": {
        "type": "char",
        "label": "l10n_gr_edi_cls_mark"
      },
      "l10n_gr_edi_document_ids": {
        "type": "one2many",
        "label": "l10n_gr_edi_document_ids"
      },
      "l10n_gr_edi_state": {
        "type": "selection",
        "label": "l10n_gr_edi_state"
      },
      "l10n_gr_edi_available_inv_type": {
        "type": "char",
        "label": "_compute_l10n_gr_edi_available_inv_type"
      },
      "l10n_gr_edi_correlation_id": {
        "type": "many2one",
        "label": "l10n_gr_edi_correlation_id"
      },
      "l10n_gr_edi_inv_type": {
        "type": "selection",
        "label": "l10n_gr_edi_inv_type"
      },
      "l10n_gr_edi_payment_method": {
        "type": "selection",
        "label": "l10n_gr_edi_payment_method"
      },
      "l10n_gr_edi_alerts": {
        "type": "char",
        "label": "_compute_l10n_gr_edi_alerts"
      },
      "l10n_gr_edi_need_correlated": {
        "type": "boolean",
        "label": "_compute_l10n_gr_edi_need_fields"
      },
      "l10n_gr_edi_need_payment_method": {
        "type": "boolean",
        "label": "_compute_l10n_gr_edi_need_fields"
      },
      "l10n_gr_edi_enable_view_mydata": {
        "type": "boolean",
        "label": "_compute_l10n_gr_edi_enable_fields"
      },
      "l10n_gr_edi_enable_send_invoices": {
        "type": "boolean",
        "label": "_compute_l10n_gr_edi_enable_fields"
      },
      "l10n_gr_edi_enable_send_expense_classification": {
        "type": "boolean",
        "label": "_compute_l10n_gr_edi_enable_fields"
      },
      "l10n_gr_edi_attachment_id": {
        "type": "many2one",
        "label": "l10n_gr_edi_attachment_id"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accountmoveline",
    "_description": "accountmoveline",
    "_auto": true,
    "_fields": {
      "l10n_gr_edi_available_cls_category": {
        "type": "char",
        "label": "_compute_l10n_gr_edi_available_cls_category"
      },
      "l10n_gr_edi_available_cls_type": {
        "type": "char",
        "label": "_compute_l10n_gr_edi_available_cls_type"
      },
      "l10n_gr_edi_available_cls_vat": {
        "type": "char",
        "label": "_compute_l10n_gr_edi_available_cls_type"
      },
      "l10n_gr_edi_need_exemption_category": {
        "type": "boolean",
        "label": "_compute_l10n_gr_edi_need_exemption_category",
        "default": false
      },
      "l10n_gr_edi_detail_type": {
        "type": "selection",
        "label": "l10n_gr_edi_detail_type"
      },
      "l10n_gr_edi_cls_category": {
        "type": "selection",
        "label": "l10n_gr_edi_cls_category"
      },
      "l10n_gr_edi_cls_type": {
        "type": "selection",
        "label": "l10n_gr_edi_cls_type"
      },
      "l10n_gr_edi_cls_vat": {
        "type": "selection",
        "label": "l10n_gr_edi_cls_vat"
      },
      "l10n_gr_edi_tax_exemption_category": {
        "type": "selection",
        "label": "l10n_gr_edi_tax_exemption_category"
      }
    },
    "_inherit": "account.move.line"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_gr_edi_default_tax_exemption_category": {
        "type": "selection",
        "label": "l10n_gr_edi_default_tax_exemption_category"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_gr_edi_aade_id": {
        "type": "char",
        "label": "AADE User ID"
      },
      "l10n_gr_edi_aade_key": {
        "type": "char",
        "label": "AADE Subscription Key"
      },
      "l10n_gr_edi_branch_number": {
        "type": "integer",
        "label": "partner_id.l10n_gr_edi_branch_number"
      },
      "l10n_gr_edi_test_env": {
        "type": "boolean",
        "label": "l10n_gr_edi_test_env"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_gr_edi_branch_number": {
        "type": "integer",
        "label": "l10n_gr_edi_branch_number"
      }
    },
    "_inherit": "res.partner"
  }
];
