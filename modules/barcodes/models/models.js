// Odoo 模块: barcodes
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "barcode.nomenclature",
    "_description": "Barcode Nomenclature",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Barcode Nomenclature",
        "required": true
      },
      "rule_ids": {
        "type": "one2many",
        "label": "barcode.rule"
      },
      "upc_ean_conv": {
        "type": "selection",
        "label": "upc_ean_conv"
      }
    }
  },
  {
    "_name": "barcode.rule",
    "_description": "Barcode Rule",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Rule Name",
        "required": true
      },
      "barcode_nomenclature_id": {
        "type": "many2one",
        "label": "barcode.nomenclature"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "encoding": {
        "type": "selection",
        "label": "encoding"
      },
      "type": {
        "type": "selection",
        "label": "type"
      },
      "pattern": {
        "type": "char",
        "label": "Barcode Pattern",
        "required": true,
        "default": ".*"
      },
      "alias": {
        "type": "char",
        "label": "Alias",
        "required": true,
        "default": "0"
      }
    }
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "nomenclature_id": {
        "type": "many2one",
        "label": "nomenclature_id"
      }
    },
    "_inherit": "res.company"
  }
];
