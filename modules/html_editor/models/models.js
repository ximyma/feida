// Odoo 模块: html_editor
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "irattachment",
    "_description": "irattachment",
    "_auto": true,
    "_fields": {
      "local_url": {
        "type": "char",
        "label": "Attachment URL"
      },
      "image_src": {
        "type": "char",
        "label": "_compute_image_src"
      },
      "image_width": {
        "type": "integer",
        "label": "_compute_image_size"
      },
      "image_height": {
        "type": "integer",
        "label": "_compute_image_size"
      },
      "original_id": {
        "type": "many2one",
        "label": "ir.attachment"
      }
    },
    "_inherit": "ir.attachment"
  },
  {
    "_name": "html_editor.converter.test",
    "_description": "Html Editor Converter Test",
    "_auto": true,
    "_fields": {
      "char": {
        "type": "char",
        "label": "char"
      },
      "integer": {
        "type": "integer",
        "label": "integer"
      },
      "float": {
        "type": "float",
        "label": "float"
      },
      "numeric": {
        "type": "float",
        "label": "numeric"
      },
      "many2one": {
        "type": "many2one",
        "label": "html_editor.converter.test.sub"
      },
      "binary": {
        "type": "text",
        "label": "binary"
      },
      "date": {
        "type": "date",
        "label": "date"
      },
      "datetime": {
        "type": "datetime",
        "label": "datetime"
      },
      "selection_str": {
        "type": "selection",
        "label": "selection_str"
      },
      "html": {
        "type": "html",
        "label": "html"
      },
      "text": {
        "type": "text",
        "label": "text"
      }
    }
  },
  {
    "_name": "html_editor.converter.test.sub",
    "_description": "Html Editor Converter Subtest",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      }
    }
  }
];
