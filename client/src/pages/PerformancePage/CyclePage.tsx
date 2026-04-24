import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker, Progress,
  Tag, Space, Popconfirm, message, Statistic, Row, Col, Badge, Descriptions, Drawer
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  CalendarOutlined, CheckCircleOutlined, SyncOutlined, EyeOutlined
} from '@ant-design/icons';

const TABLE = 'performance_cycles';
const { Option } = Select;
const { RangePicker } = DatePicker;

const CYCLE_TYPES = ['monthly', 'quarterly', 'yearly'];
const CYCLE_TYPE_LABELS: Record<string, string> = {
  'monthly': '月度考核',
  'quarterly': '季度考核',
  'yearly': '年度考核'
};
const STATUS_COLORS: Record<string, string> = {
  'planned': 'blue',
  'active': 'processing',
  'completed': 'green',
  'cancelled': 'red'
};
const STATUS_LABELS: Record<string, string> = {
  'planned': '计划中',
  'active': '进行中',
  'completed': '已完成',
  'cancelled': '已取消'
};

interface IRecord { id: string; [k: string]: any }

export default function CyclePage() {
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
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, participants: 0 });

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
      setStats({
        total: rows.length,
        active: rows.filter((r: any) => r.status === 'active').length,
        completed: rows.filter((r: any) => r.status === 'completed').length,
        participants: rows.reduce((sum: number, r: any) => sum + (r.participants || 0), 0)
      });
    } catch { message.error('加载数据失败'); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const handleEdit = (r: IRecord) => { setEditing(r); form.setFieldsValue({ ...r, dateRange: [r.startDate, r.endDate] }); setModalOpen(true); };
  const handleView = (r: IRecord) => { setViewing(r); setDrawerOpen(true); };
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/${TABLE}/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch { message.error('删除失败'); }
  };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const [startDate, endDate] = values.dateRange || [];
    const body = {
      ...(editing || {}),
      ...values,
      startDate: startDate?.format('YYYY-MM-DD'),
      endDate: endDate?.format('YYYY-MM-DD'),
      status: editing?.status || 'planned',
      participants: editing?.participants || 0,
      completedCount: editing?.completedCount || 0,
      createdAt: editing?.createdAt || new Date().toISOString()
    };
    delete body.dateRange;
    const method = editing ? 'PUT' : 'POST';
    try {
      await fetch(`/api/${TABLE}${editing ? '/' + editing.id : ''}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      message.success(editing ? '修改成功' : '添加成功');
      setModalOpen(false);
      fetchData();
    } catch { message.error('操作失败'); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/${TABLE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      message.success('状态已更新');
      fetchData();
    } catch { message.error('更新失败'); }
  };

  const columns = [
    { title: '周期编号', dataIndex: 'id', width: 130 },
    { title: '周期名称', dataIndex: 'name', width: 180, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '周期类型', dataIndex: 'cycleType', width: 100, render: (v: string) => CYCLE_TYPE_LABELS[v] || v },
    { title: '开始日期', dataIndex: 'startDate', width: 110 },
    { title: '结束日期', dataIndex: 'endDate', width: 110 },
    { title: '状态', dataIndex: 'status', width: 100, render: (v: string) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v]}</Tag> },
    { title: '参与人数', dataIndex: 'participants', width: 90, align: 'right' as const },
    { title: '完成进度', dataIndex: 'completedCount', width: 150, render: (v: number, r: any) => {
      const percent = r.participants ? Math.round((v / r.participants) * 100) : 0;
      return <Progress percent={percent} size="small" status={percent === 100 ? 'success' : 'active'} />;
    }},
    { title: '操作', width: 200, render: (_: any, r: IRecord) => (
      <Space size="small">
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(r)}>查看</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
        {r.status === 'planned' && <Button type="link" size="small" onClick={() => handleStatusChange(r.id, 'active')}>启动</Button>}
        {r.status === 'active' && <Button type="link" size="small" onClick={() => handleStatusChange(r.id, 'completed')}>完成</Button>}
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="考核周期总数" value={stats.total} prefix={<CalendarOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="进行中" value={stats.active} valueStyle={{ color: '#1890ff' }} prefix={<SyncOutlined spin />} /></Card></Col>
        <Col span={6}><Card><Statistic title="已完成" value={stats.completed} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="总参与人数" value={stats.participants} /></Card></Col>
      </Row>

      <Card title="绩效周期管理" extra={
        <Space>
          <Input.Search placeholder="搜索周期名称" allowClear style={{ width: 200 }} onSearch={v => { setSearch(v); setPagination(p => ({ ...p, current: 1 })); }} />
          <Select placeholder="状态筛选" allowClear style={{ width: 120 }} onChange={v => { setStatusFilter(v || ''); setPagination(p => ({ ...p, current: 1 })); }}>
            {Object.keys(STATUS_LABELS).map(k => <Option key={k} value={k}>{STATUS_LABELS[k]}</Option>)}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增周期</Button>
        </Space>
      }>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={pagination}
          onChange={(p) => setPagination(p)} scroll={{ x: 1300 }} />
      </Card>

      <Modal title={editing ? '编辑考核周期' : '新增考核周期'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="name" label="周期名称" rules={[{ required: true }]}>
                <Input placeholder="如：2026年Q1绩效考核" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cycleType" label="周期类型" rules={[{ required: true }]}>
                <Select placeholder="选择类型">{CYCLE_TYPES.map(t => <Option key={t} value={t}>{CYCLE_TYPE_LABELS[t]}</Option>)}</Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dateRange" label="考核周期" rules={[{ required: true }]}>
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="说明">
                <Input.TextArea rows={2} placeholder="考核周期说明" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Drawer title="周期详情" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={500}>
        {viewing && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="周期编号">{viewing.id}</Descriptions.Item>
            <Descriptions.Item label="周期名称">{viewing.name}</Descriptions.Item>
            <Descriptions.Item label="周期类型">{CYCLE_TYPE_LABELS[viewing.cycleType] || viewing.cycleType}</Descriptions.Item>
            <Descriptions.Item label="开始日期">{viewing.startDate}</Descriptions.Item>
            <Descriptions.Item label="结束日期">{viewing.endDate}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={STATUS_COLORS[viewing.status]}>{STATUS_LABELS[viewing.status]}</Tag></Descriptions.Item>
            <Descriptions.Item label="参与人数">{viewing.participants}</Descriptions.Item>
            <Descriptions.Item label="完成人数">{viewing.completedCount}</Descriptions.Item>
            <Descriptions.Item label="等级分布">{viewing.gradeDistribution && <code>{viewing.gradeDistribution}</code>}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewing.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
