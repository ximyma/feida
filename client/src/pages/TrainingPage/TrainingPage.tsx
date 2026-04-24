import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, Popconfirm, message, Tabs, Statistic, Row, Col,
  Divider, Upload, Progress, Steps, InputNumber, Textarea, Descriptions, Alert
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined,
  DownloadOutlined, SearchOutlined, PlayCircleOutlined, VideoCameraOutlined,
  FileTextOutlined, TeamOutlined, BarChartOutlined, QrcodeOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  BookOutlined, CalendarOutlined, StarOutlined, TrophyOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { confirm } = Modal;

// ============ 类型定义 ============
interface TrainingPlan {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'online';
  responsible: string;
  budget: number;
  startDate: string;
  endDate: string;
  targetDept: string;
  targetPosition: string;
  courseIds: string[];
  status: 'draft' | 'approved' | 'ongoing' | 'completed' | 'cancelled';
  progress: number;
  enrolledCount: number;
  description?: string;
}

interface OnlineCourse {
  id: string;
  title: string;
  category: 'technical' | 'management' | 'general' | 'compliance';
  instructor: string;
  duration: number;
  courseType: 'video' | 'document' | 'live';
  description: string;
  videoUrl?: string;
  enrolledCount: number;
  completedCount: number;
  completionRate: number;
  isActive: number;
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  duration: number;
  location: string;
  capacity: number;
  enrolledCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  description?: string;
}

interface TrainingClass {
  id: string;
  name: string;
  planId?: string;
  instructor: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  enrolledCount: number;
  status: 'registering' | 'ongoing' | 'completed' | 'cancelled';
  hasQRCode: boolean;
  qrCodeData?: string;
  description?: string;
}

interface TrainingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  courseId: string;
  courseName: string;
  trainingDate: string;
  hours: number;
  score?: number;
  evaluation?: string;
  source: 'class' | 'import' | 'manual';
  status: 'completed' | 'in_progress' | 'failed';
}

interface AssessmentTemplate {
  id: string;
  name: string;
  applicableCourse: string;
  questionTypes: string[];
  totalScore: number;
  passingScore: number;
  questions: AssessmentQuestion[];
  isActive: number;
}

interface AssessmentQuestion {
  id: string;
  type: 'single' | 'multiple' | 'short' | 'rating';
  question: string;
  options?: string[];
  score: number;
}

interface AssessmentResult {
  id: string;
  templateId: string;
  templateName: string;
  employeeId: string;
  employeeName: string;
  classId?: string;
  score: number;
  passed: boolean;
  completedAt: string;
  answers?: Record<string, string>;
}

const planTypeMap: Record<string, { label: string; color: string }> = {
  internal: { label: '内部培训', color: 'blue' },
  external: { label: '外训', color: 'purple' },
  online: { label: '在线学习', color: 'cyan' },
};

const planStatusMap: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  approved: { label: '审批中', color: 'orange' },
  ongoing: { label: '进行中', color: 'green' },
  completed: { label: '已完成', color: 'blue' },
  cancelled: { label: '已取消', color: 'red' },
};

const courseCategoryMap: Record<string, { label: string; color: string }> = {
  technical: { label: '技术培训', color: 'blue' },
  management: { label: '管理培训', color: 'purple' },
  general: { label: '通用培训', color: 'green' },
  compliance: { label: '合规培训', color: 'orange' },
  onboarding: { label: '入职培训', color: 'cyan' },
  safety: { label: '安全培训', color: 'red' },
};

const classStatusMap: Record<string, { label: string; color: string }> = {
  registering: { label: '报名中', color: 'blue' },
  ongoing: { label: '进行中', color: 'green' },
  completed: { label: '已结束', color: 'default' },
  cancelled: { label: '已取消', color: 'red' },
};

const recordStatusMap: Record<string, { label: string; color: string }> = {
  completed: { label: '已完成', color: 'green' },
  in_progress: { label: '进行中', color: 'blue' },
  failed: { label: '未通过', color: 'red' },
};

const questionTypeMap: Record<string, string> = {
  single: '单选题', multiple: '多选题', short: '简答题', rating: '评分题'
};

// ============ 模拟数据 ============
const generateMockPlans = (): TrainingPlan[] => [
  { id: '1', name: '2025年度技术培训计划', type: 'internal', responsible: '张老师', budget: 50000, startDate: '2025-01-01', endDate: '2025-12-31', targetDept: '研发部', targetPosition: '工程师', courseIds: ['1', '2'], status: 'ongoing', progress: 45, enrolledCount: 30, description: '全年技术能力提升培训' },
  { id: '2', name: '新员工入职培训计划', type: 'internal', responsible: '李老师', budget: 20000, startDate: '2025-03-01', endDate: '2025-03-15', targetDept: '全部', targetPosition: '新员工', courseIds: ['3'], status: 'ongoing', progress: 80, enrolledCount: 15, description: '2025年第一季度入职培训' },
  { id: '3', name: '管理能力提升外训', type: 'external', responsible: '王经理', budget: 80000, startDate: '2025-04-01', endDate: '2025-06-30', targetDept: '管理层', targetPosition: '部门经理', courseIds: [], status: 'approved', progress: 0, enrolledCount: 8, description: '外部管理课程培训' },
  { id: '4', name: '合规在线学习计划', type: 'online', responsible: '赵合规', budget: 5000, startDate: '2025-01-01', endDate: '2025-06-30', targetDept: '全部', targetPosition: '全员', courseIds: ['4'], status: 'ongoing', progress: 60, enrolledCount: 100, description: '信息安全与合规培训' },
  { id: '5', name: '安全生产培训计划', type: 'internal', responsible: '刘安全', budget: 15000, startDate: '2025-05-01', endDate: '2025-05-31', targetDept: '生产部', targetPosition: '全员', courseIds: [], status: 'draft', progress: 0, enrolledCount: 0, description: '年度安全生产培训' },
];

