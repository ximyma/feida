// Odoo 模块: l10n_fr_pos_cert
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "account.sale.closing",
    "_description": "Sale Closing",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Frequency and unique sequence number",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "date_closing_stop": {
        "type": "datetime",
        "label": "Closing Date",
        "required": true
      },
      "date_closing_start": {
        "type": "datetime",
        "label": "Starting Date",
        "required": true
      },
      "frequency": {
        "type": "selection",
        "label": "Closing Type",
        "required": true
      },
      "total_interval": {
        "type": "monetary",
        "label": "Period Total",
        "required": true
      },
      "cumulative_total": {
        "type": "monetary",
        "label": "Cumulative Grand Total",
        "required": true
      },
      "sequence_number": {
        "type": "integer",
        "label": "Sequence #",
        "required": true
      },
      "last_order_id": {
        "type": "many2one",
        "label": "pos.order"
      },
      "last_order_hash": {
        "type": "char",
        "label": "Last Order entry\\"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      }
    }
  },
  {
    "_name": "posorder",
    "_description": "posorder",
    "_auto": true,
    "_fields": {
      "l10n_fr_hash": {
        "type": "char",
        "label": "Inalteralbility Hash"
      },
      "l10n_fr_secure_sequence_number": {
        "type": "integer",
        "label": "Inalteralbility No Gap Sequence #"
      },
      "l10n_fr_string_to_hash": {
        "type": "char",
        "label": "_compute_string_to_hash"
      },
      "previous_order_id": {
        "type": "many2one",
        "label": "pos.order"
      },
      "pos_version": {
        "type": "char",
        "label": "Version of Odoo that created the order"
      }
    },
    "_inherit": "pos.order"
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "l10n_fr_pos_cert_sequence_id": {
        "type": "many2one",
        "label": "ir.sequence"
      }
    },
    "_inherit": "res.company"
  }
];
