// Odoo 模块: mass_mailing_crm
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mailingmailing",
    "_description": "mailingmailing",
    "_auto": true,
    "_fields": {
      "use_leads": {
        "type": "boolean",
        "label": "Use Leads"
      },
      "crm_lead_count": {
        "type": "integer",
        "label": "Leads/Opportunities Count"
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
        "label": "crm_lead_count"
      }
    },
    "_inherit": "utm.campaign"
  }
];
