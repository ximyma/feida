// Odoo 模块: pos_razorpay
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "pospayment",
    "_description": "pospayment",
    "_auto": true,
    "_fields": {
      "razorpay_reverse_ref_no": {
        "type": "char",
        "label": "Razorpay Reverse Reference No."
      },
      "razorpay_p2p_request_id": {
        "type": "char",
        "label": "Razorpay p2pRequestId"
      }
    },
    "_inherit": "pos.payment"
  },
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "razorpay_tid": {
        "type": "char",
        "label": "Razorpay Device Serial No"
      },
      "razorpay_allowed_payment_modes": {
        "type": "selection",
        "label": "all",
        "default": "all"
      },
      "razorpay_username": {
        "type": "char",
        "label": "Razorpay Username"
      },
      "razorpay_api_key": {
        "type": "char",
        "label": "Razorpay API Key"
      },
      "razorpay_test_mode": {
        "type": "boolean",
        "label": "Razorpay Test Mode",
        "default": false
      }
    },
    "_inherit": "pos.payment.method"
  }
];
