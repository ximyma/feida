/**
 * 增强版审批管理页面 v2.0
 * 支持多步骤工作流、条件分支、并行审批、委托、加签
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag, Space,
  Popconfirm, message, Tabs, Row, Col, Steps, Divider, Descriptions,
  Badge, Drawer, List, Tooltip, Alert, Timeline, Collapse, InputNumber,
  DatePicker, Avatar, Empty, Popover
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  SendOutlined, HistoryOutlined, AuditOutlined, HolderOutlined,
  SwapOutlined, ExclamationCircleOutlined, TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import WorkflowDesigner from './WorkflowDesigner';

const { Option } = Select;
const { TextArea } = Input;

// ============ 类型定义 ============
interface WorkflowInstance {
  id: string;
  definitionId: string;
  definitionName?: string;
  businessId: string;
  businessType: string;
  title: string;
  applicantId: string;
  applicantName: string;
  department?: string;
  status: string;
  currentNodeId: string;
  formData: string;
  nodeHistory?: any[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface PendingTask {
  id: string;
  instanceId: string;
  nodeId: string;
  nodeName: string;
  title: string;
  businessType: string;
  applicantName: string;
  department?: string;
  definitionName?: string;
  formData?: string;
  startedAt?: string;
  dueDate?: string;
}

interface NodeHistory {
  id: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: string;
  assigneeId?: string;
  assigneeName?: string;
  comment?: string;
  startedAt: string;
  completedAt?: string;
}

const moduleLabels: Record<string, string> = {
  leave: '请假申请', overtime: '加班申请', makeup: '补卡申请',
  transfer: '调岗申请', resignation: '离职申请', regular: '转正申请',
  promotion: '晋升申请', expense: '报销申请', purchase: '采购申请', custom: '其他申请'
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: '待审批', color: 'processing' },
  running: { label: '审批中', color: 'processing' },
  approved: { label: '已通过', color: 'success' },
  completed: { label: '已完成', color: 'success' },
  rejected: { label: '已拒绝', color: 'error' },
  cancelled: { label: '已撤回', color: 'default' },
};

export default function ApprovalPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [detailDrawer, setDetailDrawer] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [nodeHistory, setNodeHistory] = useState<NodeHistory[]>([]);

  const [processModal, setProcessModal] = useState(false);
  const [processingTask, setProcessingTask] = useState<PendingTask | null>(null);
  const [processAction, setProcessAction] = useState<'approve' | 'reject'>('approve');
  const [processComment, setProcessComment] = useState('');
  const [delegateModal, setDelegateModal] = useState(false);
  const [delegateUser, setDelegateUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const [messageApi, contextHolder] = message.useMessage();

  // 加载当前用户
  useEffect(() => {
    const stored = sessionStorage.getItem('__current_user');
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  // 加载数据
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [instRes, pendingRes, usersRes] = await Promise.all([
        fetch(`/api/workflow/instances?applicantId=${currentUser.id}`),
        fetch(`/api/workflow/pending?userId=${currentUser.id}`),
        fetch('/api/workflow/users'),
      ]);

      const [instJson, pendingJson, usersJson] = await Promise.all([
        instRes.json(), pendingRes.json(), usersRes.json()
      ]);

      if (instJson.success) setInstances(instJson.data);
      if (pendingJson.success) setPendingTasks(pendingJson.data);
      if (usersJson.success) setAllUsers(usersJson.data);
    } catch {
      messageApi.error('加载数据失败');
    }
    setLoading(false);
  }, [currentUser, messageApi]);

  useEffect(() => { if (currentUser) loadData(); }, [currentUser, loadData]);

  // 加载流程详情
  const loadInstanceDetail = async (instanceId: string) => {
    const [instRes, histRes] = await Promise.all([
      fetch(`/api/workflow/instances?instanceId=${instanceId}`),
      fetch(`/api/workflow/history/${instanceId}`),
    ]);
    const instJson = await instRes.json();
    const histJson = await histRes.json();
    if (instJson.success && instJson.data.length > 0) setSelectedInstance(instJson.data[0]);
    if (histJson.success) setNodeHistory(histJson.data);
    setDetailDrawer(true);
  };

  // 处理审批
  const handleProcess = async () => {
    if (!processingTask || !currentUser) return;
    if (processAction === 'reject' && !processComment.trim()) {
      messageApi.warning('请填写拒绝理由');
      return;
    }
    try {
      const res = await fetch('/api/workflow/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceId: processingTask.instanceId,
          nodeId: processingTask.nodeId,
          userId: currentUser.id,
          userName: currentUser.realName,
          action: processAction,
          comment: processComment,
        }),
      });
      const json = await res.json();
      if (json.success) {
        messageApi.success(processAction === 'approve' ? '审批已通过' : '已拒绝');
        setProcessModal(false);
        setProcessingTask(null);
        setProcessComment('');
        loadData();
      } else {
        messageApi.error(json.message || '操作失败');
      }
    } catch { messageApi.error('操作失败'); }
  };

  // 委托审批
  const handleDelegate = async () => {
    if (!processingTask || !delegateUser || !currentUser) return;
    try {
      const res = await fetch('/api/workflow/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceId: processingTask.instanceId,
          nodeId: processingTask.nodeId,
          userId: currentUser.id,
          userName: currentUser.realName,
          action: 'delegate',
          comment: `委托给 ${delegateUser.realName}`,
          delegateUserId: delegateUser.id,
          delegateUserName: delegateUser.realName,
        }),
      });
      const json = await res.json();
      if (json.success) {
        messageApi.success(`已委托给 ${delegateUser.realName}`);
        setDelegateModal(false);
        setDelegateUser(null);
        setProcessingTask(null);
        loadData();
      } else { messageApi.error(json.message || '委托失败'); }
    } catch { messageApi.error('委托失败'); }
  };

  // 撤回申请
  const handleCancel = async (instanceId: string) => {
    if (!currentUser) return;
    const res = await fetch(`/api/workflow/cancel/${instanceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id }),
    });
    const json = await res.json();
    if (json.success) { messageApi.success('已撤回'); loadData(); }
    else { messageApi.error(json.message || '撤回失败'); }
  };

  const badgeCount = (count: number) => count > 0
    ? <Badge count={count} style={{ backgroundColor: '#ff4d4f' }} />
    : null;

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <h2 style={{ marginBottom: 16 }}>📋 审批流程管理</h2>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'pending',
            label: <span><ClockCircleOutlined /> 待我审批 {badgeCount(pendingTasks.length)}</span>,
            children: (
              <div>
                <Alert
                  message={`您有 ${pendingTasks.length} 条待审批任务`}
                  type="info" showIcon icon={<ClockCircleOutlined />}
                  style={{ marginBottom: 16 }}
                />
                <List
                  loading={loading}
                  dataSource={pendingTasks}
                  locale={{ emptyText: <Empty description="暂无待审批任务" /> }}
                  renderItem={(task: PendingTask) => (
                    <List.Item
                      actions={[
                        <Button type="primary" size="small" icon={<CheckCircleOutlined />}
                          onClick={() => { setProcessingTask(task); setProcessAction('approve'); setProcessModal(true); }}>
                          同意
                        </Button>,
                        <Button danger size="small" icon={<CloseCircleOutlined />}
                          onClick={() => { setProcessingTask(task); setProcessAction('reject'); setProcessModal(true); }}>
                          拒绝
                        </Button>,
                        <Button size="small" icon={<SwapOutlined />}
                          onClick={() => { setProcessingTask(task); setDelegateModal(true); }}>
                          委托
                        </Button>,
                        <Button size="small" type="link" icon={<HistoryOutlined />}
                          onClick={() => loadInstanceDetail(task.instanceId)}>详情</Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar style={{ background: '#1890ff' }} icon={<AuditOutlined />} />}
                        title={<span>{task.title || moduleLabels[task.businessType] || task.businessType}</span>}
                        description={
                          <Space split={<span style={{ color: '#ccc' }}>|</span>}>
                            <span>申请人: {task.applicantName}</span>
                            <span>节点: <Tag color="blue">{task.nodeName}</Tag></span>
                            {task.definitionName && <span>{task.definitionName}</span>}
                            {task.startedAt && <span>{dayjs(task.startedAt).format('MM-DD HH:mm')}</span>}
                            {task.dueDate && new Date(task.dueDate) < new Date() && (
                              <Tag color="red" icon={<ExclamationCircleOutlined />}>已超时</Tag>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            ),
          },
          {
            key: 'my',
            label: <span><UserOutlined /> 我的申请</span>,
            children: (
              <Table
                loading={loading}
                dataSource={instances}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10 }}
                columns={[
                  {
                    title: '标题', dataIndex: 'title', key: 'title',
                    render: (v: string, r: WorkflowInstance) => (
                      <a onClick={() => loadInstanceDetail(r.id)}>{v || moduleLabels[r.businessType] || r.businessType}</a>
                    )
                  },
                  { title: '流程', dataIndex: 'definitionName', key: 'definitionName' },
                  { title: '申请人', dataIndex: 'applicantName', key: 'applicantName' },
                  { title: '部门', dataIndex: 'department', key: 'department' },
                  {
                    title: '状态', dataIndex: 'status', key: 'status',
                    render: (s: string) => {
                      const sl = statusLabels[s] || { label: s, color: 'default' };
                      return <Badge status={sl.color as any} text={sl.label} />;
                    }
                  },
                  {
                    title: '提交时间', dataIndex: 'createdAt', key: 'createdAt',
                    render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'
                  },
                  {
                    title: '操作', key: 'action', width: 120,
                    render: (_: any, r: WorkflowInstance) => (
                      <Space>
                        <Button size="small" type="link" onClick={() => loadInstanceDetail(r.id)}>详情</Button>
                        {r.status === 'running' && r.applicantId === currentUser?.id && (
                          <Popconfirm title="确定撤回？" onConfirm={() => handleCancel(r.id)}>
                            <Button size="small" danger type="link">撤回</Button>
                          </Popconfirm>
                        )}
                      </Space>
                    )
                  },
                ]}
              />
            ),
          },
          {
            key: 'workflows',
            label: <span><HolderOutlined /> 工作流设计</span>,
            children: <WorkflowDesigner />,
          },
        ]}
      />

      {/* 流程详情抽屉 */}
      <Drawer
        title={`📋 ${selectedInstance?.title || '流程详情'}`}
        placement="right" width={600}
        open={detailDrawer}
        onClose={() => setDetailDrawer(false)}
      >
        {selectedInstance && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="流程名称">{selectedInstance.definitionName}</Descriptions.Item>
              <Descriptions.Item label="业务类型">{moduleLabels[selectedInstance.businessType] || selectedInstance.businessType}</Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedInstance.applicantName}</Descriptions.Item>
              <Descriptions.Item label="部门">{selectedInstance.department || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge status={statusLabels[selectedInstance.status]?.color as any} text={statusLabels[selectedInstance.status]?.label} />
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">{selectedInstance.createdAt ? dayjs(selectedInstance.createdAt).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
              {(() => {
                const fd = JSON.parse(selectedInstance.formData || '{}');
                return (
                  <>
                    {fd.startDate && <Descriptions.Item label="开始日期">{fd.startDate}</Descriptions.Item>}
                    {fd.endDate && <Descriptions.Item label="结束日期">{fd.endDate}</Descriptions.Item>}
                    {fd.days && <Descriptions.Item label="天数">{fd.days}</Descriptions.Item>}
                    {fd.reason && <Descriptions.Item label="申请理由" span={2}>{fd.reason}</Descriptions.Item>}
                  </>
                );
              })()}
            </Descriptions>

            <Divider>审批进度</Divider>
            <Timeline
              items={nodeHistory.map((node: NodeHistory) => ({
                color: node.status === 'approved' ? 'green' : node.status === 'rejected' ? 'red' : node.status === 'pending' ? 'blue' : 'gray',
                children: (
                  <div>
                    <strong>{node.nodeName}</strong>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {node.assigneeName && <span>审批人: {node.assigneeName} </span>}
                      {node.startedAt && <span>{dayjs(node.startedAt).format('MM-DD HH:mm')}</span>}
                      {node.completedAt && <span> → {dayjs(node.completedAt).format('MM-DD HH:mm')}</span>}
                    </div>
                    {node.comment && (
                      <div style={{ fontSize: 12, color: '#888', fontStyle: 'italic', marginTop: 4 }}>“{node.comment}”</div>
                    )}
                    {node.status === 'pending' && <Tag color="blue" style={{ marginTop: 4 }}>⏳ 待处理</Tag>}
                  </div>
                ),
              }))}
            />
          </>
        )}
      </Drawer>

      {/* 审批处理弹窗 */}
      <Modal
        title={processAction === 'approve' ? '✅ 同意申请' : '❌ 拒绝申请'}
        open={processModal}
        onOk={handleProcess}
        onCancel={() => { setProcessModal(false); setProcessingTask(null); setProcessComment(''); }}
        okText={processAction === 'approve' ? '确认同意' : '确认拒绝'}
        okButtonProps={{ danger: processAction === 'reject' }}
      >
        {processingTask && (
          <>
            <Alert
              message={`正在审批: ${processingTask.title || moduleLabels[processingTask.businessType]}`}
              type="info" showIcon style={{ marginBottom: 16 }}
            />
            <Form layout="vertical">
              <Form.Item label="审批意见" required={processAction === 'reject'}>
                <TextArea rows={4} value={processComment}
                  onChange={e => setProcessComment(e.target.value)}
                  placeholder={processAction === 'approve' ? '可选填写审批意见...' : '请填写拒绝理由...'}
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* 委托弹窗 */}
      <Modal
        title="🔄 委托审批"
        open={delegateModal}
        onOk={handleDelegate}
        onCancel={() => { setDelegateModal(false); setDelegateUser(null); }}
        okText="确认委托" okButtonProps={{ disabled: !delegateUser }}
      >
        <Alert message="委托后，该审批任务将转交给选中的人员处理" type="info" showIcon style={{ marginBottom: 16 }} />
        <Form layout="vertical">
          <Form.Item label="委托给">
            <Select
              showSearch value={delegateUser?.id}
              onChange={(v, opt: any) => setDelegateUser(opt?.item)}
              placeholder="选择委托人" style={{ width: '100%' }}
              filterOption={(input, option: any) =>
                (option?.item?.realName || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {allUsers.filter(u => u.id !== currentUser?.id).map(u => (
                <Option key={u.id} value={u.id} item={u}>
                  <Space><UserOutlined /><span>{u.realName}</span><span style={{ color: '#999', fontSize: 12 }}>{u.userType}</span></Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
