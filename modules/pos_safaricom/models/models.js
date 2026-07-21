// Odoo 模块: pos_safaricom
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "consumer_key": {
        "type": "char",
        "label": "Consumer Key"
      },
      "consumer_secret": {
        "type": "char",
        "label": "Consumer Secret"
      },
      "business_short_code": {
        "type": "char",
        "label": "Business Short Code"
      },
      "passkey": {
        "type": "char",
        "label": "Passkey"
      },
      "safaricom_test_mode": {
        "type": "boolean",
        "label": "Test Mode",
        "default": true
      },
      "safaricom_payment_type": {
        "type": "selection",
        "label": "safaricom_payment_type"
      }
    },
    "_inherit": "pos.payment.method"
  },
  {
    "_name": "transaction.lipa.na.mpesa",
    "_description": "Transaction Lipa na M-PESA",
    "_auto": true,
    "_fields": {
      "trans_id": {
        "type": "char",
        "label": "Transaction ID"
      },
      "name": {
        "type": "char",
        "label": "Name"
      },
      "amount": {
        "type": "integer",
        "label": "Amount"
      },
      "number": {
        "type": "char",
        "label": "Number"
      },
      "received_at": {
        "type": "datetime",
        "label": "Received At"
      }
    }
  }
];
