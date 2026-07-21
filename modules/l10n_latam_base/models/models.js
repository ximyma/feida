// Odoo 模块: l10n_latam_base
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "l10n_latam.identification.type",
    "_description": "Identification Types",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "description": {
        "type": "char",
        "label": "description"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "is_vat": {
        "type": "boolean",
        "label": "is_vat"
      },
      "country_id": {
        "type": "many2one",
        "label": "res.country"
      }
    }
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_latam_identification_type_id": {
        "type": "many2one",
        "label": "l10n_latam.identification.type"
      },
      "is_vat": {
        "type": "boolean",
        "label": "l10n_latam_identification_type_id.is_vat"
      },
      "vat": {
        "type": "char",
        "label": "Identification Number"
      }
    },
    "_inherit": "res.partner"
  }
];
