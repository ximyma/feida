// Odoo 模块: l10n_jo_edi_pos
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "ir.attachment",
    "_description": "ir.attachment",
    "_auto": true,
    "_fields": {
      "l10n_jo_edi_pos_return_reason": {
        "type": "char",
        "label": "Return Reason"
      },
      "l10n_jo_edi_pos_enabled": {
        "type": "boolean",
        "label": "company_id.l10n_jo_edi_pos_enabled"
      },
      "l10n_jo_edi_pos_uuid": {
        "type": "char",
        "label": "Order UUID"
      },
      "l10n_jo_edi_pos_qr": {
        "type": "char",
        "label": "QR"
      },
      "l10n_jo_edi_pos_state": {
        "type": "selection",
        "label": "l10n_jo_edi_pos_state"
      },
      "l10n_jo_edi_pos_error": {
        "type": "text",
        "label": "l10n_jo_edi_pos_error"
      },
      "l10n_jo_edi_pos_computed_xml": {
        "type": "text",
        "label": "l10n_jo_edi_pos_computed_xml"
      },
      "l10n_jo_edi_pos_xml_attachment_id": {
        "type": "many2one",
        "label": "l10n_jo_edi_pos_xml_attachment_id"
      }
    },
    "_inherit": "pos.order"
  },
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "country_code": {
        "type": "char",
        "label": "company_id.country_id.code"
      },
      "l10n_jo_edi_pos_is_cash": {
        "type": "boolean",
        "label": "l10n_jo_edi_pos_is_cash"
      }
    },
    "_inherit": "pos.payment.method"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_jo_edi_pos_enabled": {
        "type": "boolean",
        "label": "l10n_jo_edi_pos_enabled"
      },
      "l10n_jo_edi_pos_testing_mode": {
        "type": "boolean",
        "label": "l10n_jo_edi_pos_testing_mode"
      }
    },
    "_inherit": "res.company"
  }
];
