// Odoo 模块: transifex
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "transifex.code.translation",
    "_description": "Code Translation",
    "_auto": true,
    "_fields": {
      "source": {
        "type": "text",
        "label": "Code"
      },
      "value": {
        "type": "text",
        "label": "Translation Value"
      },
      "module": {
        "type": "char",
        "label": "Module this term belongs to"
      },
      "lang": {
        "type": "selection",
        "label": "_get_languages"
      },
      "transifex_url": {
        "type": "char",
        "label": "Transifex URL"
      }
    }
  }
];
