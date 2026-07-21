// Odoo 模块: website_blog
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "blog.blog",
    "_description": "Blog",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "name": {
        "type": "char",
        "label": "Blog Name",
        "required": true
      },
      "subtitle": {
        "type": "char",
        "label": "Blog Subtitle"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "content": {
        "type": "html",
        "label": "Content"
      },
      "blog_post_ids": {
        "type": "one2many",
        "label": "blog.post"
      },
      "blog_post_count": {
        "type": "integer",
        "label": "Posts"
      }
    }
  },
  {
    "_name": "blog.tag.category",
    "_description": "Blog Tag Category",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "tag_ids": {
        "type": "one2many",
        "label": "blog.tag"
      }
    }
  },
  {
    "_name": "blog.tag",
    "_description": "Blog Tag",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "category_id": {
        "type": "many2one",
        "label": "blog.tag.category"
      },
      "color": {
        "type": "integer",
        "label": "Color"
      },
      "post_ids": {
        "type": "many2many",
        "label": "blog.post"
      }
    }
  },
  {
    "_name": "blog.post",
    "_description": "Blog Post",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Title",
        "required": true,
        "default": ""
      },
      "subtitle": {
        "type": "char",
        "label": "Sub Title"
      },
      "author_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "author_avatar": {
        "type": "text",
        "label": "author_id.image_128"
      },
      "author_name": {
        "type": "char",
        "label": "author_id.display_name"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "blog_id": {
        "type": "many2one",
        "label": "blog.blog",
        "required": true
      },
      "tag_ids": {
        "type": "many2many",
        "label": "blog.tag"
      },
      "content": {
        "type": "html",
        "label": "Content"
      },
      "teaser": {
        "type": "text",
        "label": "Teaser"
      },
      "teaser_manual": {
        "type": "text",
        "label": "Teaser Content"
      },
      "website_message_ids": {
        "type": "one2many",
        "label": "model"
      },
      "create_date": {
        "type": "datetime",
        "label": "Created on"
      },
      "published_date": {
        "type": "datetime",
        "label": "Published Date"
      },
      "post_date": {
        "type": "datetime",
        "label": "Publishing date"
      },
      "create_uid": {
        "type": "many2one",
        "label": "res.users"
      },
      "write_date": {
        "type": "datetime",
        "label": "Last Updated on"
      },
      "write_uid": {
        "type": "many2one",
        "label": "res.users"
      },
      "visits": {
        "type": "integer",
        "label": "No of Views"
      },
      "website_id": {
        "type": "many2one",
        "label": "blog_id.website_id"
      }
    }
  }
];
