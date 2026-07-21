// Odoo 模块: account_test
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accounting.assert.test",
    "_description": "Accounting Assert Test",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Test Name",
        "required": true
      },
      "desc": {
        "type": "text",
        "label": "Test Description"
      },
      "code_exec": {
        "type": "text",
        "label": "Python code",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      }
    }
  }
];
