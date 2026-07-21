// Odoo 模块: l10n_it_stock_ddt
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_it_ddt_ids": {
        "type": "many2many",
        "label": "stock.picking"
      },
      "l10n_it_ddt_count": {
        "type": "integer",
        "label": "_compute_ddt_ids"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "l10n_it_transport_reason": {
        "type": "selection",
        "label": "sale"
      },
      "l10n_it_transport_method": {
        "type": "selection",
        "label": "sender"
      },
      "l10n_it_transport_method_details": {
        "type": "char",
        "label": "Transport Note"
      },
      "l10n_it_parcels": {
        "type": "integer",
        "label": "Parcels"
      },
      "l10n_it_ddt_number": {
        "type": "char",
        "label": "DDT Number"
      },
      "l10n_it_show_print_ddt_button": {
        "type": "boolean",
        "label": "_compute_l10n_it_show_print_ddt_button"
      }
    },
    "_inherit": "stock.picking"
  },
  {
    "_name": "stockpickingtype",
    "_description": "stockpickingtype",
    "_auto": true,
    "_fields": {
      "l10n_it_ddt_sequence_id": {
        "type": "many2one",
        "label": "ir.sequence"
      }
    },
    "_inherit": "stock.picking.type"
  }
];
