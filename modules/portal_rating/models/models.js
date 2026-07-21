// Odoo 模块: portal_rating
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "ratingrating",
    "_description": "ratingrating",
    "_auto": true,
    "_fields": {
      "publisher_comment": {
        "type": "text",
        "label": "Publisher comment"
      },
      "publisher_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "publisher_datetime": {
        "type": "datetime",
        "label": "Commented on"
      }
    },
    "_inherit": "rating.rating"
  }
];
