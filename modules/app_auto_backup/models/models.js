// Odoo 模块: app_auto_backup
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "db.backup",
    "_description": "Backup configuration record",
    "_auto": true,
    "_fields": {
      "host": {
        "type": "char",
        "label": "Host",
        "required": true,
        "default": "localhost"
      },
      "port": {
        "type": "char",
        "label": "Port",
        "required": true
      },
      "name": {
        "type": "char",
        "label": "Database",
        "required": true
      },
      "folder": {
        "type": "char",
        "label": "Backup Directory",
        "required": true
      },
      "backup_type": {
        "type": "selection",
        "label": "zip",
        "required": true,
        "default": "zip"
      },
      "autoremove": {
        "type": "boolean",
        "label": "Auto. Remove Backups"
      },
      "days_to_keep": {
        "type": "integer",
        "label": "Remove after x days"
      },
      "sftp_write": {
        "type": "boolean",
        "label": "Write to external server with sftp"
      },
      "sftp_path": {
        "type": "char",
        "label": "Path external server"
      },
      "sftp_host": {
        "type": "char",
        "label": "IP Address SFTP Server"
      },
      "sftp_port": {
        "type": "integer",
        "label": "SFTP Port"
      },
      "sftp_user": {
        "type": "char",
        "label": "Username SFTP Server"
      },
      "sftp_password": {
        "type": "char",
        "label": "Password User SFTP Server"
      },
      "days_to_keep_sftp": {
        "type": "integer",
        "label": "Remove SFTP after x days"
      },
      "send_mail_sftp_fail": {
        "type": "boolean",
        "label": "Auto. E-mail on backup fail"
      },
      "email_to_notify": {
        "type": "char",
        "label": "E-mail to notify"
      },
      "backup_details_ids": {
        "type": "one2many",
        "label": "db.backup.details"
      }
    }
  },
  {
    "_name": "db.backup.details",
    "_description": "Database Backup Details",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name"
      },
      "file_path": {
        "type": "char",
        "label": "File Path"
      },
      "url": {
        "type": "char",
        "label": "URL"
      },
      "db_backup_id": {
        "type": "many2one",
        "label": "db.backup"
      }
    }
  }
];
