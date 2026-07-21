exports.model={
  "_name": "contactinfo",
  "_description": "联系人信息",
  "_auto": true,
  "_fields": {
    "contact_name": {
      "type": "char",
      "label": "联系人姓名",
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
    "gender": {
      "type": "char",
      "label": "性别",
      "required": false,
      "default": null
    },
    "department": {
      "type": "char",
      "label": "部门",
      "required": false,
      "default": null
    },
    "position": {
      "type": "char",
      "label": "职务",
      "required": false,
      "default": null
    },
    "is_decision_maker": {
      "type": "integer",
      "label": "是否决策人",
      "required": false,
      "default": "0"
    },
    "mobile": {
      "type": "char",
      "label": "手机",
      "required": false,
      "default": null
    },
    "wechat": {
      "type": "char",
      "label": "微信",
      "required": false,
      "default": null
    },
    "email": {
      "type": "char",
      "label": "邮箱",
      "required": false,
      "default": null
    },
    "birthday": {
      "type": "char",
      "label": "生日",
      "required": false,
      "default": null
    },
    "remark": {
      "type": "char",
      "label": "备注",
      "required": false,
      "default": null
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
