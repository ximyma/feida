// Odoo 模块: shoe_garment
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "product.brand",
    "_description": "品牌",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      }
    }
  },
  {
    "_name": "product.season",
    "_description": "季节",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "code": {
        "type": "char",
        "label": "code"
      }
    }
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "style_code": {
        "type": "char",
        "label": "款号"
      },
      "season_id": {
        "type": "many2one",
        "label": "product.season"
      },
      "brand_id": {
        "type": "many2one",
        "label": "product.brand"
      }
    },
    "_inherit": "product.template"
  }
];
