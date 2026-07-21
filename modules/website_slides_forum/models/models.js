// Odoo 模块: website_slides_forum
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "forumforum",
    "_description": "forumforum",
    "_auto": true,
    "_fields": {
      "slide_channel_ids": {
        "type": "one2many",
        "label": "slide.channel"
      },
      "slide_channel_id": {
        "type": "many2one",
        "label": "slide.channel"
      },
      "visibility": {
        "type": "selection",
        "label": "slide_channel_id.visibility"
      },
      "image_1920": {
        "type": "text",
        "label": "Image"
      }
    },
    "_inherit": "forum.forum"
  },
  {
    "_name": "slidechannel",
    "_description": "slidechannel",
    "_auto": true,
    "_fields": {
      "forum_id": {
        "type": "many2one",
        "label": "forum.forum"
      },
      "forum_total_posts": {
        "type": "integer",
        "label": "Number of active forum posts"
      }
    },
    "_inherit": "slide.channel"
  }
];
