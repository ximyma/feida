// Odoo 模块: l10n_ro_edi_stock_batch
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "stock.picking.batch",
    "_description": "stock.picking.batch",
    "_auto": true,
    "_fields": {
      "batch_id": {
        "type": "many2one",
        "label": "stock.picking.batch"
      }
    },
    "_inherit": "l10n_ro_edi.document"
  },
  {
    "_name": "l10n_ro_edi.document",
    "_description": "l10n_ro_edi.document",
    "_auto": true,
    "_fields": {
      "l10n_ro_edi_stock_document_ids": {
        "type": "one2many",
        "label": "l10n_ro_edi.document"
      },
      "l10n_ro_edi_stock_document_uit": {
        "type": "char",
        "label": "_compute_l10n_ro_edi_stock_current_document_uit"
      },
      "l10n_ro_edi_stock_state": {
        "type": "selection",
        "label": "l10n_ro_edi_stock_state"
      },
      "l10n_ro_edi_stock_operation_type": {
        "type": "selection",
        "label": "eTransport Operation Type"
      },
      "l10n_ro_edi_stock_available_operation_scopes": {
        "type": "char",
        "label": "_compute_l10n_ro_edi_stock_available_operation_scopes"
      },
      "l10n_ro_edi_stock_operation_scope": {
        "type": "selection",
        "label": "Operation Scope"
      },
      "l10n_ro_edi_stock_vehicle_number": {
        "type": "char",
        "label": "Vehicle Number"
      },
      "l10n_ro_edi_stock_trailer_1_number": {
        "type": "char",
        "label": "Trailer 1 Number"
      },
      "l10n_ro_edi_stock_trailer_2_number": {
        "type": "char",
        "label": "Trailer 2 Number"
      },
      "l10n_ro_edi_stock_available_start_loc_types": {
        "type": "char",
        "label": "_compute_l10n_ro_edi_stock_available_location_types"
      },
      "l10n_ro_edi_stock_start_loc_type": {
        "type": "selection",
        "label": "l10n_ro_edi_stock_start_loc_type"
      },
      "l10n_ro_edi_stock_available_end_loc_types": {
        "type": "char",
        "label": "_compute_l10n_ro_edi_stock_available_location_types"
      },
      "l10n_ro_edi_stock_end_loc_type": {
        "type": "selection",
        "label": "l10n_ro_edi_stock_end_loc_type"
      },
      "l10n_ro_edi_stock_start_bcp": {
        "type": "selection",
        "label": "Start Border Crossing Point"
      },
      "l10n_ro_edi_stock_start_customs_office": {
        "type": "selection",
        "label": "Start Customs Office"
      },
      "l10n_ro_edi_stock_end_bcp": {
        "type": "selection",
        "label": "End Border Crossing Point"
      },
      "l10n_ro_edi_stock_end_customs_office": {
        "type": "selection",
        "label": "End Customs Office"
      },
      "l10n_ro_edi_stock_remarks": {
        "type": "text",
        "label": "Remarks"
      },
      "l10n_ro_edi_stock_enable": {
        "type": "boolean",
        "label": "_compute_l10n_ro_edi_stock_enable"
      },
      "l10n_ro_edi_stock_enable_send": {
        "type": "boolean",
        "label": "_compute_l10n_ro_edi_stock_enable_send"
      },
      "l10n_ro_edi_stock_enable_fetch": {
        "type": "boolean",
        "label": "_compute_l10n_ro_edi_stock_enable_fetch"
      },
      "l10n_ro_edi_stock_enable_amend": {
        "type": "boolean",
        "label": "_compute_l10n_ro_edi_stock_enable_amend"
      },
      "l10n_ro_edi_stock_fields_readonly": {
        "type": "boolean",
        "label": "_compute_l10n_ro_edi_stock_fields_readonly"
      }
    },
    "_inherit": "stock.picking.batch"
  }
];
