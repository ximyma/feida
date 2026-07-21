// Odoo 模块: app_deepseek
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "airobot",
    "_description": "airobot",
    "_auto": true,
    "_fields": {
      "provider": {
        "type": "selection",
        "label": "deepseek"
      },
      "set_ai_model": {
        "type": "selection",
        "label": "set_ai_model"
      }
    },
    "_inherit": "ai.robot"
  }
];
