// Odoo 模块: website_payment
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountpayment",
    "_description": "accountpayment",
    "_auto": true,
    "_fields": {
      "is_donation": {
        "type": "boolean",
        "label": "Is Donation"
      }
    },
    "_inherit": "account.payment"
  },
  {
    "_name": "paymentprovider",
    "_description": "paymentprovider",
    "_auto": true,
    "_fields": {
      "website_id": {
        "type": "many2one",
        "label": "website_id"
      }
    },
    "_inherit": "payment.provider"
  },
  {
    "_name": "paymenttransaction",
    "_description": "paymenttransaction",
    "_auto": true,
    "_fields": {
      "is_donation": {
        "type": "boolean",
        "label": "Is donation"
      }
    },
    "_inherit": "payment.transaction"
  }
];
