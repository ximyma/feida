import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, InputNumber, TimePicker,
  Tag, Space, Popconfirm, message, Statistic, Row, Col, Badge
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  ShopOutlined, TeamOutlined, DollarOutlined
} from '@ant-design/icons';

const TABLE = 'canteens';
const { Option } = Select;

const STATUS_OPTIONS = ['营业中', '休息', '停用'];
const STATUS_COLORS: Record<string, string> = { '营业中': 'green', '休息': 'orange', '停用': 'default' };
const TYPE_OPTIONS = ['员工食堂', '高管餐厅', '清真食堂', '特色餐厅'];

interface IRecord { id: string; [k: string]: any }

export default function CanteenPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, open: 0, totalCapacity: 0, avgPrice: 0 });

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
      const prices = rows.filter((r: any) => r.avgPrice).map((r: any) => r.avgPrice);
      setStats({
        total: rows.length,
        open: rows.filter((r: any) => r.status === '营业中').length,
        totalCapacity: rows.reduce((s: number, r: any) => s + (r.capacity || 0), 0),
        avgPrice: prices.length ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : 0
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
    const body = editing ? { ...editing, ...values } : { id: `cant_${Date.now()}`, ...values, createdAt: new Date().toISOString() };
    const method = editing ? 'PUT' : 'POST';
    try {
      await fetch(`/api/${TABLE}${editing ? '/' + editing.id : ''}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      message.success(editing ? '修改成功' : '添加成功'); setModalOpen(false); fetchData();
    } catch { message.error('操作失败'); }
  };

  const columns = [
    { title: '食堂编号', dataIndex: 'id', width: 110 },
    { title: '食堂名称', dataIndex: 'name', width: 150, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '类型', dataIndex: 'type', width: 100, render: (v: string) => <Tag>{v}</Tag> },
    { title: '位置', dataIndex: 'location', width: 150, ellipsis: true },
    { title: '容纳人数', dataIndex: 'capacity', width: 90, align: 'right' as const },
    { title: '营业时间', dataIndex: 'openHours', width: 120 },
    { title: '人均消费', dataIndex: 'avgPrice', width: 90, align: 'right' as const, render: (v: number) => v ? `¥${v}` : '-' },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={STATUS_COLORS[v]}>{v}</Tag> },
    { title: '联系电话', dataIndex: 'phone', width: 120 },
    { title: '操作', width: 140, render: (_: any, r: IRecord) => (
      <Space size="small">
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="食堂总数" value={stats.total} prefix={<ShopOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="营业中" value={stats.open} valueStyle={{ color: '#3f8600' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="总容纳人数" value={stats.totalCapacity} prefix={<TeamOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="平均人均消费" value={stats.avgPrice} prefix={<DollarOutlined />} suffix="元" /></Card></Col>
      </Row>
      <Card title="食堂管理" extra={
        <Space>
          <Input.Search placeholder="搜索食堂名称" allowClear style={{ width: 200 }} onSearch={v => { setSearch(v); setPagination(p => ({ ...p, current: 1 })); }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增食堂</Button>
        </Space>
      }>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={pagination} onChange={(p) => setPagination(p)} scroll={{ x: 1200 }} />
      </Card>
      <Modal title={editing ? '编辑食堂' : '新增食堂'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="食堂名称" rules={[{ required: true }]}><Input placeholder="如：一食堂" /></Form.Item></Col>
            <Col span={12}><Form.Item name="type" label="食堂类型"><Select placeholder="选择类型">{TYPE_OPTIONS.map(t => <Option key={t} value={t}>{t}</Option>)}</Select></Form.Item></Col>
            <Col span={24}><Form.Item name="location" label="位置"><Input placeholder="如：行政楼一楼" /></Form.Item></Col>
            <Col span={8}><Form.Item name="capacity" label="容纳人数"><InputNumber min={10} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="avgPrice" label="人均消费(元)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="status" label="状态"><Select>{STATUS_OPTIONS.map(s => <Option key={s} value={s}>{s}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="openHours" label="营业时间"><Input placeholder="如：7:00-20:00" /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="联系电话"><Input placeholder="分机号或手机" /></Form.Item></Col>
            <Col span={24}><Form.Item name="description" label="描述"><Input.TextArea rows={2} placeholder="食堂特色、菜品类型等" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
