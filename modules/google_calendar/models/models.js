// Odoo 模块: google_calendar
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "calendar.event",
    "_description": "calendar.event",
    "_auto": true,
    "_fields": {
      "google_id": {
        "type": "char",
        "label": "google_id"
      },
      "guests_readonly": {
        "type": "boolean",
        "label": "guests_readonly"
      },
      "videocall_source": {
        "type": "selection",
        "label": "google_meet"
      }
    }
  },
  {
    "_name": "resusers",
    "_description": "resusers",
    "_auto": true,
    "_fields": {
      "google_calendar_rtoken": {
        "type": "char",
        "label": "res_users_settings_id.google_calendar_rtoken"
      },
      "google_calendar_token": {
        "type": "char",
        "label": "res_users_settings_id.google_calendar_token"
      },
      "google_calendar_token_validity": {
        "type": "datetime",
        "label": "res_users_settings_id.google_calendar_token_validity"
      },
      "google_calendar_sync_token": {
        "type": "char",
        "label": "res_users_settings_id.google_calendar_sync_token"
      },
      "google_calendar_cal_id": {
        "type": "char",
        "label": "res_users_settings_id.google_calendar_cal_id"
      },
      "google_synchronization_stopped": {
        "type": "boolean",
        "label": "res_users_settings_id.google_synchronization_stopped"
      }
    },
    "_inherit": "res.users"
  },
  {
    "_name": "resuserssettings",
    "_description": "resuserssettings",
    "_auto": true,
    "_fields": {
      "google_calendar_rtoken": {
        "type": "char",
        "label": "Refresh Token"
      },
      "google_calendar_token": {
        "type": "char",
        "label": "User token"
      },
      "google_calendar_token_validity": {
        "type": "datetime",
        "label": "Token Validity"
      },
      "google_calendar_sync_token": {
        "type": "char",
        "label": "Next Sync Token"
      },
      "google_calendar_cal_id": {
        "type": "char",
        "label": "Calendar ID"
      },
      "google_synchronization_stopped": {
        "type": "boolean",
        "label": "Google Synchronization stopped"
      }
    },
    "_inherit": "res.users.settings"
  }
];
