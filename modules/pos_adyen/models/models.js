// Odoo 模块: pos_adyen
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "posconfig",
    "_description": "posconfig",
    "_auto": true,
    "_fields": {
      "adyen_ask_customer_for_tip": {
        "type": "boolean",
        "label": "Ask Customers For Tip"
      }
    },
    "_inherit": "pos.config"
  },
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "adyen_api_key": {
        "type": "char",
        "label": "Adyen API key"
      },
      "adyen_terminal_identifier": {
        "type": "char",
        "label": "[Terminal model]-[Serial number], for example: P400Plus-123456789"
      },
      "adyen_test_mode": {
        "type": "boolean",
        "label": "Run transactions in the test environment."
      },
      "adyen_latest_response": {
        "type": "char",
        "label": "base.group_erp_manager"
      },
      "adyen_event_url": {
        "type": "char",
        "label": "adyen_event_url"
      }
    },
    "_inherit": "pos.payment.method"
  }
];
