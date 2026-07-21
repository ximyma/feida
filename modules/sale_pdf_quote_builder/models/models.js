// Odoo 模块: sale_pdf_quote_builder
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "sale.pdf.form.field",
    "_description": "sale.pdf.form.field",
    "_auto": true,
    "_fields": {
      "attached_on_sale": {
        "type": "selection",
        "label": "attached_on_sale"
      },
      "form_field_ids": {
        "type": "many2many",
        "label": "form_field_ids"
      }
    },
    "_inherit": "product.document"
  },
  {
    "_name": "quotation.document",
    "_description": "Quotation",
    "_auto": true,
    "_fields": {
      "ir_attachment_id": {
        "type": "many2one",
        "label": "ir_attachment_id"
      },
      "document_type": {
        "type": "selection",
        "label": "document_type"
      },
      "active": {
        "type": "boolean",
        "label": "active"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "quotation_template_ids": {
        "type": "many2many",
        "label": "quotation_template_ids"
      },
      "form_field_ids": {
        "type": "many2many",
        "label": "form_field_ids"
      },
      "add_by_default": {
        "type": "boolean",
        "label": "add_by_default"
      }
    }
  },
  {
    "_name": "product.document",
    "_description": "product.document",
    "_auto": true,
    "_fields": {
      "available_product_document_ids": {
        "type": "many2many",
        "label": "available_product_document_ids"
      },
      "product_document_ids": {
        "type": "many2many",
        "label": "product_document_ids"
      }
    },
    "_inherit": "sale.order.line"
  }
];
