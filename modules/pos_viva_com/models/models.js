// Odoo 模块: pos_viva_com
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "pospayment",
    "_description": "pospayment",
    "_auto": true,
    "_fields": {
      "viva_com_session_id": {
        "type": "char",
        "label": "Session ID of the transaction, stored so that it can be used to refund the payment."
      }
    },
    "_inherit": "pos.payment"
  },
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "viva_com_merchant_id": {
        "type": "char",
        "label": "viva_com_merchant_id"
      },
      "viva_com_api_key": {
        "type": "char",
        "label": "viva_com_api_key"
      },
      "viva_com_client_id": {
        "type": "char",
        "label": "viva_com_client_id"
      },
      "viva_com_client_secret": {
        "type": "char",
        "label": "viva_com_client_secret"
      },
      "viva_com_terminal_id": {
        "type": "char",
        "label": "Terminal ID"
      },
      "viva_com_bearer_token": {
        "type": "char",
        "label": "Bearer Token",
        "default": "Bearer Token"
      },
      "viva_com_webhook_verification_key": {
        "type": "char",
        "label": "viva_com_webhook_verification_key"
      },
      "viva_com_latest_response": {
        "type": "char",
        "label": "viva_com_latest_response"
      },
      "viva_com_test_mode": {
        "type": "boolean",
        "label": "Test mode"
      },
      "viva_com_webhook_endpoint": {
        "type": "char",
        "label": "_compute_viva_com_webhook_endpoint"
      }
    },
    "_inherit": "pos.payment.method"
  }
];
