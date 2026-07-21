// 论坛模块 — ORM模型
exports.models = [
  {
    _name: 'forum_boards',
    _description: '论坛版块',
    _rec_name: 'name',
    _fields: {
      name:        { type: 'char', label: '名称', required: true },
      slug:        { type: 'char', label: 'URL别名' },
      description: { type: 'text', label: '描述' },
      sortOrder:   { type: 'integer', label: '排序' },
    },
  },
  {
    _name: 'forum_threads',
    _description: '论坛帖子',
    _rec_name: 'title',
    _fields: {
      title:       { type: 'char', label: '标题', required: true },
      content:     { type: 'text', label: '内容' },
      board_id:    { type: 'char', label: '版块', index: true },
      author_name: { type: 'char', label: '作者' },
      reply_count: { type: 'integer', label: '回复数', default: 0 },
      is_pinned:   { type: 'boolean', label: '置顶' },
      status:      { type: 'selection', label: '状态', default: 'active', selection: [{label:'活跃',value:'active'},{label:'关闭',value:'closed'}] },
    },
  },
  {
    _name: 'forum_replies',
    _description: '论坛回复',
    _fields: {
      thread_id:   { type: 'char', label: '帖子ID', index: true },
      content:     { type: 'text', label: '内容' },
      author_name: { type: 'char', label: '回复者' },
    },
  },
];
