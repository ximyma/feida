// Odoo 模块: mass_mailing_sale
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mailingmailing",
    "_description": "mailingmailing",
    "_auto": true,
    "_fields": {
      "sale_quotation_count": {
        "type": "integer",
        "label": "Quotation Count"
      },
      "sale_invoiced_amount": {
        "type": "integer",
        "label": "Invoiced Amount"
      }
    },
    "_inherit": "mailing.mailing"
  },
  {
    "_name": "utmcampaign",
    "_description": "utmcampaign",
    "_auto": true,
    "_fields": {
      "ab_testing_winner_selection": {
        "type": "selection",
        "label": "ab_testing_winner_selection"
      }
    },
    "_inherit": "utm.campaign"
  }
];
