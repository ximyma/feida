// Odoo 模块: test_website
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "website",
    "_description": "website",
    "_auto": true,
    "_fields": {
      "name_translated": {
        "type": "char",
        "label": "name_translated"
      }
    },
    "_inherit": "website"
  },
  {
    "_name": "test.model",
    "_description": "Website Model Test",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "submodel_ids": {
        "type": "one2many",
        "label": "test.submodel"
      },
      "website_description": {
        "type": "html",
        "label": "website_description"
      },
      "tag_id": {
        "type": "many2one",
        "label": "test.tag"
      }
    }
  },
  {
    "_name": "test.submodel",
    "_description": "Website Submodel Test",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "test_model_id": {
        "type": "many2one",
        "label": "test.model"
      },
      "tag_id": {
        "type": "many2one",
        "label": "test.tag"
      }
    }
  },
  {
    "_name": "test.tag",
    "_description": "Website Tag Test",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      }
    }
  },
  {
    "_name": "test.model.multi.website",
    "_description": "Multi Website Model Test",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "website_id": {
        "type": "many2one",
        "label": "website"
      }
    }
  },
  {
    "_name": "test.model.exposed",
    "_description": "Website Model Test Exposed",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      }
    }
  }
];
