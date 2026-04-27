import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select,
  Tag, Space, Popconfirm, message, Tabs, Statistic, Row, Col,
  Divider, Progress, InputNumber, Descriptions, Alert
} from 'antd';
import {
  PlusOutlined, DeleteOutlined,
  DownloadOutlined, SearchOutlined, PlayCircleOutlined, VideoCameraOutlined,
  FileTextOutlined, TeamOutlined,
  QrcodeOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  BookOutlined, CalendarOutlined, StarOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

// ============ 类型定义（对齐数据库字段） ============
interface TrainingPlan {
  id: string;
  title: string;          // DB: title (前端旧名 name)
  department: string;
  trainer: string;        // DB: trainer (前端旧名 responsible)
  targetEmployees: string;// DB: JSON array string
  startDate: string;
  endDate: string;
  location: string;
  status: string;         // draft | approved | ongoing | completed | cancelled
  content: string;        // DB: content (前端旧名 description)
  cost: number;           // DB: cost (前端旧名 budget)
  participants: number;   // DB: participants (前端旧名 enrolledCount)
  createdAt: string;
}

interface TrainingCourse {
  id: string;
  title: string;
  category: string;
  type: string;           // video | document | live
  url: string;
  duration: number;       // 分钟
  description: string;    // 包含讲师信息: "课程介绍 | 讲师：XXX"
  isRequired: number;
  isActive: number;
  viewCount: number;
  createdAt: string;
}

interface TrainingClass {
  id: string;
  name: string;
  planId: string;
  instructor: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  enrolledCount: number;
  status: string;         // registering | ongoing | completed | cancelled
  qrCode: string | null;
  description: string;
  createdAt: string;
}

interface TrainingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  trainingPlanId: string;
  courseId: string;
  trainingType: string;   // internal | external | online
  trainingDate: string;
  duration: number;       // 学时
  score: number | null;
  passed: number;         // 0 | 1
  certificateNo: string | null;
  createdAt: string;
}

interface AssessmentTemplate {
  id: string;
  name: string;
  applicableCourse: string;
  questionTypes: string;  // JSON array string
  totalScore: number;
  passingScore: number;
  isActive: number;
  questions: string;      // JSON array string
  createdAt: string;
}

interface AssessmentQuestion {
  id: string;
  type: 'single' | 'multiple' | 'short' | 'rating';
  question: string;
  options?: string[];
  score: number;
}

// ============ 映射 ============
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

const courseTypeMap: Record<string, { label: string; icon: React.ReactNode }> = {
  video: { label: '视频课程', icon: <VideoCameraOutlined /> },
  document: { label: '图文课程', icon: <FileTextOutlined /> },
  live: { label: '直播课程', icon: <PlayCircleOutlined /> },
};

const classStatusMap: Record<string, { label: string; color: string }> = {
  registering: { label: '报名中', color: 'blue' },
  upcoming: { label: '即将开始', color: 'cyan' },
  ongoing: { label: '进行中', color: 'green' },
  completed: { label: '已结束', color: 'default' },
  cancelled: { label: '已取消', color: 'red' },
};

const trainingTypeMap: Record<string, string> = {
  internal: '内部培训',
  external: '外训',
  online: '在线学习',
};

const questionTypeMap: Record<string, string> = {
  single: '单选题', multiple: '多选题', short: '简答题', rating: '评分题'
};

// ============ 工具函数 ============
const genId = () => `tr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/** 从课程description中提取讲师 */
const extractInstructor = (desc: string): string => {
  const m = desc?.match(/讲师[：:]\s*(.+)/);
  return m ? m[1].trim() : '-';
};

/** 安全解析JSON */
const safeParse = <T,>(str: string | null | undefined, fallback: T): T => {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
};

// ============ API 调用 ============
const API = {
  get: async (table: string) => {
    const r = await fetch(`/api/${table}`);
    if (!r.ok) throw new Error(`GET /api/${table} failed: ${r.status}`);
    return r.json();
  },
  create: async (table: string, data: any) => {
    const r = await fetch(`/api/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(`POST /api/${table} failed: ${r.status}`);
    return r.json();
  },
  update: async (table: string, id: string, data: any) => {
    const r = await fetch(`/api/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(`PUT /api/${table}/${id} failed: ${r.status}`);
    return r.json();
  },
  delete: async (table: string, id: string) => {
    const r = await fetch(`/api/${table}/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error(`DELETE /api/${table}/${id} failed: ${r.status}`);
    return r.json();
  },
};

