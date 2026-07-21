// Odoo 模块: l10n_se
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountjournal",
    "_description": "accountjournal",
    "_auto": true,
    "_fields": {
      "invoice_reference_model": {
        "type": "selection",
        "label": "invoice_reference_model"
      },
      "l10n_se_invoice_ocr_length": {
        "type": "integer",
        "label": "OCR Number Length"
      }
    },
    "_inherit": "account.journal"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "org_number": {
        "type": "char",
        "label": "_compute_org_number"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_se_check_vendor_ocr": {
        "type": "boolean",
        "label": "Check Vendor OCR"
      },
      "l10n_se_default_vendor_payment_ref": {
        "type": "char",
        "label": "Default Vendor Payment Ref"
      }
    },
    "_inherit": "res.partner"
  }
];
