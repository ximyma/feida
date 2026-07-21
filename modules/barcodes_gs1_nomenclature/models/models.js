// Odoo 模块: barcodes_gs1_nomenclature
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "barcodenomenclature",
    "_description": "barcodenomenclature",
    "_auto": true,
    "_fields": {
      "is_gs1_nomenclature": {
        "type": "boolean",
        "label": "is_gs1_nomenclature"
      },
      "gs1_separator_fnc1": {
        "type": "char",
        "label": "gs1_separator_fnc1"
      }
    },
    "_inherit": "barcode.nomenclature"
  },
  {
    "_name": "barcoderule",
    "_description": "barcoderule",
    "_auto": true,
    "_fields": {
      "encoding": {
        "type": "selection",
        "label": "encoding"
      },
      "type": {
        "type": "selection",
        "label": "type"
      },
      "is_gs1_nomenclature": {
        "type": "boolean",
        "label": "barcode_nomenclature_id.is_gs1_nomenclature"
      },
      "gs1_content_type": {
        "type": "selection",
        "label": "gs1_content_type"
      },
      "gs1_decimal_usage": {
        "type": "boolean",
        "label": "Decimal"
      },
      "associated_uom_id": {
        "type": "many2one",
        "label": "uom.uom"
      }
    },
    "_inherit": "barcode.rule"
  }
];