const generateMockCourses = (): OnlineCourse[] => [
  { id: '1', title: 'React高级进阶', category: 'technical', instructor: '张工', duration: 2400, courseType: 'video', description: '深入学习ReactHooks、Redux、性能优化', enrolledCount: 45, completedCount: 30, completionRate: 67, isActive: 1, createdAt: '2025-01-10' },
  { id: '2', title: 'TypeScript最佳实践', category: 'technical', instructor: '李工', duration: 1800, courseType: 'video', description: 'TypeScript类型系统、工程化实践', enrolledCount: 38, completedCount: 25, completionRate: 66, isActive: 1, createdAt: '2025-01-15' },
  { id: '3', title: '新员工入职培训课程', category: 'onboarding', instructor: 'HR部门', duration: 480, courseType: 'video', description: '公司文化、规章制度、业务介绍', enrolledCount: 20, completedCount: 18, completionRate: 90, isActive: 1, createdAt: '2025-02-01' },
  { id: '4', title: '信息安全与数据合规', category: 'compliance', instructor: '安全部', duration: 1200, courseType: 'document', description: '信息安全意识、GDPR合规、数据保护', enrolledCount: 100, completedCount: 65, completionRate: 65, isActive: 1, createdAt: '2025-01-05' },
  { id: '5', title: '敏捷项目管理', category: 'management', instructor: '王经理', duration: 3600, courseType: 'live', description: 'Scrum、看板、敏捷实践', enrolledCount: 25, completedCount: 0, completionRate: 0, isActive: 1, createdAt: '2025-03-01' },
  { id: '6', title: '沟通与协作技巧', category: 'general', instructor: '刘老师', duration: 900, courseType: 'video', description: '职场沟通、团队协作、时间管理', enrolledCount: 55, completedCount: 40, completionRate: 73, isActive: 1, createdAt: '2025-02-10' },
  { id: '7', title: '产品设计与用户体验', category: 'technical', instructor: '陈产品', duration: 2100, courseType: 'video', description: '用户研究、交互设计、原型工具', enrolledCount: 20, completedCount: 15, completionRate: 75, isActive: 0, createdAt: '2025-02-20' },
];

const generateMockClasses = (): TrainingClass[] => [
  { id: '1', name: 'React进阶实战班', planId: '1', instructor: '张工', startDate: '2025-03-01', endDate: '2025-03-15', location: 'A栋302会议室', capacity: 30, enrolledCount: 25, status: 'completed', hasQRCode: true, qrCodeData: 'class-001', description: 'React高级进阶线下实战' },
  { id: '2', name: '第一期入职培训班', planId: '2', instructor: '李老师', startDate: '2025-03-10', endDate: '2025-03-14', location: 'B栋培训室', capacity: 20, enrolledCount: 18, status: 'ongoing', hasQRCode: true, qrCodeData: 'class-002', description: '新员工入职培训' },
  { id: '3', name: 'TypeScript实战工作坊', planId: '1', instructor: '李工', startDate: '2025-04-15', endDate: '2025-04-17', location: 'A栋301会议室', capacity: 25, enrolledCount: 15, status: 'registering', hasQRCode: false, description: 'TypeScript项目实战' },
  { id: '4', name: '管理能力提升班', planId: '3', instructor: '外部讲师', startDate: '2025-04-20', endDate: '2025-04-22', location: '外部培训机构', capacity: 15, enrolledCount: 8, status: 'registering', hasQRCode: false, description: '外部管理课程' },
];

const generateMockRecords = (): TrainingRecord[] => {
  const names = ['张伟', '李娜', '王芳', '刘洋', '陈明', '杨丽', '赵强', '黄敏', '周杰', '吴婷'];
  const depts = ['研发部', '市场部', '财务部', '人力资源部', '行政部'];
  const courses = ['React高级进阶', 'TypeScript最佳实践', '新员工入职培训', '信息安全与数据合规', '沟通与协作技巧'];
  const sources: TrainingRecord['source'][] = ['class', 'import', 'manual'];
  const statuses: TrainingRecord['status'][] = ['completed', 'in_progress', 'failed'];
  return names.map((name, i) => ({
    id: String(i + 1),
    employeeId: `EMP${String(1001 + i).padStart(4, '0')}`,
    employeeName: name,
    department: depts[i % depts.length],
    courseId: String((i % 5) + 1),
    courseName: courses[i % courses.length],
    trainingDate: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString().slice(0, 10),
    hours: [4, 8, 16, 24, 40][i % 5],
    score: i % 4 !== 2 ? [85, 90, 78, 92, 88, 76, 95, 83, 91, 87][i % 10] : undefined,
    evaluation: i % 3 === 0 ? '表现优秀' : i % 3 === 1 ? '学习认真' : undefined,
    source: sources[i % sources.length],
    status: statuses[i % statuses.length],
  }));
};

