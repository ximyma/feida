import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, InputNumber, DatePicker,
  Tag, Space, Popconfirm, message, Statistic, Row, Col, Badge, Progress
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  FileTextOutlined, CheckCircleOutlined, UserOutlined
} from '@ant-design/icons';

const TABLE = 'surveys';
const { Option } = Select;
const { TextArea } = Input;

const STATUS_OPTIONS = ['draft', 'active', 'closed'];
const STATUS_LABELS: Record<string, string> = { 'draft': '草稿', 'active': '进行中', 'closed': '已结束' };
const STATUS_COLORS: Record<string, string> = { 'draft': 'default', 'active': 'processing', 'closed': 'success' };
const TYPE_OPTIONS = ['满意度调查', '培训反馈', '工作环境', '员工福利', '其他'];

interface IRecord { id: string; [k: string]: any }

export default function SurveyPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, totalResponses: 0, avgResponseRate: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pagination.current > 1) params.set('page', String(pagination.current));
      if (pagination.pageSize !== 20) params.set('pageSize', String(pagination.pageSize));
      if (search) params.set('search', search);
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const json = await res.json();
      const rows = Array.isArray(json) ? json : (json.data || []);
      setData(rows);
      setPagination(p => ({ ...p, total: json.total || rows.length }));
      const rates = rows.filter((r: any) => r.responseRate).map((r: any) => r.responseRate);
      setStats({
        total: rows.length,
        active: rows.filter((r: any) => r.status === 'active').length,
        totalResponses: rows.reduce((s: number, r: any) => s + (r.responseCount || 0), 0),
        avgResponseRate: rates.length ? Math.round(rates.reduce((a: number, b: number) => a + b, 0) / rates.length) : 0
      });
    } catch { message.error('加载数据失败'); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const handleEdit = (r: IRecord) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };
  const handleDelete = async (id: string) => {
    try { await fetch(`/api/${TABLE}/${id}`, { method: 'DELETE' }); message.success('删除成功'); fetchData(); }
    catch { message.error('删除失败'); }
  };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const body = editing ? { ...editing, ...values } : { id: `survey_${Date.now()}`, ...values, status: 'draft', responseCount: 0, createdAt: new Date().toISOString() };
    const method = editing ? 'PUT' : 'POST';
    try {
      await fetch(`/api/${TABLE}${editing ? '/' + editing.id : ''}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      message.success(editing ? '修改成功' : '添加成功'); setModalOpen(false); fetchData();
    } catch { message.error('操作失败'); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/${TABLE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      message.success('状态已更新'); fetchData();
    } catch { message.error('更新失败'); }
  };

  const columns = [
    { title: '问卷编号', dataIndex: 'id', width: 130 },
    { title: '问卷标题', dataIndex: 'title', width: 200, ellipsis: true, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '类型', dataIndex: 'type', width: 100, render: (v: string) => <Tag>{v}</Tag> },
    { title: '目标人数', dataIndex: 'targetCount', width: 90, align: 'right' as const },
    { title: '已回复', dataIndex: 'responseCount', width: 80, align: 'right' as const },
    { title: '回复率', dataIndex: 'responseRate', width: 100, render: (v: number, r: any) => {
      const rate = r.targetCount ? Math.round((r.responseCount || 0) / r.targetCount * 100) : 0;
      return <Progress percent={rate} size="small" />;
    }},
    { title: '截止日期', dataIndex: 'endDate', width: 110, render: (v: string) => v?.slice(0, 10) },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v]}</Tag> },
    { title: '操作', width: 200, render: (_: any, r: IRecord) => (
      <Space size="small">
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
        {r.status === 'draft' && <Button type="link" size="small" onClick={() => handleStatusChange(r.id, 'active')}>启动</Button>}
        {r.status === 'active' && <Button type="link" size="small" onClick={() => handleStatusChange(r.id, 'closed')}>结束</Button>}
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="问卷总数" value={stats.total} prefix={<FileTextOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="进行中" value={stats.active} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="总回复数" value={stats.totalResponses} prefix={<UserOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="平均回复率" value={stats.avgResponseRate} suffix="%" valueStyle={{ color: '#3f8600' }} /></Card></Col>
      </Row>
      <Card title="问卷管理" extra={
        <Space>
          <Input.Search placeholder="搜索问卷标题" allowClear style={{ width: 200 }} onSearch={v => { setSearch(v); setPagination(p => ({ ...p, current: 1 })); }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增问卷</Button>
        </Space>
      }>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={pagination} onChange={(p) => setPagination(p)} scroll={{ x: 1200 }} />
      </Card>
      <Modal title={editing ? '编辑问卷' : '新增问卷'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} width={650}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}><Form.Item name="title" label="问卷标题" rules={[{ required: true }]}><Input placeholder="如：2026年员工满意度调查" /></Form.Item></Col>
            <Col span={12}><Form.Item name="type" label="问卷类型"><Select placeholder="选择类型">{TYPE_OPTIONS.map(t => <Option key={t} value={t}>{t}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="targetCount" label="目标人数"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="startDate" label="开始日期"><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="endDate" label="截止日期"><Input type="date" /></Form.Item></Col>
            <Col span={24}><Form.Item name="description" label="问卷说明"><TextArea rows={3} placeholder="问卷目的、填写说明等" /></Form.Item></Col>
            <Col span={24}><Form.Item name="questions" label="问题列表（JSON格式）"><TextArea rows={4} placeholder='[{"q":"问题1","options":["选项A","选项B"]}]' /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
