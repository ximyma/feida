import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, InputNumber, DatePicker,
  Tag, Space, Popconfirm, message, Statistic, Row, Col, Badge
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  CarOutlined, CheckCircleOutlined
} from '@ant-design/icons';

const TABLE = 'vehicles';
const { Option } = Select;

const STATUS_OPTIONS = ['available', 'in_use', 'maintenance', 'retired'];
const STATUS_LABELS: Record<string, string> = { 'available': '可用', 'in_use': '使用中', 'maintenance': '维修中', 'retired': '已报废' };
const STATUS_COLORS: Record<string, string> = { 'available': 'green', 'in_use': 'blue', 'maintenance': 'orange', 'retired': 'default' };
const TYPE_OPTIONS = ['轿车', 'SUV', '商务车', '货车', '叉车', '其他'];

interface IRecord { id: string; [k: string]: any }

export default function VehiclePage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, available: 0, inUse: 0, maintenance: 0 });

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
      setStats({
        total: rows.length,
        available: rows.filter((r: any) => r.status === 'available').length,
        inUse: rows.filter((r: any) => r.status === 'in_use').length,
        maintenance: rows.filter((r: any) => r.status === 'maintenance').length
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
    const body = editing ? { ...editing, ...values } : { id: `veh_${Date.now()}`, ...values, createdAt: new Date().toISOString() };
    const method = editing ? 'PUT' : 'POST';
    try {
      await fetch(`/api/${TABLE}${editing ? '/' + editing.id : ''}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      message.success(editing ? '修改成功' : '添加成功'); setModalOpen(false); fetchData();
    } catch { message.error('操作失败'); }
  };

  const columns = [
    { title: '车辆编号', dataIndex: 'id', width: 110 },
    { title: '车牌号', dataIndex: 'plateNumber', width: 110, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '品牌型号', dataIndex: 'model', width: 130 },
    { title: '车辆类型', dataIndex: 'type', width: 90, render: (v: string) => <Tag>{v}</Tag> },
    { title: '颜色', dataIndex: 'color', width: 70 },
    { title: '座位数', dataIndex: 'seats', width: 70, align: 'right' as const },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v]}</Tag> },
    { title: '年检到期', dataIndex: 'inspectionExpiry', width: 110 },
    { title: '保险到期', dataIndex: 'insuranceExpiry', width: 110 },
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
        <Col span={6}><Card><Statistic title="车辆总数" value={stats.total} prefix={<CarOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="可用" value={stats.available} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="使用中" value={stats.inUse} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="维修中" value={stats.maintenance} valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>
      <Card title="车辆管理" extra={
        <Space>
          <Input.Search placeholder="搜索车牌/品牌" allowClear style={{ width: 200 }} onSearch={v => { setSearch(v); setPagination(p => ({ ...p, current: 1 })); }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增车辆</Button>
        </Space>
      }>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={pagination} onChange={(p) => setPagination(p)} scroll={{ x: 1100 }} />
      </Card>
      <Modal title={editing ? '编辑车辆' : '新增车辆'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="plateNumber" label="车牌号" rules={[{ required: true }]}><Input placeholder="如：京A12345" /></Form.Item></Col>
            <Col span={12}><Form.Item name="model" label="品牌型号" rules={[{ required: true }]}><Input placeholder="如：别克GL8" /></Form.Item></Col>
            <Col span={12}><Form.Item name="type" label="车辆类型"><Select placeholder="选择类型">{TYPE_OPTIONS.map(t => <Option key={t} value={t}>{t}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="color" label="颜色"><Input placeholder="白色" /></Form.Item></Col>
            <Col span={8}><Form.Item name="seats" label="座位数"><InputNumber min={2} max={60} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="inspectionExpiry" label="年检到期"><Input placeholder="2026-12-31" /></Form.Item></Col>
            <Col span={8}><Form.Item name="insuranceExpiry" label="保险到期"><Input placeholder="2026-12-31" /></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="状态"><Select>{STATUS_OPTIONS.map(s => <Option key={s} value={s}>{STATUS_LABELS[s]}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="department" label="归属部门"><Input placeholder="行政部" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
