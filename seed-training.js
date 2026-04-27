// Seed training data
const db = require('better-sqlite3')('D:/feida/data/ehr.db');
const now = new Date().toISOString();

// Get employee data for records
const employees = db.prepare('SELECT id, name, employeeId, department FROM employees LIMIT 20').all();
console.log(`Found ${employees.length} employees`);

// Clear existing training data
['training_plans', 'training_courses', 'training_classes', 'training_records', 'assessment_templates'].forEach(t => {
  db.prepare(`DELETE FROM ${t}`).run();
  console.log(`Cleared ${t}`);
});

const insert = (table, obj) => {
  const keys = Object.keys(obj);
  const vals = Object.values(obj);
  db.prepare(`INSERT OR REPLACE INTO ${table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`).run(...vals);
};

// Training plans
const plans = [
  { id: 'tp1', title: '2025年度技术培训计划', department: '研发部', trainer: '张老师', targetEmployees: '["工程师","架构师"]', startDate: '2025-01-01', endDate: '2025-12-31', location: '公司内', status: 'ongoing', content: '全年技术能力提升培训', cost: 50000, participants: 30, createdAt: now },
  { id: 'tp2', title: '新员工入职培训计划', department: '全部', trainer: '李老师', targetEmployees: '["新员工"]', startDate: '2025-03-01', endDate: '2025-03-15', location: 'B栋培训室', status: 'ongoing', content: '2025年第一季度入职培训', cost: 20000, participants: 15, createdAt: now },
  { id: 'tp3', title: '管理能力提升外训', department: '管理层', trainer: '王经理', targetEmployees: '["部门经理"]', startDate: '2025-04-01', endDate: '2025-06-30', location: '外部培训机构', status: 'approved', content: '外部管理课程培训', cost: 80000, participants: 8, createdAt: now },
  { id: 'tp4', title: '合规在线学习计划', department: '全部', trainer: '赵合规', targetEmployees: '["全员"]', startDate: '2025-01-01', endDate: '2025-06-30', location: '在线', status: 'ongoing', content: '信息安全与合规培训', cost: 5000, participants: 100, createdAt: now },
  { id: 'tp5', title: '安全生产培训计划', department: '生产部', trainer: '刘安全', targetEmployees: '["全员"]', startDate: '2025-05-01', endDate: '2025-05-31', location: 'A栋大会议室', status: 'draft', content: '年度安全生产培训', cost: 15000, participants: 0, createdAt: now },
];
plans.forEach(p => insert('training_plans', p));
console.log(`Seeded ${plans.length} training_plans`);

// Training courses (add instructor field is not in DB, so we use description to embed it)
const courses = [
  { id: 'tc1', title: 'React高级进阶', category: 'technical', type: 'video', url: '', duration: 2400, description: '深入学习React Hooks、Redux、性能优化 | 讲师：张工', isRequired: 1, isActive: 1, viewCount: 45, createdAt: now },
  { id: 'tc2', title: 'TypeScript最佳实践', category: 'technical', type: 'video', url: '', duration: 1800, description: 'TypeScript类型系统、工程化实践 | 讲师：李工', isRequired: 1, isActive: 1, viewCount: 38, createdAt: now },
  { id: 'tc3', title: '新员工入职培训课程', category: 'onboarding', type: 'video', url: '', duration: 480, description: '公司文化、规章制度、业务介绍 | 讲师：HR部门', isRequired: 1, isActive: 1, viewCount: 20, createdAt: now },
  { id: 'tc4', title: '信息安全与数据合规', category: 'compliance', type: 'document', url: '', duration: 1200, description: '信息安全意识、GDPR合规、数据保护 | 讲师：安全部', isRequired: 1, isActive: 1, viewCount: 100, createdAt: now },
  { id: 'tc5', title: '敏捷项目管理', category: 'management', type: 'live', url: '', duration: 3600, description: 'Scrum、看板、敏捷实践 | 讲师：王经理', isRequired: 0, isActive: 1, viewCount: 25, createdAt: now },
  { id: 'tc6', title: '沟通与协作技巧', category: 'general', type: 'video', url: '', duration: 900, description: '职场沟通、团队协作、时间管理 | 讲师：刘老师', isRequired: 0, isActive: 1, viewCount: 55, createdAt: now },
  { id: 'tc7', title: '产品设计与用户体验', category: 'technical', type: 'video', url: '', duration: 2100, description: '用户研究、交互设计、原型工具 | 讲师：陈产品', isRequired: 0, isActive: 0, viewCount: 20, createdAt: now },
];
courses.forEach(c => insert('training_courses', c));
console.log(`Seeded ${courses.length} training_courses`);

