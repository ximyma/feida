// Odoo 模块: auth_ldap
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "ldaps": {
        "type": "one2many",
        "label": "res.company.ldap"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "res.company.ldap",
    "_description": "Company LDAP configuration",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "company": {
        "type": "many2one",
        "label": "res.company",
        "required": true
      },
      "ldap_server": {
        "type": "char",
        "label": "LDAP Server address",
        "required": true,
        "default": "127.0.0.1"
      },
      "ldap_server_port": {
        "type": "integer",
        "label": "LDAP Server port",
        "required": true
      },
      "ldap_binddn": {
        "type": "char",
        "label": "LDAP binddn"
      },
      "ldap_password": {
        "type": "char",
        "label": "LDAP password"
      },
      "ldap_filter": {
        "type": "char",
        "label": "LDAP filter",
        "required": true
      },
      "ldap_base": {
        "type": "char",
        "label": "LDAP base",
        "required": true
      },
      "user": {
        "type": "many2one",
        "label": "res.users"
      },
      "create_user": {
        "type": "boolean",
        "label": "create_user",
        "default": true
      },
      "ldap_tls": {
        "type": "boolean",
        "label": "Use TLS"
      }
    }
  }
];
