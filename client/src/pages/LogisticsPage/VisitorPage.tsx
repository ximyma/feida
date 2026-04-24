import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber,
  Tag, Space, Popconfirm, message, Statistic, Row, Col, Badge, Descriptions, Drawer
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  UserAddOutlined, ClockCircleOutlined, CheckCircleOutlined
} from '@ant-design/icons';

const TABLE = 'visitors';
const { Option } = Select;
const { RangePicker } = DatePicker;

const STATUS_OPTIONS = ['pending', 'checked_in', 'checked_out', 'rejected'];
const STATUS_LABELS: Record<string, string> = { 'pending': '待访问', 'checked_in': '已签到', 'checked_out': '已离开', 'rejected': '已拒绝' };
const STATUS_COLORS: Record<string, string> = { 'pending': 'gold', 'checked_in': 'processing', 'checked_out': 'green', 'rejected': 'red' };
const PURPOSE_OPTIONS = ['商务洽谈', '面试应聘', '设备维修', '送货', '参观考察', '其他'];

interface IRecord { id: string; [k: string]: any }

export default function VisitorPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<IRecord | null>(null);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, today: 0, pending: 0, checkedIn: 0 });

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
      const today = new Date().toISOString().slice(0, 10);
      setStats({
        total: rows.length,
        today: rows.filter((r: any) => r.visitDate?.startsWith(today)).length,
        pending: rows.filter((r: any) => r.status === 'pending').length,
        checkedIn: rows.filter((r: any) => r.status === 'checked_in').length
      });
    } catch { message.error('加载数据失败'); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search, statusFilter]);

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
    const body = editing ? { ...editing, ...values } : { id: `vis_${Date.now()}`, ...values, status: 'pending', createdAt: new Date().toISOString() };
    const method = editing ? 'PUT' : 'POST';
    try {
      await fetch(`/api/${TABLE}${editing ? '/' + editing.id : ''}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      message.success(editing ? '修改成功' : '添加成功'); setModalOpen(false); fetchData();
    } catch { message.error('操作失败'); }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await fetch(`/api/${TABLE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'checked_in', checkInTime: new Date().toISOString() }) });
      message.success('签到成功'); fetchData();
    } catch { message.error('操作失败'); }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await fetch(`/api/${TABLE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'checked_out', checkOutTime: new Date().toISOString() }) });
      message.success('签出成功'); fetchData();
    } catch { message.error('操作失败'); }
  };

  const columns = [
    { title: '访客编号', dataIndex: 'id', width: 120 },
    { title: '访客姓名', dataIndex: 'name', width: 100, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '联系电话', dataIndex: 'phone', width: 120 },
    { title: '被访人', dataIndex: 'hostName', width: 100 },
    { title: '访问部门', dataIndex: 'hostDepartment', width: 100 },
    { title: '访问目的', dataIndex: 'purpose', width: 100, render: (v: string) => <Tag>{v}</Tag> },
    { title: '访问日期', dataIndex: 'visitDate', width: 110, render: (v: string) => v?.slice(0, 10) },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v]}</Tag> },
    { title: '操作', width: 200, render: (_: any, r: IRecord) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => handleView(r)}>详情</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
        {r.status === 'pending' && <Button type="link" size="small" onClick={() => handleCheckIn(r.id)}>签到</Button>}
        {r.status === 'checked_in' && <Button type="link" size="small" onClick={() => handleCheckOut(r.id)}>签出</Button>}
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="访客总数" value={stats.total} prefix={<UserAddOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="今日访客" value={stats.today} valueStyle={{ color: '#1890ff' }} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="待访问" value={stats.pending} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已签到" value={stats.checkedIn} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} /></Card></Col>
      </Row>
      <Card title="访客管理" extra={
        <Space>
          <Input.Search placeholder="搜索访客/被访人" allowClear style={{ width: 200 }} onSearch={v => { setSearch(v); setPagination(p => ({ ...p, current: 1 })); }} />
          <Select placeholder="状态筛选" allowClear style={{ width: 120 }} onChange={v => { setStatusFilter(v || ''); setPagination(p => ({ ...p, current: 1 })); }}>
            {STATUS_OPTIONS.map(s => <Option key={s} value={s}>{STATUS_LABELS[s]}</Option>)}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>登记访客</Button>
        </Space>
      }>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={pagination} onChange={(p) => setPagination(p)} scroll={{ x: 1200 }} />
      </Card>
      <Modal title={editing ? '编辑访客' : '登记访客'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="访客姓名" rules={[{ required: true }]}><Input placeholder="访客姓名" /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="联系电话" rules={[{ required: true }]}><Input placeholder="联系电话" /></Form.Item></Col>
            <Col span={12}><Form.Item name="hostName" label="被访人" rules={[{ required: true }]}><Input placeholder="被访员工姓名" /></Form.Item></Col>
            <Col span={12}><Form.Item name="hostDepartment" label="访问部门"><Input placeholder="被访部门" /></Form.Item></Col>
            <Col span={12}><Form.Item name="purpose" label="访问目的"><Select placeholder="选择目的">{PURPOSE_OPTIONS.map(p => <Option key={p} value={p}>{p}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="visitDate" label="访问日期"><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="idCard" label="身份证号"><Input placeholder="访客身份证号" /></Form.Item></Col>
            <Col span={12}><Form.Item name="company" label="所属公司"><Input placeholder="访客所属公司" /></Form.Item></Col>
            <Col span={24}><Form.Item name="remark" label="备注"><Input.TextArea rows={2} placeholder="访问备注信息" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
      <Drawer title="访客详情" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={450}>
        {viewing && <Descriptions column={1} bordered>
          <Descriptions.Item label="访客姓名">{viewing.name}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{viewing.phone}</Descriptions.Item>
          <Descriptions.Item label="身份证号">{viewing.idCard}</Descriptions.Item>
          <Descriptions.Item label="所属公司">{viewing.company}</Descriptions.Item>
          <Descriptions.Item label="被访人">{viewing.hostName}</Descriptions.Item>
          <Descriptions.Item label="访问部门">{viewing.hostDepartment}</Descriptions.Item>
          <Descriptions.Item label="访问目的">{viewing.purpose}</Descriptions.Item>
          <Descriptions.Item label="访问日期">{viewing.visitDate?.slice(0, 10)}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color={STATUS_COLORS[viewing.status]}>{STATUS_LABELS[viewing.status]}</Tag></Descriptions.Item>
          <Descriptions.Item label="签到时间">{viewing.checkInTime?.slice(0, 16)}</Descriptions.Item>
          <Descriptions.Item label="签出时间">{viewing.checkOutTime?.slice(0, 16)}</Descriptions.Item>
          <Descriptions.Item label="备注">{viewing.remark}</Descriptions.Item>
        </Descriptions>}
      </Drawer>
    </div>
  );
}