const generateMockTemplates = (): AssessmentTemplate[] => [
  { id: '1', name: '技术课程评估表', applicableCourse: 'React高级进阶', questionTypes: ['single', 'multiple', 'short'], totalScore: 100, passingScore: 60, isActive: 1, questions: [
    { id: 'q1', type: 'single', question: 'React中的虚拟DOM是什么？', options: ['一个真实的DOM对象', '一个JavaScript对象', '一个HTML文件', '一个CSS选择器'], score: 20 },
    { id: 'q2', type: 'multiple', question: '哪些是React Hooks？', options: ['useState', 'useEffect', 'useRouter', 'useCallback'], score: 20 },
    { id: 'q3', type: 'short', question: '请简述useEffect的使用场景。', score: 60 },
  ]},
  { id: '2', name: '入职培训评估表', applicableCourse: '新员工入职培训课程', questionTypes: ['single', 'rating'], totalScore: 100, passingScore: 60, isActive: 1, questions: [
    { id: 'q1', type: 'single', question: '公司的核心价值观是什么？', options: ['创新', '诚信', '共赢', '以上全是'], score: 30 },
    { id: 'q2', type: 'rating', question: '对本次培训的整体满意度评分', score: 70 },
  ]},
];

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<string>('plan');
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [courses, setCourses] = useState<OnlineCourse[]>([]);
  const [classes, setClasses] = useState<TrainingClass[]>([]);
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [planModal, setPlanModal] = useState(false);
  const [courseModal, setCourseModal] = useState(false);
  const [classModal, setClassModal] = useState(false);
  const [recordModal, setRecordModal] = useState(false);
  const [templateModal, setTemplateModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<TrainingClass | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<OnlineCourse | null>(null);
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);
  const [editingCourse, setEditingCourse] = useState<OnlineCourse | null>(null);
  const [editingClass, setEditingClass] = useState<TrainingClass | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [form] = Form.useForm();
  const [courseForm] = Form.useForm();
  const [classForm] = Form.useForm();
  const [recordForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [planRes, courseRes, classRes, recordRes, templateRes] = await Promise.allSettled([
          fetch('/api/training_plans'), fetch('/api/training_courses'),
          fetch('/api/training_classes'), fetch('/api/training_records'),
          fetch('/api/assessment_templates'),
        ]);
        let [p, c, cl, r, t] = [[], [], [], [], []];
        if (planRes.status === 'fulfilled' && planRes.value.ok) { const j = await planRes.value.json(); if (Array.isArray(j)) p = j; }
        if (courseRes.status === 'fulfilled' && courseRes.value.ok) { const j = await courseRes.value.json(); if (Array.isArray(j)) c = j; }
        if (classRes.status === 'fulfilled' && classRes.value.ok) { const j = await classRes.value.json(); if (Array.isArray(j)) cl = j; }
        if (recordRes.status === 'fulfilled' && recordRes.value.ok) { const j = await recordRes.value.json(); if (Array.isArray(j)) r = j; }
        if (templateRes.status === 'fulfilled' && templateRes.value.ok) { const j = await templateRes.value.json(); if (Array.isArray(j)) t = j; }
        if (p.length === 0) p = generateMockPlans();
        if (c.length === 0) c = generateMockCourses();
        if (cl.length === 0) cl = generateMockClasses();
        if (r.length === 0) r = generateMockRecords();
        if (t.length === 0) t = generateMockTemplates();
        setPlans(p); setCourses(c); setClasses(cl); setRecords(r); setTemplates(t);
      } catch {
        setPlans(generateMockPlans()); setCourses(generateMockCourses());
        setClasses(generateMockClasses()); setRecords(generateMockRecords()); setTemplates(generateMockTemplates());
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const stats = {
    totalPlans: plans.length,
    ongoingPlans: plans.filter(p => p.status === 'ongoing').length,
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.isActive).length,
    totalClasses: classes.length,
    totalRecords: records.length,
    completedRecords: records.filter(r => r.status === 'completed').length,
    averageScore: records.filter(r => r.score).reduce((s, r, _, a) => s + (r.score || 0) / (a.length || 1), 0),
  };

  // 培训计划
  const openPlanModal = (plan?: TrainingPlan) => {
    setEditingPlan(plan || null);
    if (plan) form.setFieldsValue(plan); else form.resetFields();
    setPlanModal(true);
  };

  const savePlan = async () => {
    try {
      const values = await form.validateFields();
      if (editingPlan) {
        setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...values } : p));
        messageApi.success('计划已更新');
      } else {
        setPlans(prev => [...prev, { ...values, id: String(Date.now()), progress: 0, enrolledCount: 0 } as TrainingPlan]);
        messageApi.success('计划已创建');
      }
      setPlanModal(false);
    } catch { /* 验证失败 */ }
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    messageApi.success('计划已删除');
  };

  // 在线课程
  const openCourseModal = (course?: OnlineCourse) => {
    setEditingCourse(course || null);
    if (course) courseForm.setFieldsValue(course); else courseForm.resetFields();
    setCourseModal(true);
  };

  const saveCourse = async () => {
    try {
      const values = await courseForm.validateFields();
      if (editingCourse) {
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...c, ...values } : c));
        messageApi.success('课程已更新');
      } else {
        setCourses(prev => [...prev, { ...values, id: String(Date.now()), enrolledCount: 0, completedCount: 0, completionRate: 0, createdAt: new Date().toISOString().slice(0, 10), isActive: 1 } as OnlineCourse]);
        messageApi.success('课程已创建');
      }
      setCourseModal(false);
    } catch { /* 验证失败 */ }
  };

  const toggleCourseActive = (course: OnlineCourse) => {
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, isActive: c.isActive ? 0 : 1 } : c));
    messageApi.success(course.isActive ? '课程已停用' : '课程已启用');
  };

  // 培训班
  const openClassModal = (cls?: TrainingClass) => {
    setEditingClass(cls || null);
    if (cls) classForm.setFieldsValue(cls); else { classForm.resetFields(); classForm.setFieldsValue({ startDate: new Date().toISOString().slice(0, 10) }); }
    setClassModal(true);
  };

  const saveClass = async () => {
    try {
      const values = await classForm.validateFields();
      if (editingClass) {
        setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, ...values } : c));
        messageApi.success('班级已更新');
      } else {
        setClasses(prev => [...prev, { ...values, id: String(Date.now()), enrolledCount: 0, hasQRCode: false } as TrainingClass]);
        messageApi.success('班级已创建');
      }
      setClassModal(false);
    } catch { /* 验证失败 */ }
  };

  const generateQR = (cls: TrainingClass) => {
    setSelectedClass(cls);
    setQrModal(true);
  };

  const handleClassAttendance = (cls: TrainingClass) => {
    confirm({
      title: '模拟扫码签到',
      content: `${cls.name} 的参训人员已扫码签到（模拟），共 ${cls.enrolledCount} 人。`,
      onOk() { messageApi.success(`已为 ${cls.name} 登记出勤`); },
    });
  };

  // 培训记录
  const openRecordModal = () => {
    recordForm.resetFields();
    setRecordModal(true);
  };

  const saveRecord = async () => {
    try {
      const values = await recordForm.validateFields();
      setRecords(prev => [...prev, { ...values, id: String(Date.now()), source: 'manual' as const, status: 'completed' as const }]);
      messageApi.success('培训记录已添加');
      setRecordModal(false);
    } catch { /* 验证失败 */ }
  };

  const handleBatchImport = () => {
    confirm({
      title: '批量导入培训记录',
      content: '请上传Excel文件（格式：工号,姓名,部门,课程名称,培训日期,学时,成绩）。系统将自动解析并导入记录。',
      onOk() { messageApi.success('已成功导入培训记录（模拟）'); },
    });
  };

  const exportRecords = () => {
    const csv = [
      ['工号', '姓名', '部门', '课程名称', '培训日期', '学时', '成绩', '评价', '来源', '状态'].join(','),
      ...records.map(r => [r.employeeId, r.employeeName, r.department, r.courseName, r.trainingDate, r.hours, r.score || '', r.evaluation || '', r.source, r.status].join(',')),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `培训记录_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url); messageApi.success('培训记录已导出');
  };

  // 评估模板
  const openTemplateModal = () => {
    setTemplateModal(true);
  };

  const tabs = [
    { key: 'plan', label: '培训计划', icon: <CalendarOutlined /> },
    { key: 'course', label: '在线课程', icon: <VideoCameraOutlined /> },
    { key: 'class', label: '培训班', icon: <TeamOutlined /> },
    { key: 'record', label: '培训记录', icon: <FileTextOutlined /> },
    { key: 'assessment', label: '评估管理', icon: <StarOutlined /> },
  ];

  // ============ 表格列定义 ============
  const planColumns = [
    { title: '计划名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 90, render: (v: string) => <Tag color={planTypeMap[v]?.color}>{planTypeMap[v]?.label}</Tag> },
    { title: '负责人', dataIndex: 'responsible', key: 'resp', width: 90 },
    { title: '预算', dataIndex: 'budget', key: 'budget', width: 90, render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: '时间', key: 'dates', width: 180, render: (_: any, r: TrainingPlan) => `${r.startDate} ~ ${r.endDate}` },
    { title: '目标', key: 'target', width: 130, render: (_: any, r: TrainingPlan) => `${r.targetDept} / ${r.targetPosition}` },
    { title: '进度', dataIndex: 'progress', key: 'progress', width: 120, render: (v: number) => <Progress percent={v} size="small" /> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={planStatusMap[v]?.color}>{planStatusMap[v]?.label}</Tag> },
    { title: '操作', key: 'action', width: 120, render: (_: any, r: TrainingPlan) => (
      <Space size="small">
        <Button size="small" type="link" onClick={() => openPlanModal(r)}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => deletePlan(r.id)}>
          <Button size="small" danger type="link">删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  const courseColumns = [
    { title: '课程名称', dataIndex: 'title', key: 'title', width: 180 },
    { title: '分类', dataIndex: 'category', key: 'cat', width: 100, render: (v: string) => <Tag color={courseCategoryMap[v]?.color}>{courseCategoryMap[v]?.label}</Tag> },
    { title: '讲师', dataIndex: 'instructor', key: 'instr', width: 90 },
    { title: '时长', dataIndex: 'duration', key: 'dur', width: 80, render: (v: number) => `${Math.round(v / 60)}h` },
    { title: '类型', dataIndex: 'courseType', key: 'type', width: 80, render: (v: string) => ({ video: '视频', document: '图文', live: '直播' }[v] || v) },
    { title: '学习人数', dataIndex: 'enrolledCount', key: 'enrolled', width: 90, render: (v: number) => `${v}人` },
    { title: '完成率', dataIndex: 'completionRate', key: 'rate', width: 100, render: (v: number) => <Progress percent={v} size="small" /> },
    { title: '状态', dataIndex: 'isActive', key: 'active', width: 70, render: (v: number) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag> },
    { title: '操作', key: 'action', width: 160, render: (_: any, r: OnlineCourse) => (
      <Space size="small">
        <Button size="small" type="link" onClick={() => { setSelectedCourse(r); setDetailModal(true); }}>详情</Button>
        <Button size="small" type="link" onClick={() => openCourseModal(r)}>编辑</Button>
        <Button size="small" type="link" onClick={() => toggleCourseActive(r)}>{r.isActive ? '停用' : '启用'}</Button>
      </Space>
    )},
  ];

  const classColumns = [
    { title: '班级名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '讲师', dataIndex: 'instructor', key: 'instr', width: 90 },
    { title: '时间', key: 'dates', width: 200, render: (_: any, r: TrainingClass) => `${r.startDate} ~ ${r.endDate}` },
    { title: '地点', dataIndex: 'location', key: 'loc', width: 160 },
    { title: '容量', dataIndex: 'capacity', key: 'cap', width: 70, render: (v: number, r: TrainingClass) => `${r.enrolledCount}/${v}` },
    { title: '签到码', key: 'qr', width: 80, render: (_: any, r: TrainingClass) => r.hasQRCode ? <Tag color="green">已生成</Tag> : <Tag>未生成</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={classStatusMap[v]?.color}>{classStatusMap[v]?.label}</Tag> },
    { title: '操作', key: 'action', width: 240, render: (_: any, r: TrainingClass) => (
      <Space size="small" wrap>
        {!r.hasQRCode && <Button size="small" icon={<QrcodeOutlined />} type="link" onClick={() => generateQR(r)}>生成签到码</Button>}
        {r.hasQRCode && <Button size="small" icon={<QrcodeOutlined />} type="link" onClick={() => generateQR(r)}>查看签到码</Button>}
        <Button size="small" type="link" onClick={() => handleClassAttendance(r)}>扫码签到</Button>
        <Button size="small" type="link" onClick={() => openClassModal(r)}>编辑</Button>
      </Space>
    )},
  ];

  const recordColumns = [
    { title: '工号', dataIndex: 'employeeId', key: 'id', width: 100 },
    { title: '姓名', dataIndex: 'employeeName', key: 'name', width: 90 },
    { title: '部门', dataIndex: 'department', key: 'dept', width: 110 },
    { title: '课程名称', dataIndex: 'courseName', key: 'course', width: 180 },
    { title: '培训日期', dataIndex: 'trainingDate', key: 'date', width: 110 },
    { title: '学时', dataIndex: 'hours', key: 'hours', width: 70, render: (v: number) => `${v}h` },
    { title: '成绩', dataIndex: 'score', key: 'score', width: 70, render: (v?: number) => v ? <Text type={v >= 90 ? 'success' : v >= 60 ? 'warning' : 'danger'}>{v}</Text> : '-' },
    { title: '评价', dataIndex: 'evaluation', key: 'eval', width: 100, render: (v?: string) => v || '-' },
    { title: '来源', dataIndex: 'source', key: 'source', width: 80, render: (v: string) => ({ class: '培训班', import: 'Excel导入', manual: '手工登记' }[v] || v) },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={recordStatusMap[v]?.color}>{recordStatusMap[v]?.label}</Tag> },
  ];

  const templateColumns = [
    { title: '模板名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '适用课程', dataIndex: 'applicableCourse', key: 'course', width: 180 },
    { title: '题型', dataIndex: 'questionTypes', key: 'types', width: 180, render: (v: string[]) => v?.map(t => questionTypeMap[t]).join(' / ') || '' },
    { title: '总分', dataIndex: 'totalScore', key: 'total', width: 80, render: (v: number) => `${v}分` },
    { title: '及格分', dataIndex: 'passingScore', key: 'pass', width: 80, render: (v: number) => `${v}分` },
    { title: '状态', dataIndex: 'isActive', key: 'active', width: 70, render: (v: number) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag> },
    { title: '操作', key: 'action', width: 100, render: () => (
      <Button size="small" type="link">编辑</Button>
    )},
  ];

  const filteredPlans = plans.filter(p => (!filterStatus || p.status === filterStatus) && (!searchText || p.name.includes(searchText)));
  const filteredCourses = courses.filter(c => (!filterCategory || c.category === filterCategory) && (!searchText || c.title.includes(searchText)));
  const filteredRecords = records.filter(r => (!searchText || r.employeeName.includes(searchText) || r.employeeId.includes(searchText) || r.courseName.includes(searchText)));

  return (
    <div className="p-6 space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">培训管理</h2><p className="text-sm text-muted-foreground">培训计划 · 在线课程 · 培训班 · 培训记录 · 评估管理</p></div>
      </div>

      <Row gutter={16}>
        <Col span={4}><Card size="small"><Statistic title="培训计划" value={stats.totalPlans} suffix="个" valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="进行中" value={stats.ongoingPlans} suffix="个" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="在线课程" value={stats.activeCourses} suffix="个" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="培训班" value={stats.totalClasses} suffix="期" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="培训记录" value={stats.totalRecords} suffix="条" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="平均成绩" value={stats.averageScore.toFixed(1)} suffix="分" valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{ marginBottom: 16 }} items={tabs} />

        {/* ========== Tab1: 培训计划 ========== */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Space>
                <Input placeholder="搜索计划名称" prefix={<SearchOutlined />} allowClear style={{ width: 200 }} onChange={e => setSearchText(e.target.value)} />
                <Select placeholder="按状态筛选" allowClear style={{ width: 120 }} value={filterStatus || undefined} onChange={v => setFilterStatus(v)}>
                  {Object.entries(planStatusMap).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
                </Select>
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openPlanModal()}>新建计划</Button>
            </div>
            <Table columns={planColumns} dataSource={filteredPlans} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
          </div>
        )}

        {/* ========== Tab2: 在线课程 ========== */}
        {activeTab === 'course' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Space>
                <Input placeholder="搜索课程名称" prefix={<SearchOutlined />} allowClear style={{ width: 200 }} onChange={e => setSearchText(e.target.value)} />
                <Select placeholder="按分类筛选" allowClear style={{ width: 140 }} value={filterCategory || undefined} onChange={v => setFilterCategory(v)}>
                  {Object.entries(courseCategoryMap).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
                </Select>
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openCourseModal()}>新建课程</Button>
            </div>
            <Row gutter={16}>
              {courses.filter(c => c.isActive).slice(0, 4).map(course => (
                <Col span={6} key={course.id}>
                  <Card size="small" hoverable>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag color={courseCategoryMap[course.category]?.color}>{courseCategoryMap[course.category]?.label}</Tag>
                      {course.courseType === 'video' && <VideoCameraOutlined />}
                      {course.courseType === 'live' && <PlayCircleOutlined />}
                    </div>
                    <Text strong className="block mb-1">{course.title}</Text>
                    <Text type="secondary" className="text-xs block mb-2">讲师：{course.instructor} | 时长：{Math.round(course.duration / 60)}h</Text>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <Text type="secondary">学习进度</Text><Text type="secondary">{course.completionRate}%</Text>
                      </div>
                      <Progress percent={course.completionRate} size="small" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <Text type="secondary">{course.enrolledCount}人学习</Text>
                      <Button size="small" type="link" onClick={() => { setSelectedCourse(course); setDetailModal(true); }}>详情</Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            <Table columns={courseColumns} dataSource={filteredCourses} rowKey="id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true }} size="small" scroll={{ x: 1000 }} />
          </div>
        )}

        {/* ========== Tab3: 培训班 ========== */}
        {activeTab === 'class' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Space>
                <Input placeholder="搜索班级名称" prefix={<SearchOutlined />} allowClear style={{ width: 200 }} onChange={e => setSearchText(e.target.value)} />
                <Select placeholder="按状态筛选" allowClear style={{ width: 120 }} value={filterStatus || undefined} onChange={v => setFilterStatus(v)}>
                  {Object.entries(classStatusMap).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
                </Select>
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openClassModal()}>新建培训班</Button>
            </div>
            <Alert message="培训班签到码：系统为每个班级生成唯一二维码，员工使用手机扫码即可自动登记出勤记录。" type="info" showIcon style={{ marginBottom: 8 }} />
            <Table columns={classColumns} dataSource={classes.filter(c => !searchText || c.name.includes(searchText))} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} size="small" scroll={{ x: 1100 }} />
          </div>
        )}

        {/* ========== Tab4: 培训记录 ========== */}
        {activeTab === 'record' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Space>
                <Input placeholder="搜索姓名/工号/课程" prefix={<SearchOutlined />} allowClear style={{ width: 220 }} onChange={e => setSearchText(e.target.value)} />
              </Space>
              <Space>
                <Button icon={<UploadOutlined />} onClick={handleBatchImport}>Excel导入</Button>
                <Button icon={<DownloadOutlined />} onClick={exportRecords}>导出记录</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={openRecordModal}>手工登记</Button>
              </Space>
            </div>
            <Table columns={recordColumns} dataSource={filteredRecords} rowKey="id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }} size="small" scroll={{ x: 1100 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}><Text strong>统计</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}><Text strong>{records.length}条</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}><Text strong>{records.reduce((s, r) => s + r.hours, 0)}学时</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}><Text strong>平均{stats.averageScore.toFixed(1)}分</Text></Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </div>
        )}

        {/* ========== Tab5: 评估管理 ========== */}
        {activeTab === 'assessment' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Text type="secondary">管理评估模板，可对培训班的学员发起评估考核。</Text>
              <Button type="primary" icon={<PlusOutlined />} onClick={openTemplateModal}>新建评估模板</Button>
            </div>
            <Table columns={templateColumns} dataSource={templates} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} size="small"
              expandable={{
                expandedRowRender: (record: AssessmentTemplate) => (
                  <div className="space-y-3 pl-4">
                    <Text strong>题目配置：</Text>
                    {record.questions.map((q, i) => (
                      <Card key={q.id} size="small" className="bg-gray-50">
                        <div className="flex items-start gap-2">
                          <Tag>{questionTypeMap[q.type]}</Tag>
                          <div className="flex-1">
                            <Text>{i + 1}. {q.question}</Text>
                            {q.options && <div className="mt-1 space-y-1">{q.options.map((opt, oi) => <div key={oi} className="text-sm text-muted-foreground">{String.fromCharCode(65 + oi)}. {opt}</div>)}</div>}
                            <Text type="secondary" className="text-xs mt-1">满分：{q.score}分</Text>
                          </div>
                        </div>
                      </Card>
                    ))}
                    <Text type="secondary">总分：{record.totalScore}分 | 及格分数：{record.passingScore}分</Text>
                  </div>
                ),
              }}
            />
            <Alert message="发起评估：选择培训班 → 选择学员 → 发送评估邀请 → 学员在线作答 → 自动计算成绩。" type="info" showIcon />
          </div>
        )}
      </Card>

      {/* ========== 培训计划弹窗 ========== */}
      <Modal title={editingPlan ? '编辑培训计划' : '新建培训计划'} open={planModal} onOk={savePlan} onCancel={() => setPlanModal(false)} width={640} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="计划名称" rules={[{ required: true }]}><Input placeholder="如：2025年度技术培训计划" /></Form.Item></Col>
            <Col span={12}><Form.Item name="type" label="计划类型" rules={[{ required: true }]}><Select>{Object.entries(planTypeMap).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="responsible" label="负责人" rules={[{ required: true }]}><Input placeholder="负责人姓名" /></Form.Item></Col>
            <Col span={12}><Form.Item name="budget" label="预算（元）" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="startDate" label="开始日期" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="endDate" label="结束日期" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="targetDept" label="目标部门"><Input placeholder="如：研发部" /></Form.Item></Col>
            <Col span={12}><Form.Item name="targetPosition" label="目标岗位"><Input placeholder="如：工程师" /></Form.Item></Col>
            <Col span={24}><Form.Item name="description" label="计划说明"><TextArea rows={3} placeholder="培训计划详细说明" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* ========== 在线课程弹窗 ========== */}
      <Modal title={editingCourse ? '编辑课程' : '新建在线课程'} open={courseModal} onOk={saveCourse} onCancel={() => setCourseModal(false)} width={600} okText="保存" cancelText="取消">
        <Form form={courseForm} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="title" label="课程名称" rules={[{ required: true }]}><Input placeholder="课程名称" /></Form.Item></Col>
            <Col span={12}><Form.Item name="category" label="课程分类" rules={[{ required: true }]}><Select>{Object.entries(courseCategoryMap).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="instructor" label="讲师" rules={[{ required: true }]}><Input placeholder="讲师姓名" /></Form.Item></Col>
            <Col span={12}><Form.Item name="duration" label="课程时长（分钟）" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="courseType" label="课程类型" rules={[{ required: true }]}><Select><Option value="video">视频课程</Option><Option value="document">图文课程</Option><Option value="live">直播课程</Option></Select></Form.Item></Col>
            <Col span={24}><Form.Item name="description" label="课程简介"><TextArea rows={3} placeholder="课程详细介绍" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* ========== 培训班弹窗 ========== */}
      <Modal title={editingClass ? '编辑培训班' : '新建培训班'} open={classModal} onOk={saveClass} onCancel={() => setClassModal(false)} width={560} okText="保存" cancelText="取消">
        <Form form={classForm} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="班级名称" rules={[{ required: true }]}><Input placeholder="班级名称" /></Form.Item></Col>
            <Col span={12}><Form.Item name="instructor" label="讲师" rules={[{ required: true }]}><Input placeholder="讲师姓名" /></Form.Item></Col>
            <Col span={12}><Form.Item name="startDate" label="开始日期" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="endDate" label="结束日期" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="培训地点" rules={[{ required: true }]}><Input placeholder="会议室或地点" /></Form.Item></Col>
            <Col span={12}><Form.Item name="capacity" label="容量（人）" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={24}><Form.Item name="description" label="班级说明"><TextArea rows={2} placeholder="培训内容说明" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* ========== 培训记录弹窗 ========== */}
      <Modal title="手工登记培训记录" open={recordModal} onOk={saveRecord} onCancel={() => setRecordModal(false)} width={520} okText="保存" cancelText="取消">
        <Form form={recordForm} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="employeeId" label="工号" rules={[{ required: true }]}><Input placeholder="员工工号" /></Form.Item></Col>
            <Col span={12}><Form.Item name="employeeName" label="姓名" rules={[{ required: true }]}><Input placeholder="员工姓名" /></Form.Item></Col>
            <Col span={12}><Form.Item name="department" label="部门" rules={[{ required: true }]}><Input placeholder="所属部门" /></Form.Item></Col>
            <Col span={12}><Form.Item name="courseName" label="课程名称" rules={[{ required: true }]}><Input placeholder="培训课程名称" /></Form.Item></Col>
            <Col span={12}><Form.Item name="trainingDate" label="培训日期" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="hours" label="学时" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} addonAfter="小时" /></Form.Item></Col>
            <Col span={12}><Form.Item name="score" label="成绩"><InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="成绩（可选）" /></Form.Item></Col>
            <Col span={24}><Form.Item name="evaluation" label="培训评价"><TextArea rows={2} placeholder="培训评价（可选）" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* ========== 课程详情弹窗 ========== */}
      <Modal title={selectedCourse ? `课程详情 - ${selectedCourse.title}` : ''} open={detailModal} onCancel={() => setDetailModal(false)} footer={null} width={680}>
        {selectedCourse && (
          <div className="space-y-4">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="课程名称">{selectedCourse.title}</Descriptions.Item>
              <Descriptions.Item label="课程分类"><Tag color={courseCategoryMap[selectedCourse.category]?.color}>{courseCategoryMap[selectedCourse.category]?.label}</Tag></Descriptions.Item>
              <Descriptions.Item label="讲师">{selectedCourse.instructor}</Descriptions.Item>
              <Descriptions.Item label="课程类型">{selectedCourse.courseType === 'video' ? '视频课程' : selectedCourse.courseType === 'document' ? '图文课程' : '直播课程'}</Descriptions.Item>
              <Descriptions.Item label="课程时长">{Math.round(selectedCourse.duration / 60)} 小时</Descriptions.Item>
              <Descriptions.Item label="创建日期">{selectedCourse.createdAt}</Descriptions.Item>
              <Descriptions.Item label="学习人数" span={2}>{selectedCourse.enrolledCount} 人</Descriptions.Item>
              <Descriptions.Item label="课程简介" span={2}>{selectedCourse.description}</Descriptions.Item>
            </Descriptions>
            <Divider>学习进度</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="完成率">
                  <Progress percent={selectedCourse.completionRate} />
                  <Text type="secondary">{selectedCourse.completedCount}/{selectedCourse.enrolledCount} 人已完成</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="视频断点（模拟）">
                  <Text type="secondary" className="text-sm">每个员工的学习进度：</Text>
                  {['张伟', '李娜', '王芳'].map((name, i) => (
                    <div key={name} className="mt-2">
                      <div className="flex justify-between text-xs mb-1"><Text>{name}</Text><Text type="secondary">{[75, 50, 100][i]}%</Text></div>
                      <Progress percent={[75, 50, 100][i]} size="small" />
                    </div>
                  ))}
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* ========== 签到二维码弹窗 ========== */}
      <Modal title={`签到二维码 - ${selectedClass?.name}`} open={qrModal} onCancel={() => setQrModal(false)} footer={null} width={400}>
        {selectedClass && (
          <div className="text-center space-y-4">
            <Alert message={`请让参训人员扫描下方二维码进行签到登记`} type="info" showIcon />
            <div className="bg-gray-100 rounded-xl p-8 mx-auto inline-block">
              {/* 模拟二维码（实际项目中可用 qrcode.react 或 qrcode.js 库生成） */}
              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 mx-auto">
                <div className="text-center">
                  <QrcodeOutlined style={{ fontSize: 64, color: '#1677ff' }} />
                  <Text type="secondary" className="block mt-2 text-xs">扫码签到</Text>
                </div>
              </div>
              <Text type="secondary" className="block mt-2 text-xs">{selectedClass.qrCodeData || `class-${selectedClass.id}`}</Text>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>班级：{selectedClass.name}</p>
              <p>时间：{selectedClass.startDate} ~ {selectedClass.endDate}</p>
              <p>地点：{selectedClass.location}</p>
              <p>容量：{selectedClass.enrolledCount}/{selectedClass.capacity}人</p>
            </div>
            <Button type="primary" icon={<DownloadOutlined />} block onClick={() => messageApi.success('二维码已保存（模拟）')}>
              保存签到码图片
            </Button>
          </div>
        )}
      </Modal>

      {/* ========== 评估模板弹窗 ========== */}
      <Modal title="新建评估模板" open={templateModal} onCancel={() => setTemplateModal(false)} footer={null} width={560}>
        <Alert message="评估模板功能正在完善中，敬请期待。" type="info" showIcon />
        <div className="mt-4 space-y-2">
          {templates.map(t => (
            <Card key={t.id} size="small">
              <div className="flex items-center justify-between">
                <div><Text strong>{t.name}</Text><Text type="secondary" className="ml-2">适用：{t.applicableCourse}</Text></div>
                <Tag color={t.isActive ? 'green' : 'default'}>{t.isActive ? '启用' : '停用'}</Tag>
              </div>
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  );
}
