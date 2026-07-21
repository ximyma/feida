// Odoo 模块: product_email_template
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "email_template_id": {
        "type": "many2one",
        "label": "mail.template"
      }
    },
    "_inherit": "product.template"
  }
];
