// Odoo 模块: l10n_dk_nemhandel_response
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "accountmove",
    "_description": "accountmove",
    "_auto": true,
    "_fields": {
      "nemhandel_move_state": {
        "type": "selection",
        "label": "nemhandel_move_state"
      },
      "nemhandel_response_ids": {
        "type": "one2many",
        "label": "nemhandel.response"
      },
      "nemhandel_can_send_response": {
        "type": "boolean",
        "label": "_compute_nemhandel_can_send_response"
      }
    },
    "_inherit": "account.move"
  },
  {
    "_name": "nemhandel.response",
    "_description": "Business Level Responses for Nemhandel",
    "_auto": true,
    "_fields": {
      "nemhandel_message_uuid": {
        "type": "char",
        "label": "Nemhandel UUID"
      },
      "response_code": {
        "type": "selection",
        "label": "response_code"
      },
      "nemhandel_state": {
        "type": "selection",
        "label": "nemhandel_state"
      },
      "move_id": {
        "type": "many2one",
        "label": "account.move"
      },
      "company_id": {
        "type": "many2one",
        "label": "move_id.company_id"
      }
    }
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "nemhandel_supported_documents": {
        "type": "char",
        "label": "Supported Nemhandel Documents"
      },
      "nemhandel_response_support": {
        "type": "boolean",
        "label": "Nemhandel Response Service"
      }
    },
    "_inherit": "res.partner"
  }
];