// Training classes
const classes = [
  { id: 'tcl1', name: 'React进阶实战班', planId: 'tp1', instructor: '张工', startDate: '2025-03-01', endDate: '2025-03-15', location: 'A栋302会议室', capacity: 30, enrolledCount: 25, status: 'completed', qrCode: 'class-001', description: 'React高级进阶线下实战', createdAt: now },
  { id: 'tcl2', name: '第一期入职培训班', planId: 'tp2', instructor: '李老师', startDate: '2025-03-10', endDate: '2025-03-14', location: 'B栋培训室', capacity: 20, enrolledCount: 18, status: 'ongoing', qrCode: 'class-002', description: '新员工入职培训', createdAt: now },
  { id: 'tcl3', name: 'TypeScript实战工作坊', planId: 'tp1', instructor: '李工', startDate: '2025-04-15', endDate: '2025-04-17', location: 'A栋301会议室', capacity: 25, enrolledCount: 15, status: 'registering', qrCode: null, description: 'TypeScript项目实战', createdAt: now },
  { id: 'tcl4', name: '管理能力提升班', planId: 'tp3', instructor: '外部讲师', startDate: '2025-04-20', endDate: '2025-04-22', location: '外部培训机构', capacity: 15, enrolledCount: 8, status: 'registering', qrCode: null, description: '外部管理课程', createdAt: now },
];
classes.forEach(c => insert('training_classes', c));
console.log(`Seeded ${classes.length} training_classes`);

// Training records
const courseNames = ['React高级进阶', 'TypeScript最佳实践', '新员工入职培训课程', '信息安全与数据合规', '沟通与协作技巧'];
const courseIds = ['tc1', 'tc2', 'tc3', 'tc4', 'tc6'];
const trainingTypes = ['internal', 'external', 'online'];
const scores = [85, 90, 78, 92, 88, 76, 95, 83, 91, 87];
let recordCount = 0;
employees.forEach((emp, i) => {
  const ci = i % 5;
  const score = scores[i % scores.length];
  const passed = score >= 60 ? 1 : 0;
  insert('training_records', {
    id: `tr${i + 1}`,
    employeeId: emp.employeeId || emp.id,
    employeeName: emp.name,
    trainingPlanId: plans[i % plans.length].id,
    courseId: courseIds[ci],
    trainingType: trainingTypes[i % 3],
    trainingDate: `2025-0${Math.floor(i / 5) + 1}-${String((i * 3 % 28) + 1).padStart(2, '0')}`,
    duration: [4, 8, 16, 24, 40][i % 5],
    score: score,
    passed: passed,
    certificateNo: passed ? `CERT-${String(i + 1).padStart(4, '0')}` : null,
    createdAt: now,
  });
  recordCount++;
});
console.log(`Seeded ${recordCount} training_records`);

// Assessment templates
const templates = [
  {
    id: 'at1', name: '技术课程评估表', applicableCourse: 'React高级进阶',
    questionTypes: '["single","multiple","short"]', totalScore: 100, passingScore: 60, isActive: 1,
    questions: JSON.stringify([
      { id: 'q1', type: 'single', question: 'React中的虚拟DOM是什么？', options: ['一个真实的DOM对象', '一个JavaScript对象', '一个HTML文件', '一个CSS选择器'], score: 20 },
      { id: 'q2', type: 'multiple', question: '哪些是React Hooks？', options: ['useState', 'useEffect', 'useRouter', 'useCallback'], score: 20 },
      { id: 'q3', type: 'short', question: '请简述useEffect的使用场景。', score: 60 },
    ]),
    createdAt: now,
  },
  {
    id: 'at2', name: '入职培训评估表', applicableCourse: '新员工入职培训课程',
    questionTypes: '["single","rating"]', totalScore: 100, passingScore: 60, isActive: 1,
    questions: JSON.stringify([
      { id: 'q1', type: 'single', question: '公司的核心价值观是什么？', options: ['创新', '诚信', '共赢', '以上全是'], score: 30 },
      { id: 'q2', type: 'rating', question: '对本次培训的整体满意度评分', score: 70 },
    ]),
    createdAt: now,
  },
  {
    id: 'at3', name: '合规培训评估表', applicableCourse: '信息安全与数据合规',
    questionTypes: '["single","multiple"]', totalScore: 100, passingScore: 70, isActive: 1,
    questions: JSON.stringify([
      { id: 'q1', type: 'single', question: '个人信息保护法的实施日期？', options: ['2021年1月1日', '2021年11月1日', '2022年1月1日', '2020年12月1日'], score: 50 },
      { id: 'q2', type: 'multiple', question: '以下哪些属于个人敏感信息？', options: ['身份证号', '银行卡号', '工作邮箱', '家庭住址'], score: 50 },
    ]),
    createdAt: now,
  },
];
templates.forEach(t => insert('assessment_templates', t));
console.log(`Seeded ${templates.length} assessment_templates`);

db.close();
console.log('\nDone! All training data seeded.');
