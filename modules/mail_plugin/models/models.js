// Odoo 模块: mail_plugin
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "iap_enrich_info": {
        "type": "text",
        "label": "IAP Enrich Info"
      },
      "iap_search_domain": {
        "type": "char",
        "label": "Search Domain / Email"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "res.partner.iap",
    "_description": "Partner IAP",
    "_auto": true,
    "_fields": {
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "iap_search_domain": {
        "type": "char",
        "label": "Search Domain / Email"
      },
      "iap_enrich_info": {
        "type": "text",
        "label": "IAP Enrich Info"
      }
    }
  }
];
