// Odoo 模块: delivery_mondialrelay
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "deliverycarrier",
    "_description": "deliverycarrier",
    "_auto": true,
    "_fields": {
      "is_mondialrelay": {
        "type": "boolean",
        "label": "_compute_is_mondialrelay"
      },
      "mondialrelay_brand": {
        "type": "char",
        "label": "Brand Code",
        "default": "BDTEST  "
      },
      "mondialrelay_packagetype": {
        "type": "char",
        "label": "24R",
        "default": "24R"
      }
    },
    "_inherit": "delivery.carrier"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "is_mondialrelay": {
        "type": "boolean",
        "label": "_compute_is_mondialrelay"
      }
    },
    "_inherit": "res.partner"
  }
];
