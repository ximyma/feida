// Odoo 模块: crm
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "calendarevent",
    "_description": "calendarevent",
    "_auto": true,
    "_fields": {
      "opportunity_id": {
        "type": "many2one",
        "label": "opportunity_id"
      }
    },
    "_inherit": "calendar.event"
  },
  {
    "_name": "crm.lead",
    "_description": "Lead",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "name"
      },
      "user_id": {
        "type": "many2one",
        "label": "user_id"
      },
      "user_company_ids": {
        "type": "many2many",
        "label": "user_company_ids"
      },
      "team_id": {
        "type": "many2one",
        "label": "team_id"
      },
      "lead_properties": {
        "type": "char",
        "label": "lead_properties"
      },
      "company_id": {
        "type": "many2one",
        "label": "company_id"
      },
      "referred": {
        "type": "char",
        "label": "Referred By"
      },
      "description": {
        "type": "html",
        "label": "Notes"
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "type": {
        "type": "selection",
        "label": "type"
      },
      "priority": {
        "type": "selection",
        "label": "priority"
      },
      "stage_id": {
        "type": "many2one",
        "label": "stage_id"
      },
      "stage_id_color": {
        "type": "integer",
        "label": "Stage Color"
      },
      "tag_ids": {
        "type": "many2many",
        "label": "tag_ids"
      },
      "color": {
        "type": "integer",
        "label": "Color Index"
      },
      "expected_revenue": {
        "type": "monetary",
        "label": "Expected Revenue"
      },
      "prorated_revenue": {
        "type": "monetary",
        "label": "Prorated Revenue"
      },
      "recurring_revenue": {
        "type": "monetary",
        "label": "Recurring Revenues"
      },
      "recurring_plan": {
        "type": "many2one",
        "label": "crm.recurring.plan"
      },
      "recurring_revenue_monthly": {
        "type": "monetary",
        "label": "Expected MRR"
      },
      "recurring_revenue_monthly_prorated": {
        "type": "monetary",
        "label": "Prorated MRR"
      },
      "recurring_revenue_prorated": {
        "type": "monetary",
        "label": "Prorated Recurring Revenues"
      },
      "company_currency": {
        "type": "many2one",
        "label": "res.currency"
      },
      "date_closed": {
        "type": "datetime",
        "label": "Closed Date"
      },
      "date_automation_last": {
        "type": "datetime",
        "label": "Last Action"
      },
      "date_open": {
        "type": "datetime",
        "label": "date_open"
      },
      "day_open": {
        "type": "float",
        "label": "Days to Assign"
      },
      "day_close": {
        "type": "float",
        "label": "Days to Close"
      },
      "date_last_stage_update": {
        "type": "datetime",
        "label": "date_last_stage_update"
      },
      "date_conversion": {
        "type": "datetime",
        "label": "Conversion Date"
      },
      "date_deadline": {
        "type": "date",
        "label": "Expected Closing"
      },
      "commercial_partner_id": {
        "type": "many2one",
        "label": "commercial_partner_id"
      },
      "partner_id": {
        "type": "many2one",
        "label": "partner_id"
      },
      "partner_is_blacklisted": {
        "type": "boolean",
        "label": "Partner is blacklisted"
      },
      "contact_name": {
        "type": "char",
        "label": "contact_name"
      },
      "partner_name": {
        "type": "char",
        "label": "partner_name"
      },
      "function": {
        "type": "char",
        "label": "Job Position"
      },
      "email_from": {
        "type": "char",
        "label": "email_from"
      },
      "email_normalized": {
        "type": "char",
        "label": "trigram"
      },
      "email_domain_criterion": {
        "type": "char",
        "label": "email_domain_criterion"
      },
      "phone": {
        "type": "char",
        "label": "phone"
      },
      "phone_sanitized": {
        "type": "char",
        "label": "btree_not_null"
      },
      "phone_state": {
        "type": "selection",
        "label": "phone_state"
      },
      "email_state": {
        "type": "selection",
        "label": "email_state"
      },
      "website": {
        "type": "char",
        "label": "Website"
      },
      "lang_id": {
        "type": "many2one",
        "label": "lang_id"
      },
      "lang_code": {
        "type": "char",
        "label": "lang_id.code"
      },
      "lang_active_count": {
        "type": "integer",
        "label": "_compute_lang_active_count"
      },
      "street": {
        "type": "char",
        "label": "Street"
      },
      "street2": {
        "type": "char",
        "label": "Street2"
      },
      "zip": {
        "type": "char",
        "label": "Zip",
        "default": true
      },
      "city": {
        "type": "char",
        "label": "City"
      },
      "state_id": {
        "type": "many2one",
        "label": "state_id"
      },
      "country_id": {
        "type": "many2one",
        "label": "country_id"
      },
      "probability": {
        "type": "float",
        "label": "probability"
      },
      "automated_probability": {
        "type": "float",
        "label": "Automated Probability"
      },
      "is_automated_probability": {
        "type": "boolean",
        "label": "Is automated probability?"
      },
      "won_status": {
        "type": "selection",
        "label": "won_status"
      },
      "lost_reason_id": {
        "type": "many2one",
        "label": "lost_reason_id"
      },
      "calendar_event_ids": {
        "type": "one2many",
        "label": "calendar.event"
      },
      "duplicate_lead_ids": {
        "type": "many2many",
        "label": "crm.lead"
      },
      "duplicate_lead_count": {
        "type": "integer",
        "label": "_compute_potential_lead_duplicates"
      },
      "meeting_display_date": {
        "type": "date",
        "label": "_compute_meeting_display"
      },
      "meeting_display_label": {
        "type": "char",
        "label": "_compute_meeting_display"
      },
      "partner_email_update": {
        "type": "boolean",
        "label": "Partner Email will Update"
      },
      "partner_phone_update": {
        "type": "boolean",
        "label": "Partner Phone will Update"
      },
      "is_partner_visible": {
        "type": "boolean",
        "label": "Is Partner Visible"
      },
      "campaign_id": {
        "type": "many2one",
        "label": "set null"
      },
      "medium_id": {
        "type": "many2one",
        "label": "set null"
      },
      "source_id": {
        "type": "many2one",
        "label": "set null"
      }
    }
  },
  {
    "_name": "crm.lead.scoring.frequency",
    "_description": "Lead Scoring Frequency",
    "_auto": true,
    "_fields": {
      "variable": {
        "type": "char",
        "label": "Variable"
      },
      "value": {
        "type": "char",
        "label": "Value"
      },
      "won_count": {
        "type": "float",
        "label": "Won Count"
      },
      "lost_count": {
        "type": "float",
        "label": "Lost Count"
      },
      "team_id": {
        "type": "many2one",
        "label": "crm.team"
      }
    }
  },
  {
    "_name": "crm.lead.scoring.frequency.field",
    "_description": "Fields that can be used for predictive lead scoring computation",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "field_id.field_description"
      },
      "field_id": {
        "type": "many2one",
        "label": "field_id"
      },
      "color": {
        "type": "integer",
        "label": "Color"
      }
    }
  },
  {
    "_name": "crm.lost.reason",
    "_description": "Opp. Lost Reason",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Description",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "leads_count": {
        "type": "integer",
        "label": "Leads Count"
      }
    }
  },
  {
    "_name": "crm.recurring.plan",
    "_description": "CRM Recurring revenue plans",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Plan Name",
        "required": true
      },
      "number_of_months": {
        "type": "integer",
        "label": "# Months",
        "required": true
      },
      "active": {
        "type": "boolean",
        "label": "Active",
        "default": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      }
    }
  },
  {
    "_name": "crm.stage",
    "_description": "CRM Stages",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Stage Name",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "is_won": {
        "type": "boolean",
        "label": "Is Won Stage?"
      },
      "rotting_threshold_days": {
        "type": "integer",
        "label": "Days to rot"
      },
      "requirements": {
        "type": "text",
        "label": "Requirements"
      },
      "team_ids": {
        "type": "many2many",
        "label": "crm.team"
      },
      "fold": {
        "type": "boolean",
        "label": "Folded in Pipeline"
      },
      "team_count": {
        "type": "integer",
        "label": "team_count"
      },
      "color": {
        "type": "integer",
        "label": "Color"
      }
    }
  },
  {
    "_name": "crm.team",
    "_description": "Sales Team",
    "_auto": true,
    "_fields": {
      "use_leads": {
        "type": "boolean",
        "label": "Leads"
      },
      "use_opportunities": {
        "type": "boolean",
        "label": "Pipeline",
        "default": true
      },
      "alias_id": {
        "type": "many2one",
        "label": "The email address associated with this channel. New emails received will automatically create new leads assigned to the channel."
      },
      "assignment_enabled": {
        "type": "boolean",
        "label": "Lead Assign"
      },
      "assignment_auto_enabled": {
        "type": "boolean",
        "label": "Auto Assignment"
      },
      "assignment_optout": {
        "type": "boolean",
        "label": "Skip auto assignment"
      },
      "assignment_max": {
        "type": "integer",
        "label": "assignment_max"
      },
      "assignment_domain": {
        "type": "char",
        "label": "assignment_domain"
      },
      "lead_unassigned_count": {
        "type": "integer",
        "label": "lead_unassigned_count"
      },
      "lead_all_assigned_month_count": {
        "type": "integer",
        "label": "lead_all_assigned_month_count"
      },
      "lead_all_assigned_month_exceeded": {
        "type": "boolean",
        "label": "Exceed monthly lead assignement"
      },
      "lead_properties_definition": {
        "type": "char",
        "label": "Lead Properties"
      }
    }
  },
  {
    "_name": "crmteammember",
    "_description": "crmteammember",
    "_auto": true,
    "_fields": {
      "assignment_enabled": {
        "type": "boolean",
        "label": "crm_team_id.assignment_enabled"
      },
      "assignment_domain": {
        "type": "char",
        "label": "Assignment Domain"
      },
      "assignment_domain_preferred": {
        "type": "char",
        "label": "Preference assignment Domain"
      },
      "assignment_optout": {
        "type": "boolean",
        "label": "Pause assignment"
      },
      "assignment_max": {
        "type": "integer",
        "label": "Average Leads Capacity (on 30 days)"
      },
      "lead_day_count": {
        "type": "integer",
        "label": "lead_day_count"
      },
      "lead_month_count": {
        "type": "integer",
        "label": "lead_month_count"
      }
    },
    "_inherit": "crm.team.member"
  },
  {
    "_name": "digestdigest",
    "_description": "digestdigest",
    "_auto": true,
    "_fields": {
      "kpi_crm_lead_created": {
        "type": "boolean",
        "label": "New Leads"
      },
      "kpi_crm_lead_created_value": {
        "type": "integer",
        "label": "_compute_kpi_crm_lead_created_value"
      },
      "kpi_crm_opportunities_won": {
        "type": "boolean",
        "label": "Opportunities Won"
      },
      "kpi_crm_opportunities_won_value": {
        "type": "integer",
        "label": "_compute_kpi_crm_opportunities_won_value"
      }
    },
    "_inherit": "digest.digest"
  },
  {
    "_name": "respartner",
    "_description": "respartner",
    "_auto": true,
    "_fields": {
      "opportunity_ids": {
        "type": "one2many",
        "label": "crm.lead"
      },
      "opportunity_count": {
        "type": "integer",
        "label": "opportunity_count"
      }
    },
    "_inherit": "res.partner"
  },
  {
    "_name": "utmcampaign",
    "_description": "utmcampaign",
    "_auto": true,
    "_fields": {
      "use_leads": {
        "type": "boolean",
        "label": "Use Leads"
      },
      "crm_lead_count": {
        "type": "integer",
        "label": "Leads/Opportunities count"
      }
    },
    "_inherit": "utm.campaign"
  }
];
