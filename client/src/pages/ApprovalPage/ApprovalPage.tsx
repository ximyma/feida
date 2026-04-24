import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, Popconfirm, message, Tabs, Row, Col, Steps,
  Divider, Timeline, Descriptions, Badge, InputNumber, Radio,
  Checkbox, Drawer, List, Avatar, Tooltip, Progress, Alert,
  Dropdown, Menu, Transfer, Switch, Collapse, Skeleton
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  UserOutlined, TeamOutlined, FileTextOutlined, SettingOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined,
  HistoryOutlined, CopyOutlined, DownOutlined, RightOutlined,
  AppstoreOutlined, FormOutlined, ScheduleOutlined, AuditOutlined,
  SignatureOutlined, MessageOutlined, ForwardOutlined, MinusCircleOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

// ============ 类型定义 ============
interface ApprovalRequest {
  id: string;
  type: 'leave' | 'overtime' | 'makeup' | 'transfer' | 'resignation' | 'regular' | 'promotion' | 'custom';
  title: string;
  applicantId: string;
  applicantName: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'withdrawn';
  currentNode: string;
  progress: number;
  submittedAt: string;
  formData: Record<string, any>;
  approvalChain: ApprovalNode[];
  comments: ApprovalComment[];
}

interface ApprovalNode {
  id: string;
  name: string;
  type: 'approver' | 'cc' | 'condition';
  assignee?: string;
  assigneeType?: 'user' | 'role' | 'department_head';
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  handledAt?: string;
  handlerName?: string;
  comment?: string;
  signature?: string;
}

interface ApprovalComment {
  id: string;
  nodeId: string;
  userName: string;
  action: 'approve' | 'reject' | 'comment' | 'transfer';
  comment: string;
  signature?: string;
  createdAt: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  category: 'attendance' | 'hr' | 'finance' | 'admin' | 'custom';
  description: string;
  nodes: WorkflowNode[];
  formFields: FormField[];
  status: 'active' | 'inactive';
  version: number;
}

interface WorkflowNode {
  id: string;
  name: string;
  type: 'start' | 'approver' | 'cc' | 'condition' | 'end';
  assignee?: string;
  assigneeType?: 'user' | 'role' | 'department_head' | 'initiator';
  conditions?: Condition[];
  nextNodes?: string[];
  position?: { x: number; y: number };
}

interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater' | 'less' | 'contains';
  value: any;
  nextNode: string;
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file' | 'table';
  required: boolean;
  options?: string[];
  defaultValue?: any;
  placeholder?: string;
  validation?: { min?: number; max?: number; pattern?: string };
}

interface QuickPhrase {
  id: string;
  content: string;
  category: 'approve' | 'reject' | 'general';
}

const typeMap: Record<string, { label: string; color: string }> = {
  leave: { label: '请假申请', color: 'blue' },
  overtime: { label: '加班申请', color: 'purple' },
  makeup: { label: '补卡申请', color: 'cyan' },
  transfer: { label: '调岗申请', color: 'orange' },
  resignation: { label: '离职申请', color: 'red' },
  regular: { label: '转正申请', color: 'green' },
  promotion: { label: '晋升申请', color: 'gold' },
  custom: { label: '自定义申请', color: 'default' },
};

const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: '审批中', color: 'processing', icon: <ClockCircleOutlined /> },
  approved: { label: '已通过', color: 'success', icon: <CheckCircleOutlined /> },
  rejected: { label: '已拒绝', color: 'error', icon: <CloseCircleOutlined /> },
  cancelled: { label: '已撤回', color: 'default', icon: <CloseCircleOutlined /> },
  withdrawn: { label: '已撤销', color: 'default', icon: <CloseCircleOutlined /> },
};

