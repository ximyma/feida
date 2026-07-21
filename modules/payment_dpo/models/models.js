// Odoo 模块: payment_dpo
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "paymentprovider",
    "_description": "paymentprovider",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "selection",
        "label": "dpo"
      },
      "dpo_service_ref": {
        "type": "char",
        "label": "DPO Service ID"
      },
      "dpo_company_token": {
        "type": "char",
        "label": "dpo_company_token"
      }
    },
    "_inherit": "payment.provider"
  }
];
