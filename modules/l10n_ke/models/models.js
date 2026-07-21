// Odoo 模块: l10n_ke
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_ke_wh_certificate_number": {
        "type": "char",
        "label": "l10n_ke_wh_certificate_number"
      },
      "l10n_ke_wh_certificate_date": {
        "type": "date",
        "label": "l10n_ke_wh_certificate_date"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "accounttax",
    "_description": "accounttax",
    "_auto": true,
    "_fields": {
      "l10n_ke_item_code_id": {
        "type": "many2one",
        "label": "l10n_ke_item_code_id"
      }
    },
    "_inherit": "account.tax"
  },
  {
    "_name": "l10n_ke.item.code",
    "_description": "KRA defined codes that justify a given tax rate / exemption",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "char",
        "label": "KRA Item Code"
      },
      "description": {
        "type": "char",
        "label": "Description"
      },
      "tax_rate": {
        "type": "selection",
        "label": "C"
      }
    }
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_ke_oscu_is_active": {
        "type": "boolean",
        "label": "l10n_ke_oscu_is_active"
      }
    },
    "_inherit": "res.company"
  }
];
