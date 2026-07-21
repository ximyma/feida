// 低代码生成: followinfo
exports.model = {
  "_name": "followinfo",
  "_description": "跟进记录",
  "_fields": {
    "customer_id": {
      "type": "many2one",
      "label": "所属客户",
      "required": false,
      "relation": "customer"
    },
    "opportunity_id": {
      "type": "many2one",
      "label": "关联商机",
      "required": false,
      "relation": "opportunity"
    },
    "contact_id": {
      "type": "many2one",
      "label": "联系人",
      "required": false,
      "relation": "contact"
    },
    "follow_up_type": {
      "type": "char",
      "label": "跟进方式",
      "required": false
    },
    "follow_up_time": {
      "type": "char",
      "label": "跟进时间",
      "required": false
    },
    "content": {
      "type": "char",
      "label": "跟进内容",
      "required": false
    },
    "attachment": {
      "type": "char",
      "label": "附件",
      "required": false
    },
    "next_plan": {
      "type": "char",
      "label": "下一步计划",
      "required": false
    },
    "next_follow_time": {
      "type": "char",
      "label": "下次跟进时间",
      "required": false
    },
    "owner_id": {
      "type": "many2one",
      "label": "负责人",
      "required": false,
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
