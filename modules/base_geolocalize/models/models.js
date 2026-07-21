// Odoo 模块: base_geolocalize
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "base.geo_provider",
    "_description": "Geo Provider",
    "_auto": true,
    "_fields": {
      "tech_name": {
        "type": "char",
        "label": "Technical Name"
      },
      "name": {
        "type": "char",
        "label": "name"
      }
    }
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "date_localization": {
        "type": "date",
        "label": "Geolocation Date"
      }
    },
    "_inherit": "res.partner"
  }
];