// ============ 模拟数据 ============
const generateMockRequests = (): ApprovalRequest[] => [
  {
    id: '1', type: 'leave', title: '年假申请', applicantId: 'EMP0001', applicantName: '张伟', department: '研发部',
    status: 'pending', currentNode: '部门经理审批', progress: 50, submittedAt: '2025-04-22 09:30',
    formData: { leaveType: 'annual', startDate: '2025-04-25', endDate: '2025-04-28', days: 3, reason: '家庭事务' },
    approvalChain: [
      { id: 'n1', name: '部门经理审批', type: 'approver', assigneeType: 'department_head', status: 'approved', handledAt: '2025-04-22 10:15', handlerName: '王经理', comment: '同意' },
      { id: 'n2', name: 'HR审批', type: 'approver', assignee: 'HR001', status: 'pending' },
      { id: 'n3', name: '抄送申请人', type: 'cc', status: 'pending' },
    ],
    comments: [{ id: 'c1', nodeId: 'n1', userName: '王经理', action: 'approve', comment: '同意请假申请', createdAt: '2025-04-22 10:15' }],
  },
  {
    id: '2', type: 'overtime', title: '周末加班申请', applicantId: 'EMP0002', applicantName: '李娜', department: '市场部',
    status: 'pending', currentNode: '部门经理审批', progress: 0, submittedAt: '2025-04-22 11:00',
    formData: { overtimeDate: '2025-04-26', hours: 8, reason: '项目赶工' },
    approvalChain: [
      { id: 'n1', name: '部门经理审批', type: 'approver', assigneeType: 'department_head', status: 'pending' },
      { id: 'n2', name: 'HR备案', type: 'cc', status: 'pending' },
    ],
    comments: [],
  },
  {
    id: '3', type: 'regular', title: '转正申请', applicantId: 'EMP0003', applicantName: '王芳', department: '财务部',
    status: 'approved', currentNode: '完成', progress: 100, submittedAt: '2025-04-20 14:00',
    formData: { probationStart: '2025-01-20', probationEnd: '2025-04-20', performance: '优秀', selfEvaluation: '工作认真负责' },
    approvalChain: [
      { id: 'n1', name: '部门经理审批', type: 'approver', status: 'approved', handledAt: '2025-04-20 16:00', handlerName: '刘经理', comment: '表现优秀，同意转正' },
      { id: 'n2', name: 'HR审批', type: 'approver', status: 'approved', handledAt: '2025-04-21 09:00', handlerName: '张HR', comment: '同意' },
    ],
    comments: [
      { id: 'c1', nodeId: 'n1', userName: '刘经理', action: 'approve', comment: '表现优秀，同意转正', createdAt: '2025-04-20 16:00' },
      { id: 'c2', nodeId: 'n2', userName: '张HR', action: 'approve', comment: '同意', createdAt: '2025-04-21 09:00' },
    ],
  },
  {
    id: '4', type: 'transfer', title: '调岗申请', applicantId: 'EMP0004', applicantName: '赵明', department: '行政部',
    status: 'rejected', currentNode: '完成', progress: 100, submittedAt: '2025-04-19 10:00',
    formData: { targetDept: '研发部', targetPosition: '前端开发', reason: '专业对口' },
    approvalChain: [
      { id: 'n1', name: '部门经理审批', type: 'approver', status: 'approved', handledAt: '2025-04-19 14:00', handlerName: '孙经理', comment: '同意调出' },
      { id: 'n2', name: '目标部门经理审批', type: 'approver', status: 'rejected', handledAt: '2025-04-19 16:00', handlerName: '周经理', comment: '目前岗位满员' },
    ],
    comments: [
      { id: 'c1', nodeId: 'n1', userName: '孙经理', action: 'approve', comment: '同意调出', createdAt: '2025-04-19 14:00' },
      { id: 'c2', nodeId: 'n2', userName: '周经理', action: 'reject', comment: '目前岗位满员', createdAt: '2025-04-19 16:00' },
    ],
  },
  {
    id: '5', type: 'resignation', title: '离职申请', applicantId: 'EMP0005', applicantName: '陈刚', department: '技术部',
    status: 'pending', currentNode: 'HR面谈', progress: 33, submittedAt: '2025-04-21 09:00',
    formData: { resignReason: '个人发展', lastWorkDay: '2025-05-21', handoverPerson: '刘强' },
    approvalChain: [
      { id: 'n1', name: '部门经理审批', type: 'approver', status: 'approved', handledAt: '2025-04-21 11:00', handlerName: '吴经理', comment: '同意' },
      { id: 'n2', name: 'HR面谈', type: 'approver', status: 'pending' },
      { id: 'n3', name: 'HR总监审批', type: 'approver', status: 'pending' },
    ],
    comments: [
      { id: 'c1', nodeId: 'n1', userName: '吴经理', action: 'approve', comment: '同意', createdAt: '2025-04-21 11:00' },
    ],
  },
];

