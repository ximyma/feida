// Odoo 模块: app_account_ztree
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "parent_id",
    "_description": "parent_id",
    "_auto": true,
    "_fields": {
      "parent_id": {
        "type": "many2one",
        "label": "account.account"
      },
      "child_ids": {
        "type": "one2many",
        "label": "account.account"
      },
      "parent_path": {
        "type": "char",
        "label": "parent_path"
      }
    }
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "coa_delimiter": {
        "type": "char",
        "label": "COA Delimiter",
        "default": "."
      }
    }
  }
];
