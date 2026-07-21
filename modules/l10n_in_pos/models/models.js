// Odoo 模块: l10n_in_pos
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "posorderline",
    "_description": "posorderline",
    "_auto": true,
    "_fields": {
      "l10n_in_hsn_code": {
        "type": "char",
        "label": "HSN/SAC Code"
      }
    },
    "_inherit": "pos.order.line"
  },
  {
    "_name": "productproduct",
    "_description": "productproduct",
    "_auto": true,
    "_fields": {
      "l10n_in_hsn_missing_in_pos": {
        "type": "boolean",
        "label": "l10n_in_hsn_missing_in_pos"
      }
    },
    "_inherit": "product.product"
  }
];