const generateMockTemplates = (): WorkflowTemplate[] => [
  {
    id: '1', name: '请假审批流程', category: 'attendance', description: '适用于各类请假申请', status: 'active', version: 1,
    formFields: [
      { id: 'f1', name: 'leaveType', label: '请假类型', type: 'select', required: true, options: ['年假', '病假', '事假', '婚假', '产假', '丧假'] },
      { id: 'f2', name: 'dateRange', label: '请假时间', type: 'dateRange', required: true },
      { id: 'f3', name: 'days', label: '请假天数', type: 'number', required: true },
      { id: 'f4', name: 'reason', label: '请假原因', type: 'textarea', required: true },
    ],
    nodes: [
      { id: 'start', name: '开始', type: 'start', nextNodes: ['n1'] },
      { id: 'n1', name: '部门经理审批', type: 'approver', assigneeType: 'department_head', nextNodes: ['n2'] },
      { id: 'n2', name: 'HR审批', type: 'approver', assigneeType: 'role', assignee: 'hr_manager', nextNodes: ['n3'] },
      { id: 'n3', name: '抄送', type: 'cc', assigneeType: 'initiator', nextNodes: ['end'] },
      { id: 'end', name: '结束', type: 'end' },
    ],
  },
  {
    id: '2', name: '加班审批流程', category: 'attendance', description: '适用于加班申请', status: 'active', version: 1,
    formFields: [
      { id: 'f1', name: 'overtimeDate', label: '加班日期', type: 'date', required: true },
      { id: 'f2', name: 'hours', label: '加班时长(小时)', type: 'number', required: true },
      { id: 'f3', name: 'reason', label: '加班原因', type: 'textarea', required: true },
    ],
    nodes: [
      { id: 'start', name: '开始', type: 'start', nextNodes: ['n1'] },
      { id: 'n1', name: '部门经理审批', type: 'approver', assigneeType: 'department_head', nextNodes: ['n2'] },
      { id: 'n2', name: 'HR备案', type: 'cc', nextNodes: ['end'] },
      { id: 'end', name: '结束', type: 'end' },
    ],
  },
  {
    id: '3', name: '离职审批流程', category: 'hr', description: '适用于员工离职申请', status: 'active', version: 2,
    formFields: [
      { id: 'f1', name: 'resignReason', label: '离职原因', type: 'textarea', required: true },
      { id: 'f2', name: 'lastWorkDay', label: '期望最后工作日', type: 'date', required: true },
      { id: 'f3', name: 'handoverPerson', label: '工作交接人', type: 'select', required: true },
    ],
    nodes: [
      { id: 'start', name: '开始', type: 'start', nextNodes: ['n1'] },
      { id: 'n1', name: '部门经理审批', type: 'approver', assigneeType: 'department_head', nextNodes: ['n2'] },
      { id: 'n2', name: 'HR面谈', type: 'approver', assigneeType: 'role', assignee: 'hr', nextNodes: ['n3'] },
      { id: 'n3', name: '交接确认', type: 'approver', assigneeType: 'user', nextNodes: ['n4'] },
      { id: 'n4', name: 'HR总监审批', type: 'approver', assigneeType: 'role', assignee: 'hr_director', nextNodes: ['end'] },
      { id: 'end', name: '结束', type: 'end' },
    ],
  },
  {
    id: '4', name: '报销审批流程', category: 'finance', description: '适用于费用报销申请', status: 'active', version: 1,
    formFields: [
      { id: 'f1', name: 'expenseType', label: '费用类型', type: 'select', required: true, options: ['差旅费', '办公用品', '招待费', '交通费', '其他'] },
      { id: 'f2', name: 'amount', label: '报销金额', type: 'number', required: true },
      { id: 'f3', name: 'invoiceDate', label: '发票日期', type: 'date', required: true },
      { id: 'f4', name: 'description', label: '费用说明', type: 'textarea', required: true },
    ],
    nodes: [
      { id: 'start', name: '开始', type: 'start', nextNodes: ['n1'] },
      { id: 'n1', name: '部门经理审批', type: 'approver', assigneeType: 'department_head', nextNodes: ['n2'] },
      { id: 'n2', name: '财务审核', type: 'approver', assigneeType: 'role', assignee: 'finance', nextNodes: ['end'] },
      { id: 'end', name: '结束', type: 'end' },
    ],
  },
];

const generateQuickPhrases = (): QuickPhrase[] => [
  { id: 'p1', content: '同意', category: 'approve' },
  { id: 'p2', content: '同意，请按流程办理', category: 'approve' },
  { id: 'p3', content: '同意，注意后续跟进', category: 'approve' },
  { id: 'p4', content: '不同意', category: 'reject' },
  { id: 'p5', content: '理由不充分，请补充说明', category: 'reject' },
  { id: 'p6', content: '已收到，知晓', category: 'general' },
  { id: 'p7', content: '请补充相关材料', category: 'general' },
];

