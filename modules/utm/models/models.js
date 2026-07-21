// Odoo 模块: utm
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "utm.campaign",
    "_description": "UTM Campaign",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "name": {
        "type": "char",
        "label": "Campaign Identifier",
        "required": true
      },
      "title": {
        "type": "char",
        "label": "Campaign Name",
        "required": true
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "stage_id": {
        "type": "many2one",
        "label": "stage_id"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "tag_ids"
      },
      "is_auto_campaign": {
        "type": "boolean",
        "label": "Automatically Generated Campaign",
        "default": false
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      }
    }
  },
  {
    "_name": "utm.medium",
    "_description": "UTM Medium",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Medium Name",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      }
    }
  },
  {
    "_name": "utm.source",
    "_description": "UTM Source",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Source Name",
        "required": true
      }
    }
  },
  {
    "_name": "utm.stage",
    "_description": "Campaign Stage",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      }
    }
  },
  {
    "_name": "utm.tag",
    "_description": "UTM Tag",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "color"
      }
    }
  }
];
