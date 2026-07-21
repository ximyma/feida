// Auto-generated from Odoo model: ir.attachment
// Description: Attachment

exports.model = {
  "_name": "ir_attachment",
  "_description": "Attachment",
  "_fields": {
    "name": {
      "type": "char",
      "label": "Name",
      "required": true
    },
    "description": {
      "type": "text",
      "label": "Description"
    },
    "res_name": {
      "type": "char",
      "label": "Resource Name"
    },
    "res_model": {
      "type": "char",
      "label": "Resource Model"
    },
    "res_field": {
      "type": "char",
      "label": "Resource Field"
    },
    "company_id": {
      "type": "many2one",
      "label": "res.company",
      "default": true,
      "relation": "res_company"
    },
    "type": {
      "type": "selection",
      "label": "url"
    },
    "url": {
      "type": "char",
      "label": "Url"
    },
    "public": {
      "type": "boolean",
      "label": "Is public document"
    },
    "access_token": {
      "type": "char",
      "label": "Access Token"
    },
    "raw": {
      "type": "text"
    },
    "datas": {
      "type": "text"
    },
    "db_datas": {
      "type": "text",
      "label": "Database Data"
    },
    "store_fname": {
      "type": "char",
      "label": "Stored Filename",
      "index": true
    },
    "file_size": {
      "type": "integer",
      "label": "File Size"
    },
    "checksum": {
      "type": "char",
      "label": "Checksum/SHA1"
    },
    "mimetype": {
      "type": "char",
      "label": "Mime Type"
    },
    "index_content": {
      "type": "text",
      "label": "Indexed Content"
    }
  }
};
