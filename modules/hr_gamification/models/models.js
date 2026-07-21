// Odoo 模块: hr_gamification
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "gamificationbadgeuser",
    "_description": "gamificationbadgeuser",
    "_auto": true,
    "_fields": {
      "employee_id": {
        "type": "many2one",
        "label": "hr.employee"
      },
      "has_edit_delete_access": {
        "type": "boolean",
        "label": "_compute_has_edit_delete_access"
      }
    },
    "_inherit": "gamification.badge.user"
  },
  {
    "_name": "gamificationbadge",
    "_description": "gamificationbadge",
    "_auto": true,
    "_fields": {
      "granted_employees_count": {
        "type": "integer",
        "label": "_compute_granted_employees_count"
      }
    },
    "_inherit": "gamification.badge"
  },
  {
    "_name": "hremployee",
    "_description": "hremployee",
    "_auto": true,
    "_fields": {
      "goal_ids": {
        "type": "one2many",
        "label": "gamification.goal"
      },
      "badge_ids": {
        "type": "one2many",
        "label": "badge_ids"
      },
      "has_badges": {
        "type": "boolean",
        "label": "_compute_employee_badges"
      },
      "direct_badge_ids": {
        "type": "one2many",
        "label": "direct_badge_ids"
      }
    },
    "_inherit": "hr.employee"
  },
  {
    "_name": "hremployeepublic",
    "_description": "hremployeepublic",
    "_auto": true,
    "_fields": {
      "badge_ids": {
        "type": "one2many",
        "label": "gamification.badge.user"
      },
      "has_badges": {
        "type": "boolean",
        "label": "_compute_has_badges"
      }
    },
    "_inherit": "hr.employee.public"
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "goal_ids": {
        "type": "one2many",
        "label": "gamification.goal"
      },
      "badge_ids": {
        "type": "one2many",
        "label": "gamification.badge.user"
      }
    },
    "_inherit": "res.users"
  }
];
