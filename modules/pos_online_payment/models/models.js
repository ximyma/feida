// Odoo 模块: pos_online_payment
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountpayment",
    "_description": "accountpayment",
    "_auto": true,
    "_fields": {
      "pos_order_id": {
        "type": "many2one",
        "label": "pos.order"
      }
    },
    "_inherit": "account.payment"
  },
  {
    "_name": "paymenttransaction",
    "_description": "paymenttransaction",
    "_auto": true,
    "_fields": {
      "pos_order_id": {
        "type": "many2one",
        "label": "pos.order"
      }
    },
    "_inherit": "payment.transaction"
  },
  {
    "_name": "posorder",
    "_description": "posorder",
    "_auto": true,
    "_fields": {
      "online_payment_method_id": {
        "type": "many2one",
        "label": "pos.payment.method"
      },
      "next_online_payment_amount": {
        "type": "float",
        "label": "Next online payment amount to pay"
      }
    },
    "_inherit": "pos.order"
  },
  {
    "_name": "pospayment",
    "_description": "pospayment",
    "_auto": true,
    "_fields": {
      "online_account_payment_id": {
        "type": "many2one",
        "label": "account.payment"
      }
    },
    "_inherit": "pos.payment"
  },
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "is_online_payment": {
        "type": "boolean",
        "label": "Online Payment",
        "default": false
      },
      "online_payment_provider_ids": {
        "type": "many2many",
        "label": "payment.provider"
      },
      "has_an_online_payment_provider": {
        "type": "boolean",
        "label": "_compute_has_an_online_payment_provider"
      },
      "type": {
        "type": "selection",
        "label": "online"
      }
    },
    "_inherit": "pos.payment.method"
  }
];
