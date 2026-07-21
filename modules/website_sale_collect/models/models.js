// Odoo 模块: website_sale_collect
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "stock.warehouse",
    "_description": "stock.warehouse",
    "_auto": true,
    "_fields": {
      "delivery_type": {
        "type": "selection",
        "label": "delivery_type"
      },
      "warehouse_ids": {
        "type": "many2many",
        "label": "Stores"
      }
    },
    "_inherit": "delivery.carrier"
  },
  {
    "_name": "paymentprovider",
    "_description": "paymentprovider",
    "_auto": true,
    "_fields": {
      "custom_mode": {
        "type": "selection",
        "label": "on_site"
      }
    },
    "_inherit": "payment.provider"
  },
  {
    "_name": "resource.calendar",
    "_description": "resource.calendar",
    "_auto": true,
    "_fields": {
      "opening_hours": {
        "type": "many2one",
        "label": "opening_hours"
      }
    },
    "_inherit": "stock.warehouse"
  },
  {
    "_name": "delivery.carrier",
    "_description": "delivery.carrier",
    "_auto": true,
    "_fields": {
      "in_store_dm_id": {
        "type": "many2one",
        "label": "in_store_dm_id"
      }
    },
    "_inherit": "website"
  }
];
