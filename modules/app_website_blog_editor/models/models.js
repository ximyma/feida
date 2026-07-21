// Odoo 模块: app_website_blog_editor
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "blogblog",
    "_description": "blogblog",
    "_auto": true,
    "_fields": {
      "seo_name": {
        "type": "char",
        "label": "seo_name"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      }
    },
    "_inherit": "blog.blog"
  },
  {
    "_name": "blogpost",
    "_description": "blogpost",
    "_auto": true,
    "_fields": {
      "blog_id": {
        "type": "many2one",
        "label": "blog.blog"
      }
    },
    "_inherit": "blog.post"
  },
  {
    "_name": "blogtag",
    "_description": "blogtag",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      }
    },
    "_inherit": "blog.tag"
  },
  {
    "_name": "blogtagcategory",
    "_description": "blogtagcategory",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      }
    },
    "_inherit": "blog.tag.category"
  },
  {
    "_name": "websitepage",
    "_description": "websitepage",
    "_auto": true,
    "_fields": {
      "is_force_all": {
        "type": "boolean",
        "label": "Force All Website",
        "default": false
      }
    },
    "_inherit": "website.page"
  }
];
