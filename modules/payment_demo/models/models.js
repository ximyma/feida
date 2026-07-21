// Odoo 模块: payment_demo
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "paymentprovider",
    "_description": "paymentprovider",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "selection",
        "label": "demo"
      }
    },
    "_inherit": "payment.provider"
  },
  {
    "_name": "paymenttoken",
    "_description": "paymenttoken",
    "_auto": true,
    "_fields": {
      "demo_simulated_state": {
        "type": "selection",
        "label": "demo_simulated_state"
      }
    },
    "_inherit": "payment.token"
  },
  {
    "_name": "paymenttransaction",
    "_description": "paymenttransaction",
    "_auto": true,
    "_fields": {
      "capture_manually": {
        "type": "boolean",
        "label": "provider_id.capture_manually"
      }
    },
    "_inherit": "payment.transaction"
  }
];
