// Odoo 模块: partnership
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "productpricelist",
    "_description": "productpricelist",
    "_auto": true,
    "_fields": {
      "partners_count": {
        "type": "integer",
        "label": "_compute_partners_count"
      },
      "partners_label": {
        "type": "char",
        "label": "company_id.partnership_label"
      }
    },
    "_inherit": "product.pricelist"
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "service_tracking": {
        "type": "selection",
        "label": "service_tracking"
      },
      "grade_id": {
        "type": "many2one",
        "label": "res.partner.grade"
      }
    },
    "_inherit": "product.template"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "partnership_label": {
        "type": "char",
        "label": "partnership_label"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "grade_id": {
        "type": "many2one",
        "label": "res.partner.grade"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "res.partner.grade",
    "_description": "Partner Grade",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "name": {
        "type": "char",
        "label": "Level Name"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "default_pricelist_id": {
        "type": "many2one",
        "label": "product.pricelist"
      },
      "partners_count": {
        "type": "integer",
        "label": "_compute_partners_count"
      },
      "partners_label": {
        "type": "char",
        "label": "company_id.partnership_label"
      }
    }
  },
  {
    "_name": "saleorder",
    "_description": "saleorder",
    "_auto": true,
    "_fields": {
      "assigned_grade_id": {
        "type": "many2one",
        "label": "res.partner.grade"
      }
    },
    "_inherit": "sale.order"
  }
];
