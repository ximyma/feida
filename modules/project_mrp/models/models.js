// Odoo 模块: project_mrp
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mrpbom",
    "_description": "mrpbom",
    "_auto": true,
    "_fields": {
      "project_id": {
        "type": "many2one",
        "label": "project.project"
      }
    },
    "_inherit": "mrp.bom"
  },
  {
    "_name": "mrpproduction",
    "_description": "mrpproduction",
    "_auto": true,
    "_fields": {
      "project_id": {
        "type": "many2one",
        "label": "project.project"
      }
    },
    "_inherit": "mrp.production"
  },
  {
    "_name": "projectproject",
    "_description": "projectproject",
    "_auto": true,
    "_fields": {
      "bom_count": {
        "type": "integer",
        "label": "_compute_bom_count"
      },
      "production_count": {
        "type": "integer",
        "label": "_compute_production_count"
      }
    },
    "_inherit": "project.project"
  }
];
