exports.model={
  "_name": "customer_information",
  "_description": "客户信息",
  "_auto": true,
  "_fields": {
    "customer_name": {
      "type": "char",
      "label": "客户名称",
      "required": true
    },
    "customer_code": {
      "type": "char",
      "label": "客户编码",
      "required": false
    },
    "customer_status": {
      "type": "char",
      "label": "客户状态",
      "required": false
    },
    "industry": {
      "type": "char",
      "label": "所属行业",
      "required": false
    },
    "region": {
      "type": "char",
      "label": "所在地区",
      "required": false
    },
    "customer_level": {
      "type": "char",
      "label": "客户等级",
      "required": false
    },
    "source": {
      "type": "char",
      "label": "客户来源",
      "required": false
    },
    "website": {
      "type": "url",
      "label": "网址",
      "required": false
    },
    "owner_id": {
      "type": "many2one",
      "label": "负责人",
      "required": false,
      "relation": "contactinfo"
    },
    "phone": {
      "type": "phone",
      "label": "电话",
      "required": false
    },
    "address": {
      "type": "text",
      "label": "地址",
      "required": false
    },
    "remark": {
      "type": "text",
      "label": "备注",
      "required": false
    },
    "created_at": {
      "type": "date",
      "label": "创建时间",
      "required": false
    },
    "updated_at": {
      "type": "date",
      "label": "更新时间",
      "required": false
    }
  }
};
