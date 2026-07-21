// demo_erp — 产品
exports.model = {
  _name: 'demo_product',
  _description: '产品',
  _fields: {
    name:      { type: 'char', label: '产品名', required: true },
    sku:       { type: 'char', label: 'SKU编码' },
    price:     { type: 'float', label: '单价', required: true },
    stock:     { type: 'integer', label: '库存', default: 0 },
    category:  { type: 'selection', label: '分类', default: 'goods',
      selection: [{label:'实物',value:'goods'},{label:'服务',value:'service'},{label:'数字',value:'digital'}] },
    active:    { type: 'boolean', label: '在售', default: true },
  },
};
