// Odoo 模块: auth_oauth
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "auth.oauth.provider",
    "_description": "OAuth2 provider",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Provider name",
        "required": true
      },
      "client_id": {
        "type": "char",
        "label": "Client ID"
      },
      "auth_endpoint": {
        "type": "char",
        "label": "Authorization URL",
        "required": true
      },
      "scope": {
        "type": "char",
        "label": "openid profile email",
        "default": "openid profile email"
      },
      "validation_endpoint": {
        "type": "char",
        "label": "UserInfo URL",
        "required": true
      },
      "data_endpoint": {
        "type": "char",
        "label": "data_endpoint"
      },
      "enabled": {
        "type": "boolean",
        "label": "Allowed"
      },
      "css_class": {
        "type": "char",
        "label": "CSS class",
        "default": "fa fa-fw fa-sign-in text-primary"
      },
      "body": {
        "type": "char",
        "label": "Login button label",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      }
    }
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "oauth_provider_id": {
        "type": "many2one",
        "label": "auth.oauth.provider"
      },
      "oauth_uid": {
        "type": "char",
        "label": "OAuth User ID"
      },
      "oauth_access_token": {
        "type": "char",
        "label": "OAuth Access Token Store"
      },
      "has_oauth_access_token": {
        "type": "boolean",
        "label": "Has OAuth Access Token"
      }
    },
    "_inherit": "res.users"
  }
];
