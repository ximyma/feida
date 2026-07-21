// 鞋服行业模块 — ORM模型
exports.models = [
  {
    _name: 'product_colors',
    _description: '颜色管理',
    _rec_name: 'name',
    _fields: {
      name:    { type: 'char', label: '颜色名', required: true },
      hex_code:{ type: 'char', label: '色值', maxLength: 7 },
    },
  },
  {
    _name: 'product_sizes',
    _description: '尺码管理',
    _rec_name: 'name',
    _fields: {
      name:          { type: 'char', label: '尺码', required: true },
      size_category: { type: 'selection', label: '类别', selection: [{label:'服装',value:'clothing'},{label:'鞋类',value:'shoe'}] },
      sortOrder:     { type: 'integer', label: '排序' },
    },
  },
  {
    _name: 'product_styles',
    _description: '款号管理',
    _rec_name: 'name',
    _fields: {
      style_no: { type: 'char', label: '款号', required: true },
      name:     { type: 'char', label: '名称', required: true },
      gender:   { type: 'selection', label: '性别', selection: [{label:'男',value:'male'},{label:'女',value:'female'},{label:'中性',value:'unisex'}] },
      season:   { type: 'selection', label: '季节', selection: [{label:'春',value:'spring'},{label:'夏',value:'summer'},{label:'秋',value:'autumn'},{label:'冬',value:'winter'}] },
      year:     { type: 'integer', label: '年份' },
    },
  },
  {
    _name: 'product_color_size_matrix',
    _description: '款色码矩阵',
    _fields: {
      style_id: { type: 'char', label: '款号ID', index: true },
      color_id: { type: 'char', label: '颜色ID', index: true },
      size_id:  { type: 'char', label: '尺码ID', index: true },
      sku_code: { type: 'char', label: 'SKU码' },
      qty:      { type: 'integer', label: '库存量', default: 0 },
    },
  },
  {
    _name: 'product_boms',
    _description: 'BOM物料清单',
    _rec_name: 'name',
    _fields: {
      product_id: { type: 'char', label: '产品ID', index: true },
      name:       { type: 'char', label: 'BOM名称', required: true },
      quantity:   { type: 'float', label: '成品数量', default: 1 },
    },
  },
  {
    _name: 'product_bom_items',
    _description: 'BOM物料明细',
    _fields: {
      bom_id:        { type: 'char', label: 'BOM ID', index: true },
      material_code: { type: 'char', label: '物料编码' },
      material_name: { type: 'char', label: '物料名称' },
      quantity:      { type: 'float', label: '用量' },
      unit:          { type: 'char', label: '单位' },
    },
  },
];
