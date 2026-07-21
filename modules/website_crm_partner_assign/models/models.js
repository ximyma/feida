// Odoo 模块: website_crm_partner_assign
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "crmlead",
    "_description": "crmlead",
    "_auto": true,
    "_fields": {
      "partner_latitude": {
        "type": "float",
        "label": "Geo Latitude"
      },
      "partner_longitude": {
        "type": "float",
        "label": "Geo Longitude"
      },
      "partner_assigned_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "partner_declined_ids": {
        "type": "many2many",
        "label": "partner_declined_ids"
      },
      "date_partner_assign": {
        "type": "date",
        "label": "date_partner_assign"
      }
    },
    "_inherit": "crm.lead"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "partner_weight": {
        "type": "integer",
        "label": "partner_weight"
      },
      "grade_sequence": {
        "type": "integer",
        "label": "grade_id.sequence"
      },
      "activation": {
        "type": "many2one",
        "label": "res.partner.activation"
      },
      "date_partnership": {
        "type": "date",
        "label": "Partnership Date"
      },
      "date_review": {
        "type": "date",
        "label": "Latest Review"
      },
      "date_review_next": {
        "type": "date",
        "label": "Next Review"
      },
      "assigned_partner_id": {
        "type": "many2one",
        "label": "assigned_partner_id"
      },
      "implemented_partner_ids": {
        "type": "one2many",
        "label": "implemented_partner_ids"
      },
      "implemented_partner_count": {
        "type": "integer",
        "label": "_compute_implemented_partner_count"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "res.partner.activation",
    "_description": "Partner Activation",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "name": {
        "type": "char",
        "label": "Name",
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
    "_name": "res.partner.grade",
    "_description": "res.partner.grade",
    "_auto": true,
    "_fields": {
      "partner_weight": {
        "type": "integer",
        "label": "Level Weight"
      }
    }
  }
];
