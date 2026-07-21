// Odoo 模块: purchase_requisition
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "productsupplierinfo",
    "_description": "productsupplierinfo",
    "_auto": true,
    "_fields": {
      "purchase_requisition_id": {
        "type": "many2one",
        "label": "purchase.requisition"
      },
      "purchase_requisition_line_id": {
        "type": "many2one",
        "label": "purchase.requisition.line"
      }
    },
    "_inherit": "product.supplierinfo"
  },
  {
    "_name": "purchase.order.group",
    "_description": "Technical model to group PO for call to tenders",
    "_auto": true,
    "_fields": {
      "order_ids": {
        "type": "one2many",
        "label": "purchase.order"
      }
    }
  },
  {
    "_name": "purchaseorder",
    "_description": "purchaseorder",
    "_auto": true,
    "_fields": {
      "requisition_id": {
        "type": "many2one",
        "label": "purchase.requisition"
      },
      "requisition_type": {
        "type": "selection",
        "label": "requisition_id.requisition_type"
      },
      "purchase_group_id": {
        "type": "many2one",
        "label": "purchase.order.group"
      },
      "alternative_po_ids": {
        "type": "one2many",
        "label": "alternative_po_ids"
      }
    },
    "_inherit": "purchase.order"
  },
  {
    "_name": "purchaseorderline",
    "_description": "purchaseorderline",
    "_auto": true,
    "_fields": {
      "price_total_cc": {
        "type": "monetary",
        "label": "_compute_price_total_cc"
      },
      "company_currency_id": {
        "type": "many2one",
        "label": "company_id.currency_id"
      }
    },
    "_inherit": "purchase.order.line"
  },
  {
    "_name": "purchase.requisition",
    "_description": "Purchase Requisition",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "reference": {
        "type": "char",
        "label": "Reference"
      },
      "order_count": {
        "type": "integer",
        "label": "_compute_orders_number"
      },
      "vendor_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "requisition_type": {
        "type": "selection",
        "label": "requisition_type"
      },
      "date_start": {
        "type": "date",
        "label": "Start Date"
      },
      "date_end": {
        "type": "date",
        "label": "End Date"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "description": {
        "type": "html",
        "label": "description"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "purchase_ids": {
        "type": "one2many",
        "label": "purchase.order"
      },
      "line_ids": {
        "type": "one2many",
        "label": "purchase.requisition.line"
      },
      "product_id": {
        "type": "many2one",
        "label": "product.product"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "currency_id": {
        "type": "many2one",
        "label": "currency_id"
      }
    }
  },
  {
    "_name": "purchase.requisition.line",
    "_description": "Purchase Requisition Line",
    "_auto": true,
    "_fields": {
      "product_id": {
        "type": "many2one",
        "label": "product.product",
        "required": true
      },
      "product_uom_id": {
        "type": "many2one",
        "label": "product_uom_id"
      },
      "product_qty": {
        "type": "float",
        "label": "Quantity"
      },
      "product_description_variants": {
        "type": "char",
        "label": "Description"
      },
      "price_unit": {
        "type": "float",
        "label": "price_unit"
      },
      "qty_ordered": {
        "type": "float",
        "label": "_compute_ordered_qty"
      },
      "requisition_id": {
        "type": "many2one",
        "label": "purchase.requisition",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "supplier_info_ids": {
        "type": "one2many",
        "label": "product.supplierinfo"
      }
    }
  }
];
