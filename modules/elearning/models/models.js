// 在线学习模块 — ORM模型
exports.models = [
  {
    _name: 'elearning_courses',
    _description: '在线课程',
    _rec_name: 'title',
    _fields: {
      title:            { type: 'char', label: '课程名', required: true },
      description:      { type: 'text', label: '描述' },
      instructor_name:  { type: 'char', label: '讲师' },
      difficulty:       { type: 'selection', label: '难度', selection: [{label:'初级',value:'beginner'},{label:'中级',value:'intermediate'},{label:'高级',value:'advanced'}] },
      duration_minutes: { type: 'integer', label: '时长(分)' },
      enrollment_count: { type: 'integer', label: '报名人数', default: 0 },
      status:           { type: 'selection', label: '状态', default: 'draft', selection: [{label:'草稿',value:'draft'},{label:'已发布',value:'published'}] },
    },
  },
  {
    _name: 'elearning_chapters',
    _description: '课程章节',
    _rec_name: 'title',
    _fields: {
      course_id:  { type: 'char', label: '课程ID', index: true },
      title:      { type: 'char', label: '标题', required: true },
      content:    { type: 'text', label: '内容' },
      sortOrder:  { type: 'integer', label: '排序' },
      type:       { type: 'selection', label: '类型', default: 'text', selection: [{label:'文本',value:'text'},{label:'视频',value:'video'},{label:'测验',value:'quiz'}] },
    },
  },
  {
    _name: 'elearning_quizzes',
    _description: '章节测验',
    _fields: {
      chapter_id: { type: 'char', label: '章节ID', index: true },
      question:   { type: 'text', label: '问题', required: true },
      options:    { type: 'text', label: '选项(JSON)' },
      answer:     { type: 'char', label: '正确答案' },
    },
  },
];
