// Odoo 模块: l10n_cz
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "l10n_cz.tax_office",
    "_description": "Tax office in Czech Republic",
    "_auto": true,
    "_fields": {
      "workplace_code": {
        "type": "integer",
        "label": "Territorial Office",
        "required": true
      },
      "code": {
        "type": "integer",
        "label": "Code",
        "required": true
      },
      "name": {
        "type": "char",
        "label": "Name"
      },
      "region": {
        "type": "char",
        "label": "Region",
        "required": true
      }
    }
  }
];
