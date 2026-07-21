// Odoo 模块: fleet
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "fleet.service.type",
    "_description": "Fleet Service Type",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "category": {
        "type": "selection",
        "label": "category"
      }
    }
  },
  {
    "_name": "fleet.vehicle",
    "_description": "Vehicle",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "_compute_vehicle_name"
      },
      "description": {
        "type": "html",
        "label": "Vehicle Description"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "manager_id": {
        "type": "many2one",
        "label": "manager_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "country_id": {
        "type": "many2one",
        "label": "res.country"
      },
      "country_code": {
        "type": "char",
        "label": "country_id.code"
      },
      "license_plate": {
        "type": "char",
        "label": "license_plate"
      },
      "vin_sn": {
        "type": "char",
        "label": "Chassis Number"
      },
      "trailer_hook": {
        "type": "boolean",
        "label": "Trailer Hitch",
        "default": false
      },
      "driver_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "future_driver_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "model_id": {
        "type": "many2one",
        "label": "fleet.vehicle.model"
      },
      "brand_id": {
        "type": "many2one",
        "label": "fleet.vehicle.model.brand"
      },
      "log_drivers": {
        "type": "one2many",
        "label": "fleet.vehicle.assignation.log"
      },
      "log_services": {
        "type": "one2many",
        "label": "fleet.vehicle.log.services"
      },
      "log_contracts": {
        "type": "one2many",
        "label": "fleet.vehicle.log.contract"
      },
      "contract_count": {
        "type": "integer",
        "label": "_compute_count_all"
      },
      "service_count": {
        "type": "integer",
        "label": "_compute_count_all"
      },
      "odometer_count": {
        "type": "integer",
        "label": "_compute_count_all"
      },
      "history_count": {
        "type": "integer",
        "label": "_compute_count_all"
      },
      "next_assignation_date": {
        "type": "date",
        "label": "Assignment Date"
      },
      "order_date": {
        "type": "date",
        "label": "Order Date"
      },
      "acquisition_date": {
        "type": "date",
        "label": "Registration Date"
      },
      "write_off_date": {
        "type": "date",
        "label": "Cancellation Date"
      },
      "contract_date_start": {
        "type": "date",
        "label": "First Contract Date"
      },
      "color": {
        "type": "char",
        "label": "Color of the vehicle"
      },
      "state_id": {
        "type": "many2one",
        "label": "fleet.vehicle.state"
      },
      "location": {
        "type": "char",
        "label": "Location of the vehicle (garage, ...)"
      },
      "seats": {
        "type": "integer",
        "label": "Seating Capacity"
      },
      "model_year": {
        "type": "selection",
        "label": "_get_year_selection"
      },
      "doors": {
        "type": "integer",
        "label": "Number of Doors"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "fleet.vehicle.tag"
      },
      "odometer": {
        "type": "float",
        "label": "_get_odometer"
      },
      "odometer_unit": {
        "type": "selection",
        "label": "odometer_unit"
      },
      "transmission": {
        "type": "selection",
        "label": "transmission"
      },
      "fuel_type": {
        "type": "selection",
        "label": "Fuel Type"
      },
      "power_unit": {
        "type": "selection",
        "label": "power_unit"
      },
      "horsepower": {
        "type": "float",
        "label": "_compute_horsepower"
      },
      "horsepower_tax": {
        "type": "float",
        "label": "Horsepower Taxation"
      },
      "power": {
        "type": "float",
        "label": "Power"
      },
      "co2": {
        "type": "float",
        "label": "CO₂ Emissions"
      },
      "co2_emission_unit": {
        "type": "selection",
        "label": "g/km"
      },
      "co2_standard": {
        "type": "char",
        "label": "Emission Standard"
      },
      "category_id": {
        "type": "many2one",
        "label": "fleet.vehicle.model.category"
      },
      "image_128": {
        "type": "text",
        "label": "model_id.image_128"
      },
      "contract_renewal_due_soon": {
        "type": "boolean",
        "label": "_compute_contract_reminder"
      },
      "contract_renewal_overdue": {
        "type": "boolean",
        "label": "_compute_contract_reminder"
      },
      "contract_state": {
        "type": "selection",
        "label": "contract_state"
      },
      "car_value": {
        "type": "float",
        "label": "Catalog Value (VAT Incl.)"
      },
      "net_car_value": {
        "type": "float",
        "label": "Purchase Value"
      },
      "residual_value": {
        "type": "float",
        "label": "residual_value"
      },
      "plan_to_change_car": {
        "type": "boolean",
        "label": "plan_to_change_car"
      },
      "plan_to_change_bike": {
        "type": "boolean",
        "label": "plan_to_change_bike"
      },
      "vehicle_type": {
        "type": "selection",
        "label": "model_id.vehicle_type"
      },
      "frame_type": {
        "type": "selection",
        "label": "diamant"
      },
      "electric_assistance": {
        "type": "boolean",
        "label": "_compute_electric_assistance"
      },
      "frame_size": {
        "type": "float",
        "label": "frame_size"
      },
      "service_activity": {
        "type": "selection",
        "label": "service_activity"
      },
      "vehicle_properties": {
        "type": "char",
        "label": "Properties"
      },
      "vehicle_range": {
        "type": "integer",
        "label": "Range"
      },
      "range_unit": {
        "type": "selection",
        "label": "km"
      }
    }
  },
  {
    "_name": "fleet.vehicle.assignation.log",
    "_description": "Drivers history on a vehicle",
    "_auto": true,
    "_fields": {
      "vehicle_id": {
        "type": "many2one",
        "label": "fleet.vehicle",
        "required": true
      },
      "driver_id": {
        "type": "many2one",
        "label": "res.partner",
        "required": true
      },
      "date_start": {
        "type": "date",
        "label": "Start Date"
      },
      "date_end": {
        "type": "date",
        "label": "End Date"
      }
    }
  },
  {
    "_name": "fleet.vehicle.log.contract",
    "_description": "Vehicle Contract",
    "_auto": true,
    "_fields": {
      "vehicle_id": {
        "type": "many2one",
        "label": "fleet.vehicle",
        "required": true
      },
      "cost_subtype_id": {
        "type": "many2one",
        "label": "fleet.service.type"
      },
      "amount": {
        "type": "monetary",
        "label": "Cost"
      },
      "date": {
        "type": "date",
        "label": "Date when the cost has been executed"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "name": {
        "type": "char",
        "label": "Name"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "start_date": {
        "type": "date",
        "label": "start_date"
      },
      "expiration_date": {
        "type": "date",
        "label": "expiration_date"
      },
      "days_left": {
        "type": "integer",
        "label": "_compute_days_left"
      },
      "expires_today": {
        "type": "boolean",
        "label": "_compute_days_left"
      },
      "has_open_contract": {
        "type": "boolean",
        "label": "_compute_has_open_contract"
      },
      "insurer_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "purchaser_id": {
        "type": "many2one",
        "label": "vehicle_id.driver_id"
      },
      "ins_ref": {
        "type": "char",
        "label": "Reference"
      },
      "state": {
        "type": "selection",
        "label": "state"
      },
      "notes": {
        "type": "html",
        "label": "Terms and Conditions"
      },
      "cost_generated": {
        "type": "monetary",
        "label": "Recurring Cost"
      },
      "cost_frequency": {
        "type": "selection",
        "label": "cost_frequency"
      },
      "service_ids": {
        "type": "many2many",
        "label": "fleet.service.type"
      }
    }
  },
  {
    "_name": "fleet.vehicle.log.services",
    "_description": "Services for vehicles",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "vehicle_id": {
        "type": "many2one",
        "label": "fleet.vehicle",
        "required": true
      },
      "model_id": {
        "type": "many2one",
        "label": "fleet.vehicle.model"
      },
      "brand_id": {
        "type": "many2one",
        "label": "fleet.vehicle.model.brand"
      },
      "manager_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "amount": {
        "type": "monetary",
        "label": "Cost"
      },
      "description": {
        "type": "char",
        "label": "Description"
      },
      "odometer_id": {
        "type": "many2one",
        "label": "fleet.vehicle.odometer"
      },
      "odometer": {
        "type": "float",
        "label": "odometer"
      },
      "odometer_unit": {
        "type": "selection",
        "label": "vehicle_id.odometer_unit"
      },
      "date": {
        "type": "date",
        "label": "Date when the cost has been executed"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "currency_id": {
        "type": "many2one",
        "label": "res.currency"
      },
      "purchaser_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "inv_ref": {
        "type": "char",
        "label": "Vendor Reference"
      },
      "vendor_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "notes": {
        "type": "text",
        "label": "notes"
      },
      "service_type_id": {
        "type": "many2one",
        "label": "service_type_id"
      },
      "state": {
        "type": "selection",
        "label": "state"
      }
    }
  },
  {
    "_name": "fleet.vehicle.model",
    "_description": "Model of a vehicle",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Model name",
        "required": true
      },
      "brand_id": {
        "type": "many2one",
        "label": "fleet.vehicle.model.brand",
        "required": true
      },
      "category_id": {
        "type": "many2one",
        "label": "fleet.vehicle.model.category"
      },
      "vendors": {
        "type": "many2many",
        "label": "res.partner"
      },
      "image_128": {
        "type": "text",
        "label": "brand_id.image_128"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "vehicle_type": {
        "type": "selection",
        "label": "car",
        "required": true,
        "default": "car"
      },
      "transmission": {
        "type": "selection",
        "label": "manual"
      },
      "vehicle_count": {
        "type": "integer",
        "label": "_compute_vehicle_count"
      },
      "model_year": {
        "type": "selection",
        "label": "_get_year_selection"
      },
      "color": {
        "type": "char",
        "label": "color"
      },
      "seats": {
        "type": "integer",
        "label": "Seating Capacity"
      },
      "doors": {
        "type": "integer",
        "label": "Number of Doors"
      },
      "trailer_hook": {
        "type": "boolean",
        "label": "Trailer Hitch",
        "default": false
      },
      "default_co2": {
        "type": "float",
        "label": "CO₂ Emissions"
      },
      "co2_emission_unit": {
        "type": "selection",
        "label": "g/km",
        "required": true
      },
      "co2_standard": {
        "type": "char",
        "label": "Emission Standard"
      },
      "default_fuel_type": {
        "type": "selection",
        "label": "Fuel Type",
        "default": "electric"
      },
      "power": {
        "type": "float",
        "label": "Power"
      },
      "horsepower": {
        "type": "float",
        "label": "horsepower"
      },
      "horsepower_tax": {
        "type": "float",
        "label": "Horsepower Taxation"
      },
      "electric_assistance": {
        "type": "boolean",
        "label": "electric_assistance",
        "default": false
      },
      "power_unit": {
        "type": "selection",
        "label": "power_unit"
      },
      "vehicle_properties_definition": {
        "type": "char",
        "label": "Vehicle Properties"
      },
      "vehicle_range": {
        "type": "integer",
        "label": "Range"
      },
      "range_unit": {
        "type": "selection",
        "label": "km",
        "required": true,
        "default": "km"
      },
      "drive_type": {
        "type": "selection",
        "label": "drive_type"
      }
    }
  },
  {
    "_name": "fleet.vehicle.model.brand",
    "_description": "Brand of the vehicle",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "image_128": {
        "type": "text",
        "label": "Logo"
      },
      "model_count": {
        "type": "integer",
        "label": "_compute_model_count"
      },
      "model_ids": {
        "type": "one2many",
        "label": "fleet.vehicle.model"
      }
    }
  },
  {
    "_name": "fleet.vehicle.model.category",
    "_description": "Category of the model",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      }
    }
  },
  {
    "_name": "fleet.vehicle.odometer",
    "_description": "Odometer log for a vehicle",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "_compute_vehicle_log_name"
      },
      "date": {
        "type": "date",
        "label": "date"
      },
      "value": {
        "type": "float",
        "label": "Odometer Value"
      },
      "vehicle_id": {
        "type": "many2one",
        "label": "fleet.vehicle",
        "required": true
      },
      "unit": {
        "type": "selection",
        "label": "vehicle_id.odometer_unit"
      },
      "driver_id": {
        "type": "many2one",
        "label": "res.partner"
      }
    }
  },
  {
    "_name": "fleet.vehicle.state",
    "_description": "Vehicle Status",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      },
      "fold": {
        "type": "boolean",
        "label": "Folded in Kanban"
      }
    }
  },
  {
    "_name": "fleet.vehicle.tag",
    "_description": "Vehicle Tag",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Tag Name",
        "required": true
      },
      "color": {
        "type": "integer",
        "label": "Color"
      }
    }
  }
];
