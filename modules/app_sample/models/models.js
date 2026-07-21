// Odoo 模块: app_sample
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "model.new",
    "_description": "Model New",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "ref": {
        "type": "char",
        "label": "Reference",
        "required": true
      },
      "image": {
        "type": "text",
        "label": "Image"
      },
      "amount": {
        "type": "float",
        "label": "Amount"
      },
      "note": {
        "type": "text",
        "label": "Note"
      },
      "website_description": {
        "type": "html",
        "label": "website_description"
      },
      "date": {
        "type": "datetime",
        "label": "Date"
      },
      "partner_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "partner_count": {
        "type": "integer",
        "label": "#Partner"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "state": {
        "type": "selection",
        "label": "State"
      },
      "w_phone": {
        "type": "char",
        "label": "phone",
        "default": "13925100000"
      },
      "w_email": {
        "type": "char",
        "label": "email",
        "default": "info@example.com"
      },
      "w_image_url": {
        "type": "char",
        "label": "image_url",
        "default": "https://www.odooai.cn/web/image/website/1/logo"
      },
      "w_url": {
        "type": "char",
        "label": "url",
        "default": "https://www.odooai.cn"
      },
      "w_CopyClipboardURL": {
        "type": "char",
        "label": "CopyClipboardURL",
        "default": "https://www.odooai.cn"
      },
      "w_CopyClipboardChar": {
        "type": "char",
        "label": "CopyClipboardChar",
        "default": "https://www.odooai.cn"
      },
      "w_CopyClipboardText": {
        "type": "char",
        "label": "CopyClipboardText",
        "default": "https://www.odooai.cn"
      },
      "date_end": {
        "type": "datetime",
        "label": "Date End"
      },
      "day_max": {
        "type": "integer",
        "label": "Left Days Max"
      },
      "w_gauge": {
        "type": "integer",
        "label": "w_gauge"
      },
      "w_progressbar": {
        "type": "float",
        "label": "progressbar"
      },
      "w_percentpie": {
        "type": "float",
        "label": "percentpie"
      },
      "w_percentage": {
        "type": "float",
        "label": "percentage"
      },
      "w_status_with_color": {
        "type": "selection",
        "label": "status_with_color"
      },
      "w_color_s": {
        "type": "integer",
        "label": "status_with_color Color Index"
      },
      "w_selection_badge": {
        "type": "many2one",
        "label": "res.partner"
      },
      "w_autosave_many2many_tags": {
        "type": "many2many",
        "label": "res.partner"
      },
      "w_date_begin": {
        "type": "char",
        "label": "Widget Date Begin"
      },
      "w_date_end": {
        "type": "char",
        "label": "Widget Date End"
      },
      "w_toggle_button": {
        "type": "boolean",
        "label": "toggle_button"
      },
      "w_res_partner_many2one": {
        "type": "char",
        "label": "Boolean toggle"
      },
      "w_int_time_delta": {
        "type": "integer",
        "label": "time_delta"
      }
    }
  },
  {
    "_name": "producttemplate",
    "_description": "producttemplate",
    "_auto": true,
    "_fields": {
      "short_name": {
        "type": "char",
        "label": "Short Name"
      }
    },
    "_inherit": "product.template"
  }
];
