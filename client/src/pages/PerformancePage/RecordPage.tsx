import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, InputNumber,
  Tag, Space, Popconfirm, message, Statistic, Row, Col, Badge, Descriptions, Drawer, Rate
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  FileSearchOutlined, CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';

const TABLE = 'performance_records';
const { Option } = Select;
const { TextArea } = Input;

const STATUS_COLORS: Record<string, string> = {
  'draft': 'default',
  'submitted': 'processing',
  'reviewed': 'success',
  'completed': 'green',
  'rejected': 'red'
};
const STATUS_LABELS: Record<string, string> = {
  'draft': '草稿',
  'submitted': '已提交',
  'reviewed': '已审核',
  'completed': '已完成',
  'rejected': '已驳回'
};
const GRADE_COLORS: Record<string, string> = {
  'S': 'purple', 'A': 'blue', 'B': 'cyan', 'C': 'geekblue', 'D': 'red'
};

interface IRecord { id: string; [k: string]: any }

export default function RecordPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, completed: 0, avgScore: 0, pending: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pagination.current > 1) params.set('page', String(pagination.current));
      if (pagination.pageSize !== 20) params.set('pageSize', String(pagination.pageSize));
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const json = await res.json();
      const rows = Array.isArray(json) ? json : (json.data || []);
      setData(rows);
      setPagination(p => ({ ...p, total: json.total || rows.length }));
      const scores = rows.filter((r: any) => r.totalScore).map((r: any) => r.totalScore);
      setStats({
        total: rows.length,
        completed: rows.filter((r: any) => r.status === 'completed').length,
        avgScore: scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length * 10) / 10 : 0,
        pending: rows.filter((r: any) => ['draft', 'submitted'].includes(r.status)).length
      });
    } catch { message.error('加载数据失败'); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleView = (r: IRecord) => { setViewing(r); setDrawerOpen(true); };
  const handleAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const handleEdit = (r: IRecord) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/${TABLE}/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch { message.error('删除失败'); }
  };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const body = editing ? { ...editing, ...values } : { id: `pr_${Date.now()}`, ...values, status: 'draft', createdAt: new Date().toISOString() };
    const method = editing ? 'PUT' : 'POST';
    try {
      await fetch(`/api/${TABLE}${editing ? '/' + editing.id : ''}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      message.success(editing ? '修改成功' : '添加成功');
      setModalOpen(false);
      fetchData();
    } catch { message.error('操作失败'); }
  };

  const handleStatusAction = async (id: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === 'submitted') updates.submittedAt = new Date().toISOString();
      if (status === 'reviewed') updates.reviewedAt = new Date().toISOString();
      await fetch(`/api/${TABLE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
      message.success('操作成功');
      fetchData();
    } catch { message.error('操作失败'); }
  };

  const columns = [
    { title: '记录编号', dataIndex: 'id', width: 180, ellipsis: true },
    { title: '员工', dataIndex: 'employeeName', width: 100 },
    { title: '考核周期', dataIndex: 'cycleName', width: 160, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '自评分', dataIndex: 'selfScore', width: 80, align: 'right' as const },
    { title: '主管评分', dataIndex: 'managerScore', width: 80, align: 'right' as const },
    { title: 'HR评分', dataIndex: 'hrScore', width: 80, align: 'right' as const },
    { title: '总分', dataIndex: 'totalScore', width: 80, align: 'right' as const, render: (v: number) => <span style={{ fontWeight: 'bold' }}>{v}</span> },
    { title: '等级', dataIndex: 'grade', width: 70, render: (v: string) => <Tag color={GRADE_COLORS[v] || 'default'}>{v}</Tag> },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v]}</Tag> },
    { title: '操作', width: 220, render: (_: any, r: IRecord) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => handleView(r)}>详情</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
        {r.status === 'draft' && <Button type="link" size="small" onClick={() => handleStatusAction(r.id, 'submitted')}>提交</Button>}
        {r.status === 'submitted' && <Button type="link" size="small" onClick={() => handleStatusAction(r.id, 'reviewed')}>审核</Button>}
        {r.status === 'reviewed' && <Button type="primary" size="small" onClick={() => handleStatusAction(r.id, 'completed')}>确认</Button>}
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="绩效记录总数" value={stats.total} prefix={<FileSearchOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="已完成" value={stats.completed} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="平均分" value={stats.avgScore} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="待处理" value={stats.pending} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} /></Card></Col>
      </Row>

      <Card title="绩效记录管理" extra={
        <Space>
          <Input.Search placeholder="搜索员工/周期" allowClear style={{ width: 220 }} onSearch={v => { setSearch(v); setPagination(p => ({ ...p, current: 1 })); }} />
          <Select placeholder="状态筛选" allowClear style={{ width: 120 }} onChange={v => { setStatusFilter(v || ''); setPagination(p => ({ ...p, current: 1 })); }}>
            {Object.keys(STATUS_LABELS).map(k => <Option key={k} value={k}>{STATUS_LABELS[k]}</Option>)}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增记录</Button>
        </Space>
      }>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={pagination}
          onChange={(p) => setPagination(p)} scroll={{ x: 1300 }} />
      </Card>

      <Modal title={editing ? '编辑绩效记录' : '新增绩效记录'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} width={650}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="employeeId" label="员工ID" rules={[{ required: true }]}>
                <Input placeholder="如：emp-1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="employeeName" label="员工姓名">
                <Input placeholder="自动填充" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cycleId" label="考核周期ID" rules={[{ required: true }]}>
                <Input placeholder="如：cycle_2026q1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cycleName" label="考核周期名称">
                <Input placeholder="自动填充" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="selfScore" label="自评分">
                <InputNumber min={0} max={100} precision={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="managerScore" label="主管评分">
                <InputNumber min={0} max={100} precision={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="hrScore" label="HR评分">
                <InputNumber min={0} max={100} precision={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="totalScore" label="总分">
                <InputNumber min={0} max={100} precision={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="grade" label="等级">
                <Select placeholder="选择等级" allowClear>
                  {['S', 'A', 'B', 'C', 'D'].map(g => <Option key={g} value={g}>{g}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="feedback" label="评价反馈">
                <TextArea rows={2} placeholder="绩效评价反馈" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="improvement" label="改进建议">
                <TextArea rows={2} placeholder="绩效改进建议" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Drawer title="绩效记录详情" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={550}>
        {viewing && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="员工姓名" span={1}>{viewing.employeeName}</Descriptions.Item>
            <Descriptions.Item label="员工ID" span={1}>{viewing.employeeId}</Descriptions.Item>
            <Descriptions.Item label="考核周期" span={2}>{viewing.cycleName}</Descriptions.Item>
            <Descriptions.Item label="自评分" span={1}>{viewing.selfScore}</Descriptions.Item>
            <Descriptions.Item label="主管评分" span={1}>{viewing.managerScore}</Descriptions.Item>
            <Descriptions.Item label="HR评分" span={1}>{viewing.hrScore}</Descriptions.Item>
            <Descriptions.Item label="总分" span={1}><span style={{ fontWeight: 'bold', fontSize: 16 }}>{viewing.totalScore}</span></Descriptions.Item>
            <Descriptions.Item label="等级" span={1}><Tag color={GRADE_COLORS[viewing.grade] || 'default'} style={{ fontSize: 16 }}>{viewing.grade}</Tag></Descriptions.Item>
            <Descriptions.Item label="状态" span={1}><Tag color={STATUS_COLORS[viewing.status]}>{STATUS_LABELS[viewing.status]}</Tag></Descriptions.Item>
            <Descriptions.Item label="KPI得分" span={2}><code>{viewing.kpiScores}</code></Descriptions.Item>
            <Descriptions.Item label="评价反馈" span={2}>{viewing.feedback}</Descriptions.Item>
            <Descriptions.Item label="改进建议" span={2}>{viewing.improvement}</Descriptions.Item>
            <Descriptions.Item label="提交时间" span={1}>{viewing.submittedAt?.slice(0, 16)}</Descriptions.Item>
            <Descriptions.Item label="审核时间" span={1}>{viewing.reviewedAt?.slice(0, 16)}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
