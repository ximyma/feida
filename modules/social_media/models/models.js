// Odoo 模块: social_media
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "social_twitter": {
        "type": "char",
        "label": "X Account"
      },
      "social_facebook": {
        "type": "char",
        "label": "Facebook Account"
      },
      "social_github": {
        "type": "char",
        "label": "GitHub Account"
      },
      "social_linkedin": {
        "type": "char",
        "label": "LinkedIn Account"
      },
      "social_youtube": {
        "type": "char",
        "label": "Youtube Account"
      },
      "social_instagram": {
        "type": "char",
        "label": "Instagram Account"
      },
      "social_tiktok": {
        "type": "char",
        "label": "TikTok Account"
      },
      "social_discord": {
        "type": "char",
        "label": "Discord Account"
      }
    },
    "_inherit": "res.company"
  }
];
