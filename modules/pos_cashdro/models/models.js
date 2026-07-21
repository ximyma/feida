// Odoo 模块: pos_cashdro
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "cashdro_ip": {
        "type": "char",
        "label": "Cashdro IP"
      },
      "cashdro_username": {
        "type": "char",
        "label": "Cashdro Username"
      },
      "cashdro_password": {
        "type": "char",
        "label": "Cashdro Password"
      },
      "cashdro_use_lna": {
        "type": "boolean",
        "label": "Cashdro Local Network Access"
      }
    },
    "_inherit": "pos.payment.method"
  }
];
