// Odoo 模块: pos_dpopay
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "pospayment",
    "_description": "pospayment",
    "_auto": true,
    "_fields": {
      "dpopay_rrn": {
        "type": "char",
        "label": "RRN"
      },
      "dpopay_transaction_ref": {
        "type": "char",
        "label": "Transaction Reference"
      },
      "dpopay_mobile_money_phone": {
        "type": "char",
        "label": "Mobile Money Phone Number(Last 4 Digit)"
      }
    },
    "_inherit": "pos.payment"
  },
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "dpopay_client_id": {
        "type": "char",
        "label": "DPO Pay Client ID"
      },
      "dpopay_client_secret": {
        "type": "char",
        "label": "DPO Pay Client Secret"
      },
      "dpopay_mid": {
        "type": "char",
        "label": "DPO Pay Merchant ID"
      },
      "dpopay_tid": {
        "type": "char",
        "label": "DPO Pay Terminal ID"
      },
      "dpopay_payment_mode": {
        "type": "selection",
        "label": "dpopay_payment_mode"
      },
      "dpopay_chain_id": {
        "type": "char",
        "label": "DPO Pay Chain-ID"
      },
      "dpopay_test_mode": {
        "type": "boolean",
        "label": "Enable Test Mode"
      },
      "dpopay_bearer_token": {
        "type": "char",
        "label": "Token",
        "default": "Token"
      }
    },
    "_inherit": "pos.payment.method"
  }
];
