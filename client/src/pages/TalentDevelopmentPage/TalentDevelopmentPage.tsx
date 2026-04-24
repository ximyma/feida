import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, Popconfirm, message, Tabs, Statistic, Row, Col,
  Divider, Progress, InputNumber, Descriptions, Alert, Tooltip,
  Collapse, Radio, Checkbox, Steps, Result, QRCode, Badge
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined,
  TeamOutlined, TrophyOutlined, StarOutlined, RadarChartOutlined,
  BarChartOutlined, FileTextOutlined, QrcodeOutlined, SendOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  PlayCircleOutlined, EyeOutlined, SettingOutlined, CopyOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

// ============ 类型定义 ============
interface AssessmentTool {
  id: string;
  name: string;
  type: 'enneagram' | 'mbti' | 'pdp' | 'disc' | 'holland' | 'custom';
  description: string;
  questionCount: number;
  duration: number;
  status: 'active' | 'inactive';
}

interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'scale';
  options?: string[];
  weights?: Record<string, number>;
}

interface Competency {
  id: string;
  name: string;
  category: string; // 冰山模型六层面
  level: number;
  description: string;
  behaviors: string[];
  weight: number;
  assessmentMethod: string;
}

interface JobCompetencyModel {
  id: string;
  positionId: string;
  positionName: string;
  competencies: { competencyId: string; weight: number; required: boolean }[];
  status: 'active' | 'inactive';
}

interface TalentAssessment {
  id: string;
  employeeId: string;
  employeeName: string;
  assessmentType: string;
  status: 'pending' | 'in_progress' | 'completed';
  result?: string;
  score?: number;
  completedAt?: string;
  qrCode?: string;
}

interface TalentReview {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  potential: number;
  performance: number;
  quadrant: string;
  competencyScores: Record<string, number>;
  createdAt: string;
}

const assessmentTypeMap: Record<string, { label: string; color: string }> = {
  enneagram: { label: '九型人格', color: 'blue' },
  mbti: { label: 'MBTI职业性格', color: 'purple' },
  pdp: { label: 'PDP性格测试', color: 'green' },
  disc: { label: 'DISC行为风格', color: 'orange' },
  holland: { label: '霍兰德职业兴趣', color: 'cyan' },
  custom: { label: '自定义测评', color: 'default' },
};

const icebergCategoryMap: Record<string, string> = {
  knowledge: '知识',
  skill: '技能', 
  ability: '能力',
  value: '价值观',
  self: '自我认知',
  motive: '动机',
};

const quadrantMap: Record<string, { label: string; color: string; desc: string }> = {
  star: { label: '明星人才', color: 'gold', desc: '高潜力高绩效，重点培养' },
  core: { label: '核心人才', color: 'blue', desc: '高绩效稳定贡献者' },
  potential: { label: '潜力人才', color: 'green', desc: '高潜力待培养' },
  stable: { label: '稳定贡献', color: 'default', desc: '稳定完成工作' },
};

// ============ 模拟数据 ============
const generateMockTools = (): AssessmentTool[] => [
  { id: '1', name: '九型人格测试', type: 'enneagram', description: '了解你的核心性格类型，发现优势与盲点', questionCount: 108, duration: 20, status: 'active' },
  { id: '2', name: 'MBTI职业性格测试', type: 'mbti', description: '测评你的性格类型，找到适合的职业方向', questionCount: 93, duration: 15, status: 'active' },
  { id: '3', name: 'PDP性格测试', type: 'pdp', description: '了解你的行为风格：老虎、孔雀、考拉、猫头鹰', questionCount: 60, duration: 10, status: 'active' },
  { id: '4', name: 'DISC行为风格测试', type: 'disc', description: '识别你的沟通与行为偏好', questionCount: 28, duration: 5, status: 'active' },
  { id: '5', name: '霍兰德职业兴趣测试', type: 'holland', description: '发现你的职业兴趣类型', questionCount: 90, duration: 12, status: 'inactive' },
];

