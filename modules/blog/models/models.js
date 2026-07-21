// 博客模块 — ORM模型
exports.models = [
  {
    _name: 'blog_categories',
    _description: '博客分类',
    _rec_name: 'name',
    _fields: {
      name:        { type: 'char', label: '名称', required: true },
      slug:        { type: 'char', label: 'URL别名' },
      description: { type: 'text', label: '描述' },
      sortOrder:   { type: 'integer', label: '排序' },
    },
  },
  {
    _name: 'blog_posts',
    _description: '博客文章',
    _rec_name: 'title',
    _fields: {
      title:       { type: 'char', label: '标题', required: true },
      summary:     { type: 'text', label: '摘要' },
      content:     { type: 'text', label: '内容' },
      category_id: { type: 'char', label: '分类' },
      author_name: { type: 'char', label: '作者' },
      status:      { type: 'selection', label: '状态', default: 'draft',
                     selection: [{label:'草稿',value:'draft'},{label:'已发布',value:'published'}] },
      published_at:{ type: 'datetime', label: '发布时间' },
    },
  },
  {
    _name: 'blog_comments',
    _description: '博客评论',
    _fields: {
      post_id:     { type: 'char', label: '文章ID', index: true },
      author_name: { type: 'char', label: '评论者' },
      content:     { type: 'text', label: '内容' },
      status:      { type: 'selection', label: '状态', default: 'pending',
                     selection: [{label:'待审',value:'pending'},{label:'通过',value:'approved'}] },
    },
  },
];
