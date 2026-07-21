// Odoo 模块: onboarding
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "onboarding.onboarding",
    "_description": "Onboarding",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name of the onboarding"
      },
      "route_name": {
        "type": "char",
        "label": "One word name",
        "required": true
      },
      "step_ids": {
        "type": "many2many",
        "label": "onboarding.onboarding.step"
      },
      "text_completed": {
        "type": "char",
        "label": "text_completed"
      },
      "is_per_company": {
        "type": "boolean",
        "label": "is_per_company"
      },
      "panel_close_action_name": {
        "type": "char",
        "label": "panel_close_action_name"
      },
      "current_progress_id": {
        "type": "many2one",
        "label": "current_progress_id"
      },
      "current_onboarding_state": {
        "type": "selection",
        "label": "current_onboarding_state"
      },
      "is_onboarding_closed": {
        "type": "boolean",
        "label": "Was panel closed?"
      },
      "progress_ids": {
        "type": "one2many",
        "label": "progress_ids"
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      }
    }
  },
  {
    "_name": "onboarding.onboarding.step",
    "_description": "Onboarding Step",
    "_auto": true,
    "_fields": {
      "onboarding_ids": {
        "type": "many2many",
        "label": "onboarding.onboarding"
      },
      "title": {
        "type": "char",
        "label": "Title"
      },
      "description": {
        "type": "char",
        "label": "Description"
      },
      "button_text": {
        "type": "char",
        "label": "button_text"
      },
      "done_icon": {
        "type": "char",
        "label": "Font Awesome Icon when completed",
        "default": "fa-star"
      },
      "done_text": {
        "type": "char",
        "label": "done_text"
      },
      "step_image": {
        "type": "text",
        "label": "Step Image"
      },
      "step_image_filename": {
        "type": "char",
        "label": "Step Image Filename"
      },
      "step_image_alt": {
        "type": "char",
        "label": "step_image_alt"
      },
      "panel_step_open_action_name": {
        "type": "char",
        "label": "panel_step_open_action_name"
      },
      "current_progress_step_id": {
        "type": "many2one",
        "label": "current_progress_step_id"
      },
      "current_step_state": {
        "type": "selection",
        "label": "current_step_state"
      },
      "progress_ids": {
        "type": "one2many",
        "label": "progress_ids"
      },
      "is_per_company": {
        "type": "boolean",
        "label": "Is per company",
        "default": true
      },
      "sequence": {
        "type": "integer",
        "label": "sequence"
      }
    }
  },
  {
    "_name": "onboarding.progress",
    "_description": "Onboarding Progress Tracker",
    "_auto": true,
    "_fields": {
      "onboarding_state": {
        "type": "selection",
        "label": "onboarding_state"
      },
      "is_onboarding_closed": {
        "type": "boolean",
        "label": "Was panel closed?"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      },
      "onboarding_id": {
        "type": "many2one",
        "label": "onboarding_id"
      },
      "progress_step_ids": {
        "type": "many2many",
        "label": "onboarding.progress.step"
      }
    }
  },
  {
    "_name": "onboarding.progress.step",
    "_description": "Onboarding Progress Step Tracker",
    "_auto": true,
    "_fields": {
      "progress_ids": {
        "type": "many2many",
        "label": "onboarding.progress"
      },
      "step_state": {
        "type": "selection",
        "label": "step_state"
      },
      "step_id": {
        "type": "many2one",
        "label": "step_id"
      },
      "company_id": {
        "type": "many2one",
        "label": "res.company"
      }
    }
  }
];
