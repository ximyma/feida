exports.model={
  "_name": "customer_information",
  "_description": "客户信息",
  "_auto": true,
  "_fields": {
    "customer_name": {
      "type": "char",
      "label": "客户名称"
    },
    "customer_code": {
      "type": "char",
      "label": "客户编码"
    },
    "customer_status": {
      "type": "char",
      "label": "客户状态"
    },
    "industry": {
      "type": "char",
      "label": "所属行业"
    },
    "region": {
      "type": "char",
      "label": "所在地区"
    },
    "customer_level": {
      "type": "char",
      "label": "客户等级"
    },
    "source": {
      "type": "char",
      "label": "客户来源"
    },
    "website": {
      "type": "url",
      "label": "网址"
    },
    "owner_id": {
      "type": "many2one",
      "label": "负责人",
      "relation": "contactinfo"
    },
    "phone": {
      "type": "phone",
      "label": "电话"
    },
    "address": {
      "type": "text",
      "label": "地址"
    },
    "remark": {
      "type": "text",
      "label": "备注"
    },
    "created_at": {
      "type": "date",
      "label": "创建时间"
    },
    "updated_at": {
      "type": "date",
      "label": "更新时间"
    }
  }
};
