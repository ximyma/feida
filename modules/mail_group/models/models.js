// Odoo 模块: mail_group
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "mail.group",
    "_description": "Mail Group",
    "_auto": true,
    "_fields": {
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "description": {
        "type": "text",
        "label": "Description"
      },
      "image_128": {
        "type": "text",
        "label": "Image"
      },
      "is_closed": {
        "type": "boolean",
        "label": "Is Closed"
      },
      "mail_group_message_ids": {
        "type": "one2many",
        "label": "mail.group.message"
      },
      "mail_group_message_last_month_count": {
        "type": "integer",
        "label": "Messages Per Month"
      },
      "mail_group_message_count": {
        "type": "integer",
        "label": "Messages Count"
      },
      "mail_group_message_moderation_count": {
        "type": "integer",
        "label": "Pending Messages Count"
      },
      "is_member": {
        "type": "boolean",
        "label": "Is Member"
      },
      "member_ids": {
        "type": "one2many",
        "label": "mail.group.member"
      },
      "member_partner_ids": {
        "type": "many2many",
        "label": "res.partner"
      },
      "member_count": {
        "type": "integer",
        "label": "Members Count"
      },
      "is_moderator": {
        "type": "boolean",
        "label": "Moderator"
      },
      "moderation": {
        "type": "boolean",
        "label": "Moderate"
      },
      "moderation_rule_count": {
        "type": "integer",
        "label": "Moderated emails count"
      },
      "moderation_rule_ids": {
        "type": "one2many",
        "label": "mail.group.moderation"
      },
      "moderator_ids": {
        "type": "many2many",
        "label": "res.users"
      },
      "moderation_notify": {
        "type": "boolean",
        "label": "moderation_notify"
      },
      "moderation_notify_msg": {
        "type": "html",
        "label": "Notification message"
      },
      "moderation_guidelines": {
        "type": "boolean",
        "label": "moderation_guidelines"
      },
      "moderation_guidelines_msg": {
        "type": "html",
        "label": "Guidelines"
      },
      "access_mode": {
        "type": "selection",
        "label": "access_mode"
      },
      "access_group_id": {
        "type": "many2one",
        "label": "res.groups"
      },
      "can_manage_group": {
        "type": "boolean",
        "label": "Can Manage"
      }
    }
  },
  {
    "_name": "mail.group.member",
    "_description": "Mailing List Member",
    "_auto": true,
    "_fields": {
      "email": {
        "type": "char",
        "label": "Email"
      },
      "email_normalized": {
        "type": "char",
        "label": "email_normalized"
      },
      "mail_group_id": {
        "type": "many2one",
        "label": "mail.group",
        "required": true
      },
      "partner_id": {
        "type": "many2one",
        "label": "res.partner"
      }
    }
  },
  {
    "_name": "mail.group.message",
    "_description": "Mailing List Message",
    "_auto": true,
    "_fields": {
      "attachment_ids": {
        "type": "many2many",
        "label": "mail_message_id.attachment_ids"
      },
      "author_id": {
        "type": "many2one",
        "label": "mail_message_id.author_id"
      },
      "email_from": {
        "type": "char",
        "label": "mail_message_id.email_from"
      },
      "email_from_normalized": {
        "type": "char",
        "label": "Normalized From"
      },
      "body": {
        "type": "html",
        "label": "mail_message_id.body"
      },
      "subject": {
        "type": "char",
        "label": "mail_message_id.subject"
      },
      "mail_group_id": {
        "type": "many2one",
        "label": "mail_group_id"
      },
      "mail_message_id": {
        "type": "many2one",
        "label": "mail.message",
        "required": true
      },
      "group_message_parent_id": {
        "type": "many2one",
        "label": "group_message_parent_id"
      },
      "group_message_child_ids": {
        "type": "one2many",
        "label": "mail.group.message"
      },
      "author_moderation": {
        "type": "selection",
        "label": "ban"
      },
      "is_group_moderated": {
        "type": "boolean",
        "label": "Is Group Moderated"
      },
      "moderation_status": {
        "type": "selection",
        "label": "moderation_status"
      },
      "moderator_id": {
        "type": "many2one",
        "label": "res.users"
      },
      "create_date": {
        "type": "datetime",
        "label": "Posted"
      }
    }
  },
  {
    "_name": "mail.group.moderation",
    "_description": "Mailing List black/white list",
    "_auto": true,
    "_fields": {
      "email": {
        "type": "char",
        "label": "Email",
        "required": true
      },
      "status": {
        "type": "selection",
        "label": "status"
      },
      "mail_group_id": {
        "type": "many2one",
        "label": "mail.group",
        "required": true
      }
    }
  }
];
