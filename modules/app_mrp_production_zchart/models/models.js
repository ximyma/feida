// Odoo 模块: app_mrp_production_zchart
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "parent_id",
    "_description": "parent_id",
    "_auto": true,
    "_fields": {
      "parent_id": {
        "type": "many2one",
        "label": "mrp.production"
      },
      "child_ids": {
        "type": "one2many",
        "label": "mrp.production"
      },
      "child_all_count": {
        "type": "integer",
        "label": "Indirect Surbordinates Count"
      },
      "image_128": {
        "type": "text",
        "label": "product_id.image_128"
      },
      "product_name": {
        "type": "char",
        "label": "product_id.name"
      },
      "parent_path": {
        "type": "char",
        "label": "parent_path"
      }
    },
    "_inherit": "mrp.production"
  }
];
