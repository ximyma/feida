// Odoo 模块: l10n_it_edi_doi
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "l10n_it_edi_doi.declaration_of_intent",
    "_description": "l10n_it_edi_doi.declaration_of_intent",
    "_auto": true,
    "_fields": {
      "l10n_it_edi_doi_date": {
        "type": "date",
        "label": "l10n_it_edi_doi_date"
      },
      "l10n_it_edi_doi_use": {
        "type": "boolean",
        "label": "l10n_it_edi_doi_use"
      },
      "l10n_it_edi_doi_id": {
        "type": "many2one",
        "label": "l10n_it_edi_doi_id"
      },
      "l10n_it_edi_doi_amount": {
        "type": "monetary",
        "label": "l10n_it_edi_doi_amount"
      },
      "l10n_it_edi_doi_warning": {
        "type": "text",
        "label": "l10n_it_edi_doi_warning"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "account.tax",
    "_description": "account.tax",
    "_auto": true,
    "_fields": {
      "l10n_it_edi_doi_tax_id": {
        "type": "many2one",
        "label": "l10n_it_edi_doi_tax_id"
      },
      "l10n_it_edi_doi_fiscal_position_id": {
        "type": "many2one",
        "label": "l10n_it_edi_doi_fiscal_position_id"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "l10n_it_edi_doi_ids": {
        "type": "one2many",
        "label": "l10n_it_edi_doi_ids"
      }
    },
    "_inherit": "res.partner"
  }
];
