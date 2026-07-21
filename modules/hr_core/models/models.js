// HR核心模块 — ORM模型定义
// 表名: employees, departments, positions, ranks

exports.models = [
  {
    _name: 'employees',
    _description: '员工档案',
    _order: 'id DESC',
    _rec_name: 'realName',
    _fields: {
      realName:    { type: 'char',  label: '姓名', required: true, index: true },
      phone:       { type: 'char',  label: '手机号', maxLength: 20 },
      email:       { type: 'char',  label: '邮箱' },
      gender:      { type: 'selection', label: '性别', selection: [{label:'男',value:'male'},{label:'女',value:'female'}] },
      birthDate:   { type: 'date',  label: '出生日期' },
      joinDate:    { type: 'date',  label: '入职日期' },
      deptId:      { type: 'char',  label: '所属部门', index: true },
      deptName:    { type: 'char',  label: '部门名称' },
      positionId:  { type: 'char',  label: '岗位' },
      positionName:{ type: 'char',  label: '岗位名称' },
      rankId:      { type: 'char',  label: '职级' },
      status:      { type: 'selection', label: '状态', selection: [{label:'在职',value:'active'},{label:'离职',value:'inactive'},{label:'试用',value:'probation'}], default: 'active' },
      baseSalary:  { type: 'float', label: '基本工资', groups: ['super_admin','hr_admin','hr_staff'] },
      idCard:      { type: 'char',  label: '身份证号', groups: ['super_admin','hr_admin'] },
      bankAccount: { type: 'char',  label: '银行账号', groups: ['super_admin','hr_admin','finance'] },
      remark:      { type: 'text',  label: '备注' },
    },
  },
  {
    _name: 'departments',
    _description: '组织架构',
    _rec_name: 'name',
    _fields: {
      name:      { type: 'char',  label: '名称', required: true },
      parentId:  { type: 'char',  label: '上级部门', index: true },
      sortOrder: { type: 'integer', label: '排序' },
      managerId: { type: 'char',  label: '负责人' },
    },
  },
  {
    _name: 'positions',
    _description: '岗位管理',
    _rec_name: 'name',
    _fields: {
      name:      { type: 'char',  label: '名称', required: true },
      deptId:    { type: 'char',  label: '所属部门' },
      sortOrder: { type: 'integer', label: '排序' },
    },
  },
  {
    _name: 'ranks',
    _description: '职级体系',
    _rec_name: 'name',
    _fields: {
      name:      { type: 'char',  label: '名称', required: true },
      level:     { type: 'integer', label: '级次' },
      minSalary: { type: 'float', label: '最低薪资' },
      maxSalary: { type: 'float', label: '最高薪资' },
    },
  },
];