const generateMockCompetencies = (): Competency[] => [
  { id: '1', name: '专业知识', category: 'knowledge', level: 5, description: '掌握岗位所需的专业知识', behaviors: ['能独立解决专业问题', '具备行业知识', '持续学习新技术'], weight: 15, assessmentMethod: '笔试+面试' },
  { id: '2', name: '沟通能力', category: 'skill', level: 5, description: '有效表达与倾听的能力', behaviors: ['表达清晰', '善于倾听', '跨部门沟通'], weight: 10, assessmentMethod: '360度评估' },
  { id: '3', name: '团队协作', category: 'ability', level: 5, description: '与团队成员有效合作', behaviors: ['乐于分享', '支持队友', '冲突处理'], weight: 12, assessmentMethod: '360度评估' },
  { id: '4', name: '责任心', category: 'value', level: 5, description: '对工作认真负责', behaviors: ['按时完成任务', '主动承担责任', '追求卓越'], weight: 10, assessmentMethod: '上级评价' },
  { id: '5', name: '自我认知', category: 'self', level: 5, description: '了解自己的优劣势', behaviors: ['自我反思', '接受反馈', '持续改进'], weight: 8, assessmentMethod: '自评' },
  { id: '6', name: '成就动机', category: 'motive', level: 5, description: '追求成功的内在动力', behaviors: ['设定目标', '主动挑战', '坚持不懈'], weight: 10, assessmentMethod: '行为观察' },
];

const generateMockModels = (): JobCompetencyModel[] => [
  { id: '1', positionId: 'pos1', positionName: '高级工程师', status: 'active', competencies: [
    { competencyId: '1', weight: 20, required: true },
    { competencyId: '2', weight: 15, required: true },
    { competencyId: '3', weight: 15, required: true },
  ]},
  { id: '2', positionId: 'pos2', positionName: '部门经理', status: 'active', competencies: [
    { competencyId: '2', weight: 20, required: true },
    { competencyId: '3', weight: 20, required: true },
    { competencyId: '4', weight: 15, required: true },
  ]},
];

const generateMockAssessments = (): TalentAssessment[] => [
  { id: '1', employeeId: 'EMP0001', employeeName: '张伟', assessmentType: 'mbti', status: 'completed', result: 'INTJ', score: 92, completedAt: '2025-04-20', qrCode: 'assess-001' },
  { id: '2', employeeId: 'EMP0002', employeeName: '李娜', assessmentType: 'enneagram', status: 'in_progress', qrCode: 'assess-002' },
  { id: '3', employeeId: 'EMP0003', employeeName: '王芳', assessmentType: 'pdp', status: 'pending', qrCode: 'assess-003' },
];

const generateMockReviews = (): TalentReview[] => [
  { id: '1', employeeId: 'EMP0001', employeeName: '张伟', department: '研发部', potential: 85, performance: 90, quadrant: 'star', competencyScores: { '1': 90, '2': 85, '3': 88, '4': 92 }, createdAt: '2025-04-15' },
  { id: '2', employeeId: 'EMP0002', employeeName: '李娜', department: '市场部', potential: 70, performance: 85, quadrant: 'core', competencyScores: { '1': 80, '2': 88, '3': 82, '4': 85 }, createdAt: '2025-04-15' },
  { id: '3', employeeId: 'EMP0003', employeeName: '王芳', department: '财务部', potential: 80, performance: 65, quadrant: 'potential', competencyScores: { '1': 75, '2': 70, '3': 72, '4': 68 }, createdAt: '2025-04-15' },
  { id: '4', employeeId: 'EMP0004', employeeName: '刘洋', department: '人力资源部', potential: 60, performance: 75, quadrant: 'stable', competencyScores: { '1': 72, '2': 75, '3': 70, '4': 73 }, createdAt: '2025-04-15' },
];