// ============ 主组件 ============
export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<string>('plan');
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
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
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);
  const [editingCourse, setEditingCourse] = useState<TrainingCourse | null>(null);
  const [editingClass, setEditingClass] = useState<TrainingClass | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<AssessmentTemplate | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [planForm] = Form.useForm();
  const [courseForm] = Form.useForm();
  const [classForm] = Form.useForm();
  const [recordForm] = Form.useForm();
  const [templateForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c, cl, r, t] = await Promise.all([
        API.get('training_plans'),
        API.get('training_courses'),
        API.get('training_classes'),
        API.get('training_records'),
        API.get('assessment_templates'),
      ]);
      setPlans(Array.isArray(p) ? p : []);
      setCourses(Array.isArray(c) ? c : []);
      setClasses(Array.isArray(cl) ? cl : []);
      setRecords(Array.isArray(r) ? r : []);
      setTemplates(Array.isArray(t) ? t : []);
    } catch (e) {
      messageApi.error('数据加载失败: ' + (e as Error).message);
    }
    setLoading(false);
  }, [messageApi]);

  useEffect(() => { loadData(); }, [loadData]);

  // ============ 统计 ============
  const stats = {
    totalPlans: plans.length,
    ongoingPlans: plans.filter(p => p.status === 'ongoing').length,
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.isActive).length,
    totalClasses: classes.length,
    totalRecords: records.length,
    completedRecords: records.filter(r => r.passed).length,
    averageScore: records.filter(r => r.score != null).length > 0
      ? records.filter(r => r.score != null).reduce((s, r) => s + (r.score || 0), 0) / records.filter(r => r.score != null).length
      : 0,
  };

  // ============ 培训计划 CRUD ============
  const openPlanModal = (plan?: TrainingPlan) => {
    setEditingPlan(plan || null);
    if (plan) {
      planForm.setFieldsValue({
        ...plan,
        targetEmployees: safeParse<string[]>(plan.targetEmployees, []).join(', '),
      });
    } else {
      planForm.resetFields();
    }
    setPlanModal(true);
  };

  const savePlan = async () => {
    try {
      const values = await planForm.validateFields();
      const data = {
        ...values,
        targetEmployees: JSON.stringify(
          values.targetEmployees
            ? values.targetEmployees.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)
            : []
        ),
        cost: Number(values.cost) || 0,
        participants: Number(values.participants) || 0,
      };

      if (editingPlan) {
        await API.update('training_plans', editingPlan.id, data);
        messageApi.success('计划已更新');
      } else {
        await API.create('training_plans', { ...data, id: genId(), status: data.status || 'draft' });
        messageApi.success('计划已创建');
      }
      setPlanModal(false);
      loadData();
    } catch { /* 验证失败 */ }
  };

  const deletePlan = async (id: string) => {
    try {
      await API.delete('training_plans', id);
      messageApi.success('计划已删除');
      loadData();
    } catch (e) { messageApi.error('删除失败'); }
  };

  // ============ 在线课程 CRUD ============
  const openCourseModal = (course?: TrainingCourse) => {
    setEditingCourse(course || null);
    if (course) {
      // 从description中提取讲师
      const instructor = extractInstructor(course.description);
      planForm.setFieldsValue({ ...course, instructor });
    } else {
      courseForm.resetFields();
    }
    setCourseModal(true);
  };

  const saveCourse = async () => {
    try {
      const values = await courseForm.validateFields();
      const instructor = values.instructor || '';
      const desc = values.description || '';
      // 将讲师信息编码到description中
      const fullDesc = instructor ? `${desc} | 讲师：${instructor}` : desc;
      const data = {
        title: values.title,
        category: values.category,
        type: values.type || 'video',
        url: values.url || '',
        duration: Number(values.duration) || 0,
        description: fullDesc,
        isRequired: values.isRequired ? 1 : 0,
        isActive: 1,
        viewCount: 0,
      };

      if (editingCourse) {
        await API.update('training_courses', editingCourse.id, { ...data, isActive: editingCourse.isActive, viewCount: editingCourse.viewCount });
        messageApi.success('课程已更新');
      } else {
        await API.create('training_courses', { ...data, id: genId() });
        messageApi.success('课程已创建');
      }
      setCourseModal(false);
      loadData();
    } catch { /* 验证失败 */ }
  };

  const toggleCourseActive = async (course: TrainingCourse) => {
    try {
      await API.update('training_courses', course.id, { isActive: course.isActive ? 0 : 1 });
      messageApi.success(course.isActive ? '课程已停用' : '课程已启用');
      loadData();
    } catch (e) { messageApi.error('操作失败'); }
  };

  const deleteCourse = async (id: string) => {
    try {
      await API.delete('training_courses', id);
      messageApi.success('课程已删除');
      loadData();
    } catch (e) { messageApi.error('删除失败'); }
  };

  // ============ 培训班 CRUD ============
  const openClassModal = (cls?: TrainingClass) => {
    setEditingClass(cls || null);
    if (cls) {
      classForm.setFieldsValue(cls);
    } else {
      classForm.resetFields();
      classForm.setFieldsValue({ capacity: 30, status: 'registering' });
    }
    setClassModal(true);
  };

  const saveClass = async () => {
    try {
      const values = await classForm.validateFields();
      const data = {
        name: values.name,
        planId: values.planId || '',
        instructor: values.instructor,
        startDate: values.startDate,
        endDate: values.endDate,
        location: values.location,
        capacity: Number(values.capacity) || 30,
        enrolledCount: editingClass ? editingClass.enrolledCount : 0,
        status: values.status || 'registering',
        qrCode: editingClass?.qrCode || null,
        description: values.description || '',
      };

      if (editingClass) {
        await API.update('training_classes', editingClass.id, data);
        messageApi.success('班级已更新');
      } else {
        await API.create('training_classes', { ...data, id: genId() });
        messageApi.success('班级已创建');
      }
      setClassModal(false);
      loadData();
    } catch { /* 验证失败 */ }
  };

  const generateQR = async (cls: TrainingClass) => {
    try {
      const qrData = `class-${cls.id}-${Date.now()}`;
      await API.update('training_classes', cls.id, { qrCode: qrData });
      setSelectedClass({ ...cls, qrCode: qrData });
      setQrModal(true);
      messageApi.success('签到码已生成');
      loadData();
    } catch (e) { messageApi.error('生成签到码失败'); }
  };

  const showQR = (cls: TrainingClass) => {
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

  const deleteClass = async (id: string) => {
    try {
      await API.delete('training_classes', id);
      messageApi.success('班级已删除');
      loadData();
    } catch (e) { messageApi.error('删除失败'); }
  };

  // ============ 培训记录 CRUD ============
  const openRecordModal = () => {
    recordForm.resetFields();
    setRecordModal(true);
  };

  const saveRecord = async () => {
    try {
      const values = await recordForm.validateFields();
      const data = {
        id: genId(),
        employeeId: values.employeeId,
        employeeName: values.employeeName,
        trainingPlanId: values.trainingPlanId || '',
        courseId: values.courseId || '',
        trainingType: values.trainingType || 'manual',
        trainingDate: values.trainingDate,
        duration: Number(values.duration) || 0,
        score: values.score != null ? Number(values.score) : null,
        passed: values.score != null && Number(values.score) >= 60 ? 1 : 0,
        certificateNo: null,
      };
      await API.create('training_records', data);
      messageApi.success('培训记录已添加');
      setRecordModal(false);
      loadData();
    } catch { /* 验证失败 */ }
  };

  const deleteRecord = async (id: string) => {
    try {
      await API.delete('training_records', id);
      messageApi.success('记录已删除');
      loadData();
    } catch (e) { messageApi.error('删除失败'); }
  };

  const exportRecords = () => {
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c.title]));
    const csv = [
      ['工号', '姓名', '培训类型', '课程', '培训日期', '学时', '成绩', '是否通过', '证书编号'].join(','),
      ...records.map(r => [
        r.employeeId, r.employeeName, trainingTypeMap[r.trainingType] || r.trainingType,
        courseMap[r.courseId] || r.courseId, r.trainingDate, r.duration,
        r.score ?? '', r.passed ? '通过' : '未通过', r.certificateNo || ''
      ].join(',')),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `培训记录_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    messageApi.success('培训记录已导出');
  };

  // ============ 评估模板 CRUD ============
  const openTemplateModal = (tmpl?: AssessmentTemplate) => {
    setEditingTemplate(tmpl || null);
    if (tmpl) {
      templateForm.setFieldsValue({
        name: tmpl.name,
        applicableCourse: tmpl.applicableCourse,
        totalScore: tmpl.totalScore,
        passingScore: tmpl.passingScore,
        isActive: tmpl.isActive,
      });
    } else {
      templateForm.resetFields();
      templateForm.setFieldsValue({ totalScore: 100, passingScore: 60, isActive: 1 });
    }
    setTemplateModal(true);
  };

  const saveTemplate = async () => {
    try {
      const values = await templateForm.validateFields();
      const data = {
        name: values.name,
        applicableCourse: values.applicableCourse,
        questionTypes: JSON.stringify(['single']),
        totalScore: Number(values.totalScore) || 100,
        passingScore: Number(values.passingScore) || 60,
        isActive: values.isActive ? 1 : 0,
        questions: editingTemplate?.questions || '[]',
      };

      if (editingTemplate) {
        await API.update('assessment_templates', editingTemplate.id, data);
        messageApi.success('模板已更新');
      } else {
        await API.create('assessment_templates', { ...data, id: genId() });
        messageApi.success('模板已创建');
      }
      setTemplateModal(false);
      loadData();
    } catch { /* 验证失败 */ }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await API.delete('assessment_templates', id);
      messageApi.success('模板已删除');
      loadData();
    } catch (e) { messageApi.error('删除失败'); }
  };

  const toggleTemplateActive = async (tmpl: AssessmentTemplate) => {
    try {
      await API.update('assessment_templates', tmpl.id, { isActive: tmpl.isActive ? 0 : 1 });
      messageApi.success(tmpl.isActive ? '模板已停用' : '模板已启用');
      loadData();
    } catch (e) { messageApi.error('操作失败'); }
  };

  // ============ Tabs ============
  const tabs = [
    { key: 'plan', label: '培训计划', icon: <CalendarOutlined /> },
    { key: 'course', label: '在线课程', icon: <VideoCameraOutlined /> },
    { key: 'class', label: '培训班', icon: <TeamOutlined /> },
    { key: 'record', label: '培训记录', icon: <FileTextOutlined /> },
    { key: 'assessment', label: '评估管理', icon: <StarOutlined /> },
  ];

  // ============ 表格列 ============
  const planColumns = [
    { title: '计划名称', dataIndex: 'title', key: 'title', width: 200 },
    { title: '部门', dataIndex: 'department', key: 'dept', width: 100 },
    { title: '负责人', dataIndex: 'trainer', key: 'trainer', width: 90 },
    { title: '预算', dataIndex: 'cost', key: 'cost', width: 90, render: (v: number) => v ? `¥${v.toLocaleString()}` : '-' },
    { title: '时间', key: 'dates', width: 180, render: (_: any, r: TrainingPlan) => `${r.startDate} ~ ${r.endDate}` },
    { title: '人数', dataIndex: 'participants', key: 'participants', width: 70, render: (v: number) => `${v || 0}人` },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={planStatusMap[v]?.color || 'default'}>{planStatusMap[v]?.label || v}</Tag> },
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
    { title: '分类', dataIndex: 'category', key: 'cat', width: 100, render: (v: string) => <Tag color={courseCategoryMap[v]?.color}>{courseCategoryMap[v]?.label || v}</Tag> },
    { title: '讲师', key: 'instructor', width: 90, render: (_: any, r: TrainingCourse) => extractInstructor(r.description) },
    { title: '时长', dataIndex: 'duration', key: 'dur', width: 80, render: (v: number) => v ? `${Math.round(v / 60)}h` : '-' },
    { title: '类型', dataIndex: 'type', key: 'type', width: 80, render: (v: string) => <Tag>{courseTypeMap[v]?.label || v}</Tag> },
    { title: '学习人数', dataIndex: 'viewCount', key: 'views', width: 90, render: (v: number) => `${v || 0}人` },
    { title: '必学', dataIndex: 'isRequired', key: 'req', width: 60, render: (v: number) => v ? <Tag color="red">必学</Tag> : <Tag>选修</Tag> },
    { title: '状态', dataIndex: 'isActive', key: 'active', width: 70, render: (v: number) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag> },
    { title: '操作', key: 'action', width: 180, render: (_: any, r: TrainingCourse) => (
      <Space size="small">
        <Button size="small" type="link" onClick={() => { setSelectedCourse(r); setDetailModal(true); }}>详情</Button>
        <Button size="small" type="link" onClick={() => openCourseModal(r)}>编辑</Button>
        <Button size="small" type="link" onClick={() => toggleCourseActive(r)}>{r.isActive ? '停用' : '启用'}</Button>
        <Popconfirm title="确认删除？" onConfirm={() => deleteCourse(r.id)}>
          <Button size="small" danger type="link">删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  const classColumns = [
    { title: '班级名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '讲师', dataIndex: 'instructor', key: 'instr', width: 90 },
    { title: '时间', key: 'dates', width: 200, render: (_: any, r: TrainingClass) => `${r.startDate} ~ ${r.endDate}` },
    { title: '地点', dataIndex: 'location', key: 'loc', width: 140 },
    { title: '容量', dataIndex: 'capacity', key: 'cap', width: 80, render: (v: number, r: TrainingClass) => `${r.enrolledCount}/${v}` },
    { title: '签到码', key: 'qr', width: 80, render: (_: any, r: TrainingClass) => r.qrCode ? <Tag color="green">已生成</Tag> : <Tag>未生成</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={classStatusMap[v]?.color || 'default'}>{classStatusMap[v]?.label || v}</Tag> },
    { title: '操作', key: 'action', width: 240, render: (_: any, r: TrainingClass) => (
      <Space size="small" wrap>
        {!r.qrCode && <Button size="small" icon={<QrcodeOutlined />} type="link" onClick={() => generateQR(r)}>生成签到码</Button>}
        {r.qrCode && <Button size="small" icon={<QrcodeOutlined />} type="link" onClick={() => showQR(r)}>查看签到码</Button>}
        <Button size="small" type="link" onClick={() => handleClassAttendance(r)}>扫码签到</Button>
        <Button size="small" type="link" onClick={() => openClassModal(r)}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => deleteClass(r.id)}>
          <Button size="small" danger type="link">删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  const courseMapForRecords = Object.fromEntries(courses.map(c => [c.id, c.title]));
  const recordColumns = [
    { title: '工号', dataIndex: 'employeeId', key: 'id', width: 100 },
    { title: '姓名', dataIndex: 'employeeName', key: 'name', width: 90 },
    { title: '培训类型', dataIndex: 'trainingType', key: 'type', width: 90, render: (v: string) => trainingTypeMap[v] || v },
    { title: '课程', key: 'course', width: 160, render: (_: any, r: TrainingRecord) => courseMapForRecords[r.courseId] || r.courseId || '-' },
    { title: '培训日期', dataIndex: 'trainingDate', key: 'date', width: 110 },
    { title: '学时', dataIndex: 'duration', key: 'hours', width: 70, render: (v: number) => `${v}h` },
    { title: '成绩', dataIndex: 'score', key: 'score', width: 70, render: (v: number | null) => v != null ? (v >= 90 ? <Tag color="green">{v}</Tag> : v >= 60 ? <Tag color="orange">{v}</Tag> : <Tag color="red">{v}</Tag>) : '-' },
    { title: '是否通过', dataIndex: 'passed', key: 'passed', width: 80, render: (v: number) => v ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> },
    { title: '证书', dataIndex: 'certificateNo', key: 'cert', width: 120, render: (v: string | null) => v || '-' },
    { title: '操作', key: 'action', width: 80, render: (_: any, r: TrainingRecord) => (
      <Popconfirm title="确认删除？" onConfirm={() => deleteRecord(r.id)}>
        <Button size="small" danger type="link">删除</Button>
      </Popconfirm>
    )},
  ];

  const templateColumns = [
    { title: '模板名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '适用课程', dataIndex: 'applicableCourse', key: 'course', width: 180 },
    { title: '题型', dataIndex: 'questionTypes', key: 'types', width: 180, render: (v: string) => {
      const types = safeParse<string[]>(v, []);
      return types.map(t => questionTypeMap[t]).filter(Boolean).join(' / ') || '-';
    }},
    { title: '总分', dataIndex: 'totalScore', key: 'total', width: 80, render: (v: number) => `${v}分` },
    { title: '及格分', dataIndex: 'passingScore', key: 'pass', width: 80, render: (v: number) => `${v}分` },
    { title: '状态', dataIndex: 'isActive', key: 'active', width: 70, render: (v: number) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag> },
    { title: '操作', key: 'action', width: 160, render: (_: any, r: AssessmentTemplate) => (
      <Space size="small">
        <Button size="small" type="link" onClick={() => openTemplateModal(r)}>编辑</Button>
        <Button size="small" type="link" onClick={() => toggleTemplateActive(r)}>{r.isActive ? '停用' : '启用'}</Button>
        <Popconfirm title="确认删除？" onConfirm={() => deleteTemplate(r.id)}>
          <Button size="small" danger type="link">删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  // ============ 过滤 ============
  const filteredPlans = plans.filter(p =>
    (!filterStatus || p.status === filterStatus) &&
    (!searchText || p.title?.includes(searchText) || p.department?.includes(searchText))
  );
  const filteredCourses = courses.filter(c =>
    (!filterCategory || c.category === filterCategory) &&
    (!searchText || c.title?.includes(searchText))
  );
  const filteredClasses = classes.filter(c =>
    (!searchText || c.name?.includes(searchText) || c.instructor?.includes(searchText))
  );
  const filteredRecords = records.filter(r =>
    (!searchText || r.employeeName?.includes(searchText) || r.employeeId?.includes(searchText))
  );

  return (
    <div className="p-6 space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">培训管理</h2>
          <p className="text-sm text-muted-foreground">培训计划 · 在线课程 · 培训班 · 培训记录 · 评估管理</p>
        </div>
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
                <Input placeholder="搜索计划名称/部门" prefix={<SearchOutlined />} allowClear style={{ width: 220 }} onChange={e => setSearchText(e.target.value)} />
                <Select placeholder="按状态筛选" allowClear style={{ width: 120 }} value={filterStatus || undefined} onChange={v => setFilterStatus(v || '')}>
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
                <Select placeholder="按分类筛选" allowClear style={{ width: 140 }} value={filterCategory || undefined} onChange={v => setFilterCategory(v || '')}>
                  {Object.entries(courseCategoryMap).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
                </Select>
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openCourseModal()}>新建课程</Button>
            </div>
            {/* 热门课程卡片 */}
            {courses.filter(c => c.isActive).length > 0 && (
              <Row gutter={16}>
                {courses.filter(c => c.isActive).slice(0, 4).map(course => (
                  <Col span={6} key={course.id}>
                    <Card size="small" hoverable>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag color={courseCategoryMap[course.category]?.color}>{courseCategoryMap[course.category]?.label || course.category}</Tag>
                        {courseTypeMap[course.type]?.icon}
                      </div>
                      <div className="font-semibold mb-1">{course.title}</div>
                      <div className="text-xs text-gray-500 mb-2">讲师：{extractInstructor(course.description)} | 时长：{course.duration ? Math.round(course.duration / 60) + 'h' : '-'}</div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{course.viewCount || 0}人学习</span>
                        <Button size="small" type="link" onClick={() => { setSelectedCourse(course); setDetailModal(true); }}>详情</Button>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
            <Table columns={courseColumns} dataSource={filteredCourses} rowKey="id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true }} size="small" scroll={{ x: 1100 }} />
          </div>
        )}

        {/* ========== Tab3: 培训班 ========== */}
        {activeTab === 'class' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Space>
                <Input placeholder="搜索班级名称" prefix={<SearchOutlined />} allowClear style={{ width: 200 }} onChange={e => setSearchText(e.target.value)} />
                <Select placeholder="按状态筛选" allowClear style={{ width: 120 }} value={filterStatus || undefined} onChange={v => setFilterStatus(v || '')}>
                  {Object.entries(classStatusMap).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
                </Select>
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openClassModal()}>新建培训班</Button>
            </div>
            <Alert message="培训班签到码：系统为每个班级生成唯一二维码，员工使用手机扫码即可自动登记出勤记录。" type="info" showIcon style={{ marginBottom: 8 }} />
            <Table columns={classColumns} dataSource={filteredClasses} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} size="small" scroll={{ x: 1200 }} />
          </div>
        )}

        {/* ========== Tab4: 培训记录 ========== */}
        {activeTab === 'record' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Space>
                <Input placeholder="搜索姓名/工号" prefix={<SearchOutlined />} allowClear style={{ width: 200 }} onChange={e => setSearchText(e.target.value)} />
              </Space>
              <Space>
                <Button icon={<DownloadOutlined />} onClick={exportRecords}>导出记录</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={openRecordModal}>手工登记</Button>
              </Space>
            </div>
            <Table columns={recordColumns} dataSource={filteredRecords} rowKey="id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }} size="small" scroll={{ x: 1100 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}><strong>统计</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}><strong>{records.length}条</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={2} />
                    <Table.Summary.Cell index={3} />
                    <Table.Summary.Cell index={4}><strong>{records.reduce((s, r) => s + (r.duration || 0), 0)}学时</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={5}><strong>平均{stats.averageScore.toFixed(1)}分</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={6}><strong>{stats.completedRecords}通过</strong></Table.Summary.Cell>
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
              <span className="text-sm text-muted-foreground">管理评估模板，可对培训班的学员发起评估考核。</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openTemplateModal()}>新建评估模板</Button>
            </div>
            <Table columns={templateColumns} dataSource={templates} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} size="small"
              expandable={{
                expandedRowRender: (record: AssessmentTemplate) => {
                  const questions = safeParse<AssessmentQuestion[]>(record.questions, []);
                  const types = safeParse<string[]>(record.questionTypes, []);
                  return (
                    <div className="space-y-3 pl-4">
                      <strong>题目配置：</strong>
                      {questions.length === 0 ? (
                        <span className="text-gray-400">暂无题目</span>
                      ) : (
                        questions.map((q, i) => (
                          <Card key={q.id} size="small" className="bg-gray-50">
                            <div className="flex items-start gap-2">
                              <Tag>{questionTypeMap[q.type] || q.type}</Tag>
                              <div className="flex-1">
                                <span>{i + 1}. {q.question}</span>
                                {q.options && (
                                  <div className="mt-1 space-y-1">
                                    {q.options.map((opt, oi) => (
                                      <div key={oi} className="text-sm text-gray-500">{String.fromCharCode(65 + oi)}. {opt}</div>
                                    ))}
                                  </div>
                                )}
                                <span className="text-xs text-gray-400 mt-1 block">满分：{q.score}分</span>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                      <div className="text-sm text-gray-400">题型：{types.map(t => questionTypeMap[t]).filter(Boolean).join(' / ')} | 总分：{record.totalScore}分 | 及格：{record.passingScore}分</div>
                    </div>
                  );
                },
              }}
            />
          </div>
        )}
      </Card>

      {/* ========== 培训计划弹窗 ========== */}
      <Modal title={editingPlan ? '编辑培训计划' : '新建培训计划'} open={planModal} onOk={savePlan} onCancel={() => setPlanModal(false)} width={640} okText="保存" cancelText="取消">
        <Form form={planForm} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="title" label="计划名称" rules={[{ required: true, message: '请输入计划名称' }]}><Input placeholder="如：2025年度技术培训计划" /></Form.Item></Col>
            <Col span={12}><Form.Item name="department" label="目标部门" rules={[{ required: true }]}><Input placeholder="如：研发部" /></Form.Item></Col>
            <Col span={12}><Form.Item name="trainer" label="负责人" rules={[{ required: true }]}><Input placeholder="负责人姓名" /></Form.Item></Col>
            <Col span={12}><Form.Item name="cost" label="预算（元）"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="startDate" label="开始日期" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="endDate" label="结束日期" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="培训地点"><Input placeholder="会议室或地点" /></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="状态"><Select>{Object.entries(planStatusMap).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="participants" label="参训人数"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="targetEmployees" label="目标对象"><Input placeholder="如：工程师, 架构师" /></Form.Item></Col>
            <Col span={24}><Form.Item name="content" label="计划说明"><TextArea rows={3} placeholder="培训计划详细说明" /></Form.Item></Col>
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
            <Col span={12}><Form.Item name="type" label="课程类型" rules={[{ required: true }]}><Select><Option value="video">视频课程</Option><Option value="document">图文课程</Option><Option value="live">直播课程</Option></Select></Form.Item></Col>
            <Col span={12}><Form.Item name="url" label="课程链接"><Input placeholder="视频/直播URL" /></Form.Item></Col>
            <Col span={12}><Form.Item name="isRequired" label="是否必修" valuePropName="checked"><Select><Option value={1}>必修</Option><Option value={0}>选修</Option></Select></Form.Item></Col>
            <Col span={24}><Form.Item name="description" label="课程简介"><TextArea rows={3} placeholder="课程详细介绍（讲师信息将自动附加）" /></Form.Item></Col>
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
            <Col span={12}><Form.Item name="planId" label="关联计划"><Select allowClear placeholder="选择培训计划">{plans.map(p => <Option key={p.id} value={p.id}>{p.title}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="状态"><Select>{Object.entries(classStatusMap).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}</Select></Form.Item></Col>
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
            <Col span={12}><Form.Item name="trainingType" label="培训类型" rules={[{ required: true }]}><Select>{Object.entries(trainingTypeMap).map(([k, v]) => <Option key={k} value={k}>{v}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="courseId" label="课程"><Select allowClear placeholder="选择课程">{courses.map(c => <Option key={c.id} value={c.id}>{c.title}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="trainingDate" label="培训日期" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="duration" label="学时" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} addonAfter="小时" /></Form.Item></Col>
            <Col span={12}><Form.Item name="score" label="成绩"><InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="成绩（可选）" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* ========== 课程详情弹窗 ========== */}
      <Modal title={selectedCourse ? `课程详情 - ${selectedCourse.title}` : ''} open={detailModal} onCancel={() => setDetailModal(false)} footer={null} width={680}>
        {selectedCourse && (
          <div className="space-y-4">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="课程名称">{selectedCourse.title}</Descriptions.Item>
              <Descriptions.Item label="课程分类"><Tag color={courseCategoryMap[selectedCourse.category]?.color}>{courseCategoryMap[selectedCourse.category]?.label || selectedCourse.category}</Tag></Descriptions.Item>
              <Descriptions.Item label="讲师">{extractInstructor(selectedCourse.description)}</Descriptions.Item>
              <Descriptions.Item label="课程类型">{courseTypeMap[selectedCourse.type]?.label || selectedCourse.type}</Descriptions.Item>
              <Descriptions.Item label="课程时长">{selectedCourse.duration ? Math.round(selectedCourse.duration / 60) + ' 小时' : '-'}</Descriptions.Item>
              <Descriptions.Item label="创建日期">{selectedCourse.createdAt?.slice(0, 10)}</Descriptions.Item>
              <Descriptions.Item label="学习人数" span={2}>{selectedCourse.viewCount || 0} 人</Descriptions.Item>
              <Descriptions.Item label="课程简介" span={2}>{selectedCourse.description?.replace(/\s*\|\s*讲师[：:].+$/, '')}</Descriptions.Item>
            </Descriptions>
            <Divider>课程信息</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="课程属性">
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>是否必修</span><Tag color={selectedCourse.isRequired ? 'red' : 'default'}>{selectedCourse.isRequired ? '必修' : '选修'}</Tag></div>
                    <div className="flex justify-between"><span>课程状态</span><Tag color={selectedCourse.isActive ? 'green' : 'default'}>{selectedCourse.isActive ? '启用' : '停用'}</Tag></div>
                    {selectedCourse.url && <div className="flex justify-between"><span>课程链接</span><a href={selectedCourse.url} target="_blank" rel="noreferrer">打开</a></div>}
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="学习统计">
                  <Statistic title="学习人数" value={selectedCourse.viewCount || 0} suffix="人" />
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
            <Alert message="请让参训人员扫描下方二维码进行签到登记" type="info" showIcon />
            <div className="bg-gray-100 rounded-xl p-8 mx-auto inline-block">
              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 mx-auto">
                <div className="text-center">
                  <QrcodeOutlined style={{ fontSize: 64, color: '#1677ff' }} />
                  <span className="block mt-2 text-xs text-gray-400">扫码签到</span>
                </div>
              </div>
              <span className="block mt-2 text-xs text-gray-400">{selectedClass.qrCode || `class-${selectedClass.id}`}</span>
            </div>
            <div className="text-sm text-gray-500">
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
      <Modal title={editingTemplate ? '编辑评估模板' : '新建评估模板'} open={templateModal} onOk={saveTemplate} onCancel={() => setTemplateModal(false)} width={560} okText="保存" cancelText="取消">
        <Form form={templateForm} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="模板名称" rules={[{ required: true }]}><Input placeholder="如：技术课程评估表" /></Form.Item></Col>
            <Col span={12}><Form.Item name="applicableCourse" label="适用课程" rules={[{ required: true }]}><Select allowClear placeholder="选择课程">{courses.map(c => <Option key={c.id} value={c.title}>{c.title}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="totalScore" label="总分" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="passingScore" label="及格分数" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="isActive" label="是否启用" valuePropName="checked"><Select><Option value={1}>启用</Option><Option value={0}>停用</Option></Select></Form.Item></Col>
          </Row>
        </Form>
        {editingTemplate && (
          <Alert message="题目编辑功能正在完善中，当前仅支持修改模板基本信息。" type="info" showIcon style={{ marginTop: 8 }} />
        )}
      </Modal>
    </div>
  );
}
