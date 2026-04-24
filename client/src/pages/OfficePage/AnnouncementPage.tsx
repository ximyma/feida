import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber,
  Tag, Space, Popconfirm, message, Statistic, Row, Col, Badge, Descriptions, Drawer
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  NotificationOutlined, EyeOutlined, CheckCircleOutlined
} from '@ant-design/icons';

const TABLE = 'announcements';
const { Option } = Select;
const { TextArea } = Input;

const TYPE_OPTIONS = ['公司新闻', '通知公告', '人事任免', '制度更新', '紧急通知'];
const STATUS_OPTIONS = ['draft', 'published', 'archived'];
const STATUS_LABELS: Record<string, string> = { 'draft': '草稿', 'published': '已发布', 'archived': '已归档' };
const STATUS_COLORS: Record<string, string> = { 'draft': 'default', 'published': 'green', 'archived': 'orange' };
const PRIORITY_COLORS: Record<string, string> = { 'low': 'default', 'normal': 'blue', 'high': 'red' };

interface IRecord { id: string; [k: string]: any }

export default function AnnouncementPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<IRecord | null>(null);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, views: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pagination.current > 1) params.set('page', String(pagination.current));
      if (pagination.pageSize !== 20) params.set('pageSize', String(pagination.pageSize));
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const json = await res.json();
      const rows = Array.isArray(json) ? json : (json.data || []);
      setData(rows);
      setPagination(p => ({ ...p, total: json.total || rows.length }));
      setStats({
        total: rows.length,
        published: rows.filter((r: any) => r.status === 'published').length,
        draft: rows.filter((r: any) => r.status === 'draft').length,
        views: rows.reduce((s: number, r: any) => s + (r.viewCount || 0), 0)
      });
    } catch { message.error('加载数据失败'); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const handleEdit = (r: IRecord) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };
  const handleView = (r: IRecord) => { setViewing(r); setDrawerOpen(true); };
  const handleDelete = async (id: string) => {
    try { await fetch(`/api/${TABLE}/${id}`, { method: 'DELETE' }); message.success('删除成功'); fetchData(); }
    catch { message.error('删除失败'); }
  };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const body = editing ? { ...editing, ...values } : { id: `ann_${Date.now()}`, ...values, status: 'draft', viewCount: 0, createdAt: new Date().toISOString() };
    const method = editing ? 'PUT' : 'POST';
    try {
      await fetch(`/api/${TABLE}${editing ? '/' + editing.id : ''}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      message.success(editing ? '修改成功' : '添加成功'); setModalOpen(false); fetchData();
    } catch { message.error('操作失败'); }
  };

  const handlePublish = async (id: string) => {
    try {
      await fetch(`/api/${TABLE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'published', publishDate: new Date().toISOString() }) });
      message.success('发布成功'); fetchData();
    } catch { message.error('发布失败'); }
  };

  const columns = [
    { title: '公告编号', dataIndex: 'id', width: 120 },
    { title: '标题', dataIndex: 'title', width: 200, ellipsis: true, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '类型', dataIndex: 'type', width: 100, render: (v: string) => <Tag>{v}</Tag> },
    { title: '发布人', dataIndex: 'author', width: 100 },
    { title: '发布时间', dataIndex: 'publishDate', width: 160, render: (v: string) => v?.slice(0, 16) },
    { title: '阅读量', dataIndex: 'viewCount', width: 80, align: 'right' as const },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v]}</Tag> },
    { title: '操作', width: 200, render: (_: any, r: IRecord) => (
      <Space size="small">
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(r)}>查看</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
        {r.status === 'draft' && <Button type="link" size="small" onClick={() => handlePublish(r.id)}>发布</Button>}
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="公告总数" value={stats.total} prefix={<NotificationOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="已发布" value={stats.published} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="草稿" value={stats.draft} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="总阅读量" value={stats.views} prefix={<EyeOutlined />} /></Card></Col>
      </Row>
      <Card title="公告管理" extra={
        <Space>
          <Input.Search placeholder="搜索标题" allowClear style={{ width: 200 }} onSearch={v => { setSearch(v); setPagination(p => ({ ...p, current: 1 })); }} />
          <Select placeholder="类型筛选" allowClear style={{ width: 120 }} onChange={v => { setTypeFilter(v || ''); setPagination(p => ({ ...p, current: 1 })); }}>
            {TYPE_OPTIONS.map(t => <Option key={t} value={t}>{t}</Option>)}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增公告</Button>
        </Space>
      }>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={pagination} onChange={(p) => setPagination(p)} scroll={{ x: 1200 }} />
      </Card>
      <Modal title={editing ? '编辑公告' : '新增公告'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} width={650}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}><Form.Item name="title" label="标题" rules={[{ required: true }]}><Input placeholder="公告标题" /></Form.Item></Col>
            <Col span={12}><Form.Item name="type" label="类型" rules={[{ required: true }]}><Select placeholder="选择类型">{TYPE_OPTIONS.map(t => <Option key={t} value={t}>{t}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="priority" label="优先级"><Select placeholder="选择优先级"><Option value="low">低</Option><Option value="normal">普通</Option><Option value="high">高</Option></Select></Form.Item></Col>
            <Col span={24}><Form.Item name="content" label="内容" rules={[{ required: true }]}><TextArea rows={6} placeholder="公告正文内容" /></Form.Item></Col>
            <Col span={24}><Form.Item name="summary" label="摘要"><Input placeholder="公告摘要（可选）" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
      <Drawer title="公告详情" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={550}>
        {viewing && <Descriptions column={1} bordered>
          <Descriptions.Item label="标题">{viewing.title}</Descriptions.Item>
          <Descriptions.Item label="类型">{viewing.type}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color={STATUS_COLORS[viewing.status]}>{STATUS_LABELS[viewing.status]}</Tag></Descriptions.Item>
          <Descriptions.Item label="发布人">{viewing.author}</Descriptions.Item>
          <Descriptions.Item label="发布时间">{viewing.publishDate?.slice(0, 16)}</Descriptions.Item>
          <Descriptions.Item label="阅读量">{viewing.viewCount}</Descriptions.Item>
          <Descriptions.Item label="摘要">{viewing.summary}</Descriptions.Item>
          <Descriptions.Item label="内容"><pre style={{ whiteSpace: 'pre-wrap' }}>{viewing.content}</pre></Descriptions.Item>
        </Descriptions>}
      </Drawer>
    </div>
  );
}
