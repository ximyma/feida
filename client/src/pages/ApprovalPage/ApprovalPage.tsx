import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag, Space,
  Popconfirm, message, Tabs, Row, Col, Steps, Divider, Descriptions,
  Badge, Drawer, List, Tooltip, Progress, Alert, Collapse
} from 'antd';
const { TextArea } = Input;
import {
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  SendOutlined, HistoryOutlined, AuditOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Panel } = Collapse;

// ============ 类型定义 ============
interface ApprovalRequest {
  id: string;
  flowId: string;
  module: string;
  title: string;
  applicantId: string;
  applicantName: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  currentStep: number;
  formData: string;
  submittedAt: string;
  completedAt?: string;
  createdAt: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  steps: string;
  isActive: number;
  createdBy: string;
  createdAt: string;
}

const moduleLabels: Record<string, string> = {
  leave: '请假申请',
  overtime: '加班申请',
  makeup: '补卡申请',
  transfer: '调岗申请',
  resignation: '离职申请',
  regular: '转正申请',
  promotion: '晋升申请',
  expense: '报销申请',
  purchase: '采购申请',
  custom: '其他申请'
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: '审批中', color: 'processing' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已拒绝', color: 'error' },
  cancelled: { label: '已撤回', color: 'default' }
};

export default function ApprovalPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const [detailModal, setDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [templateModal, setTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkflowTemplate | null>(null);
  const [approvalComment, setApprovalComment] = useState('');

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, tempRes] = await Promise.all([
        fetch('/api/approval_requests').then(r => r.json()).catch(() => []),
        fetch('/api/workflow_templates').then(r => r.json()).catch(() => [])
      ]);
      setRequests(Array.isArray(reqRes) ? reqRes : []);
      setTemplates(Array.isArray(tempRes) ? tempRes : []);
    } catch {
      messageApi.error('加载数据失败');
    }
    setLoading(false);
  }, [messageApi]);

  useEffect(() => { loadData(); }, [loadData]);

  // 统计
  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    total: requests.length
  };

  // 审批操作
  const handleApprove = async (request: ApprovalRequest) => {
    Modal.confirm({
      title: '审批通过',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: (
        <div className="space-y-2">
          <TextArea rows={2} placeholder="审批意见（可选）" value={approvalComment} onChange={e => setApprovalComment(e.target.value)} />
        </div>
      ),
      onOk: async () => {
        const res = await fetch(`/api/approval_requests/${request.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved', completedAt: new Date().toISOString() })
        });
        if (res.ok) {
          messageApi.success('审批通过');
          setApprovalComment('');
          loadData();
        }
      }
    });
  };

  const handleReject = async (request: ApprovalRequest) => {
    Modal.confirm({
      title: '审批拒绝',
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div className="space-y-2">
          <TextArea rows={2} placeholder="拒绝原因" value={approvalComment} onChange={e => setApprovalComment(e.target.value)} />
        </div>
      ),
      onOk: async () => {
        const res = await fetch(`/api/approval_requests/${request.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected', completedAt: new Date().toISOString() })
        });
        if (res.ok) {
          messageApi.success('已拒绝');
          setApprovalComment('');
          loadData();
        }
      }
    });
  };

  const handleWithdraw = async (request: ApprovalRequest) => {
    const res = await fetch(`/api/approval_requests/${request.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    });
    if (res.ok) {
      messageApi.success('已撤回');
      loadData();
    }
  };

  // 模板操作
  const openTemplateModal = (template?: WorkflowTemplate) => {
    setEditingTemplate(template || null);
    if (template) {
      form.setFieldsValue({
        ...template,
        isActive: template.isActive === 1,
        steps: JSON.parse(template.steps || '[]')
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ steps: [{ name: '' }], isActive: true });
    }
    setTemplateModal(true);
  };

  const saveTemplate = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        id: editingTemplate?.id || `wt_${Date.now()}`,
        name: values.name,
        type: values.type,
        description: values.description || '',
        steps: JSON.stringify(values.steps || []),
        isActive: values.isActive ? 1 : 0,
        createdBy: '系统管理员'
      };
      const url = editingTemplate ? `/api/workflow_templates/${editingTemplate.id}` : '/api/workflow_templates';
      const method = editingTemplate ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok || res.status === 200) {
        messageApi.success(editingTemplate ? '模板已更新' : '模板已创建');
        setTemplateModal(false);
        loadData();
      }
    } catch {}
  };

  const deleteTemplate = async (id: string) => {
    await fetch(`/api/workflow_templates/${id}`, { method: 'DELETE' });
    messageApi.success('模板已删除');
    loadData();
  };

  // 列定义
  const requestColumns = [
    { title: '标题', dataIndex: 'title', key: 'title', width: 200 },
    { title: '类型', dataIndex: 'module', key: 'module', width: 100, render: (v: string) => <Tag color="blue">{moduleLabels[v] || v}</Tag> },
    { title: '申请人', dataIndex: 'applicantName', key: 'applicant', width: 100 },
    { title: '提交时间', dataIndex: 'submittedAt', key: 'submittedAt', width: 150, render: (v: string) => v?.slice(0, 16) || '-' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (v: string) => <Tag color={statusLabels[v]?.color}>{statusLabels[v]?.label || v}</Tag> },
    { title: '当前节点', key: 'step', width: 100, render: (_: any, r: ApprovalRequest) => `步骤 ${r.currentStep + 1}` },
    {
      title: '操作', key: 'action', width: 200, render: (_: any, r: ApprovalRequest) => (
        <Space size="small">
          <Button size="small" type="link" onClick={() => { setSelectedRequest(r); setDetailModal(true); }}>详情</Button>
          {r.status === 'pending' && (
            <>
              <Button size="small" type="link" style={{ color: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => handleApprove(r)}>通过</Button>
              <Button size="small" danger type="link" icon={<CloseCircleOutlined />} onClick={() => handleReject(r)}>拒绝</Button>
            </>
          )}
          {r.status === 'pending' && r.applicantId === 'emp-1' && (
            <Button size="small" type="link" onClick={() => handleWithdraw(r)}>撤回</Button>
          )}
        </Space>
      )
    }
  ];

  const templateColumns = [
    { title: '模板名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100, render: (v: string) => <Tag color="blue">{moduleLabels[v] || v}</Tag> },
    { title: '描述', dataIndex: 'description', key: 'desc', width: 200 },
    { title: '审批步骤', dataIndex: 'steps', key: 'steps', width: 200, render: (v: string) => {
      const steps = JSON.parse(v || '[]');
      return steps.map((s: any, i: number) => <Tag key={i}>{s.name || s}</Tag>);
    }},
    { title: '状态', dataIndex: 'isActive', key: 'status', width: 80, render: (v: number) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag> },
    {
      title: '操作', key: 'action', width: 130, render: (_: any, r: WorkflowTemplate) => (
        <Space size="small">
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openTemplateModal(r)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => deleteTemplate(r.id)}>
            <Button size="small" danger type="link" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'pending') return r.status === 'pending';
    if (activeTab === 'approved') return r.status === 'approved';
    if (activeTab === 'rejected') return r.status === 'rejected';
    return true;
  });

  const tabs = [
    { key: 'pending', label: `待审批 (${stats.pending})` },
    { key: 'approved', label: `已通过 (${stats.approved})` },
    { key: 'rejected', label: `已拒绝 (${stats.rejected})` },
    { key: 'templates', label: '流程模板' }
  ];

  return (
    <div className="p-6 space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">📋 流程审批</h2>
          <p className="text-sm text-muted-foreground mt-1">审批各类申请，管理工作流模板</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openTemplateModal()}>新建模板</Button>
      </div>

      <Row gutter={16}>
        <Col span={6}><Card size="small"><div className="text-center"><Badge count={stats.pending} showZero><ClockCircleOutlined style={{ fontSize: 24, color: '#1677ff' }} /></Badge><div className="mt-2 text-sm">待审批</div></div></Card></Col>
        <Col span={6}><Card size="small"><div className="text-center"><CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} /><div className="mt-2 text-sm">已通过 {stats.approved}</div></div></Card></Col>
        <Col span={6}><Card size="small"><div className="text-center"><CloseCircleOutlined style={{ fontSize: 24, color: '#ff4d4f' }} /><div className="mt-2 text-sm">已拒绝 {stats.rejected}</div></div></Card></Col>
        <Col span={6}><Card size="small"><div className="text-center"><AuditOutlined style={{ fontSize: 24 }} /><div className="mt-2 text-sm">总计 {stats.total}</div></div></Card></Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />

        {activeTab !== 'templates' ? (
          <Table columns={requestColumns} dataSource={filteredRequests} rowKey="id" loading={loading}
            pagination={{ pageSize: 10 }} locale={{ emptyText: '暂无数据' }} />
        ) : (
          <Table columns={templateColumns} dataSource={templates} rowKey="id" loading={loading}
            pagination={{ pageSize: 10 }} locale={{ emptyText: '暂无模板' }} />
        )}
      </Card>

      {/* 详情弹窗 */}
      <Modal title="申请详情" open={detailModal} onCancel={() => setDetailModal(false)} footer={null} width={600}>
        {selectedRequest && (
          <div className="space-y-4">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="标题" span={2}>{selectedRequest.title}</Descriptions.Item>
              <Descriptions.Item label="类型">{moduleLabels[selectedRequest.module] || selectedRequest.module}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={statusLabels[selectedRequest.status]?.color}>{statusLabels[selectedRequest.status]?.label}</Tag></Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedRequest.applicantName}</Descriptions.Item>
              <Descriptions.Item label="工号">{selectedRequest.applicantId}</Descriptions.Item>
              <Descriptions.Item label="提交时间">{selectedRequest.submittedAt?.slice(0, 16)}</Descriptions.Item>
              <Descriptions.Item label="完成时间">{selectedRequest.completedAt?.slice(0, 16) || '-'}</Descriptions.Item>
            </Descriptions>
            <Divider>申请内容</Divider>
            <pre className="bg-gray-50 p-3 rounded text-sm">{JSON.stringify(JSON.parse(selectedRequest.formData || '{}'), null, 2)}</pre>
          </div>
        )}
      </Modal>

      {/* 模板编辑弹窗 */}
      <Modal title={editingTemplate ? '编辑模板' : '新建模板'} open={templateModal} onOk={saveTemplate} onCancel={() => setTemplateModal(false)} width={600} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="模板名称" rules={[{ required: true }]}>
                <Input placeholder="如：请假审批流程" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="申请类型" rules={[{ required: true }]}>
                <Select placeholder="选择类型">
                  {Object.entries(moduleLabels).map(([k, v]) => <Option key={k} value={k}>{v}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="描述">
            <TextArea rows={2} placeholder="流程说明" />
          </Form.Item>
          <Form.Item name="steps" label="审批步骤">
            <Form.List name="steps">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true }]}>
                        <Input placeholder="步骤名称，如：部门经理审批" />
                      </Form.Item>
                      <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add({ name: '' })} block icon={<PlusOutlined />}>添加步骤</Button>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked" label="状态">
            <Tag.CheckableTag checked={form.getFieldValue('isActive')} onChange={v => form.setFieldsValue({ isActive: v })}>
              {form.getFieldValue('isActive') ? '启用' : '停用'}
            </Tag.CheckableTag>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