export default function ApprovalPage() {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [quickPhrases, setQuickPhrases] = useState<QuickPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailDrawer, setDetailDrawer] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [applyModal, setApplyModal] = useState(false);
  const [templateModal, setTemplateModal] = useState(false);
  const [signatureModal, setSignatureModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<WorkflowTemplate | null>(null);
  const [templateForm] = Form.useForm();
  const [applyForm] = Form.useForm();
  const [approvalComment, setApprovalComment] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  // 模板编辑：流程节点和表单字段临时状态
  const [editingNodes, setEditingNodes] = useState<WorkflowNode[]>([]);
  const [editingFormFields, setEditingFormFields] = useState<FormField[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [reqRes, tempRes, phraseRes] = await Promise.allSettled([
          fetch('/api/approval_requests'), fetch('/api/workflow_templates'), fetch('/api/quick_phrases'),
        ]);
        let [r, t, p] = [[], [], []] as any[];
        if (reqRes.status === 'fulfilled' && reqRes.value.ok) { const j = await reqRes.value.json(); if (Array.isArray(j)) r = j; }
        if (tempRes.status === 'fulfilled' && tempRes.value.ok) { const j = await tempRes.value.json(); if (Array.isArray(j)) t = j; }
        if (phraseRes.status === 'fulfilled' && phraseRes.value.ok) { const j = await phraseRes.value.json(); if (Array.isArray(j)) p = j; }
        if (r.length === 0) r = generateMockRequests();
        if (t.length === 0) t = generateMockTemplates();
        if (p.length === 0) p = generateQuickPhrases();
        setRequests(r); setTemplates(t); setQuickPhrases(p);
      } catch {
        setRequests(generateMockRequests()); setTemplates(generateMockTemplates()); setQuickPhrases(generateQuickPhrases());
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    myPending: requests.filter(r => r.status === 'pending').length,
  };

  // 审批操作
  const handleApprove = (request: ApprovalRequest) => {
    Modal.confirm({
      title: '审批通过',
      content: (
        <div className="space-y-3">
          <TextArea rows={3} placeholder="审批意见" value={approvalComment} onChange={e => setApprovalComment(e.target.value)} />
          <div className="text-sm text-muted-foreground">常用语：</div>
          <div className="flex flex-wrap gap-1">
            {quickPhrases.filter(p => p.category === 'approve').map(p => (
              <Tag key={p.id} className="cursor-pointer hover:bg-blue-100" onClick={() => setApprovalComment(p.content)}>{p.content}</Tag>
            ))}
          </div>
        </div>
      ),
      onOk() {
        setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'approved', progress: 100 } : r));
        messageApi.success('审批通过');
        setApprovalComment('');
      },
    });
  };

  const handleReject = (request: ApprovalRequest) => {
    Modal.confirm({
      title: '审批拒绝',
      content: (
        <div className="space-y-3">
          <TextArea rows={3} placeholder="拒绝原因" value={approvalComment} onChange={e => setApprovalComment(e.target.value)} />
          <div className="text-sm text-muted-foreground">常用语：</div>
          <div className="flex flex-wrap gap-1">
            {quickPhrases.filter(p => p.category === 'reject').map(p => (
              <Tag key={p.id} className="cursor-pointer hover:bg-red-100" onClick={() => setApprovalComment(p.content)}>{p.content}</Tag>
            ))}
          </div>
        </div>
      ),
      onOk() {
        setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'rejected' } : r));
        messageApi.success('已拒绝');
        setApprovalComment('');
      },
    });
  };

  const handleTransfer = (request: ApprovalRequest) => {
    Modal.confirm({
      title: '转交他人',
      content: (
        <div className="space-y-3">
          <Select placeholder="选择转交对象" style={{ width: '100%' }}>
            <Option value="user1">张三</Option>
            <Option value="user2">李四</Option>
            <Option value="user3">王五</Option>
          </Select>
          <TextArea rows={2} placeholder="转交说明" />
        </div>
      ),
      onOk() { messageApi.success('已转交'); },
    });
  };

  // ========== 模板管理 CRUD（增强版） ==========
  const handleAddTemplate = () => {
    setEditingTemplate(null);
    templateForm.resetFields();
    setEditingNodes([
      { id: 'start', name: '开始', type: 'start', nextNodes: ['n1'] },
      { id: 'n1', name: '审批人', type: 'approver', assigneeType: 'department_head', nextNodes: ['end'] },
      { id: 'end', name: '结束', type: 'end' },
    ]);
    setEditingFormFields([]);
    setTemplateModal(true);
  };

  const handleEditTemplate = (template: WorkflowTemplate) => {
    setEditingTemplate(template);
    templateForm.setFieldsValue({
      name: template.name,
      category: template.category,
      description: template.description,
      status: template.status,
    });
    setEditingNodes([...template.nodes]);
    setEditingFormFields([...template.formFields]);
    setTemplateModal(true);
  };

  const handleDeleteTemplate = (template: WorkflowTemplate) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除流程模板「${template.name}」吗？`,
      okText: '删除',
      okType: 'danger',
      onOk() {
        setTemplates(prev => prev.filter(t => t.id !== template.id));
        messageApi.success('模板已删除');
      },
    });
  };

  const handleSaveTemplate = async () => {
    try {
      const values = await templateForm.validateFields();
      // 过滤掉start和end节点，只保留业务节点
      const businessNodes = editingNodes;
      if (editingTemplate) {
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? {
          ...t,
          ...values,
          nodes: businessNodes,
          formFields: editingFormFields,
          version: t.version + 1,
        } : t));
        messageApi.success('模板已更新');
      } else {
        const newTemplate: WorkflowTemplate = {
          id: String(Date.now()),
          ...values,
          formFields: editingFormFields,
          nodes: businessNodes,
          version: 1,
        };
        setTemplates(prev => [...prev, newTemplate]);
        messageApi.success('模板已创建');
      }
      setTemplateModal(false);
    } catch {}
  };

  const handleToggleTemplateStatus = (template: WorkflowTemplate) => {
    const newStatus = template.status === 'active' ? 'inactive' : 'active';
    setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, status: newStatus } : t));
    messageApi.success(newStatus === 'active' ? '模板已启用' : '模板已停用');
  };

  // 流程节点增删改
  const addNode = () => {
    const id = `n${Date.now()}`;
    setEditingNodes(prev => {
      // 在end节点之前插入
      const endIdx = prev.findIndex(n => n.type === 'end');
      const newNode: WorkflowNode = { id, name: '新审批节点', type: 'approver', assigneeType: 'department_head' };
      if (endIdx >= 0) {
        return [...prev.slice(0, endIdx), newNode, prev[endIdx]];
      }
      return [...prev, newNode];
    });
  };

  const removeNode = (nodeId: string) => {
    setEditingNodes(prev => prev.filter(n => n.id !== nodeId));
  };

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setEditingNodes(prev => prev.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  };

  // 表单字段增删改
  const addFormField = () => {
    const id = `f${Date.now()}`;
    setEditingFormFields(prev => [...prev, {
      id, name: `field_${Date.now()}`, label: '新字段', type: 'text', required: false,
    }]);
  };

  const removeFormField = (fieldId: string) => {
    setEditingFormFields(prev => prev.filter(f => f.id !== fieldId));
  };

  const updateFormField = (fieldId: string, updates: Partial<FormField>) => {
    setEditingFormFields(prev => prev.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  // 查看详情
  const viewDetail = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setDetailDrawer(true);
  };

  // 发起申请
  const openApplyModal = (template?: WorkflowTemplate) => {
    setSelectedTemplate(template || null);
    if (template) {
      const initialValues: Record<string, any> = {};
      template.formFields.forEach(f => { if (f.defaultValue) initialValues[f.name] = f.defaultValue; });
      applyForm.setFieldsValue(initialValues);
    } else {
      applyForm.resetFields();
    }
    setApplyModal(true);
  };

  const submitApply = async () => {
    try {
      const values = await applyForm.validateFields();
      setRequests(prev => [...prev, {
        id: String(Date.now()),
        type: 'custom',
        title: selectedTemplate?.name || '自定义申请',
        applicantId: 'EMP0001',
        applicantName: '当前用户',
        department: '研发部',
        status: 'pending',
        currentNode: '部门经理审批',
        progress: 0,
        submittedAt: new Date().toISOString(),
        formData: values,
        approvalChain: selectedTemplate?.nodes.filter(n => n.type !== 'start' && n.type !== 'end').map(n => ({ ...n, status: 'pending' as const })) || [],
        comments: [],
      }]);
      messageApi.success('申请已提交');
      setApplyModal(false);
    } catch { }
  };

  const tabs = [
    { key: 'pending', label: '待我审批', icon: <ClockCircleOutlined /> },
    { key: 'handled', label: '已处理', icon: <CheckCircleOutlined /> },
    { key: 'my', label: '我的申请', icon: <FileTextOutlined /> },
    { key: 'templates', label: '流程模板', icon: <SettingOutlined /> },
  ];

  const columns = [
    { title: '申请类型', dataIndex: 'type', key: 'type', width: 100, render: (v: string) => <Tag color={typeMap[v]?.color}>{typeMap[v]?.label}</Tag> },
    { title: '申请标题', dataIndex: 'title', key: 'title', width: 180 },
    { title: '申请人', dataIndex: 'applicantName', key: 'applicant', width: 90 },
    { title: '部门', dataIndex: 'department', key: 'dept', width: 100 },
    { title: '当前节点', dataIndex: 'currentNode', key: 'currentNode', width: 120, render: (v: string) => <Tag>{v}</Tag> },
    { title: '进度', dataIndex: 'progress', key: 'progress', width: 100, render: (v: number) => <Progress percent={v} size="small" /> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label}</Tag> },
    { title: '提交时间', dataIndex: 'submittedAt', key: 'submittedAt', width: 140 },
    { title: '操作', key: 'action', width: 200, render: (_: any, r: ApprovalRequest) => (
      <Space size="small">
        <Button size="small" type="link" onClick={() => viewDetail(r)}>详情</Button>
        {r.status === 'pending' && activeTab === 'pending' && (
          <>
            <Button size="small" type="link" style={{ color: '#52c41a' }} onClick={() => handleApprove(r)}>通过</Button>
            <Button size="small" type="link" danger onClick={() => handleReject(r)}>拒绝</Button>
            <Button size="small" type="link" onClick={() => handleTransfer(r)}>转交</Button>
          </>
        )}
        {r.status === 'pending' && activeTab === 'my' && (
          <Button size="small" type="link" onClick={() => {
            setRequests(prev => prev.map(x => x.id === r.id ? { ...x, status: 'withdrawn' as const } : x));
            messageApi.success('已撤回');
          }}>撤回</Button>
        )}
      </Space>
    )},
  ];

  const templateColumns = [
    { title: '流程名称', dataIndex: 'name', key: 'name', width: 160 },
    { title: '分类', dataIndex: 'category', key: 'category', width: 80, render: (v: string) => {
      const map: Record<string, string> = { attendance: '考勤', hr: '人事', finance: '财务', admin: '行政', custom: '自定义' };
      return <Tag>{map[v]}</Tag>;
    }},
    { title: '描述', dataIndex: 'description', key: 'desc', width: 180 },
    { title: '表单字段', key: 'fields', width: 80, render: (_: any, r: WorkflowTemplate) => <Tag color="blue">{r.formFields.length}个</Tag> },
    { title: '审批节点', key: 'nodes', width: 80, render: (_: any, r: WorkflowTemplate) => <Tag color="green">{r.nodes.filter(n => n.type === 'approver').length}个</Tag> },
    { title: '版本', dataIndex: 'version', key: 'version', width: 60, render: (v: number) => `v${v}` },
    { title: '状态', dataIndex: 'status', key: 'status', width: 70, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? '启用' : '停用'}</Tag> },
    { title: '操作', key: 'action', width: 260, render: (_: any, r: WorkflowTemplate) => (
      <Space size="small">
        <Button size="small" type="primary" onClick={() => openApplyModal(r)}>发起申请</Button>
        <Button size="small" type="link" onClick={() => handleEditTemplate(r)}>编辑</Button>
        <Button size="small" type="link" onClick={() => {
          // 复制模板
          const copied: WorkflowTemplate = { ...r, id: String(Date.now()), name: `${r.name} (副本)`, version: 1 };
          setTemplates(prev => [...prev, copied]);
          messageApi.success('模板已复制');
        }} icon={<CopyOutlined />}>复制</Button>
        <Button size="small" type="link" onClick={() => handleToggleTemplateStatus(r)}>{r.status === 'active' ? '停用' : '启用'}</Button>
        <Popconfirm title="确定删除此模板?" onConfirm={() => handleDeleteTemplate(r)}>
          <Button size="small" type="link" danger>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'pending') return r.status === 'pending';
    if (activeTab === 'handled') return r.status === 'approved' || r.status === 'rejected';
    if (activeTab === 'my') return true;
    return true;
  });

  return (
    <div className="p-6 space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">流程审批</h2><p className="text-sm text-muted-foreground">考勤申请 · 人事申请 · 自定义流程 · 工作流引擎</p></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openApplyModal()}>发起申请</Button>
      </div>

      <Row gutter={16}>
        <Col span={6}><Card size="small" className="cursor-pointer hover:shadow-md" onClick={() => setActiveTab('pending')}><Statistic title="待我审批" value={stats.pending} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已通过" value={stats.approved} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="流程模板" value={templates.length} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已拒绝" value={stats.rejected} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{ marginBottom: 16 }} items={tabs} />

        {activeTab !== 'templates' && (
          <Table columns={columns} dataSource={filteredRequests} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Alert message="工作流引擎：支持多分支、条件判断、自动流转。可自定义审批节点、抄送人、条件分支。" type="info" showIcon className="flex-1" />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTemplate} className="ml-4">新建模板</Button>
            </div>
            <Table columns={templateColumns} dataSource={templates} rowKey="id" loading={loading} pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: (record: WorkflowTemplate) => (
                  <div className="p-4 bg-gray-50 rounded space-y-3">
                    <div>
                      <Text strong>表单字段：</Text>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {record.formFields.map(f => (
                          <Tag key={f.id} color={f.required ? 'blue' : 'default'}>{f.label} ({f.type}){f.required && '*'}</Tag>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Text strong>审批流程：</Text>
                      <Steps current={-1} size="small" className="mt-2">
                        {record.nodes.filter(n => n.type !== 'start' && n.type !== 'end').map((n, i) => (
                          <Steps.Step key={n.id} title={n.name} description={
                            n.type === 'approver' ? `审批节点 (${n.assigneeType === 'department_head' ? '部门经理' : n.assigneeType === 'role' ? '角色' : '指定人'})` :
                            n.type === 'cc' ? '抄送' : '条件'
                          } />
                        ))}
                      </Steps>
                    </div>
                  </div>
                ),
              }}
            />
          </div>
        )}
      </Card>

      {/* 详情抽屉 */}
      <Drawer title="申请详情" open={detailDrawer} onClose={() => setDetailDrawer(false)} width={640}>
        {selectedRequest && (
          <div className="space-y-4">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="申请类型"><Tag color={typeMap[selectedRequest.type]?.color}>{typeMap[selectedRequest.type]?.label}</Tag></Descriptions.Item>
              <Descriptions.Item label="申请标题">{selectedRequest.title}</Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedRequest.applicantName}</Descriptions.Item>
              <Descriptions.Item label="部门">{selectedRequest.department}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={statusMap[selectedRequest.status]?.color}>{statusMap[selectedRequest.status]?.label}</Tag></Descriptions.Item>
              <Descriptions.Item label="提交时间">{selectedRequest.submittedAt}</Descriptions.Item>
            </Descriptions>

            <Divider>表单数据</Divider>
            <Descriptions column={1} bordered size="small">
              {Object.entries(selectedRequest.formData).map(([k, v]) => (
                <Descriptions.Item key={k} label={k}>{String(v)}</Descriptions.Item>
              ))}
            </Descriptions>

            <Divider>审批流程</Divider>
            <Steps current={selectedRequest.approvalChain.findIndex(n => n.status === 'pending')} status={selectedRequest.status === 'rejected' ? 'error' : 'process'} direction="vertical">
              {selectedRequest.approvalChain.map((node, i) => (
                <Steps.Step
                  key={node.id}
                  title={node.name}
                  description={
                    <div>
                      {node.handlerName && <Text type="secondary">{node.handlerName} · {node.handledAt}</Text>}
                      {node.comment && <div className="mt-1">{node.comment}</div>}
                    </div>
                  }
                  status={node.status === 'approved' ? 'finish' : node.status === 'rejected' ? 'error' : 'wait'}
                />
              ))}
            </Steps>

            <Divider>审批记录</Divider>
            <Timeline items={selectedRequest.comments.map(c => ({
              color: c.action === 'approve' ? 'green' : c.action === 'reject' ? 'red' : 'blue',
              children: (
                <div>
                  <Text strong>{c.userName}</Text>
                  <Tag color={c.action === 'approve' ? 'green' : c.action === 'reject' ? 'red' : 'blue'} className="ml-2">
                    {c.action === 'approve' ? '通过' : c.action === 'reject' ? '拒绝' : c.action === 'transfer' ? '转交' : '评论'}
                  </Tag>
                  <div className="mt-1 text-sm">{c.comment}</div>
                  <Text type="secondary" className="text-xs">{c.createdAt}</Text>
                </div>
              ),
            }))} />

            <Divider>操作</Divider>
            {selectedRequest.status === 'pending' && (
              <Space>
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => { handleApprove(selectedRequest); setDetailDrawer(false); }}>通过</Button>
                <Button danger icon={<CloseCircleOutlined />} onClick={() => { handleReject(selectedRequest); setDetailDrawer(false); }}>拒绝</Button>
                <Button icon={<ForwardOutlined />} onClick={() => handleTransfer(selectedRequest)}>转交</Button>
              </Space>
            )}
          </div>
        )}
      </Drawer>

      {/* 发起申请弹窗 */}
      <Modal title={selectedTemplate ? `发起申请 - ${selectedTemplate.name}` : '发起申请'} open={applyModal} onOk={submitApply} onCancel={() => setApplyModal(false)} width={640}>
        <Form form={applyForm} layout="vertical" size="small">
          {!selectedTemplate && (
            <>
              <Form.Item name="type" label="申请类型" rules={[{ required: true }]}>
                <Select placeholder="选择申请类型">
                  {Object.entries(typeMap).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="title" label="申请标题" rules={[{ required: true }]}><Input placeholder="申请标题" /></Form.Item>
            </>
          )}
          {selectedTemplate?.formFields.map(field => (
            <Form.Item key={field.id} name={field.name} label={field.label} rules={[{ required: field.required }]}>
              {field.type === 'text' && <Input placeholder={field.placeholder} />}
              {field.type === 'number' && <InputNumber style={{ width: '100%' }} />}
              {field.type === 'date' && <DatePicker style={{ width: '100%' }} />}
              {field.type === 'dateRange' && <RangePicker style={{ width: '100%' }} />}
              {field.type === 'select' && <Select>{field.options?.map(o => <Option key={o} value={o}>{o}</Option>)}</Select>}
              {field.type === 'textarea' && <TextArea rows={3} placeholder={field.placeholder} />}
            </Form.Item>
          ))}
        </Form>
      </Modal>

      {/* ========== 模板编辑弹窗（增强版：含流程节点和表单字段配置） ========== */}
      <Modal
        title={editingTemplate ? '编辑模板' : '新建模板'}
        open={templateModal}
        onOk={handleSaveTemplate}
        onCancel={() => setTemplateModal(false)}
        width={860}
        okText="保存"
      >
        <Collapse defaultActiveKey={['basic', 'nodes', 'fields']} ghost>
          <Panel header="📋 基本信息" key="basic">
            <Form form={templateForm} layout="vertical" size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="流程名称" rules={[{ required: true, message: '请输入流程名称' }]}>
                    <Input placeholder="例如：请假审批流程" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="category" label="分类" rules={[{ required: true }]}>
                    <Select placeholder="选择分类">
                      <Option value="attendance">考勤</Option>
                      <Option value="hr">人事</Option>
                      <Option value="finance">财务</Option>
                      <Option value="admin">行政</Option>
                      <Option value="custom">自定义</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="description" label="描述">
                <TextArea rows={2} placeholder="流程描述" />
              </Form.Item>
              <Form.Item name="status" label="状态" initialValue="active">
                <Radio.Group>
                  <Radio value="active">启用</Radio>
                  <Radio value="inactive">停用</Radio>
                </Radio.Group>
              </Form.Item>
            </Form>
          </Panel>

          <Panel header={`🔗 审批流程节点 (${editingNodes.filter(n => n.type !== 'start' && n.type !== 'end').length}个)`} key="nodes">
            <div className="space-y-3">
              <Alert message="流程从「开始」节点出发，依次经过各审批/抄送节点，最终到达「结束」节点" type="info" showIcon className="mb-3" />
              
              {/* 节点可视化流程图 */}
              <div className="flex items-center gap-2 flex-wrap mb-4 p-3 bg-gray-50 rounded">
                {editingNodes.map((node, idx) => (
                  <React.Fragment key={node.id}>
                    <div className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                      node.type === 'start' ? 'bg-green-50 border-green-300 text-green-700' :
                      node.type === 'end' ? 'bg-red-50 border-red-300 text-red-700' :
                      node.type === 'approver' ? 'bg-blue-50 border-blue-300 text-blue-700' :
                      node.type === 'cc' ? 'bg-yellow-50 border-yellow-300 text-yellow-700' :
                      'bg-purple-50 border-purple-300 text-purple-700'
                    }`}>
                      {node.type === 'start' ? '🟢 开始' : node.type === 'end' ? '🔴 结束' : node.name}
                    </div>
                    {idx < editingNodes.length - 1 && <RightOutlined className="text-gray-400" />}
                  </React.Fragment>
                ))}
              </div>

              {/* 节点列表 - 可编辑 */}
              {editingNodes.map((node, idx) => {
                if (node.type === 'start' || node.type === 'end') return null;
                return (
                  <div key={node.id} className="border rounded-lg p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">节点 {idx}：{node.name}</span>
                      <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeNode(node.id)}>删除</Button>
                    </div>
                    <Row gutter={12}>
                      <Col span={8}>
                        <div className="text-xs text-muted-foreground mb-1">节点名称</div>
                        <Input size="small" value={node.name} onChange={e => updateNode(node.id, { name: e.target.value })} placeholder="节点名称" />
                      </Col>
                      <Col span={6}>
                        <div className="text-xs text-muted-foreground mb-1">节点类型</div>
                        <Select size="small" value={node.type} style={{ width: '100%' }} onChange={v => updateNode(node.id, { type: v as WorkflowNode['type'] })}>
                          <Option value="approver">审批节点</Option>
                          <Option value="cc">抄送节点</Option>
                          <Option value="condition">条件分支</Option>
                        </Select>
                      </Col>
                      <Col span={10}>
                        <div className="text-xs text-muted-foreground mb-1">审批人类型</div>
                        <Select size="small" value={node.assigneeType} style={{ width: '100%' }} onChange={v => updateNode(node.id, { assigneeType: v as WorkflowNode['assigneeType'] })}>
                          <Option value="department_head">部门经理</Option>
                          <Option value="role">指定角色</Option>
                          <Option value="user">指定人员</Option>
                          <Option value="initiator">申请人</Option>
                        </Select>
                      </Col>
                    </Row>
                    {node.assigneeType === 'role' && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">角色</div>
                        <Input size="small" value={node.assignee || ''} onChange={e => updateNode(node.id, { assignee: e.target.value })} placeholder="角色标识，如 hr_manager" />
                      </div>
                    )}
                    {node.assigneeType === 'user' && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">指定人员</div>
                        <Input size="small" value={node.assignee || ''} onChange={e => updateNode(node.id, { assignee: e.target.value })} placeholder="人员ID" />
                      </div>
                    )}
                  </div>
                );
              })}

              <Button type="dashed" block icon={<PlusOutlined />} onClick={addNode}>添加审批节点</Button>
            </div>
          </Panel>

          <Panel header={`📝 表单字段 (${editingFormFields.length}个)`} key="fields">
            <div className="space-y-3">
              <Alert message="表单字段定义申请人需要填写的表单内容" type="info" showIcon className="mb-3" />
              
              {editingFormFields.map(field => (
                <div key={field.id} className="border rounded-lg p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{field.label} <Tag color="blue" className="ml-1">{field.type}</Tag></span>
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeFormField(field.id)}>删除</Button>
                  </div>
                  <Row gutter={12}>
                    <Col span={6}>
                      <div className="text-xs text-muted-foreground mb-1">字段标签</div>
                      <Input size="small" value={field.label} onChange={e => updateFormField(field.id, { label: e.target.value })} />
                    </Col>
                    <Col span={6}>
                      <div className="text-xs text-muted-foreground mb-1">字段名(name)</div>
                      <Input size="small" value={field.name} onChange={e => updateFormField(field.id, { name: e.target.value })} />
                    </Col>
                    <Col span={5}>
                      <div className="text-xs text-muted-foreground mb-1">类型</div>
                      <Select size="small" value={field.type} style={{ width: '100%' }} onChange={v => updateFormField(field.id, { type: v as FormField['type'] })}>
                        <Option value="text">文本</Option>
                        <Option value="number">数字</Option>
                        <Option value="date">日期</Option>
                        <Option value="dateRange">日期范围</Option>
                        <Option value="select">下拉选择</Option>
                        <Option value="radio">单选</Option>
                        <Option value="checkbox">多选</Option>
                        <Option value="textarea">多行文本</Option>
                        <Option value="file">附件</Option>
                      </Select>
                    </Col>
                    <Col span={5}>
                      <div className="text-xs text-muted-foreground mb-1">必填</div>
                      <Switch size="small" checked={field.required} onChange={v => updateFormField(field.id, { required: v })} />
                    </Col>
                  </Row>
                  {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">选项（逗号分隔）</div>
                      <Input size="small" value={(field.options || []).join(',')} onChange={e => updateFormField(field.id, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="选项1,选项2,选项3" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">占位提示</div>
                    <Input size="small" value={field.placeholder || ''} onChange={e => updateFormField(field.id, { placeholder: e.target.value })} placeholder="输入提示文字" />
                  </div>
                </div>
              ))}

              <Button type="dashed" block icon={<PlusOutlined />} onClick={addFormField}>添加表单字段</Button>
            </div>
          </Panel>
        </Collapse>
      </Modal>
    </div>
  );
}
