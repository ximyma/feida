// Odoo 模块: website_event_track_live
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "eventtrack",
    "_description": "eventtrack",
    "_auto": true,
    "_fields": {
      "youtube_video_url": {
        "type": "char",
        "label": "YouTube Video Link"
      },
      "youtube_video_id": {
        "type": "char",
        "label": "YouTube video ID"
      },
      "is_youtube_replay": {
        "type": "boolean",
        "label": "Is YouTube Replay"
      },
      "is_youtube_chat_available": {
        "type": "boolean",
        "label": "Is Chat Available"
      }
    },
    "_inherit": "event.track"
  }
];