export default function TalentDevelopmentPage() {
  const [activeTab, setActiveTab] = useState<string>('tools');
  const [tools, setTools] = useState<AssessmentTool[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [models, setModels] = useState<JobCompetencyModel[]>([]);
  const [assessments, setAssessments] = useState<TalentAssessment[]>([]);
  const [reviews, setReviews] = useState<TalentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [toolModal, setToolModal] = useState(false);
  const [competencyModal, setCompetencyModal] = useState(false);
  const [modelModal, setModelModal] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<AssessmentTool | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<TalentAssessment | null>(null);
  const [editingCompetency, setEditingCompetency] = useState<Competency | null>(null);
  const [form] = Form.useForm();
  const [competencyForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [toolRes, compRes, modelRes, assessRes, reviewRes] = await Promise.allSettled([
          fetch('/api/assessment_tools'), fetch('/api/competencies'),
          fetch('/api/job_competency_models'), fetch('/api/talent_assessments'),
          fetch('/api/talent_reviews'),
        ]);
        let [t, c, m, a, r] = [[], [], [], [], []];
        if (toolRes.status === 'fulfilled' && toolRes.value.ok) { const j = await toolRes.value.json(); if (Array.isArray(j)) t = j; }
        if (compRes.status === 'fulfilled' && compRes.value.ok) { const j = await compRes.value.json(); if (Array.isArray(j)) c = j; }
        if (modelRes.status === 'fulfilled' && modelRes.value.ok) { const j = await modelRes.value.json(); if (Array.isArray(j)) m = j; }
        if (assessRes.status === 'fulfilled' && assessRes.value.ok) { const j = await assessRes.value.json(); if (Array.isArray(j)) a = j; }
        if (reviewRes.status === 'fulfilled' && reviewRes.value.ok) { const j = await reviewRes.value.json(); if (Array.isArray(j)) r = j; }
        if (t.length === 0) t = generateMockTools();
        if (c.length === 0) c = generateMockCompetencies();
        if (m.length === 0) m = generateMockModels();
        if (a.length === 0) a = generateMockAssessments();
        if (r.length === 0) r = generateMockReviews();
        setTools(t); setCompetencies(c); setModels(m); setAssessments(a); setReviews(r);
      } catch {
        setTools(generateMockTools()); setCompetencies(generateMockCompetencies());
        setModels(generateMockModels()); setAssessments(generateMockAssessments()); setReviews(generateMockReviews());
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const stats = {
    totalTools: tools.filter(t => t.status === 'active').length,
    totalCompetencies: competencies.length,
    totalModels: models.filter(m => m.status === 'active').length,
    pendingAssessments: assessments.filter(a => a.status === 'pending').length,
    completedAssessments: assessments.filter(a => a.status === 'completed').length,
    starTalent: reviews.filter(r => r.quadrant === 'star').length,
  };

  // 测评工具操作
  const toggleToolStatus = (tool: AssessmentTool) => {
    setTools(prev => prev.map(t => t.id === tool.id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t));
    messageApi.success(tool.status === 'active' ? '已停用测评' : '已启用测评');
  };

  const generateAssessmentLink = (tool: AssessmentTool) => {
    setSelectedTool(tool);
    setQrModal(true);
  };

  const pushAssessmentToEmployee = () => {
    Modal.confirm({
      title: '推送测评给员工',
      content: (
        <Form layout="vertical" size="small">
          <Form.Item label="选择员工">
            <Select mode="multiple" placeholder="选择要推送的员工">
              <Option value="EMP0001">张伟</Option>
              <Option value="EMP0002">李娜</Option>
              <Option value="EMP0003">王芳</Option>
            </Select>
          </Form.Item>
          <Form.Item label="测评截止时间">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      ),
      onOk() { messageApi.success('测评已推送'); }
    });
  };

  // 能力素质字典操作
  const openCompetencyModal = (comp?: Competency) => {
    setEditingCompetency(comp || null);
    if (comp) competencyForm.setFieldsValue(comp); else competencyForm.resetFields();
    setCompetencyModal(true);
  };

  const saveCompetency = async () => {
    try {
      const values = await competencyForm.validateFields();
      if (editingCompetency) {
        setCompetencies(prev => prev.map(c => c.id === editingCompetency.id ? { ...c, ...values } : c));
        messageApi.success('能力素质已更新');
      } else {
        setCompetencies(prev => [...prev, { ...values, id: String(Date.now()) } as Competency]);
        messageApi.success('能力素质已创建');
      }
      setCompetencyModal(false);
    } catch { }
  };

  // 人才盘点
  const calculateQuadrant = (potential: number, performance: number): string => {
    if (potential >= 70 && performance >= 70) return 'star';
    if (potential < 70 && performance >= 70) return 'core';
    if (potential >= 70 && performance < 70) return 'potential';
    return 'stable';
  };

  const exportReviewReport = () => {
    const csv = [
      ['工号', '姓名', '部门', '潜力', '绩效', '九宫格', '能力评分'].join(','),
      ...reviews.map(r => [r.employeeId, r.employeeName, r.department, r.potential, r.performance, quadrantMap[r.quadrant]?.label, JSON.stringify(r.competencyScores)].join(',')),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `人才盘点报告_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    messageApi.success('报告已导出');
  };

  const tabs = [
    { key: 'tools', label: '人才测评工具', icon: <FileTextOutlined /> },
    { key: 'online', label: '在线测评', icon: <PlayCircleOutlined /> },
    { key: 'dictionary', label: '能力素质字典', icon: <TeamOutlined /> },
    { key: 'model', label: '胜任力模型', icon: <TrophyOutlined /> },
    { key: 'review', label: '人才盘点', icon: <RadarChartOutlined /> },
  ];

  // 表格列定义
  const toolColumns = [
    { title: '测评名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 120, render: (v: string) => <Tag color={assessmentTypeMap[v]?.color}>{assessmentTypeMap[v]?.label}</Tag> },
    { title: '题目数', dataIndex: 'questionCount', key: 'count', width: 80, render: (v: number) => `${v}题` },
    { title: '时长', dataIndex: 'duration', key: 'duration', width: 80, render: (v: number) => `${v}分钟` },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? '启用' : '停用'}</Tag> },
    { title: '操作', key: 'action', width: 200, render: (_: any, r: AssessmentTool) => (
      <Space size="small">
        <Button size="small" type="link" icon={<QrcodeOutlined />} onClick={() => generateAssessmentLink(r)}>生成二维码</Button>
        <Button size="small" type="link" onClick={() => toggleToolStatus(r)}>{r.status === 'active' ? '停用' : '启用'}</Button>
      </Space>
    )},
  ];

  const assessmentColumns = [
    { title: '工号', dataIndex: 'employeeId', key: 'id', width: 100 },
    { title: '姓名', dataIndex: 'employeeName', key: 'name', width: 90 },
    { title: '测评类型', dataIndex: 'assessmentType', key: 'type', width: 120, render: (v: string) => <Tag color={assessmentTypeMap[v]?.color}>{assessmentTypeMap[v]?.label}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (v: string) => {
      const map: Record<string, { color: string; label: string }> = { pending: { color: 'default', label: '待开始' }, in_progress: { color: 'blue', label: '进行中' }, completed: { color: 'green', label: '已完成' } };
      return <Tag color={map[v]?.color}>{map[v]?.label}</Tag>;
    }},
    { title: '结果', dataIndex: 'result', key: 'result', width: 80 },
    { title: '得分', dataIndex: 'score', key: 'score', width: 70, render: (v?: number) => v ? <Text type={v >= 90 ? 'success' : v >= 60 ? 'warning' : 'danger'}>{v}</Text> : '-' },
    { title: '完成时间', dataIndex: 'completedAt', key: 'completed', width: 100, render: (v?: string) => v || '-' },
    { title: '操作', key: 'action', width: 100, render: (_: any, r: TalentAssessment) => (
      <Space size="small">
        {r.status === 'pending' && <Button size="small" type="link" icon={<SendOutlined />} onClick={pushAssessmentToEmployee}>推送</Button>}
        {r.status === 'completed' && <Button size="small" type="link" icon={<EyeOutlined />}>查看报告</Button>}
      </Space>
    )},
  ];

  const competencyColumns = [
    { title: '能力名称', dataIndex: 'name', key: 'name', width: 120 },
    { title: '冰山模型', dataIndex: 'category', key: 'category', width: 100, render: (v: string) => <Tag>{icebergCategoryMap[v]}</Tag> },
    { title: '等级', dataIndex: 'level', key: 'level', width: 70 },
    { title: '权重', dataIndex: 'weight', key: 'weight', width: 70, render: (v: number) => `${v}%` },
    { title: '测评方式', dataIndex: 'assessmentMethod', key: 'method', width: 120 },
    { title: '操作', key: 'action', width: 100, render: (_: any, r: Competency) => (
      <Space size="small">
        <Button size="small" type="link" onClick={() => openCompetencyModal(r)}>编辑</Button>
      </Space>
    )},
  ];

  const reviewColumns = [
    { title: '工号', dataIndex: 'employeeId', key: 'id', width: 100 },
    { title: '姓名', dataIndex: 'employeeName', key: 'name', width: 90 },
    { title: '部门', dataIndex: 'department', key: 'dept', width: 120 },
    { title: '潜力', dataIndex: 'potential', key: 'potential', width: 80, render: (v: number) => <Progress percent={v} size="small" /> },
    { title: '绩效', dataIndex: 'performance', key: 'performance', width: 80, render: (v: number) => <Progress percent={v} size="small" /> },
    { title: '九宫格', dataIndex: 'quadrant', key: 'quadrant', width: 100, render: (v: string) => <Tag color={quadrantMap[v]?.color}>{quadrantMap[v]?.label}</Tag> },
    { title: '操作', key: 'action', width: 100, render: (_: any, r: TalentReview) => (
      <Button size="small" type="link" icon={<EyeOutlined />}>详情</Button>
    )},
  ];

  return (
    <div className="p-6 space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">人才发展</h2><p className="text-sm text-muted-foreground">测评工具 · 能力字典 · 胜任力模型 · 人才盘点</p></div>
      </div>

      <Row gutter={16}>
        <Col span={4}><Card size="small"><Statistic title="测评工具" value={stats.totalTools} suffix="个" valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="能力素质" value={stats.totalCompetencies} suffix="项" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="胜任力模型" value={stats.totalModels} suffix="个" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="待测评" value={stats.pendingAssessments} suffix="人" valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="已完成" value={stats.completedAssessments} suffix="人" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="明星人才" value={stats.starTalent} suffix="人" valueStyle={{ color: '#fa8c16' }} /></Card></Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{ marginBottom: 16 }} items={tabs} />

        {/* Tab1: 测评工具 */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <Alert message="支持多套人才测评工具：九型人格、MBTI职业性格、PDP性格测试、DISC行为风格、霍兰德职业兴趣等。" type="info" showIcon />
            <Table columns={toolColumns} dataSource={tools} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
          </div>
        )}

        {/* Tab2: 在线测评 */}
        {activeTab === 'online' && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <Text type="secondary">向员工推送测评链接或二维码，支持断点续答。</Text>
              <Button type="primary" icon={<SendOutlined />} onClick={pushAssessmentToEmployee}>批量推送测评</Button>
            </div>
            <Table columns={assessmentColumns} dataSource={assessments} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
          </div>
        )}

        {/* Tab3: 能力素质字典 */}
        {activeTab === 'dictionary' && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <Alert message="冰山模型六层面：知识、技能、能力、价值观、自我认知、动机。每项能力可定义行为等级、权重及测评方式。" type="info" showIcon style={{ flex: 1 }} />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openCompetencyModal()}>新建能力</Button>
            </div>
            <Table columns={competencyColumns} dataSource={competencies} rowKey="id" loading={loading} pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: (record: Competency) => (
                  <div className="p-4 bg-gray-50 rounded">
                    <Text strong>行为等级描述：</Text>
                    <div className="mt-2 space-y-1">
                      {record.behaviors.map((b, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Tag color="blue">L{i + 1}</Tag>
                          <Text>{b}</Text>
                        </div>
                      ))}
                    </div>
                    <Text type="secondary" className="block mt-2">描述：{record.description}</Text>
                  </div>
                ),
              }}
            />
          </div>
        )}

        {/* Tab4: 胜任力模型 */}
        {activeTab === 'model' && (
          <div className="space-y-4">
            <Alert message="为岗位设置必备能力及权重，支持人岗匹配度计算。" type="info" showIcon />
            <Table
              columns={[
                { title: '岗位名称', dataIndex: 'positionName', key: 'name', width: 180 },
                { title: '能力数量', key: 'count', width: 100, render: (_: any, r: JobCompetencyModel) => `${r.competencies.length}项` },
                { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? '启用' : '停用'}</Tag> },
                { title: '操作', key: 'action', width: 150, render: () => (
                  <Space size="small">
                    <Button size="small" type="link">编辑</Button>
                    <Button size="small" type="link">复制</Button>
                  </Space>
                )},
              ]}
              dataSource={models} rowKey="id" loading={loading} pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: (record: JobCompetencyModel) => (
                  <div className="p-4 bg-gray-50 rounded">
                    <Text strong>岗位能力要求：</Text>
                    <div className="mt-2 space-y-2">
                      {record.competencies.map(c => {
                        const comp = competencies.find(x => x.id === c.competencyId);
                        return (
                          <div key={c.competencyId} className="flex items-center gap-4">
                            <Tag color={comp ? 'blue' : 'default'}>{comp?.name || '未知能力'}</Tag>
                            <Text type="secondary">权重: {c.weight}%</Text>
                            {c.required && <Tag color="orange">必修</Tag>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ),
              }}
            />
          </div>
        )}

        {/* Tab5: 人才盘点 */}
        {activeTab === 'review' && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <Text type="secondary">通过导入关键人才的能力数据与绩效数据进行人才盘点，支持报表及九宫格图形。</Text>
              <Space>
                <Button icon={<PlusOutlined />}>导入人才数据</Button>
                <Button icon={<BarChartOutlined />} onClick={exportReviewReport}>导出报告</Button>
              </Space>
            </div>
            
            {/* 九宫格 */}
            <Card title="人才九宫格" size="small">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-100 p-4 rounded min-h-24">
                  <Text type="secondary">潜力人才</Text>
                  <div className="mt-2"><Badge count={reviews.filter(r => r.quadrant === 'potential').length} showZero color="green" /></div>
                </div>
                <div className="bg-gold-50 p-4 rounded min-h-24 border-2 border-gold-300">
                  <Text strong style={{ color: '#fa8c16' }}>明星人才</Text>
                  <div className="mt-2"><Badge count={reviews.filter(r => r.quadrant === 'star').length} showZero color="gold" /></div>
                </div>
                <div className="bg-gray-100 p-4 rounded min-h-24">
                  <Text type="secondary">明星人才</Text>
                  <div className="mt-2"><Badge count={0} showZero /></div>
                </div>
                <div className="bg-gray-100 p-4 rounded min-h-24">
                  <Text type="secondary">稳定贡献</Text>
                  <div className="mt-2"><Badge count={reviews.filter(r => r.quadrant === 'stable').length} showZero /></div>
                </div>
                <div className="bg-blue-50 p-4 rounded min-h-24 border border-blue-200">
                  <Text style={{ color: '#1677ff' }}>核心人才</Text>
                  <div className="mt-2"><Badge count={reviews.filter(r => r.quadrant === 'core').length} showZero color="blue" /></div>
                </div>
                <div className="bg-gray-100 p-4 rounded min-h-24">
                  <Text type="secondary">核心人才</Text>
                  <div className="mt-2"><Badge count={0} showZero /></div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <Text type="secondary">低绩效</Text>
                <Text type="secondary">高绩效</Text>
              </div>
              <div className="text-center text-xs text-muted-foreground mt-1">
                <Text type="secondary">高潜力 ↑</Text>
                <div className="h-16"></div>
                <Text type="secondary">低潜力 ↓</Text>
              </div>
            </Card>

            <Table columns={reviewColumns} dataSource={reviews} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
          </div>
        )}
      </Card>

      {/* 测评二维码弹窗 */}
      <Modal title={`${selectedTool?.name} - 测评二维码`} open={qrModal} onCancel={() => setQrModal(false)} footer={null} width={400}>
        {selectedTool && (
          <div className="text-center space-y-4">
            <div className="bg-white p-8 rounded-xl border inline-block mx-auto">
              <QRCode value={`https://hr.feida.com/assessment/${selectedTool.id}`} size={200} />
            </div>
            <Text type="secondary" className="block">员工扫码即可参与测评</Text>
            <div className="bg-gray-50 p-3 rounded text-left">
              <Text type="secondary" className="text-xs">测评链接：</Text>
              <Text copyable className="text-xs break-all">https://hr.feida.com/assessment/{selectedTool.id}</Text>
            </div>
            <Space>
              <Button icon={<SendOutlined />} type="primary">推送链接</Button>
              <Button icon={<CopyOutlined />}>复制链接</Button>
            </Space>
          </div>
        )}
      </Modal>

      {/* 能力素质编辑弹窗 */}
      <Modal title={editingCompetency ? '编辑能力素质' : '新建能力素质'} open={competencyModal} onOk={saveCompetency} onCancel={() => setCompetencyModal(false)} width={600}>
        <Form form={competencyForm} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="能力名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="category" label="冰山模型层面" rules={[{ required: true }]}>
              <Select>{Object.entries(icebergCategoryMap).map(([k, v]) => <Option key={k} value={k}>{v}</Option>)}</Select>
            </Form.Item></Col>
            <Col span={12}><Form.Item name="level" label="行为等级数" rules={[{ required: true }]}><InputNumber min={1} max={5} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="weight" label="默认权重(%)" rules={[{ required: true }]}><InputNumber min={1} max={100} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={24}><Form.Item name="description" label="能力描述"><TextArea rows={2} /></Form.Item></Col>
            <Col span={24}><Form.Item name="assessmentMethod" label="测评方式"><Input placeholder="如：笔试+面试、360度评估" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
