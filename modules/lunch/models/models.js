// Odoo 模块: lunch
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "lunch.alert",
    "_description": "Lunch Alert",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Alert Name",
        "required": true
      },
      "message": {
        "type": "html",
        "label": "Message",
        "required": true
      },
      "mode": {
        "type": "selection",
        "label": "mode"
      },
      "recipients": {
        "type": "selection",
        "label": "recipients"
      },
      "notification_time": {
        "type": "float",
        "label": "Notification Time"
      },
      "notification_moment": {
        "type": "selection",
        "label": "notification_moment"
      },
      "tz": {
        "type": "selection",
        "label": "Timezone",
        "required": true
      },
      "cron_id": {
        "type": "many2one",
        "label": "ir.cron",
        "required": true
      },
      "until": {
        "type": "date",
        "label": "Show Until"
      },
      "mon": {
        "type": "boolean",
        "label": "mon",
        "default": true
      },
      "tue": {
        "type": "boolean",
        "label": "tue",
        "default": true
      },
      "wed": {
        "type": "boolean",
        "label": "wed",
        "default": true
      },
      "thu": {
        "type": "boolean",
        "label": "thu",
        "default": true
      },
      "fri": {
        "type": "boolean",
        "label": "fri",
        "default": true
      },
      "sat": {
        "type": "boolean",
        "label": "sat",
        "default": true
      },
      "sun": {
        "type": "boolean",
        "label": "sun",
        "default": true
      },
      "available_today": {
        "type": "boolean",
        "label": "Is Displayed Today"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "location_ids": {
        "type": "many2many",
        "label": "lunch.location"
      }
    }
  },
  {
    "_name": "lunch.cashmove",
    "_description": "Lunch Cashmove",
    "_auto": true,
    "_fields": {
      "currency_id": {
        "type": "many2one",
        "label": "res.currency",
        "required": true
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "date": {
        "type": "date",
        "label": "Date",
        "required": true
      },
      "amount": {
        "type": "float",
        "label": "Amount",
        "required": true
      },
      "description": {
        "type": "text",
        "label": "Description"
      }
    }
  },
  {
    "_name": "lunch.location",
    "_description": "Lunch Locations",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Location Name",
        "required": true
      },
      "address": {
        "type": "text",
        "label": "Address"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      }
    }
  },
  {
    "_name": "lunch.order",
    "_description": "Lunch Order",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "product_id.name"
      },
      "topping_ids_1": {
        "type": "many2many",
        "label": "lunch.topping"
      },
      "topping_ids_2": {
        "type": "many2many",
        "label": "lunch.topping"
      },
      "topping_ids_3": {
        "type": "many2many",
        "label": "lunch.topping"
      },
      "product_id": {
        "type": "many2one",
        "label": "lunch.product",
        "required": true
      },
      "category_id": {
        "type": "many2one",
        "label": "category_id"
      },
      "date": {
        "type": "date",
        "label": "Order Date",
        "required": true
      },
      "supplier_id": {
        "type": "many2one",
        "label": "supplier_id"
      },
      "available_today": {
        "type": "boolean",
        "label": "supplier_id.available_today"
      },
      "available_on_date": {
        "type": "boolean",
        "label": "_compute_available_on_date"
      },
      "order_deadline_passed": {
        "type": "boolean",
        "label": "_compute_order_deadline_passed"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "lunch_location_id": {
        "type": "many2one",
        "label": "lunch.location"
      },
      "note": {
        "type": "text",
        "label": "Notes"
      },
      "price": {
        "type": "monetary",
        "label": "Total Price"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "state": {
        "type": "selection",
        "label": "new"
      },
      "notified": {
        "type": "boolean",
        "label": "notified",
        "default": false
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "currency_id": {
        "type": "many2one",
        "label": "company_id.currency_id"
      },
      "quantity": {
        "type": "float",
        "label": "Quantity",
        "required": true
      },
      "display_toppings": {
        "type": "text",
        "label": "Extras"
      },
      "product_description": {
        "type": "html",
        "label": "Description"
      },
      "topping_label_1": {
        "type": "char",
        "label": "product_id.supplier_id.topping_label_1"
      },
      "topping_label_2": {
        "type": "char",
        "label": "product_id.supplier_id.topping_label_2"
      },
      "topping_label_3": {
        "type": "char",
        "label": "product_id.supplier_id.topping_label_3"
      },
      "topping_quantity_1": {
        "type": "selection",
        "label": "product_id.supplier_id.topping_quantity_1"
      },
      "topping_quantity_2": {
        "type": "selection",
        "label": "product_id.supplier_id.topping_quantity_2"
      },
      "topping_quantity_3": {
        "type": "selection",
        "label": "product_id.supplier_id.topping_quantity_3"
      },
      "image_1920": {
        "type": "text",
        "label": "_compute_product_images"
      },
      "image_128": {
        "type": "text",
        "label": "_compute_product_images"
      },
      "available_toppings_1": {
        "type": "boolean",
        "label": "Are extras available for this product"
      },
      "available_toppings_2": {
        "type": "boolean",
        "label": "Are extras available for this product"
      },
      "available_toppings_3": {
        "type": "boolean",
        "label": "Are extras available for this product"
      },
      "display_reorder_button": {
        "type": "boolean",
        "label": "_compute_display_reorder_button"
      },
      "display_add_button": {
        "type": "boolean",
        "label": "_compute_display_add_button"
      }
    }
  },
  {
    "_name": "lunch.product",
    "_description": "Lunch Product",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Product Name",
        "required": true
      },
      "category_id": {
        "type": "many2one",
        "label": "lunch.product.category",
        "required": true
      },
      "description": {
        "type": "html",
        "label": "Description"
      },
      "price": {
        "type": "float",
        "label": "Price",
        "required": true
      },
      "supplier_id": {
        "type": "many2one",
        "label": "lunch.supplier",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "new_until": {
        "type": "date",
        "label": "New Until"
      },
      "is_new": {
        "type": "boolean",
        "label": "_compute_is_new"
      },
      "favorite_user_ids": {
        "type": "many2many",
        "label": "res.users"
      },
      "is_favorite": {
        "type": "boolean",
        "label": "_compute_is_favorite"
      },
      "last_order_date": {
        "type": "date",
        "label": "_compute_last_order_date"
      },
      "product_image": {
        "type": "text",
        "label": "_compute_product_image"
      },
      "is_available_at": {
        "type": "many2one",
        "label": "lunch.location"
      }
    }
  },
  {
    "_name": "lunch.product.category",
    "_description": "Lunch Product Category",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Product Category",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "product_count": {
        "type": "integer",
        "label": "_compute_product_count"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "image_1920": {
        "type": "text",
        "label": "image_1920"
      }
    }
  },
  {
    "_name": "lunch.supplier",
    "_description": "Lunch Supplier",
    "_auto": true,
    "_fields": {
      "partner_id": {
        "type": "many2one",
        "label": "res.partner",
        "required": true
      },
      "name": {
        "type": "char",
        "label": "Name"
      },
      "email": {
        "type": "char",
        "label": "partner_id.email"
      },
      "email_formatted": {
        "type": "char",
        "label": "partner_id.email_formatted"
      },
      "phone": {
        "type": "char",
        "label": "partner_id.phone"
      },
      "street": {
        "type": "char",
        "label": "partner_id.street"
      },
      "street2": {
        "type": "char",
        "label": "partner_id.street2"
      },
      "zip_code": {
        "type": "char",
        "label": "partner_id.zip"
      },
      "city": {
        "type": "char",
        "label": "partner_id.city"
      },
      "state_id": {
        "type": "many2one",
        "label": "res.country.state"
      },
      "country_id": {
        "type": "many2one",
        "label": "res.country"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "responsible_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "send_by": {
        "type": "selection",
        "label": "send_by"
      },
      "automatic_email_time": {
        "type": "float",
        "label": "Order Time",
        "required": true
      },
      "cron_id": {
        "type": "many2one",
        "label": "ir.cron",
        "required": true
      },
      "mon": {
        "type": "boolean",
        "label": "mon",
        "default": true
      },
      "tue": {
        "type": "boolean",
        "label": "tue",
        "default": true
      },
      "wed": {
        "type": "boolean",
        "label": "wed",
        "default": true
      },
      "thu": {
        "type": "boolean",
        "label": "thu",
        "default": true
      },
      "fri": {
        "type": "boolean",
        "label": "fri",
        "default": true
      },
      "sat": {
        "type": "boolean",
        "label": "sat"
      },
      "sun": {
        "type": "boolean",
        "label": "sun"
      },
      "recurrency_end_date": {
        "type": "date",
        "label": "Until"
      },
      "available_location_ids": {
        "type": "many2many",
        "label": "lunch.location"
      },
      "available_today": {
        "type": "boolean",
        "label": "This is True when if the supplier is available today"
      },
      "order_deadline_passed": {
        "type": "boolean",
        "label": "_compute_order_deadline_passed"
      },
      "tz": {
        "type": "selection",
        "label": "Timezone",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "moment": {
        "type": "selection",
        "label": "moment"
      },
      "delivery": {
        "type": "selection",
        "label": "delivery"
      },
      "topping_label_1": {
        "type": "char",
        "label": "Extra 1 Label",
        "required": true,
        "default": "Extras"
      },
      "topping_label_2": {
        "type": "char",
        "label": "Extra 2 Label",
        "required": true,
        "default": "Beverages"
      },
      "topping_label_3": {
        "type": "char",
        "label": "Extra 3 Label",
        "required": true,
        "default": "Extra Label 3"
      },
      "topping_ids_1": {
        "type": "one2many",
        "label": "lunch.topping"
      },
      "topping_ids_2": {
        "type": "one2many",
        "label": "lunch.topping"
      },
      "topping_ids_3": {
        "type": "one2many",
        "label": "lunch.topping"
      },
      "topping_quantity_1": {
        "type": "selection",
        "label": "topping_quantity_1"
      },
      "topping_quantity_2": {
        "type": "selection",
        "label": "topping_quantity_2"
      },
      "topping_quantity_3": {
        "type": "selection",
        "label": "topping_quantity_3"
      },
      "show_order_button": {
        "type": "boolean",
        "label": "_compute_buttons"
      },
      "show_confirm_button": {
        "type": "boolean",
        "label": "_compute_buttons"
      }
    }
  },
  {
    "_name": "lunch.topping",
    "_description": "Lunch Extras",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "price": {
        "type": "monetary",
        "label": "Price",
        "required": true
      },
      "supplier_id": {
        "type": "many2one",
        "label": "lunch.supplier"
      },
      "topping_category": {
        "type": "integer",
        "label": "Topping Category",
        "required": true
      }
    }
  },
  {
    "_name": "rescompany",
    "_description": "rescompany",
    "_auto": true,
    "_fields": {
      "lunch_minimum_threshold": {
        "type": "float",
        "label": "lunch_minimum_threshold"
      },
      "lunch_notify_message": {
        "type": "html",
        "label": "lunch_notify_message"
      }
    },
    "_inherit": "res.company"
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "last_lunch_location_id": {
        "type": "many2one",
        "label": "lunch.location"
      },
      "favorite_lunch_product_ids": {
        "type": "many2many",
        "label": "lunch.product"
      }
    },
    "_inherit": "res.users"
  }
];
