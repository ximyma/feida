// Odoo 模块: test_base_automation
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "base.automation.lead.test",
    "_description": "Automated Rule Test",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Subject",
        "required": true
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "state": {
        "type": "selection",
        "label": "draft"
      },
      "active": {
        "type": "boolean",
        "label": "active",
        "default": true
      },
      "tag_ids": {
        "type": "many2many",
        "label": "test_base_automation.tag"
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      },
      "date_automation_last": {
        "type": "datetime",
        "label": "Last Automation"
      },
      "employee": {
        "type": "boolean",
        "label": "_compute_employee_deadline"
      },
      "line_ids": {
        "type": "one2many",
        "label": "base.automation.line.test"
      },
      "priority": {
        "type": "boolean",
        "label": "priority"
      },
      "deadline": {
        "type": "boolean",
        "label": "_compute_employee_deadline"
      },
      "is_assigned_to_admin": {
        "type": "boolean",
        "label": "Assigned to admin user"
      },
      "stage_id": {
        "type": "many2one",
        "label": "stage_id"
      }
    }
  },
  {
    "_name": "base.automation.lead.thread.test",
    "_description": "Automated Rule Test With Thread",
    "_auto": true,
    "_fields": {
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      }
    }
  },
  {
    "_name": "base.automation.line.test",
    "_description": "Automated Rule Line Test",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "lead_id": {
        "type": "many2one",
        "label": "base.automation.lead.test"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      }
    }
  },
  {
    "_name": "base.automation.link.test",
    "_description": "Automated Rule Link Test",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "linked_id": {
        "type": "many2one",
        "label": "base.automation.linked.test"
      }
    }
  },
  {
    "_name": "base.automation.linked.test",
    "_description": "Automated Rule Linked Test",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "another_field": {
        "type": "char",
        "label": "another_field"
      }
    }
  },
  {
    "_name": "test_base_automation.project",
    "_description": "test_base_automation.project",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "task_ids": {
        "type": "one2many",
        "label": "test_base_automation.task"
      },
      "stage_id": {
        "type": "many2one",
        "label": "test_base_automation.stage"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "test_base_automation.tag"
      },
      "priority": {
        "type": "selection",
        "label": "0",
        "default": "1"
      },
      "user_ids": {
        "type": "many2many",
        "label": "res.users"
      }
    }
  },
  {
    "_name": "test_base_automation.task",
    "_description": "test_base_automation.task",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "parent_id": {
        "type": "many2one",
        "label": "test_base_automation.task"
      },
      "project_id": {
        "type": "many2one",
        "label": "project_id"
      },
      "allocated_hours": {
        "type": "float",
        "label": "allocated_hours"
      },
      "trigger_hours": {
        "type": "float",
        "label": "Save time to trigger effective hours"
      },
      "remaining_hours": {
        "type": "float",
        "label": "Time Remaining"
      },
      "effective_hours": {
        "type": "float",
        "label": "Time Spent"
      }
    }
  },
  {
    "_name": "test_base_automation.stage",
    "_description": "test_base_automation.stage",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      }
    }
  },
  {
    "_name": "test_base_automation.tag",
    "_description": "test_base_automation.tag",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      }
    }
  },
  {
    "_name": "base.automation.model.with.recname.char",
    "_description": "Model with Char as _rec_name",
    "_auto": true,
    "_fields": {
      "description": {
        "type": "char",
        "label": "description"
      },
      "user_id": {
        "type": "many2one",
        "label": "res.users"
      }
    }
  },
  {
    "_name": "base.automation.model.with.recname.m2o",
    "_description": "Model with Many2one as _rec_name and name_create",
    "_auto": true,
    "_fields": {
      "user_id": {
        "type": "many2one",
        "label": "base.automation.model.with.recname.char"
      }
    }
  }
];
