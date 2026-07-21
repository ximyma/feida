exports.model={
  "_name": "customer_information",
  "_description": "客户信息",
  "_auto": true,
  "_fields": {
    "customer_name": {
      "type": "char",
      "label": "客户名称",
      "required": false,
      "default": null
    },
    "customer_code": {
      "type": "char",
      "label": "客户编码",
      "required": false,
      "default": null
    },
    "customer_status": {
      "type": "char",
      "label": "客户状态",
      "required": false,
      "default": null
    },
    "industry": {
      "type": "char",
      "label": "所属行业",
      "required": false,
      "default": null
    },
    "region": {
      "type": "char",
      "label": "所在地区",
      "required": false,
      "default": null
    },
    "customer_level": {
      "type": "char",
      "label": "客户等级",
      "required": false,
      "default": null
    },
    "source": {
      "type": "char",
      "label": "客户来源",
      "required": false,
      "default": null
    },
    "website": {
      "type": "char",
      "label": "网址",
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
    "phone": {
      "type": "char",
      "label": "电话",
      "required": false,
      "default": null
    },
    "address": {
      "type": "char",
      "label": "地址",
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
