// Odoo 模块: base_address_extended
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "res.city",
    "_description": "City",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "zipcode": {
        "type": "char",
        "label": "Zip"
      },
      "country_id": {
        "type": "many2one",
        "label": "res.country",
        "required": true
      },
      "state_id": {
        "type": "many2one",
        "label": "res.country.state"
      }
    }
  },
  {
    "_name": "rescountry",
    "_description": "rescountry",
    "_auto": true,
    "_fields": {
      "enforce_cities": {
        "type": "boolean",
        "label": "enforce_cities"
      }
    },
    "_inherit": "res.country"
  }
];
