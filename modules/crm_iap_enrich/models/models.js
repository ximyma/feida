// Odoo 模块: crm_iap_enrich
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "reveal",
    "_description": "reveal",
    "_auto": true,
    "_fields": {
      "iap_enrich_done": {
        "type": "boolean",
        "label": "Enrichment done"
      },
      "show_enrich_button": {
        "type": "boolean",
        "label": "Allow manual enrich"
      }
    },
    "_inherit": "crm.lead"
  }
];
