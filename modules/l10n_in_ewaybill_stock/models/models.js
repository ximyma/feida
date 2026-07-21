// Odoo 模块: l10n_in_ewaybill_stock
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "account.fiscal.position",
    "_description": "account.fiscal.position",
    "_auto": true,
    "_fields": {
      "state": {
        "type": "selection",
        "label": "state"
      },
      "type_description": {
        "type": "char",
        "label": "Description"
      },
      "picking_id": {
        "type": "many2one",
        "label": "stock.picking"
      },
      "move_ids": {
        "type": "one2many",
        "label": "picking_id.move_ids"
      },
      "fiscal_position_id": {
        "type": "many2one",
        "label": "fiscal_position_id"
      }
    },
    "_inherit": "l10n.in.ewaybill"
  },
  {
    "_name": "account.tax",
    "_description": "Stock Move Ewaybill",
    "_auto": true,
    "_fields": {
      "l10n_in_ewaybill_ids": {
        "type": "one2many",
        "label": "picking_id.l10n_in_ewaybill_ids"
      },
      "company_currency_id": {
        "type": "many2one",
        "label": "company_id.currency_id"
      },
      "ewaybill_price_unit": {
        "type": "monetary",
        "label": "ewaybill_price_unit"
      },
      "ewaybill_tax_ids": {
        "type": "many2many",
        "label": "ewaybill_tax_ids"
      }
    },
    "_inherit": "stock.move"
  },
  {
    "_name": "stockpicking",
    "_description": "stockpicking",
    "_auto": true,
    "_fields": {
      "l10n_in_ewaybill_ids": {
        "type": "one2many",
        "label": "l10n.in.ewaybill"
      },
      "l10n_in_ewaybill_name": {
        "type": "char",
        "label": "l10n_in_ewaybill_name"
      },
      "l10n_in_ewaybill_feature_enabled": {
        "type": "boolean",
        "label": "company_id.l10n_in_ewaybill_feature"
      }
    },
    "_inherit": "stock.picking"
  }
];
