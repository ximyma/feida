// Odoo 模块: microsoft_calendar
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "calendar.event",
    "_description": "calendar.event",
    "_auto": true,
    "_fields": {
      "microsoft_recurrence_master_id": {
        "type": "char",
        "label": "Microsoft Recurrence Master Id"
      }
    }
  },
  {
    "_name": "calendar.recurrence",
    "_description": "calendar.recurrence",
    "_auto": true,
    "_fields": {
      "need_sync_m": {
        "type": "boolean",
        "label": "need_sync_m",
        "default": false
      }
    }
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "microsoft_calendar_sync_token": {
        "type": "char",
        "label": "res_users_settings_id.microsoft_calendar_sync_token"
      },
      "microsoft_synchronization_stopped": {
        "type": "boolean",
        "label": "res_users_settings_id.microsoft_synchronization_stopped"
      },
      "microsoft_last_sync_date": {
        "type": "datetime",
        "label": "res_users_settings_id.microsoft_last_sync_date"
      }
    },
    "_inherit": "res.users"
  },
  {
    "_name": "resuserssettings",
    "_description": "resuserssettings",
    "_auto": true,
    "_fields": {
      "microsoft_calendar_sync_token": {
        "type": "char",
        "label": "Microsoft Next Sync Token"
      },
      "microsoft_synchronization_stopped": {
        "type": "boolean",
        "label": "Outlook Synchronization stopped"
      },
      "microsoft_last_sync_date": {
        "type": "datetime",
        "label": "Last Sync Date"
      }
    },
    "_inherit": "res.users.settings"
  }
];
