// Odoo 模块: payment_china
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "paymentmethod",
    "_description": "paymentmethod",
    "_auto": true,
    "_fields": {
      "is_china_payment": {
        "type": "boolean",
        "label": "中国支付方式"
      }
    },
    "_inherit": "payment.method"
  },
  {
    "_name": "paymentprovider",
    "_description": "paymentprovider",
    "_auto": true,
    "_fields": {
      "code": {
        "type": "selection",
        "label": "code"
      },
      "alipay_qr_code_url": {
        "type": "char",
        "label": "支付宝收款二维码URL"
      },
      "alipay_account": {
        "type": "char",
        "label": "支付宝账号"
      },
      "wechat_qr_code_url": {
        "type": "char",
        "label": "微信收款二维码URL"
      },
      "wechat_account": {
        "type": "char",
        "label": "微信账号"
      },
      "china_payment_type": {
        "type": "selection",
        "label": "china_payment_type"
      }
    },
    "_inherit": "payment.provider"
  },
  {
    "_name": "paymenttransaction",
    "_description": "paymenttransaction",
    "_auto": true,
    "_fields": {
      "china_payment_type": {
        "type": "char",
        "label": "中国支付类型"
      },
      "china_qr_code": {
        "type": "char",
        "label": "收款二维码URL"
      },
      "china_account": {
        "type": "char",
        "label": "收款账号"
      }
    },
    "_inherit": "payment.transaction"
  }
];
