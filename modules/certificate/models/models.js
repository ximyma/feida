// Odoo 模块: certificate
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "certificate.certificate",
    "_description": "Certificate",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "content": {
        "type": "text",
        "label": "Certificate",
        "required": true
      },
      "pkcs12_password": {
        "type": "char",
        "label": "Certificate Password"
      },
      "private_key_id": {
        "type": "many2one",
        "label": "private_key_id"
      },
      "public_key_id": {
        "type": "many2one",
        "label": "public_key_id"
      },
      "scope": {
        "type": "selection",
        "label": "scope"
      },
      "content_format": {
        "type": "selection",
        "label": "content_format"
      },
      "pem_certificate": {
        "type": "text",
        "label": "pem_certificate"
      },
      "subject_common_name": {
        "type": "char",
        "label": "subject_common_name"
      },
      "serial_number": {
        "type": "char",
        "label": "serial_number"
      },
      "date_start": {
        "type": "datetime",
        "label": "date_start"
      },
      "date_end": {
        "type": "datetime",
        "label": "date_end"
      },
      "loading_error": {
        "type": "text",
        "label": "Loading error"
      },
      "is_valid": {
        "type": "boolean",
        "label": "Valid"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "country_code": {
        "type": "char",
        "label": "company_id.country_code"
      }
    }
  },
  {
    "_name": "certificate.key",
    "_description": "Cryptographic Keys",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "default": "New key"
      },
      "content": {
        "type": "text",
        "label": "Key file",
        "required": true
      },
      "password": {
        "type": "char",
        "label": "Private key password"
      },
      "pem_key": {
        "type": "text",
        "label": "pem_key"
      },
      "public": {
        "type": "boolean",
        "label": "public"
      },
      "loading_error": {
        "type": "text",
        "label": "loading_error"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      }
    }
  }
];
