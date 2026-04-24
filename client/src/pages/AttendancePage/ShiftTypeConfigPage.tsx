import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select,
  Tag, Space, Popconfirm, message, Row, Col, Statistic, Switch
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  ClockCircleOutlined, SunOutlined, MoonOutlined
} from '@ant-design/icons';

const TABLE = 'shift_types';

const SHIFT_CATEGORIES = [
  { value: '早班', label: '早班', color: 'blue' },
  { value: '中班', label: '中班', color: 'orange' },
  { value: '晚班', label: '晚班', color: 'purple' },
  { value: '行政班', label: '行政班', color: 'green' },
  { value: '弹性班', label: '弹性班', color: 'cyan' },
];

interface IRecord {
  id: string;
  name?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
  workHours?: number;
  isActive?: boolean;
  description?: string;
  [k: string]: any;
}

export default function ShiftTypeConfigPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');

  const stats = {
    total: data.length,
    active: data.filter(r => r.isActive).length,
    inactive: data.filter(r => !r.isActive).length,
    avgHours: data.length ? (data.reduce((s, r) => s + (Number(r.workHours) || 0), 0) / data.length).toFixed(1) : '0',
  };

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
    } catch {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ isActive: true }); setModalOpen(true); };
  const openEdit = (r: IRecord) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };

  const handleSave = async () => {
    try {
      const vals = await form.validateFields();
      const url = editing ? `/api/${TABLE}/${editing.id}` : `/api/${TABLE}`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vals)
      });
      if (res.ok) { message.success(editing ? '修改成功' : '新增成功'); setModalOpen(false); fetchData(); }
      else { message.error('保存失败'); }
    } catch { /* validation */ }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/${TABLE}/${id}`, { method: 'DELETE' });
    message.success('删除成功');
    fetchData();
  };

  const toggleActive = async (r: IRecord) => {
    try {
      await fetch(`/api/${TABLE}/${r.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...r, isActive: !r.isActive })
      });
      message.success(r.isActive ? '已停用' : '已启用');
      fetchData();
    } catch { message.error('操作失败'); }
  };

  const columns = [
    {
      title: '班次名称', dataIndex: 'name', key: 'name', width: 120,
      render: (v: string) => <span style={{ fontWeight: 600 }}>{v || '-'}</span>,
    },
    {
      title: '类型', dataIndex: 'type', key: 'type', width: 100,
      render: (v: string) => {
        const c = SHIFT_CATEGORIES.find(x => x.value === v);
        return <Tag color={c?.color || 'default'}>{v || '-'}</Tag>;
      },
    },
    {
      title: '上班时间', dataIndex: 'startTime', key: 'startTime', width: 100,
      render: (v: string) => <Space><SunOutlined />{v || '-'}</Space>,
    },
    {
      title: '下班时间', dataIndex: 'endTime', key: 'endTime', width: 100,
      render: (v: string) => <Space><MoonOutlined />{v || '-'}</Space>,
    },
    {
      title: '工作时长(h)', dataIndex: 'workHours', key: 'workHours', width: 110, align: 'center' as const,
      render: (v: number) => <Tag color="blue">{v || '-'} 小时</Tag>,
    },
    {
      title: '状态', dataIndex: 'isActive', key: 'isActive', width: 80,
      render: (v: boolean, r: IRecord) => (
        <Switch checked={!!v} onChange={() => toggleActive(r)} checkedChildren="启用" unCheckedChildren="停用" />
      ),
    },
    {
      title: '说明', dataIndex: 'description', key: 'description', width: 150, ellipsis: true,
    },
    {
      title: '操作', key: 'action', fixed: 'right' as const, width: 140,
      render: (_: any, r: IRecord) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
          <Popconfirm title="确定删除该班次？" onConfirm={() => handleDelete(r.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small" hoverable><Statistic title="班次总数" value={stats.total} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="已启用" value={stats.active} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="已停用" value={stats.inactive} valueStyle={{ color: '#999' }} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="平均工时" value={stats.avgHours} suffix="小时" /></Card></Col>
      </Row>

      <Card
        title={<span style={{ fontSize: 18, fontWeight: 600 }}>班次管理</span>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增班次</Button>}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '16px 16px 0' }}>
          <Space>
            <Input.Search placeholder="搜索班次名称..." value={search} onChange={e => setSearch(e.target.value)}
              onSearch={() => setPagination(p => ({ ...p, current: 1 }))} style={{ width: 240 }} allowClear />
            <Button icon={<ReloadOutlined />} onClick={() => { setPagination(p => ({ ...p, current: 1 })); fetchData(); }}>刷新</Button>
          </Space>
        </div>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, showQuickJumper: true, showTotal: (t: number) => `共 ${t} 条` }}
          onChange={pag => setPagination(p => ({ ...p, current: pag.current || 1, pageSize: pag.pageSize || 20 }))}
          scroll={{ x: 'max-content' }} size="middle" style={{ marginTop: 8 }} />
      </Card>

      <Modal title={(editing ? '编辑' : '新增') + '班次'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)}
        width={600} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="班次名称" name="name" rules={[{ required: true, message: '请输入班次名称' }]}>
                <Input placeholder="如：早班A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="班次类型" name="type" rules={[{ required: true, message: '请选择班次类型' }]}>
                <Select placeholder="请选择" options={SHIFT_CATEGORIES.map(c => ({ value: c.value, label: c.label }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="上班时间" name="startTime" rules={[{ required: true, message: '请输入上班时间' }]}>
                <Input placeholder="如 09:00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="下班时间" name="endTime" rules={[{ required: true, message: '请输入下班时间' }]}>
                <Input placeholder="如 18:00" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="工作时长(小时)" name="workHours">
                <Input placeholder="自动根据上下班时间计算" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="启用状态" name="isActive" valuePropName="checked">
                <Switch checkedChildren="启用" unCheckedChildren="停用" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="说明" name="description">
            <Input.TextArea rows={2} placeholder="可选，描述该班次的特殊规则" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
