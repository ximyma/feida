// Auto-generated from Odoo model: ir.actions.act_url
// Description: Action URL

exports.model = {
  "_name": "ir_actions_act_url",
  "_description": "Action URL",
  "_fields": {
    "type": {
      "type": "char",
      "label": "ir.actions.act_url",
      "default": "ir.actions.act_url"
    },
    "url": {
      "type": "text",
      "label": "Action URL",
      "required": true
    },
    "target": {
      "type": "selection",
      "label": "new"
    }
  }
};
