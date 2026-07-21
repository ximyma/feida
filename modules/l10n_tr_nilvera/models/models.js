// Odoo 模块: l10n_tr_nilvera
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountjournal",
    "_description": "accountjournal",
    "_auto": true,
    "_fields": {
      "l10n_tr_nilvera_api_key": {
        "type": "char",
        "label": "company_id.l10n_tr_nilvera_api_key"
      },
      "is_nilvera_journal": {
        "type": "boolean",
        "label": "Journal used for Nilvera"
      }
    },
    "_inherit": "account.journal"
  },
  {
    "_name": "l10n_tr.nilvera.alias",
    "_description": "Customer Alias on Nilvera",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      }
    }
  },
  {
    "_name": "account.journal",
    "_description": "account.journal",
    "_auto": true,
    "_fields": {
      "l10n_tr_nilvera_api_key": {
        "type": "char",
        "label": "Nilvera API key"
      },
      "l10n_tr_nilvera_use_test_env": {
        "type": "boolean",
        "label": "l10n_tr_nilvera_use_test_env"
      },
      "l10n_tr_nilvera_purchase_journal_id": {
        "type": "many2one",
        "label": "l10n_tr_nilvera_purchase_journal_id"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "res.partner",
    "_description": "res.partner",
    "_auto": true,
    "_fields": {
      "invoice_edi_format": {
        "type": "selection",
        "label": "ubl_tr"
      },
      "l10n_tr_nilvera_customer_status": {
        "type": "selection",
        "label": "l10n_tr_nilvera_customer_status"
      },
      "l10n_tr_nilvera_customer_alias_id": {
        "type": "many2one",
        "label": "l10n_tr_nilvera_customer_alias_id"
      },
      "l10n_tr_nilvera_customer_alias_ids": {
        "type": "one2many",
        "label": "l10n_tr_nilvera_customer_alias_ids"
      }
    }
  }
];
