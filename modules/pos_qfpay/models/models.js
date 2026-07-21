// Odoo 模块: pos_qfpay
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "pospaymentmethod",
    "_description": "pospaymentmethod",
    "_auto": true,
    "_fields": {
      "qfpay_terminal_ip_address": {
        "type": "char",
        "label": "QFPay Terminal IP Address"
      },
      "qfpay_pos_key": {
        "type": "char",
        "label": "QFPay POS Key"
      },
      "qfpay_notification_key": {
        "type": "char",
        "label": "QFPay Notification Key"
      },
      "qfpay_latest_response": {
        "type": "char",
        "label": "point_of_sale.group_pos_manager"
      },
      "qfpay_payment_type": {
        "type": "selection",
        "label": "qfpay_payment_type"
      }
    },
    "_inherit": "pos.payment.method"
  }
];
