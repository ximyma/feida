exports.model={
  "_name": "opportunity",
  "_description": "商机信息",
  "_auto": true,
  "_fields": {
    "opportunity_name": {
      "type": "char",
      "label": "商机名称",
      "required": false,
      "default": null
    },
    "customer_id": {
      "type": "many2one",
      "label": "所属客户",
      "required": false,
      "default": null,
      "relation": "customer"
    },
    "contact_id": {
      "type": "many2one",
      "label": "联系人",
      "required": false,
      "default": null,
      "relation": "contact"
    },
    "opportunity_type": {
      "type": "char",
      "label": "商机类型",
      "required": false,
      "default": null
    },
    "stage": {
      "type": "char",
      "label": "阶段",
      "required": false,
      "default": null
    },
    "amount": {
      "type": "char",
      "label": "金额",
      "required": false,
      "default": null
    },
    "expected_close_date": {
      "type": "char",
      "label": "预计成交日期",
      "required": false,
      "default": null
    },
    "win_probability": {
      "type": "char",
      "label": "赢单概率",
      "required": false,
      "default": null
    },
    "competitor": {
      "type": "char",
      "label": "竞争对手",
      "required": false,
      "default": null
    },
    "lost_reason": {
      "type": "char",
      "label": "丢单原因",
      "required": false,
      "default": null
    },
    "owner_id": {
      "type": "many2one",
      "label": "负责人",
      "required": false,
      "default": null,
      "relation": "owner"
    },
    "created_at": {
      "type": "char",
      "label": "创建时间",
      "required": false,
      "default": "CURRENT_TIMESTAMP"
    },
    "updated_at": {
      "type": "char",
      "label": "更新时间",
      "required": false,
      "default": "CURRENT_TIMESTAMP"
    }
  }
};
