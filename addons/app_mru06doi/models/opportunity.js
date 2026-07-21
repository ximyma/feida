// 低代码生成: opportunity
exports.model = {
  "_name": "opportunity",
  "_description": "商机信息",
  "_fields": {
    "opportunity_name": {
      "type": "char",
      "label": "商机名称",
      "required": false
    },
    "customer_id": {
      "type": "many2one",
      "label": "所属客户",
      "required": false,
      "relation": "customer"
    },
    "contact_id": {
      "type": "many2one",
      "label": "联系人",
      "required": false,
      "relation": "contact"
    },
    "opportunity_type": {
      "type": "char",
      "label": "商机类型",
      "required": false
    },
    "stage": {
      "type": "char",
      "label": "阶段",
      "required": false
    },
    "amount": {
      "type": "char",
      "label": "金额",
      "required": false
    },
    "expected_close_date": {
      "type": "char",
      "label": "预计成交日期",
      "required": false
    },
    "win_probability": {
      "type": "char",
      "label": "赢单概率",
      "required": false
    },
    "competitor": {
      "type": "char",
      "label": "竞争对手",
      "required": false
    },
    "lost_reason": {
      "type": "char",
      "label": "丢单原因",
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
