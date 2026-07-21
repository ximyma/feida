// Odoo 模块: test_import_export
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "export.aggregator",
    "_description": "Export Aggregator",
    "_auto": true,
    "_fields": {
      "int_sum": {
        "type": "integer",
        "label": "sum"
      },
      "int_max": {
        "type": "integer",
        "label": "max"
      },
      "float_min": {
        "type": "float",
        "label": "min"
      },
      "float_avg": {
        "type": "float",
        "label": "avg"
      },
      "float_monetary": {
        "type": "monetary",
        "label": "currency_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "date_max": {
        "type": "date",
        "label": "max"
      },
      "bool_and": {
        "type": "boolean",
        "label": "bool_and"
      },
      "bool_or": {
        "type": "boolean",
        "label": "bool_or"
      },
      "many2one": {
        "type": "many2one",
        "label": "export.integer"
      },
      "one2many": {
        "type": "one2many",
        "label": "export.aggregator.one2many"
      },
      "many2many": {
        "type": "many2many",
        "label": "res.partner"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "parent_id": {
        "type": "many2one",
        "label": "export.aggregator"
      },
      "definition_properties": {
        "type": "char",
        "label": "Definitions"
      },
      "properties": {
        "type": "char",
        "label": "Properties"
      }
    }
  },
  {
    "_name": "export.aggregator.one2many",
    "_description": "Export Aggregator One2Many",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "parent_id": {
        "type": "many2one",
        "label": "export.aggregator"
      },
      "value": {
        "type": "integer",
        "label": "value"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "admin_property_def": {
        "type": "many2one",
        "label": "export.aggregator.admin"
      },
      "admin_property": {
        "type": "char",
        "label": "Properties"
      }
    }
  },
  {
    "_name": "export.aggregator.admin",
    "_description": "Export Aggregator only for admin",
    "_auto": true,
    "_fields": {
      "definition_properties": {
        "type": "char",
        "label": "Definitions"
      }
    }
  },
  {
    "_name": "value",
    "_description": "value",
    "_auto": true,
    "_fields": {
      "const": {
        "type": "integer",
        "label": "const"
      }
    }
  },
  {
    "_name": "export.one2many.child",
    "_description": "Export One to Many Child",
    "_auto": true,
    "_fields": {
      "parent_id": {
        "type": "many2one",
        "label": "export.one2many"
      },
      "str": {
        "type": "char",
        "label": "str"
      },
      "m2o": {
        "type": "many2one",
        "label": "export.integer"
      },
      "value": {
        "type": "integer",
        "label": "value"
      }
    }
  },
  {
    "_name": "export.one2many.multiple",
    "_description": "Export One To Many Multiple",
    "_auto": true,
    "_fields": {
      "parent_id": {
        "type": "many2one",
        "label": "export.one2many.recursive"
      },
      "const": {
        "type": "integer",
        "label": "const"
      },
      "child1": {
        "type": "one2many",
        "label": "export.one2many.child.1"
      },
      "child2": {
        "type": "one2many",
        "label": "export.one2many.child.2"
      }
    }
  },
  {
    "_name": "export.many2many.other",
    "_description": "Export Many to Many Other",
    "_auto": true,
    "_fields": {
      "str": {
        "type": "char",
        "label": "str"
      },
      "value": {
        "type": "integer",
        "label": "value"
      }
    }
  },
  {
    "_name": "export.selection.withdefault",
    "_description": "Export Selection With Default",
    "_auto": true,
    "_fields": {
      "const": {
        "type": "integer",
        "label": "const"
      },
      "value": {
        "type": "selection",
        "label": "1",
        "default": "2"
      }
    }
  },
  {
    "_name": "export.one2many.recursive",
    "_description": "Export One To Many Recursive",
    "_auto": true,
    "_fields": {
      "value": {
        "type": "integer",
        "label": "value"
      },
      "child": {
        "type": "one2many",
        "label": "export.one2many.multiple"
      }
    }
  },
  {
    "_name": "export.unique",
    "_description": "Export Unique",
    "_auto": true,
    "_fields": {
      "value": {
        "type": "integer",
        "label": "value"
      },
      "value2": {
        "type": "integer",
        "label": "value2"
      },
      "value3": {
        "type": "integer",
        "label": "value3"
      }
    }
  },
  {
    "_name": "export.inherits.parent",
    "_description": "export.inherits.parent",
    "_auto": true,
    "_fields": {
      "value_parent": {
        "type": "integer",
        "label": "value_parent"
      }
    }
  },
  {
    "_name": "export.inherits.child",
    "_description": "export.inherits.child",
    "_auto": true,
    "_fields": {
      "parent_id": {
        "type": "many2one",
        "label": "export.inherits.parent",
        "required": true
      },
      "value": {
        "type": "integer",
        "label": "value"
      }
    }
  },
  {
    "_name": "export.m2o.str",
    "_description": "export.m2o.str",
    "_auto": true,
    "_fields": {
      "child_id": {
        "type": "many2one",
        "label": "export.m2o.str.child"
      }
    }
  },
  {
    "_name": "export.m2o.str.child",
    "_description": "export.m2o.str.child",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      }
    }
  },
  {
    "_name": "export.with.required.field",
    "_description": "export.with.required.field",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "value": {
        "type": "integer",
        "label": "value",
        "required": true
      }
    }
  },
  {
    "_name": "export.many2one.required.subfield",
    "_description": "export.many2one.required.subfield",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "many2one",
        "label": "export.with.required.field"
      }
    }
  },
  {
    "_name": "export.with.non.demo.constraint",
    "_description": "export.with.non.demo.constraint",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      }
    }
  },
  {
    "_name": "import.char",
    "_description": "Tests: Base Import Model, Character",
    "_auto": true,
    "_fields": {
      "value": {
        "type": "char",
        "label": "value"
      }
    }
  },
  {
    "_name": "import.char.required",
    "_description": "Tests: Base Import Model, Character required",
    "_auto": true,
    "_fields": {
      "value": {
        "type": "char",
        "label": "value",
        "required": true
      }
    }
  },
  {
    "_name": "import.char.readonly",
    "_description": "Tests: Base Import Model, Character readonly",
    "_auto": true,
    "_fields": {
      "value": {
        "type": "char",
        "label": "value"
      }
    }
  },
  {
    "_name": "import.char.noreadonly",
    "_description": "Tests: Base Import Model, Character No readonly",
    "_auto": true,
    "_fields": {
      "value": {
        "type": "char",
        "label": "value"
      }
    }
  },
  {
    "_name": "import.char.stillreadonly",
    "_description": "Tests: Base Import Model, Character still readonly",
    "_auto": true,
    "_fields": {
      "value": {
        "type": "char",
        "label": "value"
      }
    }
  },
  {
    "_name": "import.m2o",
    "_description": "Tests: Base Import Model, Many to One",
    "_auto": true,
    "_fields": {
      "value": {
        "type": "many2one",
        "label": "import.m2o.related"
      }
    }
  },
  {
    "_name": "import.m2o.related",
    "_description": "Tests: Base Import Model, Many to One related",
    "_auto": true,
    "_fields": {
      "value": {
        "type": "integer",
        "label": "value"
      }
    }
  },
  {
    "_name": "import.m2o.required",
    "_description": "Tests: Base Import Model, Many to One required",
    "_auto": true,
    "_fields": {
      "value": {
        "type": "many2one",
        "label": "import.m2o.required.related",
        "required": true
      }
    }
  },
  {
    "_name": "import.m2o.required.related",
    "_description": "Tests: Base Import Model, Many to One required related",
    "_auto": true,
    "_fields": {
      "value": {
        "type": "integer",
        "label": "value"
      }
    }
  },
  {
    "_name": "import.o2m",
    "_description": "Tests: Base Import Model, One to Many",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "value": {
        "type": "one2many",
        "label": "import.o2m.child"
      }
    }
  },
  {
    "_name": "import.o2m.child",
    "_description": "Tests: Base Import Model, One to Many child",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "parent_id": {
        "type": "many2one",
        "label": "import.o2m"
      },
      "value": {
        "type": "integer",
        "label": "value"
      }
    }
  },
  {
    "_name": "import.preview",
    "_description": "Tests: Base Import Model Preview",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "somevalue": {
        "type": "integer",
        "label": "Some Value",
        "required": true
      },
      "othervalue": {
        "type": "integer",
        "label": "Other Variable"
      },
      "date": {
        "type": "date",
        "label": "Date"
      },
      "datetime": {
        "type": "datetime",
        "label": "Datetime"
      }
    }
  },
  {
    "_name": "import.float",
    "_description": "Tests: Base Import Model Float",
    "_auto": true,
    "_fields": {
      "value": {
        "type": "float",
        "label": "value"
      },
      "value2": {
        "type": "monetary",
        "label": "value2"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      }
    }
  },
  {
    "_name": "import.complex",
    "_description": "Tests: Base Import Model Complex",
    "_auto": true,
    "_fields": {
      "f": {
        "type": "float",
        "label": "f"
      },
      "m": {
        "type": "monetary",
        "label": "m"
      },
      "c": {
        "type": "char",
        "label": "c"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "d": {
        "type": "date",
        "label": "d"
      },
      "dt": {
        "type": "datetime",
        "label": "dt"
      },
      "parent_id": {
        "type": "many2one",
        "label": "import.complex"
      },
      "html": {
        "type": "html",
        "label": "html"
      }
    }
  },
  {
    "_name": "import.properties.definition",
    "_description": "import.properties.definition",
    "_auto": true,
    "_fields": {
      "properties_definition": {
        "type": "char",
        "label": "properties_definition"
      },
      "record_properties_ids": {
        "type": "one2many",
        "label": "import.properties"
      },
      "main_properties_record_id": {
        "type": "many2one",
        "label": "import.properties"
      }
    }
  },
  {
    "_name": "import.properties",
    "_description": "import.properties",
    "_auto": true,
    "_fields": {
      "properties": {
        "type": "char",
        "label": "record_definition_id.properties_definition"
      },
      "record_definition_id": {
        "type": "many2one",
        "label": "import.properties.definition"
      }
    }
  },
  {
    "_name": "propertyinherits",
    "_description": "import.properties.inherits",
    "_auto": true,
    "_fields": {
      "parent_id": {
        "type": "many2one",
        "label": "import.properties",
        "required": true
      }
    }
  },
  {
    "_name": "pathtoproperty",
    "_description": "import.path.properties",
    "_auto": true,
    "_fields": {
      "properties_id": {
        "type": "many2one",
        "label": "import.properties"
      },
      "another_properties_id": {
        "type": "many2one",
        "label": "import.properties"
      },
      "all_properties_ids": {
        "type": "many2many",
        "label": "import.properties"
      }
    }
  }
];
