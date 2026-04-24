import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, InputNumber,
  Tag, Space, Popconfirm, message, Statistic, Row, Col, Badge, Descriptions, Drawer
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  HomeOutlined, UserOutlined, DollarOutlined
} from '@ant-design/icons';

const TABLE = 'dormitories';
const { Option } = Select;

const STATUS_OPTIONS = ['available', 'in_use', 'maintenance', 'retired'];
const STATUS_LABELS: Record<string, string> = { 'available': '空闲', 'in_use': '已入住', 'maintenance': '维修中', 'retired': '已停用' };
const STATUS_COLORS: Record<string, string> = { 'available': 'green', 'in_use': 'blue', 'maintenance': 'orange', 'retired': 'default' };
const TYPE_OPTIONS = ['男生宿舍', '女生宿舍', '夫妻房', '管理人员房'];

interface IRecord { id: string; [k: string]: any }

export default function DormitoryPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, available: 0, inUse: 0, totalBeds: 0 });

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
        totalBeds: rows.reduce((s: number, r: any) => s + (r.capacity || 0), 0)
      });
    } catch { message.error('加载数据失败'); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search]);

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
    const body = editing ? { ...editing, ...values } : { id: `dorm_${Date.now()}`, ...values, createdAt: new Date().toISOString() };
    const method = editing ? 'PUT' : 'POST';
    try {
      await fetch(`/api/${TABLE}${editing ? '/' + editing.id : ''}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      message.success(editing ? '修改成功' : '添加成功'); setModalOpen(false); fetchData();
    } catch { message.error('操作失败'); }
  };

  const columns = [
    { title: '宿舍编号', dataIndex: 'id', width: 120 },
    { title: '宿舍名称', dataIndex: 'name', width: 140, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '楼栋', dataIndex: 'building', width: 80 },
    { title: '楼层', dataIndex: 'floor', width: 60 },
    { title: '房间号', dataIndex: 'roomNumber', width: 80 },
    { title: '类型', dataIndex: 'type', width: 100, render: (v: string) => <Tag>{v}</Tag> },
    { title: '容纳人数', dataIndex: 'capacity', width: 80, align: 'right' as const },
    { title: '已入住', dataIndex: 'currentOccupancy', width: 80, align: 'right' as const },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Badge status={STATUS_COLORS[v] === 'green' ? 'success' : STATUS_COLORS[v] === 'blue' ? 'processing' : 'warning'} text={STATUS_LABELS[v] || v} /> },
    { title: '月租(元)', dataIndex: 'monthlyRent', width: 90, align: 'right' as const, render: (v: number) => v ? `¥${v}` : '-' },
    { title: '操作', width: 170, render: (_: any, r: IRecord) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => handleView(r)}>详情</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="宿舍总数" value={stats.total} prefix={<HomeOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="空闲房间" value={stats.available} valueStyle={{ color: '#3f8600' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已入住" value={stats.inUse} valueStyle={{ color: '#1890ff' }} prefix={<UserOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="总床位" value={stats.totalBeds} /></Card></Col>
      </Row>
      <Card title="宿舍管理" extra={
        <Space>
          <Input.Search placeholder="搜索宿舍" allowClear style={{ width: 200 }} onSearch={v => { setSearch(v); setPagination(p => ({ ...p, current: 1 })); }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增宿舍</Button>
        </Space>
      }>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={pagination} onChange={(p) => setPagination(p)} scroll={{ x: 1200 }} />
      </Card>
      <Modal title={editing ? '编辑宿舍' : '新增宿舍'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="宿舍名称" rules={[{ required: true }]}><Input placeholder="如：A栋101" /></Form.Item></Col>
            <Col span={12}><Form.Item name="type" label="宿舍类型" rules={[{ required: true }]}><Select placeholder="选择类型">{TYPE_OPTIONS.map(t => <Option key={t} value={t}>{t}</Option>)}</Select></Form.Item></Col>
            <Col span={8}><Form.Item name="building" label="楼栋"><Input placeholder="A栋" /></Form.Item></Col>
            <Col span={8}><Form.Item name="floor" label="楼层"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="roomNumber" label="房间号"><Input placeholder="101" /></Form.Item></Col>
            <Col span={8}><Form.Item name="capacity" label="容纳人数" rules={[{ required: true }]}><InputNumber min={1} max={20} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="currentOccupancy" label="已入住人数"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="monthlyRent" label="月租(元)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="状态"><Select>{STATUS_OPTIONS.map(s => <Option key={s} value={s}>{STATUS_LABELS[s]}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="facilities" label="设施"><Input placeholder="空调、热水器、独立卫浴" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
      <Drawer title="宿舍详情" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={450}>
        {viewing && <Descriptions column={1} bordered>
          <Descriptions.Item label="名称">{viewing.name}</Descriptions.Item>
          <Descriptions.Item label="楼栋/楼层/房间">{viewing.building}/{viewing.floor}层/{viewing.roomNumber}</Descriptions.Item>
          <Descriptions.Item label="类型">{viewing.type}</Descriptions.Item>
          <Descriptions.Item label="容纳/已入住">{viewing.capacity}/{viewing.currentOccupancy}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color={STATUS_COLORS[viewing.status]}>{STATUS_LABELS[viewing.status]}</Tag></Descriptions.Item>
          <Descriptions.Item label="月租">{viewing.monthlyRent ? `¥${viewing.monthlyRent}` : '-'}</Descriptions.Item>
          <Descriptions.Item label="设施">{viewing.facilities}</Descriptions.Item>
        </Descriptions>}
      </Drawer>
    </div>
  );
}
