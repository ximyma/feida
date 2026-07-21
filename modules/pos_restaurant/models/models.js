// Odoo 模块: pos_restaurant
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "posconfig",
    "_description": "posconfig",
    "_auto": true,
    "_fields": {
      "iface_splitbill": {
        "type": "boolean",
        "label": "Bill Splitting"
      },
      "iface_printbill": {
        "type": "boolean",
        "label": "Bill Printing"
      },
      "floor_ids": {
        "type": "many2many",
        "label": "restaurant.floor"
      },
      "set_tip_after_payment": {
        "type": "boolean",
        "label": "Set Tip After Payment"
      },
      "default_screen": {
        "type": "selection",
        "label": "tables",
        "default": "tables"
      }
    },
    "_inherit": "pos.config"
  },
  {
    "_name": "posorder",
    "_description": "posorder",
    "_auto": true,
    "_fields": {
      "table_id": {
        "type": "many2one",
        "label": "restaurant.table"
      },
      "customer_count": {
        "type": "integer",
        "label": "Guests"
      },
      "course_ids": {
        "type": "one2many",
        "label": "restaurant.order.course"
      }
    },
    "_inherit": "pos.order"
  },
  {
    "_name": "posorderline",
    "_description": "posorderline",
    "_auto": true,
    "_fields": {
      "course_id": {
        "type": "many2one",
        "label": "restaurant.order.course"
      }
    },
    "_inherit": "pos.order.line"
  },
  {
    "_name": "pospreset",
    "_description": "pospreset",
    "_auto": true,
    "_fields": {
      "use_guest": {
        "type": "boolean",
        "label": "Guest",
        "default": false
      }
    },
    "_inherit": "pos.preset"
  },
  {
    "_name": "restaurant.floor",
    "_description": "Restaurant Floor",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Floor Name",
        "required": true
      },
      "pos_config_ids": {
        "type": "many2many",
        "label": "pos.config"
      },
      "background_image": {
        "type": "text",
        "label": "Background Image"
      },
      "background_color": {
        "type": "char",
        "label": "Background Color"
      },
      "table_ids": {
        "type": "one2many",
        "label": "restaurant.table"
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "floor_background_image": {
        "type": "text",
        "label": "Floor Background Image"
      }
    }
  },
  {
    "_name": "restaurant.table",
    "_description": "Restaurant Table",
    "_auto": true,
    "_fields": {
      "floor_id": {
        "type": "many2one",
        "label": "restaurant.floor"
      },
      "table_number": {
        "type": "integer",
        "label": "Table Number",
        "required": true
      },
      "shape": {
        "type": "selection",
        "label": "square",
        "required": true,
        "default": "square"
      },
      "position_h": {
        "type": "float",
        "label": "Horizontal Position"
      },
      "position_v": {
        "type": "float",
        "label": "Vertical Position"
      },
      "width": {
        "type": "float",
        "label": "Width"
      },
      "height": {
        "type": "float",
        "label": "Height"
      },
      "seats": {
        "type": "integer",
        "label": "Seats"
      },
      "color": {
        "type": "char",
        "label": "Color"
      },
      "parent_id": {
        "type": "many2one",
        "label": "restaurant.table"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      }
    }
  },
  {
    "_name": "restaurant.order.course",
    "_description": "POS Restaurant Order Course",
    "_auto": true,
    "_fields": {
      "fired": {
        "type": "boolean",
        "label": "Fired",
        "default": false
      },
      "fired_date": {
        "type": "datetime",
        "label": "Fired Date"
      },
      "uuid": {
        "type": "char",
        "label": "Uuid"
      },
      "index": {
        "type": "integer",
        "label": "Course index"
      },
      "order_id": {
        "type": "many2one",
        "label": "pos.order",
        "required": true
      },
      "line_ids": {
        "type": "one2many",
        "label": "pos.order.line"
      }
    }
  }
];
