// Odoo 模块: pos_pine_labs
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "pospayment",
    "_description": "pospayment",
    "_auto": true,
    "_fields": {
      "pine_labs_plutus_transaction_ref": {
        "type": "char",
        "label": "pine_labs_plutus_transaction_ref"
      }
    },
    "_inherit": "pos.payment"
  },
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "pine_labs_merchant": {
        "type": "char",
        "label": "Pine Labs Merchant ID"
      },
      "pine_labs_store": {
        "type": "char",
        "label": "Pine Labs Store ID"
      },
      "pine_labs_client": {
        "type": "char",
        "label": "Pine Labs Client ID"
      },
      "pine_labs_security_token": {
        "type": "char",
        "label": "Pine Labs Security Token"
      },
      "pine_labs_allowed_payment_mode": {
        "type": "selection",
        "label": "pine_labs_allowed_payment_mode"
      },
      "pine_labs_test_mode": {
        "type": "boolean",
        "label": "Pine Labs Test Mode"
      }
    },
    "_inherit": "pos.payment.method"
  }
];
