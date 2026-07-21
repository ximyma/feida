// Odoo 模块: l10n_ke_edi_tremol
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_ke_cu_datetime": {
        "type": "datetime",
        "label": "CU Signing Date and Time"
      },
      "l10n_ke_cu_serial_number": {
        "type": "char",
        "label": "CU Serial Number"
      },
      "l10n_ke_cu_invoice_number": {
        "type": "char",
        "label": "CU Invoice Number"
      },
      "l10n_ke_cu_qrcode": {
        "type": "char",
        "label": "CU QR Code"
      },
      "l10n_ke_cu_show_send_button": {
        "type": "boolean",
        "label": "Show Send to Tremol button"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_ke_cu_proxy_address": {
        "type": "char",
        "label": "l10n_ke_cu_proxy_address"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_ke_exemption_number": {
        "type": "char",
        "label": "l10n_ke_exemption_number"
      }
    },
    "_inherit": "res.partner"
  }
];
