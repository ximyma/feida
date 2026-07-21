// Odoo 模块: l10n_id
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "l10n_id_qris_transaction_ids": {
        "type": "many2many",
        "label": "l10n_id.qris.transaction"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "l10n_id.qris.transaction",
    "_description": "Record of QRIS transactions",
    "_auto": true,
    "_fields": {
      "model": {
        "type": "char",
        "label": "Model"
      },
      "model_id": {
        "type": "char",
        "label": "Model ID"
      },
      "qris_invoice_id": {
        "type": "char",
        "label": "qris_invoice_id"
      },
      "qris_amount": {
        "type": "integer",
        "label": "qris_amount"
      },
      "qris_content": {
        "type": "char",
        "label": "qris_content"
      },
      "qris_creation_datetime": {
        "type": "datetime",
        "label": "qris_creation_datetime"
      },
      "bank_id": {
        "type": "many2one",
        "label": "res.partner.bank"
      },
      "paid": {
        "type": "boolean",
        "label": "Payment Status of QRIS"
      }
    }
  },
  {
    "_name": "respartnerbank",
    "_description": "respartnerbank",
    "_auto": true,
    "_fields": {
      "l10n_id_qris_api_key": {
        "type": "char",
        "label": "QRIS API Key"
      },
      "l10n_id_qris_mid": {
        "type": "char",
        "label": "QRIS Merchant ID"
      }
    },
    "_inherit": "res.partner.bank"
  }
];
