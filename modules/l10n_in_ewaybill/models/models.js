// Odoo 模块: l10n_in_ewaybill
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_in_ewaybill_ids": {
        "type": "one2many",
        "label": "l10n_in_ewaybill_ids"
      },
      "l10n_in_ewaybill_name": {
        "type": "char",
        "label": "l10n_in_ewaybill_name"
      },
      "l10n_in_ewaybill_expiry_date": {
        "type": "datetime",
        "label": "_compute_l10n_in_ewaybill_details"
      },
      "l10n_in_ewaybill_feature_enabled": {
        "type": "boolean",
        "label": "E-Waybill Feature Enabled"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "l10n.in.ewaybill.type",
    "_description": "E-Waybill Document Type",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Type"
      },
      "code": {
        "type": "char",
        "label": "Type Code"
      },
      "sub_type": {
        "type": "char",
        "label": "Sub-type"
      },
      "sub_type_code": {
        "type": "char",
        "label": "Sub-type Code"
      },
      "allowed_supply_type": {
        "type": "selection",
        "label": "allowed_supply_type"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      }
    }
  },
  {
    "_name": "l10n.in.ewaybill",
    "_description": "e-Waybill",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "e-Waybill Number"
      },
      "ewaybill_date": {
        "type": "date",
        "label": "e-Waybill Date"
      },
      "ewaybill_expiry_date": {
        "type": "date",
        "label": "e-Waybill Valid Upto"
      },
      "state": {
        "type": "selection",
        "label": "Status"
      },
      "account_move_id": {
        "type": "many2one",
        "label": "account.move"
      },
      "document_date": {
        "type": "datetime",
        "label": "Document Date"
      },
      "document_number": {
        "type": "char",
        "label": "Document"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "company_currency_id": {
        "type": "many2one",
        "label": "company_id.currency_id"
      },
      "supply_type": {
        "type": "selection",
        "label": "Supply Type"
      },
      "partner_bill_from_id": {
        "type": "many2one",
        "label": "partner_bill_from_id"
      },
      "partner_bill_to_id": {
        "type": "many2one",
        "label": "partner_bill_to_id"
      },
      "partner_ship_from_id": {
        "type": "many2one",
        "label": "partner_ship_from_id"
      },
      "partner_ship_to_id": {
        "type": "many2one",
        "label": "partner_ship_to_id"
      },
      "is_bill_to_editable": {
        "type": "boolean",
        "label": "_compute_is_editable"
      },
      "is_bill_from_editable": {
        "type": "boolean",
        "label": "_compute_is_editable"
      },
      "is_ship_to_editable": {
        "type": "boolean",
        "label": "_compute_is_editable"
      },
      "is_ship_from_editable": {
        "type": "boolean",
        "label": "_compute_is_editable"
      },
      "type_id": {
        "type": "many2one",
        "label": "l10n.in.ewaybill.type"
      },
      "sub_type_code": {
        "type": "char",
        "label": "type_id.sub_type_code"
      },
      "distance": {
        "type": "integer",
        "label": "Distance"
      },
      "mode": {
        "type": "selection",
        "label": "mode"
      },
      "vehicle_no": {
        "type": "char",
        "label": "Vehicle Number"
      },
      "vehicle_type": {
        "type": "selection",
        "label": "vehicle_type"
      },
      "transportation_doc_no": {
        "type": "char",
        "label": "transportation_doc_no"
      },
      "transportation_doc_date": {
        "type": "date",
        "label": "transportation_doc_date"
      },
      "transporter_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "error_message": {
        "type": "html",
        "label": "error_message"
      },
      "blocking_level": {
        "type": "selection",
        "label": "blocking_level"
      },
      "content": {
        "type": "text",
        "label": "_compute_content"
      },
      "cancel_reason": {
        "type": "selection",
        "label": "cancel_reason"
      },
      "cancel_remarks": {
        "type": "char",
        "label": "Cancel remarks"
      },
      "attachment_id": {
        "type": "many2one",
        "label": "attachment_id"
      },
      "attachment_file": {
        "type": "text",
        "label": "attachment_file"
      }
    }
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_in_ewaybill_username": {
        "type": "char",
        "label": "E-Waybill Username"
      },
      "l10n_in_ewaybill_password": {
        "type": "char",
        "label": "E-Waybill Password"
      },
      "l10n_in_ewaybill_auth_validity": {
        "type": "datetime",
        "label": "E-Waybill Valid Until"
      },
      "l10n_in_ewaybill_feature": {
        "type": "boolean",
        "label": "E-Waybill"
      }
    },
    "_inherit": "res.company"
  }
];
