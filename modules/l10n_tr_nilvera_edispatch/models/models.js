// Odoo 模块: l10n_tr_nilvera_edispatch
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "l10n_tr.nilvera.trailer.plate",
    "_description": "GİB Plate numbers",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "GİB Plate Number"
      },
      "plate_number_type": {
        "type": "selection",
        "label": "plate_number_type"
      }
    }
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_tr_nilvera_edispatch_customs_zip": {
        "type": "char",
        "label": "l10n_tr_nilvera_edispatch_customs_zip"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "res.partner",
    "_description": "res.partner",
    "_auto": true,
    "_fields": {
      "l10n_tr_nilvera_dispatch_type": {
        "type": "selection",
        "label": "l10n_tr_nilvera_dispatch_type"
      },
      "l10n_tr_nilvera_carrier_id": {
        "type": "many2one",
        "label": "l10n_tr_nilvera_carrier_id"
      },
      "l10n_tr_nilvera_buyer_id": {
        "type": "many2one",
        "label": "l10n_tr_nilvera_buyer_id"
      },
      "l10n_tr_nilvera_seller_supplier_id": {
        "type": "many2one",
        "label": "l10n_tr_nilvera_seller_supplier_id"
      },
      "l10n_tr_nilvera_buyer_originator_id": {
        "type": "many2one",
        "label": "l10n_tr_nilvera_buyer_originator_id"
      },
      "l10n_tr_nilvera_delivery_printed_number": {
        "type": "char",
        "label": "Printed Delivery Note Number"
      },
      "l10n_tr_nilvera_delivery_date": {
        "type": "date",
        "label": "Printed Delivery Note Date"
      },
      "l10n_tr_vehicle_plate": {
        "type": "many2one",
        "label": "l10n_tr_vehicle_plate"
      },
      "l10n_tr_nilvera_trailer_plate_ids": {
        "type": "many2many",
        "label": "l10n_tr_nilvera_trailer_plate_ids"
      },
      "l10n_tr_nilvera_driver_ids": {
        "type": "many2many",
        "label": "l10n_tr_nilvera_driver_ids"
      },
      "l10n_tr_nilvera_delivery_notes": {
        "type": "char",
        "label": "Delivery Notes"
      },
      "l10n_tr_nilvera_dispatch_state": {
        "type": "selection",
        "label": "l10n_tr_nilvera_dispatch_state"
      },
      "l10n_tr_nilvera_edispatch_warnings": {
        "type": "char",
        "label": "_compute_edispatch_warnings"
      }
    },
    "_inherit": "stock.picking"
  }
];
